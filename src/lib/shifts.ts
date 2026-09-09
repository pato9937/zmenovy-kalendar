import {
  addDays,
  addMonths,
  eachDayOfInterval,
  differenceInCalendarDays,
  getDay,
  isWeekend,
  startOfWeek,
} from "date-fns";
import { durationHours, fromISODate, toISODate } from "./dates";
import { isDayOfRest } from "./holidays";

export type ShiftKind = "morning" | "night" | "shift8" | "extra" | "vacation" | "trip" | "pn" | "off";
export type PatternType = "rot12" | "week8" | "week8alt";

export interface DayShift {
  kind: ShiftKind;
  start: string;
  end: string;
  hours: number;
  note: string;
  manual: boolean;
  perDiem?: number; // Diéta za pracovnú cestu (€) — platená mimo výplaty, len evidenčné
}

export interface PatternTimes {
  morningStart: string;
  morningEnd: string;
  nightStart: string;
  nightEnd: string;
  shift8Start: string;
  shift8End: string;
  shift8PmStart: string; // Poobedný týždeň pri striedavej 7,5h rotácii
  shift8PmEnd: string;
}

export const DEFAULT_TIMES: PatternTimes = {
  morningStart: "06:00",
  morningEnd: "18:00",
  nightStart: "18:00",
  nightEnd: "06:00",
  shift8Start: "06:00",
  shift8End: "14:00",
  shift8PmStart: "14:00",
  shift8PmEnd: "22:00",
};

/** Neplatená prestávka na 12-hodinovej zmene (6–18 / 18–6). */
export const BREAK_12H = 1;
/** Neplatená prestávka na 7,5h zmene (napr. 6:00–14:00 = 7,5h platených). */
export const BREAK_SHIFT8 = 0.5;

export const KIND_LABEL: Record<ShiftKind, string> = {
  morning: "Ranná",
  night: "Nočná",
  shift8: "8-hodinová",
  extra: "Navyše",
  vacation: "Dovolenka",
  trip: "Pracovná cesta",
  pn: "PN",
  off: "Voľno",
};

export const KIND_SHORT: Record<ShiftKind, string> = {
  morning: "R",
  night: "N",
  shift8: "8",
  extra: "+",
  vacation: "D",
  trip: "C",
  pn: "PN",
  off: "V",
};

const ROT12: ShiftKind[] = [
  "morning",
  "morning",
  "night",
  "night",
  "off",
  "off",
  "off",
  "off",
];

export const ROTATION_MONTHS = 60;

export function rotationEndISO(start: string): string {
  return toISODate(addDays(addMonths(fromISODate(start), ROTATION_MONTHS), -1));
}

export function netWorkHours(
  kind: ShiftKind,
  start: string,
  end: string,
  break12 = BREAK_12H,
): number {
  if (kind === "off" || kind === "vacation" || kind === "trip" || kind === "pn" || !start || !end) return 0;
  const clock = durationHours(start, end);
  const unpaid =
    kind === "morning" || kind === "night" || (kind === "extra" && clock >= 11)
      ? break12
      : kind === "shift8"
        ? BREAK_SHIFT8
        : 0;
  return Math.round(Math.max(0, clock - unpaid) * 100) / 100;
}

export function makeShift(
  kind: ShiftKind,
  times: PatternTimes,
  manual: boolean,
  note = "",
): DayShift {
  if (kind === "off") {
    return { kind, start: "", end: "", hours: 0, note, manual };
  }
  if (kind === "vacation") {
    return { kind, start: "", end: "", hours: 11, note, manual };
  }
  if (kind === "trip") {
    return { kind, start: "", end: "", hours: 8, note, manual, perDiem: 0 };
  }
  if (kind === "pn") {
    return { kind, start: "", end: "", hours: 0, note, manual };
  }
  const { start, end } = timesForKind(kind, times);
  return {
    kind,
    start,
    end,
    hours: netWorkHours(kind, start, end),
    note,
    manual,
  };
}

export function timesForKind(
  kind: Exclude<ShiftKind, "off">,
  times: PatternTimes,
): { start: string; end: string } {
  if (kind === "morning") return { start: times.morningStart, end: times.morningEnd };
  if (kind === "night") return { start: times.nightStart, end: times.nightEnd };
  if (kind === "shift8") return { start: times.shift8Start, end: times.shift8End };
  return { start: times.morningStart, end: times.morningEnd };
}

