import { addDays, eachDayOfInterval, endOfMonth, isWeekend, startOfMonth } from "date-fns";
import { fromISODate, toISODate, toMinutes } from "./dates";
import { isPublicHoliday } from "./holidays";
import { BREAK_12H, DEFAULT_TIMES, netWorkHours, type DayShift } from "./shifts";

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

export interface PayrollConfig {
  ppuRate: number;            // Priemer PPÚ (kvartálne prepočítavaný priemerný zárobok): 12,5118 €/h
  tariffMonthly: number;      // Tarifný plat (mesačný): 1 510,00 €
  afternoonRate: number;      // Poobedný príplatok: 0,80 €/h — 14:00–22:00 (potvrdené naprieč 5 mesiacmi, stabilné)
  nightRate: number;          // Firemná nočná sadzba (referenčná, v praxi vždy prekonaná zákonným minimom nižšie): 1,43 €/h
  minWageHourly: number;      // Min. hodinová mzda (40h/týž.) pre AKTUÁLNY ROK — mení sa každý 1.1., over si aktuálnu sumu; 2026 = 5,259 €
  weekendRate: number;        // Príplatok So/Ne — empiricky pozorované 6,09–6,66 €/h naprieč mesiacmi (kolíše, presný mechanizmus sa nepodarilo dokopy vysvetliť — priebežne uprav podľa najnovšej pásky)
  vykonBonusPercent: number;  // Výkonnostný bonus 0–10 % zo (základná mzda + zákl. za nadčas) — diskrétny, zadaj ručne za daný mesiac
  earlyArrivalMinutes: number; // Predvolený "skorší príchod" pripočítaný ku KAŽDEJ rannej/nočnej zmene (default 15 min) — použije sa len na dni, kde si nechal štandardný čas zmeny; ak si na konkrétny deň čas ručne upravil, ráta sa presne to, čo je zadané, bez tohto bonusu
  holidayPercent: number;     // Sviatok: 100 % z PPÚ
  overtimePercent: number;    // Nadčas — príplatok: 25 % z PPÚ
  afternoonFrom: string;
  afternoonTo: string;
  nightFrom: string;
  nightTo: string;
  travel: number;             // Cestovné: 60 € (pozor: v mesiaci s menej odpracovanými dňami býva nižšie, možno pomerné — over si to, ak máš kratší mesiac)
  attendance: number;         // Dochádzkový bonus, bežný mesiac: 70 €
  attendanceBonus: number;    // Dochádzkový bonus, kvartálny mesiac: 140 €
  attendanceMonths: number[]; // Mesiace s kvartálnym bonusom
  halfYearMonths: number[];   // Mesiace s polročnou prémiou (máj, november)
  food: number;               // Zrážka za stravu: 7,50 € (pozor: kolíše aj toto — videné aj 4 € a 10 €, over si to na páske)
  dds: number;                // DDS zamestnanec — zrážka: 15,00 €
  mealVouchers: number;       // Stravné lístky/gastro karta od firmy — pripočíta sa priamo k čistej mzde (nezdaňuje sa, nejde do hrubého). Predvolene 0, nastav podľa toho, koľko ti firma dáva.
  ddsEmployerTaxable: number; // Príspevok zamestnávateľa na DDS (15 €) sa pripočítava k základu dane ako nepeňažný zdaniteľný príjem — potvrdené na 2 rôznych mesiacoch (rozdiel presne +15 € v Zákl.daň.mesač)
  nczd: number;               // Odpočet na daňovníka (mesačne): 497,23 € — aktuálna suma pre 2026 (v roku 2025 to bolo menej, napr. 479,48 €)
  healthRate: number;         // Zdravotné poistenie zamestnanca: 5 % — POZOR: do 12/2025 to bolo 4 %, od 1/2026 je to 5 % (celoštátna zmena)
  sicknessRate: number;       // Nemocenské poistenie: 1,4 %
  disabilityRate: number;     // Invalidné poistenie: 3 %
  pensionRate: number;        // Starobné poistenie: 4 %
  unemploymentRate: number;   // Poistenie v nezamestnanosti: 1 %
}

