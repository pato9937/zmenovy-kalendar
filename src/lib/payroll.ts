import { addDays, eachDayOfInterval, endOfMonth, isWeekend, startOfMonth } from "date-fns";
import { fromISODate, toISODate, toMinutes } from "./dates";
import { isDayOfRest, isPublicHoliday } from "./holidays";
import { BREAK_12H, netWorkHours, type DayShift } from "./shifts";

export interface PayrollConfig {
  hourlyRate: number;
  afternoonRate: number;
  nightRate: number;
  weekendRate: number;
  holidayPercent: number;
  overtimePercent: number;
  afternoonFrom: string;
  afternoonTo: string;
  nightFrom: string;
  nightTo: string;
  travel: number;
  attendance: number;
  attendanceBonus: number;
  attendanceMonths: number[];
  halfYearMonths: number[];
  food: number;
  dds: number;
  nczd: number;
  healthRate: number;
  sicknessRate: number;
  disabilityRate: number;
  pensionRate: number;
  unemploymentRate: number;
}

export interface MonthExtras {
  vacationHours: number;
  extraGross: number;
}

export const DEFAULT_PAYROLL: PayrollConfig = {
  hourlyRate: 12.5118,
  afternoonRate: 0.8,
  nightRate: 2.1,
  weekendRate: 1.4,
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
  halfYearMonths: [6, 12],
  food: 10,
  dds: 15,
  nczd: 497.23,
  healthRate: 5,
  sicknessRate: 1.4,
  disabilityRate: 3,
  pensionRate: 4,
  unemploymentRate: 1,
};

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
    if (isWeekend(date)) out.weekend += hours;
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
  vacationPay: number;
  afternoonPay: number;
  nightPay: number;
  weekendPay: number;
  holidayPay: number;
  overtimePay: number;
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

function halfYearPay(month: number, cfg: PayrollConfig, basePay: number): number {
  if (!cfg.halfYearMonths.includes(month)) return 0;
  return roundCents(basePay / 2);
}

function monthlyNczd(preNczd: number, full: number): number {
  if (preNczd <= 2173.59) return full;
  return Math.max(0, roundCents(14661.11 / 12 - preNczd / 3));
}

function progressiveTax(base: number): number {
  if (base <= 0) return 0;
  const bands = [
    { upTo: 3665.28, rate: 0.19 },
    { upTo: 5029.1, rate: 0.25 },
    { upTo: 6250.86, rate: 0.3 },
    { upTo: Infinity, rate: 0.35 },
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

  const base = workHours * cfg.hourlyRate;
  const vacationPay = vacationHours * cfg.hourlyRate;
  const afternoonPay = afternoonHours * cfg.afternoonRate;
  const nightPay = nightHours * cfg.nightRate;
  const weekendPay = weekendHours * cfg.weekendRate;
  const holidayPay = holidayHours * cfg.hourlyRate * (cfg.holidayPercent / 100);
  const overtimePay = overtimeHours * cfg.hourlyRate * (cfg.overtimePercent / 100);
  const month = opts.cursor.getMonth() + 1;
  const travel = workHours > 0 ? cfg.travel : 0;
  const attendance = workHours > 0 || vacationHours > 0 ? attendanceFor(month, cfg) : 0;
  const halfYear = halfYearPay(month, cfg, base + vacationPay);
  const extraGross = extras.extraGross;

  const gross = roundCents(
    base +
      vacationPay +
      afternoonPay +
      nightPay +
      weekendPay +
      holidayPay +
      overtimePay +
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
  const nczd = monthlyNczd(preNczd, cfg.nczd);
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
    vacationPay: roundCents(vacationPay),
    afternoonPay: roundCents(afternoonPay),
    nightPay: roundCents(nightPay),
    weekendPay: roundCents(weekendPay),
    holidayPay: roundCents(holidayPay),
    overtimePay: roundCents(overtimePay),
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
