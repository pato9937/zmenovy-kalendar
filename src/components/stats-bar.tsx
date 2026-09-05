import { addDays, endOfMonth, endOfYear, format, startOfMonth, startOfYear } from "date-fns";
import { sk } from "date-fns/locale/sk";
import {
  formatDelta,
  formatHours,
  formatRange,
  fromISODate,
  toISODate,
  todayISO,
} from "@/lib/dates";
import { computeStats, KIND_LABEL, nextWorkDay, rotationEndISO } from "@/lib/shifts";
import { useShiftStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useState } from "react";

type StatsRange = "month" | "year" | "all";

export function StatsBar({ cursor }: { cursor: Date }) {
  const days = useShiftStore((s) => s.days);
  const standardDailyHours = useShiftStore((s) => s.standardDailyHours);
  const patternStart = useShiftStore((s) => s.patternStart);
  const [range, setRange] = useState<StatsRange>("month");

  const bounds = rangeBounds(range, cursor, patternStart);
  const stats = computeStats({
    days,
    from: bounds.from,
    to: bounds.to,
    standardDailyHours,
    patternStart,
  });

  const upcoming = nextWorkDay(days, todayISO());
  const plus = stats.delta > 0;
  const minus = stats.delta < 0;

  return (
    <section className="rounded-2xl bg-card px-4 py-3 shadow-border">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Saldo · {bounds.label}
          </p>
          <p
            className={cn(
              "text-2xl font-semibold tracking-tight tabular-nums",
              plus && "text-night",
              minus && "text-holiday",
              !plus && !minus && "text-foreground",
            )}
          >
            {formatDelta(stats.delta)}
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>
            Odpracované{" "}
            <span className="tabular-nums text-foreground">{formatHours(stats.workedHours)}</span>
          </p>
          <p>
            Fond{" "}
            <span className="tabular-nums text-foreground">{formatHours(stats.standardHours)}</span>
            <span className="text-subtle"> · {stats.fundDays} dní</span>
          </p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-full bg-surface-2 p-0.5">
          {(
            [
              ["month", "Mesiac"],
              ["year", String(cursor.getFullYear())],
              ["all", "Rotácia"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setRange(id)}
              className={cn(
                "h-8 rounded-full px-2.5 text-xs font-medium",
                range === id ? "bg-card text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-2xs text-muted-foreground">
          {stats.workDays ? `${stats.workDays} zmien` : null}
          {stats.morningCount ? ` · ${stats.morningCount}× R` : null}
          {stats.nightCount ? ` · ${stats.nightCount}× N` : null}
          {stats.shift8Count ? ` · ${stats.shift8Count}× 8 h` : null}
          {stats.extraCount ? ` · ${stats.extraCount}× +` : null}
        </p>
      </div>

      {upcoming ? (
        <p className="mt-2 border-t border-border pt-2 text-sm text-foreground">
          {upcoming.iso === todayISO()
            ? "Dnes"
            : upcoming.iso === toISODate(addDays(new Date(), 1))
              ? "Zajtra"
              : format(fromISODate(upcoming.iso), "EEEE d. M.", { locale: sk })}
          {" · "}
          {KIND_LABEL[upcoming.shift.kind]}{" "}
          {formatRange(upcoming.shift.start, upcoming.shift.end, true)}
        </p>
      ) : null}
    </section>
  );
}

function rangeBounds(range: StatsRange, cursor: Date, patternStart: string | null) {
  if (range === "year") {
    return {
      from: toISODate(startOfYear(cursor)),
      to: toISODate(endOfYear(cursor)),
      label: String(cursor.getFullYear()),
    };
  }
  if (range === "all" && patternStart) {
    return {
      from: patternStart,
      to: rotationEndISO(patternStart),
      label: "5 rokov",
    };
  }
  return {
    from: toISODate(startOfMonth(cursor)),
    to: toISODate(endOfMonth(cursor)),
    label: format(cursor, "LLLL", { locale: sk }),
  };
}
