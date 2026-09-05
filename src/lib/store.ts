import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_PAYROLL,
  EMPTY_EXTRAS,
  type MonthExtras,
  type PayrollConfig,
} from "./payroll";
import {
  DEFAULT_TIMES,
  generateRotation,
  makeShift,
  netWorkHours,
  swapShifts,
  type DayShift,
  type PatternTimes,
  type PatternType,
  type ShiftKind,
} from "./shifts";

export interface ShiftState extends PatternTimes {
  hasHydrated: boolean;
  setupDone: boolean;
  pattern: PatternType | null;
  patternStart: string | null;
  standardDailyHours: number;
  days: Record<string, DayShift>;
  payroll: PayrollConfig;
  monthExtras: Record<string, MonthExtras>;
}

interface ShiftActions {
  generate: (opts: {
    type: PatternType;
    start: string;
    overwriteManual: boolean;
    times?: Partial<PatternTimes>;
  }) => void;
  setKind: (iso: string, kind: ShiftKind) => void;
  updateDay: (iso: string, patch: Partial<DayShift>) => void;
  swap: (a: string, b: string) => void;
  setStandardHours: (hours: number) => void;
  setTimes: (times: Partial<PatternTimes>, applyToGenerated: boolean) => void;
  setPayroll: (patch: Partial<PayrollConfig>) => void;
  setMonthExtras: (key: string, patch: Partial<MonthExtras>) => void;
  reset: () => void;
}

const INITIAL: Omit<ShiftState, "hasHydrated"> = {
  setupDone: false,
  pattern: null,
  patternStart: null,
  standardDailyHours: 7.5,
  days: {},
  payroll: { ...DEFAULT_PAYROLL },
  monthExtras: {},
  ...DEFAULT_TIMES,
};

export const useShiftStore = create<ShiftState & ShiftActions>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      ...INITIAL,
      generate: ({ type, start, overwriteManual, times }) => {
        const state = get();
        const nextTimes = { ...pickTimes(state), ...times };
        const days = generateRotation({
          type,
          start,
          times: nextTimes,
          existing: state.days,
          overwriteManual,
        });
        set({
          ...nextTimes,
          days,
          pattern: type,
          patternStart: start,
          setupDone: true,
        });
      },
      setKind: (iso, kind) => {
        const state = get();
        const prev = state.days[iso];
        const next = makeShift(kind, pickTimes(state), true, prev?.note ?? "");
        set({ days: { ...state.days, [iso]: next } });
      },
      updateDay: (iso, patch) => {
        const state = get();
        const current = state.days[iso] ?? makeShift("off", pickTimes(state), true);
        const merged: DayShift = { ...current, ...patch, manual: true };
        if (patch.start !== undefined || patch.end !== undefined) {
          if (merged.start && merged.end) {
            merged.hours = netWorkHours(merged.kind, merged.start, merged.end);
          }
        }
        set({ days: { ...state.days, [iso]: merged } });
      },
      swap: (a, b) => {
        if (a === b) return;
        set({ days: swapShifts(get().days, a, b) });
      },
      setStandardHours: (hours) => set({ standardDailyHours: hours }),
      setTimes: (times, applyToGenerated) => {
        const state = get();
        const nextTimes = { ...pickTimes(state), ...times };
        if (!applyToGenerated) {
          set(nextTimes);
          return;
        }
        const days: Record<string, DayShift> = { ...state.days };
        for (const [iso, shift] of Object.entries(days)) {
          if (shift.manual || shift.kind === "off" || shift.kind === "extra") continue;
          days[iso] = makeShift(shift.kind, nextTimes, false, shift.note);
        }
        set({ ...nextTimes, days });
      },
      setPayroll: (patch) => {
        set({ payroll: { ...get().payroll, ...patch } });
      },
      setMonthExtras: (key, patch) => {
        const prev = get().monthExtras[key] ?? EMPTY_EXTRAS;
        set({
          monthExtras: {
            ...get().monthExtras,
            [key]: { ...prev, ...patch },
          },
        });
      },
      reset: () => set({ ...INITIAL, hasHydrated: true, payroll: { ...DEFAULT_PAYROLL } }),
    }),
    {
      name: "zmeny-v1",
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state) {
          useShiftStore.setState({
            hasHydrated: true,
            payroll: { ...DEFAULT_PAYROLL, ...state.payroll },
            monthExtras: state.monthExtras ?? {},
          });
        } else {
          useShiftStore.setState({ hasHydrated: true });
        }
      },
      partialize: (s) => ({
        setupDone: s.setupDone,
        pattern: s.pattern,
        patternStart: s.patternStart,
        standardDailyHours: s.standardDailyHours,
        days: s.days,
        morningStart: s.morningStart,
        morningEnd: s.morningEnd,
        nightStart: s.nightStart,
        nightEnd: s.nightEnd,
        shift8Start: s.shift8Start,
        shift8End: s.shift8End,
        payroll: s.payroll,
        monthExtras: s.monthExtras,
      }),
    },
  ),
);

function pickTimes(state: PatternTimes): PatternTimes {
  return {
    morningStart: state.morningStart,
    morningEnd: state.morningEnd,
    nightStart: state.nightStart,
    nightEnd: state.nightEnd,
    shift8Start: state.shift8Start,
    shift8End: state.shift8End,
  };
}
