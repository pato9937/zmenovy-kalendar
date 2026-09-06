import { addDays, eachDayOfInterval, endOfMonth, isWeekend, startOfMonth } from "date-fns";
import { fromISODate, toISODate, toMinutes } from "./dates";
import { isDayOfRest, isPublicHoliday } from "./holidays";
import { BREAK_12H, netWorkHours, type DayShift } from "./shifts";

// src/lib/payroll.ts
//
// PREPRACOVANÉ podľa reálnej výplatnej pásky (04/2026) A podľa oficiálnej
// internej dokumentácie firmy ("Výplatná páska — vysvetlivky"), ktorá
// definuje presné vzorce pre každú položku. Táto dokumentácia je autorita —
// nahrádza moje skoršie odhady (napr. že nočný príplatok je naviazaný na
// zákonné minimum — NIE JE, je to plochá firemná sadzba 1,43 €/h).
//
// Kľúčové vzorce (doslovne podľa firemného dokumentu):
//  - Základná mzda = tarifný plat / plánované (fond) hodiny × odpracované hodiny
//  - Zákl. za nadčas = tá istá odvodená sadzba × nadčasové hodiny
//  - Prípl. nadčas = nadčasové hodiny × PPÚ × 25 %
//  - Dovolenka = hodiny dovolenky × PPÚ
//  - Prípl. sviatok = hodiny odpracované vo sviatok × PPÚ
//  - Prípl. poobedný = 0,80 € × hodiny odpracované 14:00–22:00
//  - Prípl. nočný = 1,43 € × hodiny odpracované 22:00–06:00 (plochá sadzba,
//    NIE naviazaná na minimálnu mzdu)
//  - Prípl. So/Ne = hodiny odpracované cez víkend × sadzba podľa TARIFNEJ
//    TRIEDY (3,58 / 4,28 / 4,98 / 5,68 €/h — u teba trieda 6–7 = 4,98 €/h)
//  - Zdravotné poistenie zamestnanca: 4 %
//  - Nemocenské 1,4 %, invalidné 3 %, starobné 4 %, nezamestnanosť 1 %
//  - Základ dane = hrubá mzda − poistné − odpočet na daňovníka
//
// Neobjasnené drobnosti (viď poznámky pri poli): aprílová páska
// ukazuje o niečo vyššie sumy pri nočnom príplatku a zdravotnom poistení,
// než by dal tento vzorec — možno retroaktívna úprava alebo iný mesačný
// základ; pri bežných mesiacoch by mal tento vzorec sedieť presne.

export type TariffClass = "1-3" | "4-5" | "6-7" | "8-12";

export const WEEKEND_RATE_BY_CLASS: Record<TariffClass, number> = {
  "1-3": 3.58,
  "4-5": 4.28,
  "6-7": 4.98,
  "8-12": 5.68,
};

export interface PayrollConfig {
  ppuRate: number;            // Priemer PPÚ (kvartálne prepočítavaný priemerný zárobok): 12,5118 €/h
  tariffMonthly: number;      // Tarifný plat (mesačný): 1 510,00 €
  tariffClass: TariffClass;   // Tarifná trieda — určuje sadzbu za So/Ne (u teba: "6-7")
  afternoonRate: number;      // Poobedný príplatok: 0,80 €/h — 14:00–22:00
  nightRate: number;          // Nočný príplatok: 1,43 €/h (plochá sadzba) — 22:00–06:00
  vykonBonusPercent: number;  // Výkonnostný bonus 0–10 % zo (základná mzda + zákl. za nadčas) — diskrétny, zadaj ručne za daný mesiac
  holidayPercent: number;     // Sviatok: 100 % z PPÚ
  overtimePercent: number;    // Nadčas — príplatok: 25 % z PPÚ
  afternoonFrom: string;
  afternoonTo: string;
  nightFrom: string;
  nightTo: string;
  travel: number;             // Cestovné: 60 €
  attendance: number;         // Dochádzkový bonus, bežný mesiac: 70 €
  attendanceBonus: number;    // Dochádzkový bonus, kvartálny mesiac: 140 €
  attendanceMonths: number[]; // Mesiace s kvartálnym bonusom
  halfYearMonths: number[];   // Mesiace s polročnou prémiou (máj, november)
  food: number;               // Zrážka za stravu: 7,50 €
  dds: number;                // DDS zamestnanec — zrážka: 15,00 €
  nczd: number;               // Odpočet na daňovníka (mesačne): 497,23 € — aktuálna suma pre 2026 (firemný vzorový doklad má staršiu hodnotu 410,24 €, nesedí na skutočnú pásku)
  healthRate: number;         // Zdravotné poistenie zamestnanca: 4 %
  sicknessRate: number;       // Nemocenské poistenie: 1,4 %
  disabilityRate: number;     // Invalidné poistenie: 3 %
  pensionRate: number;        // Starobné poistenie: 4 %
  unemploymentRate: number;   // Poistenie v nezamestnanosti: 1 %
}