export const DEFAULT_PAYROLL: PayrollConfig = {
  ppuRate: 0, // Nastav v Mzdových sadzbách podľa svojej výplatnej pásky (Priemer PPÚ)
  tariffMonthly: 0, // Nastav v Mzdových sadzbách podľa svojej výplatnej pásky (Tarifný plat)
  afternoonRate: 0.8,
  nightRate: 1.43,
  minWageHourly: 5.259,
  weekendRate: 6.66,
  vykonBonusPercent: 0,
  earlyArrivalMinutes: 15,
  holidayPercent: 100,
  overtimePercent: 25,
  afternoonFrom: "14:00",
  afternoonTo: "22:00",
  nightFrom: "22:00",
  nightTo: "06:00",
  travel: 0, // Nastav podľa svojej firmy — nie každá firma dáva rovnaké cestovné/tankovanie
  attendance: 0, // Nastav podľa svojej firmy — nie každá firma dáva dochádzkovú prémiu
  attendanceBonus: 0, // Nastav podľa svojej firmy (kvartálna dochádzková prémia, ak ju máš)
  attendanceMonths: [3, 6, 9, 12],
  halfYearMonths: [5, 11],
  food: 0, // Nastav podľa svojej firmy — zrážka za stravu sa líši
  dds: 0, // Nastav podľa svojej zmluvy o DDS (3. pilier), ak ho máš
  mealVouchers: 0,
  ddsEmployerTaxable: 15.0,
  nczd: 497.23,
  healthRate: 5,
  sicknessRate: 1.4,
  disabilityRate: 3,
  pensionRate: 4,
  unemploymentRate: 1,
};

export interface MonthExtras {
  vacationHours: number;
  fundHoursOverride?: number; // Ak zadané, použije sa NAMIESTO vypočítaného fondu — zadaj priamo číslo "Úväzok" z pásky (kolíše mesiac čo mesiac, napr. 176h alebo 132h, nedá sa spoľahlivo predpočítať)
  balanceAdjustmentHours?: number; // Prenesené saldo nadčasov z predošlého mesiaca (napr. "Saldo nadčasov" z poslednej pásky) — appka si ho naprieč mesiacmi nepamätá sama, zadaj ho ručne každý mesiac nanovo. Vypláca sa max. 32h/mesiac.
  annualTaxSettlement?: number; // Jednorazová položka "Ročné zúčt.dane" z pásky (raz ročne) — zadaj ako KLADNÉ číslo (refundácia), pripočíta sa priamo k čistej mzde
}

export const EMPTY_EXTRAS: MonthExtras = { vacationHours: 0 };

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
 * Nočný príplatok: Zákonník práce garantuje minimálnu výšku (40 % z
 * minimálnej hodinovej mzdy). Firemná referenčná sadzba (1,43 €/h) je
 * historicky nižšia než aktuálne zákonné minimum — v praxi teda vždy
 * platí to vyššie číslo. Over si `minWageHourly` každý rok k 1.1.
 */
function effectiveNightRate(cfg: PayrollConfig): number {
  return Math.max(cfg.nightRate, cfg.minWageHourly * 0.4);
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
 * segment padá na víkend. Sviatočný príplatok sa ale NEROBÍ po
 * segmentoch podľa kalendárneho dňa — podľa §122 Zákonníka práce a
 * ustálenej praxe sa CELÁ zmena posudzuje podľa dňa, kedy ZAČÍNA:
 *   - ak zmena začína V DEŇ SVIATKU → celá zmena (aj časť po polnoci
 *     na druhý deň) má nárok na sviatočný príplatok
 *   - ak zmena začína DEŇ PRED sviatkom (a končí ráno v deň sviatku)
 *     → nepatrí žiadny sviatočný príplatok, ani za tú časť, čo
 *     reálne padne do sviatočného dňa
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
  }
  // Sviatok: celá zmena podľa dňa ZAČIATKU (viď poznámka vyššie), nie po segmentoch.
  if (isPublicHoliday(iso)) out.holiday = paidHours;
  return out;
}

export interface PayrollBreakdown {
  workHours: number;
  vacationHours: number;
  pnHours: number; // Hodiny PN, ktoré vyňali fond (informačné, žiadna výplata sa z nich nepočíta)
  fundHours: number;
  overtimeHours: number;
  perDiemTotal: number; // Súčet diét z dní "Pracovná cesta" — informačné, NIE je súčasťou hrubej/čistej mzdy
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
  mealVouchers: number;
  annualTaxSettlement: number;
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
  times?: import("./shifts").PatternTimes; // skutočne nastavené časy zmien (Nastavenia) — ak chýba, použije sa DEFAULT_TIMES
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
  let calendarVacationHours = 0;
  let pnFundHours = 0;
  let perDiemTotal = 0;