export function generateRotation(opts: {
  type: PatternType;
  start: string;
  times: PatternTimes;
  existing: Record<string, DayShift>;
  overwriteManual: boolean;
}): Record<string, DayShift> {
  const origin = fromISODate(opts.start);
  const end = addDays(addMonths(origin, ROTATION_MONTHS), -1);
  const interval = eachDayOfInterval({ start: origin, end });
  const next: Record<string, DayShift> = { ...opts.existing };

  for (const date of interval) {
    const iso = toISODate(date);
    const prev = opts.existing[iso];
    if (prev?.manual && !opts.overwriteManual) continue;

    if (opts.type === "week8alt") {
      const dow = getDay(date);
      if (dow === 0 || dow === 6) {
        next[iso] = makeShift("off", opts.times, false, prev?.note ?? "");
        continue;
      }
      // Týždne (Po–Ne) sa počítajú od týždňa, v ktorom je "start" —
      // párny index = ranný týždeň, nepárny = poobedný týždeň.
      const weekIndex = Math.floor(
        differenceInCalendarDays(startOfWeek(date, { weekStartsOn: 1 }), startOfWeek(origin, { weekStartsOn: 1 })) / 7,
      );
      const isAfternoonWeek = ((weekIndex % 2) + 2) % 2 === 1;
      const shiftStart = isAfternoonWeek ? opts.times.shift8PmStart : opts.times.shift8Start;
      const shiftEnd = isAfternoonWeek ? opts.times.shift8PmEnd : opts.times.shift8End;
      next[iso] = {
        kind: "shift8",
        start: shiftStart,
        end: shiftEnd,
        hours: netWorkHours("shift8", shiftStart, shiftEnd),
        note: prev?.note ?? "",
        manual: false,
      };
      continue;
    }

    let kind: ShiftKind = "off";
    if (opts.type === "rot12") {
      const i = differenceInCalendarDays(date, origin);
      kind = ROT12[((i % 8) + 8) % 8] ?? "off";
    } else {
      const dow = getDay(date);
      kind = dow === 0 || dow === 6 ? "off" : "shift8";
    }
    next[iso] = makeShift(kind, opts.times, false, prev?.note ?? "");
  }
  return next;
}

export interface PeriodStats {
  workedHours: number;
  standardHours: number;
  delta: number;
  morningCount: number;
  nightCount: number;
  shift8Count: number;
  extraCount: number;
  offCount: number;
  workDays: number;
  fundDays: number;
}

export function computeStats(opts: {
  days: Record<string, DayShift>;
  from: string;
  to: string;
  standardDailyHours: number;
  patternStart: string | null;
}): PeriodStats {
  const start = fromISODate(opts.from);
  const end = fromISODate(opts.to);
  const gate = opts.patternStart ? fromISODate(opts.patternStart) : start;
  const stats: PeriodStats = {
    workedHours: 0,
    standardHours: 0,
    delta: 0,
    morningCount: 0,
    nightCount: 0,
    shift8Count: 0,
    extraCount: 0,
    offCount: 0,
    workDays: 0,
    fundDays: 0,
  };

  for (const date of eachDayOfInterval({ start, end })) {
    if (date < gate) continue;
    const iso = toISODate(date);
    const shift = opts.days[iso];
    const kind = shift?.kind ?? "off";
    const hours =
      kind === "off"
        ? 0
        : kind === "vacation" || kind === "trip"
          ? shift?.hours ?? 0
          : netWorkHours(kind, shift?.start ?? "", shift?.end ?? "", BREAK_12H);
    stats.workedHours += hours;
    if (kind !== "off") stats.workDays += 1;
    if (kind === "morning") stats.morningCount += 1;
    else if (kind === "night") stats.nightCount += 1;
    else if (kind === "shift8") stats.shift8Count += 1;
    else if (kind === "extra") stats.extraCount += 1;
    else stats.offCount += 1;

    if (!isWeekend(date) && !isDayOfRest(iso) && kind !== "vacation" && kind !== "pn") {
      stats.fundDays += 1;
      stats.standardHours += opts.standardDailyHours;
    }
  }

  stats.workedHours = Math.round(stats.workedHours * 10) / 10;
  stats.standardHours = Math.round(stats.standardHours * 10) / 10;
  stats.delta = Math.round((stats.workedHours - stats.standardHours) * 10) / 10;
  return stats;
}

export function nextWorkDay(
  days: Record<string, DayShift>,
  fromISO: string,
): { iso: string; shift: DayShift } | null {
  const start = fromISODate(fromISO);
  for (let i = 0; i < 60; i += 1) {
    const iso = toISODate(addDays(start, i));
    const shift = days[iso];
    if (shift && shift.kind !== "off") return { iso, shift };
  }
  return null;
}

export function swapShifts(
  days: Record<string, DayShift>,
  a: string,
  b: string,
): Record<string, DayShift> {
  const left = days[a] ?? makeShift("off", DEFAULT_TIMES, true);
  const right = days[b] ?? makeShift("off", DEFAULT_TIMES, true);
  return {
    ...days,
    [a]: { ...right, manual: true },
    [b]: { ...left, manual: true },
  };
}