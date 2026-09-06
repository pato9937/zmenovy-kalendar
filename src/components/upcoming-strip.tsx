import { addDays, getDay, isToday, isWeekend } from "date-fns";
import { cn } from "@/lib/utils";
import { formatTimeShort, toISODate, WEEKDAYS } from "@/lib/dates";
import { getHoliday } from "@/lib/holidays";
import type { DayShift, ShiftKind } from "@/lib/shifts";
import { useShiftStore } from "@/lib/store";

export function UpcomingStrip({ onSelect }: { onSelect: (iso: string) => void }) {
  const days = useShiftStore((s) => s.days);
  const items = Array.from({ length: 8 }, (_, i) => {
    const date = addDays(new Date(), i);
    const iso = toISODate(date);
    return { date, iso, shift: days[iso] as DayShift | undefined };
  });

  return (
    <section className="rounded-2xl bg-card p-3 shadow-border">
      <p className="mb-2 px-0.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        Najbližších 8 dní
      </p>
      <div className="grid grid-cols-8 gap-1">
        {items.map(({ date, iso, shift }) => {
          const holiday = Boolean(getHoliday(iso));
          const kind: ShiftKind = shift?.kind ?? "off";
          const weekend = isWeekend(date);
          const weekday = WEEKDAYS[(getDay(date) + 6) % 7];
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={cn(
                "flex min-h-14 flex-col items-center rounded-lg px-0.5 py-1 text-center outline-none touch-manipulation",
                "transition-transform duration-150 ease-out active:scale-[0.96]",
                "focus-visible:ring-2 focus-visible:ring-ring",
                stripTone(kind, weekend),
                isToday(date) && "ring-1 ring-foreground/50",
              )}
            >
              <span
                className={cn(
                  "text-2xs font-medium uppercase leading-none",
                  holiday ? "text-holiday" : "opacity-70",
                )}
              >
                {weekday}
              </span>
              <span
                className={cn(
                  "mt-1 text-xs font-semibold tabular-nums leading-none",
                  holiday && "text-holiday",
                )}
              >
                {date.getDate()}
              </span>
              {kind !== "off" && shift ? (
                <span className="mt-auto text-2xs font-medium tabular-nums leading-tight">
                  {formatTimeShort(shift.start)}–{formatTimeShort(shift.end)}
                </span>
              ) : (
                <span className="mt-auto text-2xs leading-none opacity-50">·</span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function stripTone(kind: ShiftKind, weekend: boolean) {
  if (kind === "morning") return "bg-morning-dim text-morning";
  if (kind === "night") return "bg-night-dim text-night";
  if (kind === "shift8") return "bg-shift8-dim text-shift8";
  if (kind === "extra") return "bg-extra-dim text-extra";
  if (kind === "vacation") return "bg-vacation-dim text-vacation";
  if (weekend) return "bg-weekend text-subtle";
  return "bg-off-dim text-off-fg";
}