  for (const date of eachDayOfInterval({ start, end })) {
    if (date < gate) continue;
    const iso = toISODate(date);
    const shift = opts.days[iso];
    const kind = shift?.kind ?? "off";
    if (kind === "vacation") {
      calendarVacationHours += shift?.hours ?? 0;
    } else if (kind === "trip") {
      // Pracovná cesta: flat hodiny, žiadne poobedné/nočné/víkendové/sviatočné
      // príplatky (bežná zahraničná pracovná doba, diéty sa riešia mimo appky).
      workHours += shift?.hours ?? 0;
      perDiemTotal += shift?.perDiem ?? 0;
    } else if (kind !== "off" && shift?.start && shift?.end) {
      let paid = netWorkHours(kind, shift.start, shift.end, BREAK_12H);
      // Predvolený "skorší príchod" (napr. 15 min) sa pripočíta len na
      // dni, kde je čas zmeny presne štandardný (06:00–18:00 /
      // 18:00–06:00) — teda si ho v ten deň ručne needitoval. Ak si
      // "Od"/"Do" pre konkrétny deň zmenil, ráta sa presne to, čo je
      // zadané, bez tohto bonusu (predpokladá sa, že si to už zohľadnil
      // priamo v zadanom čase). Zjednodušene sa pripočítava len do
      // odpracovaných/nadčasových hodín, nie do rozpisu poobedný/
      // nočný/víkendový/sviatočný príplatok (na to slúži ručná úprava
      // konkrétneho dňa v kalendári).
      const times = opts.times ?? DEFAULT_TIMES;
      const isDefaultTiming =
        (kind === "morning" && shift.start === times.morningStart && shift.end === times.morningEnd) ||
        (kind === "night" && shift.start === times.nightStart && shift.end === times.nightEnd) ||
        (kind === "shift8" && shift.start === times.shift8Start && shift.end === times.shift8End);
      if (isDefaultTiming && cfg.earlyArrivalMinutes > 0) {
        paid = roundCents(paid + cfg.earlyArrivalMinutes / 60);
      }
      workHours += paid;
      const prem = shiftPremiumHours(iso, shift.start, shift.end, paid, cfg);
      afternoonHours += prem.afternoon;
      nightHours += prem.night;
      weekendHours += prem.weekend;
      holidayHours += prem.holiday;
    }
    if (!isWeekend(date)) {
      // Fond pre VÝPOČET SADZBY (base pay rate) je NEZÁVISLÝ od
      // nastavenia "Denný fond" (to slúži len na sledovanie saldo/
      // nadčasu podľa tvojho reálneho úväzku, napr. 7,5h). Firma tu
      // používa štandardný celoštátny fond 8h/pracovný deň, sviatky sa
      // nedčítavajú (turnusoví zamestnanci) — potvrdené na páske:
      // 22 dní × 8h = 176h v apríli, presne sedí na Základná mzda.
      fundHours += 8;
      // PN (práceneschopnosť): deň sa nepočíta ako odpracovaný, ale
      // zároveň sa vyníma z fondu, aby ťa nepenalizoval na základnej
      // mzde — žiadna výplata sa zaňho zatiaľ nepočíta.
      if (kind === "pn") pnFundHours += 8;
    }
  }

  // "Úväzok" na páske kolíše mesiac čo mesiac spôsobom, ktorý sa
  // nepodarilo spoľahlivo predpovedať len z kalendára (napr. apríl
  // 176h, ale február 132h pri rovnakom type mesiaca) — ak je k
  // dispozícii ručne zadaná hodnota z konkrétnej pásky, použi tú
  // namiesto odhadu.
  if (typeof extras.fundHoursOverride === "number" && extras.fundHoursOverride > 0) {
    fundHours = extras.fundHoursOverride;
  }

  // Dovolenka sa spočíta z dní označených v kalendári ako "Dovolenka"
  // A pripočíta sa k ručne zadanému číslu (napr. pre mesiace, keď ešte
  // kalendár nie je takto vyplnený deň po dni).
  const vacationHours = Math.max(0, calendarVacationHours + extras.vacationHours);
  const remainingFund = Math.max(0, fundHours - vacationHours - pnFundHours);