export const DEFAULT_PAYROLL: PayrollConfig = {
  ppuRate: 12.5118,
  tariffMonthly: 1510.0,
  tariffClass: "6-7",
  afternoonRate: 0.8,
  nightRate: 1.43,
  vykonBonusPercent: 0,
  holidayPercent: 100,
  overtimePercent: 25,
  afternoonFrom: "14:00",
  afternoonTo: "22:00",
  nightFrom: "22:00",
  nightTo: "06:00",
  travel: 60,
  attendance: 70,
  attendanceBonus: 140,
  attendanceMonths: [3, 6, 9, 12],
  halfYearMonths: [5, 11],
  food: 7.5,
  dds: 15.0,
  nczd: 497.23,
  healthRate: 4,
  sicknessRate: 1.4,
  disabilityRate: 3,
  pensionRate: 4,
  unemploymentRate: 1,
};

export interface MonthExtras {
  vacationHours: number;
  extraGross: number;
}

export const EMPTY_EXTRAS: MonthExtras = { vacationHours: 0, extraGross: 0 };

const DAY_MINS = 24 * 60;

export function monthKey(cursor: Date): string {
  return `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
}

export function roundCents(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatEur(n: number, digits = 2): string {
  const sign = n < 0 ? "−" : "";
  const v = Math.abs(roundCents(n));
  const body = v.toFixed(digits);
  const [int, frac] = body.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  if (digits === 0 || Number(frac) === 0) return `${sign}${grouped}\u00a0€`;
  return `${sign}${grouped},${frac}\u00a0€`;
}

/**
 * Sadzba za So/Ne príplatok podľa tarifnej triedy zamestnanca —
 * priama tabuľka z firemného dokumentu (nie zákonné minimum).
 */
function weekendRate(cfg: PayrollConfig): number {
  return WEEKEND_RATE_BY_CLASS[cfg.tariffClass];
}

function windows(from: string, to: string): Array<[number, number]> {
  const s = toMinutes(from);
  const e = toMinutes(to);
  if (e <= s) return [
    [s, DAY_MINS],
    [0, e],
  ];
  return [[s, e]];
}

function overlap(a0: number, a1: number, b0: number, b1: number): number {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
}

function sumOverlap(seg: [number, number], wins: Array<[number, number]>): number {
  let m = 0;
  for (const w of wins) m += overlap(seg[0], seg[1], w[0], w[1]);
  return m;
}

function segments(iso: string, start: string, end: string): Array<{ iso: string; span: [number, number] }> {
  const s = toMinutes(start);
  const e = toMinutes(end);
  if (e > s) return [{ iso, span: [s, e] }];
  return [
    { iso, span: [s, DAY_MINS] },
    { iso: toISODate(addDays(fromISODate(iso), 1)), span: [0, e] },
  ];
}

export interface PremiumHours {
  paid: number;
  afternoon: number;
  night: number;
  weekend: number;
  holiday: number;
}

/**
 * Rozdelí odpracované (platené) hodiny jednej zmeny podľa reálneho
 * prekryvu času zmeny s poobedným/nočným pásmom a podľa toho, či
 * segment padá na víkend alebo sviatok. Toto je presne to, čo
 * v skrátenej verzii kódu chýbalo — tam sa poobedné/nočné hodiny
 * odhadovali paušálne podľa druhu zmeny namiesto reálneho výpočtu.
 */
export function shiftPremiumHours(
  iso: string,
  start: string,
  end: string,
  paidHours: number,
  cfg: PayrollConfig,
): PremiumHours {
  let clockMins = toMinutes(end) - toMinutes(start);
  if (clockMins <= 0) clockMins += DAY_MINS;
  const clock = clockMins / 60;
  if (clock <= 0 || paidHours <= 0) {
    return { paid: 0, afternoon: 0, night: 0, weekend: 0, holiday: 0 };
  }
  const factor = paidHours / clock;
  const aft = windows(cfg.afternoonFrom, cfg.afternoonTo);
  const nit = windows(cfg.nightFrom, cfg.nightTo);
  const out: PremiumHours = { paid: paidHours, afternoon: 0, night: 0, weekend: 0, holiday: 0 };
  for (const seg of segments(iso, start, end)) {
    const hours = ((seg.span[1] - seg.span[0]) / 60) * factor;
    const date = fromISODate(seg.iso);
    out.afternoon += (sumOverlap(seg.span, aft) / 60) * factor;
    out.night += (sumOverlap(seg.span, nit) / 60) * factor;
    const dow = date.getDay();
    if (dow === 6 || dow === 0) out.weekend += hours;
    if (isPublicHoliday(seg.iso)) out.holiday += hours;
  }
  return out;
}

export interface PayrollBreakdown {
  workHours: number;
  vacationHours: number;
  fundHours: number;
  overtimeHours: number;
  afternoonHours: number;
  nightHours: number;
  weekendHours: number;
  holidayHours: number;
  base: number;
  overtimeBase: number;
  vacationPay: number;
  afternoonPay: number;
  nightPay: number;
  weekendPay: number;
  holidayPay: number;
  overtimePay: number;
  vykonBonus: number;
  travel: number;
  attendance: number;
  halfYear: number;
  extraGross: number;
  gross: number;
  health: number;
  sickness: number;
  disability: number;
  pension: number;
  unemployment: number;
  insurance: number;
  nczd: number;
  taxBase: number;
  tax: number;
  food: number;
  dds: number;
  net: number;
}

function attendanceFor(month: number, cfg: PayrollConfig): number {
  if (cfg.attendanceMonths.includes(month)) return cfg.attendanceBonus;
  return cfg.attendance;
}

function halfYearPay(month: number, cfg: PayrollConfig): number {
  if (!cfg.halfYearMonths.includes(month)) return 0;
  return roundCents(cfg.tariffMonthly / 2);
}

// Nezdaniteľná časť: v praxi mzdové systémy počas roka odpočítavajú
// plnú mesačnú sumu (497,23 € pre 2026); k prípadnému kráteniu podľa
// ročného základu dochádza až pri ročnom zúčtovaní/daňovom priznaní,
// nie mesiac čo mesiac. Preto tu NEROBÍME priebežnú degresiu.
function monthlyNczd(cfg: PayrollConfig): number {
  return cfg.nczd;
}

function progressiveTax(base: number): number {
  if (base <= 0) return 0;
  // Poznámka: bežný zamestnanec platí rovných 19 % (25 % nad ročným
  // stropom cca 41-násobku živ. minima). Pásma nechávame pripravené
  // pre vyššie príjmy, v bežnom mesiaci sa uplatní len prvé pásmo.
  const bands = [
    { upTo: 4079.6825, rate: 0.19 }, // cca 176,8-násobok živ. minima / 12 (horný strop pre 25% pásmo)
    { upTo: Infinity, rate: 0.25 },
  ];
  let tax = 0;
  let prev = 0;
  for (const band of bands) {
    const slice = Math.min(base, band.upTo) - prev;
    if (slice > 0) tax += slice * band.rate;
    prev = band.upTo;
    if (base <= band.upTo) break;
  }
  return roundCents(tax);
}

export function computeMonthPayroll(opts: {
  days: Record<string, DayShift>;
  cursor: Date;
  standardDailyHours: number;
  patternStart: string | null;
  cfg: PayrollConfig;
  extras?: MonthExtras;
}): PayrollBreakdown {
  const start = startOfMonth(opts.cursor);
  const end = endOfMonth(opts.cursor);
  const gate = opts.patternStart ? fromISODate(opts.patternStart) : start;
  const extras = opts.extras ?? EMPTY_EXTRAS;
  const cfg = opts.cfg;

  let workHours = 0;
  let fundHours = 0;
  let afternoonHours = 0;
  let nightHours = 0;
  let weekendHours = 0;
  let holidayHours = 0;

  for (const date of eachDayOfInterval({ start, end })) {
    if (date < gate) continue;
    const iso = toISODate(date);
    const shift = opts.days[iso];
    const kind = shift?.kind ?? "off";
    if (kind !== "off" && shift?.start && shift?.end) {
      const paid = netWorkHours(kind, shift.start, shift.end, BREAK_12H);
      workHours += paid;
      const prem = shiftPremiumHours(iso, shift.start, shift.end, paid, cfg);
      afternoonHours += prem.afternoon;
      nightHours += prem.night;
      weekendHours += prem.weekend;
      holidayHours += prem.holiday;
    }
    if (!isWeekend(date) && !isDayOfRest(iso)) {
      fundHours += opts.standardDailyHours;
    }
  }

  const vacationHours = Math.max(0, extras.vacationHours);
  const remainingFund = Math.max(0, fundHours - vacationHours);
  const overtimeHours = Math.max(0, workHours - remainingFund);
  const regularHours = Math.max(0, workHours - overtimeHours);

  // Odvodená hodinová sadzba z tarifného platu — mení sa mesiac čo
  // mesiac podľa toho, koľko má mesiac fondových hodín (presne ako
  // na páske: 1 510 / 176 h v apríli = 8,58 €/h).
  const derivedRate = fundHours > 0 ? cfg.tariffMonthly / fundHours : 0;

  const base = regularHours * derivedRate;
  const overtimeBase = overtimeHours * derivedRate;
  const vacationPay = vacationHours * cfg.ppuRate;
  const afternoonPay = afternoonHours * cfg.afternoonRate;
  const nightPay = nightHours * cfg.nightRate;
  const weekendPay = weekendHours * weekendRate(cfg);
  const holidayPay = holidayHours * cfg.ppuRate * (cfg.holidayPercent / 100);
  const overtimePay = overtimeHours * cfg.ppuRate * (cfg.overtimePercent / 100);
  const vykonBonus = roundCents((base + overtimeBase) * (cfg.vykonBonusPercent / 100));
  const month = opts.cursor.getMonth() + 1;
  const travel = workHours > 0 ? cfg.travel : 0;
  const attendance = workHours > 0 || vacationHours > 0 ? attendanceFor(month, cfg) : 0;
  const halfYear = halfYearPay(month, cfg);
  const extraGross = extras.extraGross;

  const gross = roundCents(
    base +
      overtimeBase +
      vacationPay +
      afternoonPay +
      nightPay +
      weekendPay +
      holidayPay +
      overtimePay +
      vykonBonus +
      travel +
      attendance +
      halfYear +
      extraGross,
  );

  const health = roundCents(gross * (cfg.healthRate / 100));
  const sickness = roundCents(gross * (cfg.sicknessRate / 100));
  const disability = roundCents(gross * (cfg.disabilityRate / 100));
  const pension = roundCents(gross * (cfg.pensionRate / 100));
  const unemployment = roundCents(gross * (cfg.unemploymentRate / 100));
  const insurance = roundCents(health + sickness + disability + pension + unemployment);
  const preNczd = roundCents(gross - insurance);
  const nczd = monthlyNczd(cfg);
  const taxBase = Math.max(0, roundCents(preNczd - nczd));
  const tax = progressiveTax(taxBase);
  const food = cfg.food;
  const dds = cfg.dds;
  const net = roundCents(gross - insurance - tax - food - dds);

  return {
    workHours: roundCents(workHours),
    vacationHours: roundCents(vacationHours),
    fundHours: roundCents(fundHours),
    overtimeHours: roundCents(overtimeHours),
    afternoonHours: roundCents(afternoonHours),
    nightHours: roundCents(nightHours),
    weekendHours: roundCents(weekendHours),
    holidayHours: roundCents(holidayHours),
    base: roundCents(base),
    overtimeBase: roundCents(overtimeBase),
    vacationPay: roundCents(vacationPay),
    afternoonPay: roundCents(afternoonPay),
    nightPay: roundCents(nightPay),
    weekendPay: roundCents(weekendPay),
    holidayPay: roundCents(holidayPay),
    overtimePay: roundCents(overtimePay),
    vykonBonus: roundCents(vykonBonus),
    travel: roundCents(travel),
    attendance: roundCents(attendance),
    halfYear: roundCents(halfYear),
    extraGross: roundCents(extraGross),
    gross,
    health,
    sickness,
    disability,
    pension,
    unemployment,
    insurance,
    nczd: roundCents(nczd),
    taxBase,
    tax,
    food: roundCents(food),
    dds: roundCents(dds),
    net,
  };
}