  // Regulárne hodiny vychádzajú ČISTO z toho, čo je tento mesiac
  // reálne v kalendári (žiadne prenesené saldo) — presne toľko, koľko
  // reálne pokrýva fond tohto mesiaca.
  const regularHours = Math.min(workHours, remainingFund);
  const rawOvertimeBasis = workHours - remainingFund; // môže byť aj záporné (menej odpracované než fond)

  // Prenesené saldo z minulého mesiaca (napr. "Saldo nadčasov" z
  // poslednej pásky — zadaj ho v appke ručne, appka si ho naprieč
  // mesiacmi nepamätá sama). Kladné = mal si nadčas navyše, ktorý sa
  // ešte nevyplatil; záporné = dlžíš hodiny. Vypláca sa maximálne
  // 32 h nadčasu za mesiac (zvyšok nad 32 h sa ďalej neprenáša
  // automaticky — over si na nasledujúcej páske skutočný zostatok
  // a zadaj ho nabudúce nanovo). Ak je súčet záporný alebo nula,
  // nevypláca sa nič a ani sa nič nestrháva — jednoducho sa čaká,
  // kým sa saldo postupne vyrovná.
  const carryIn = extras.balanceAdjustmentHours ?? 0;
  const overtimeBasisWithCarry = rawOvertimeBasis + carryIn;
  const overtimeHours = Math.max(0, Math.min(32, overtimeBasisWithCarry));

  // Odvodená hodinová sadzba z tarifného platu — mení sa mesiac čo
  // mesiac podľa toho, koľko má mesiac fondových hodín (presne ako
  // na páske: 1 510 / 176 h v apríli = 8,58 €/h).
  const derivedRate = fundHours > 0 ? cfg.tariffMonthly / fundHours : 0;

  const base = regularHours * derivedRate;
  const overtimeBase = overtimeHours * derivedRate;
  const vacationPay = vacationHours * cfg.ppuRate;
  const afternoonPay = afternoonHours * cfg.afternoonRate;
  const nightPay = nightHours * effectiveNightRate(cfg);
  const weekendPay = weekendHours * cfg.weekendRate;
  const holidayPay = holidayHours * cfg.ppuRate * (cfg.holidayPercent / 100);
  const overtimePay = overtimeHours * cfg.ppuRate * (cfg.overtimePercent / 100);
  const vykonBonus = roundCents((base + overtimeBase) * (cfg.vykonBonusPercent / 100));
  const month = opts.cursor.getMonth() + 1;
  const travel = workHours > 0 ? cfg.travel : 0;
  const attendance = workHours > 0 || vacationHours > 0 ? attendanceFor(month, cfg) : 0;
  const halfYear = halfYearPay(month, cfg);

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
      halfYear,
  );

  const health = roundCents(gross * (cfg.healthRate / 100));
  const sickness = roundCents(gross * (cfg.sicknessRate / 100));
  const disability = roundCents(gross * (cfg.disabilityRate / 100));
  const pension = roundCents(gross * (cfg.pensionRate / 100));
  const unemployment = roundCents(gross * (cfg.unemploymentRate / 100));
  const insurance = roundCents(health + sickness + disability + pension + unemployment);
  const preNczd = roundCents(gross - insurance + cfg.ddsEmployerTaxable);
  const nczd = monthlyNczd(cfg);
  const taxBase = Math.max(0, roundCents(preNczd - nczd));
  const tax = progressiveTax(taxBase);
  const food = cfg.food;
  const dds = cfg.dds;
  const annualTaxSettlement = extras.annualTaxSettlement ?? 0; // jednorazová položka "Ročné zúčt.dane" — kladné číslo z pásky (aj keď je tam so znamienkom mínus, je to REFUNDÁCIA, teda plus pre teba)
  const net = roundCents(gross - insurance - tax - food - dds + cfg.mealVouchers + annualTaxSettlement);

  return {
    workHours: roundCents(workHours),
    perDiemTotal: roundCents(perDiemTotal),
    vacationHours: roundCents(vacationHours),
    pnHours: roundCents(pnFundHours),
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
    mealVouchers: roundCents(cfg.mealVouchers),
    annualTaxSettlement: roundCents(annualTaxSettlement),
    net,
  };
}