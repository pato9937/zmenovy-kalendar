import { eachDayOfInterval, endOfMonth, endOfYear, getDay, startOfMonth, startOfYear } from "date-fns";
import { format } from "date-fns";
import { sk } from "date-fns/locale/sk";
import { cn } from "@/lib/utils";
import { formatDelta, toISODate } from "@/lib/dates";
import { getHoliday } from "@/lib/holidays";
import { computeStats, type DayShift, type ShiftKind } from "@/lib/shifts";
import { useShiftStore } from "@/lib/store";

interface YearViewProps {
  year: number;
  days: Record<string, DayShift>;
  onPickMonth: (monthIndex: number) => void;
}

export function YearView({ year, days, onPickMonth }: YearViewProps) {
  const standardDailyHours = useShiftStore((s) => s.standardDailyHours);
  const patternStart = useShiftStore((s) => s.patternStart);
  const yearCursor = new Date(year, 0, 1);
  const yearStats = computeStats({
    days,
    from: toISODate(startOfYear(yearCursor)),
    to: toISODate(endOfYear(yearCursor)),
    standardDailyHours,
    patternStart,
  });
  const plus = yearStats.delta > 0;
  const minus = yearStats.delta < 0;

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between rounded-2xl bg-card px-4 py-3 shadow-border">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Saldo roku
          </p>
          <p
            className={cn(
              "text-2xl font-semibold tabular-nums tracking-tight",
              plus && "text-night",
              minus && "text-holiday",
            )}
          >
            {formatDelta(yearStats.delta)}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="tabular-nums text-foreground">{yearStats.workDays}</span> zmien
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 12 }, (_, month) => (
          <MiniMonth
            key={month}
            year={year}
            month={month}
            days={days}
            onPick={() => onPickMonth(month)}
          />
        ))}
      </div>
    </div>
  );
}

function MiniMonth({
  year,
  month,
  days,
  onPick,
}: {
  year: number;
  month: number;
  days: Record<string, DayShift>;
  onPick: () => void;
}) {
  const standardDailyHours = useShiftStore((s) => s.standardDailyHours);
  const patternStart = useShiftStore((s) => s.patternStart);
  const start = startOfMonth(new Date(year, month, 1));
  const end = endOfMonth(start);
  const leading = (getDay(start) + 6) % 7;
  const monthDays = eachDayOfInterval({ start, end });
  const cells: Array<Date | null> = [];
  for (let i = 0; i < leading; i += 1) cells.push(null);
  cells.push(...monthDays);

  const stats = computeStats({
    days,
    from: toISODate(start),
    to: toISODate(end),
    standardDailyHours,
    patternStart,
  });
  const showDelta = stats.workDays > 0 || stats.standardHours > 0;

  return (
    <button
      type="button"
      onClick={onPick}
      className="rounded-2xl bg-card p-3 text-left shadow-border transition-transform duration-150 ease-out active:scale-[0.98]"
    >
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="text-xs font-medium capitalize text-muted-foreground">
          {format(start, "LLLL", { locale: sk })}
        </p>
        {showDelta ? (
          <p
            className={cn(
              "text-2xs font-medium tabular-nums",
              stats.delta > 0 && "text-night",
              stats.delta < 0 && "text-holiday",
              stats.delta === 0 && "text-subtle",
            )}
          >
            {formatDelta(stats.delta)}
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((date, i) => {
          if (!date) return <span key={`e-${i}`} className="aspect-square" />;
          const iso = toISODate(date);
          const shift = days[iso];
          const holiday = Boolean(getHoliday(iso));
          return (
            <span
              key={iso}
              className={cn(
                "aspect-square rounded-sm",
                miniTone(shift?.kind ?? null),
                holiday && "ring-1 ring-holiday",
              )}
            />
          );
        })}
      </div>
    </button>
  );
}

function miniTone(kind: ShiftKind | null) {
  if (kind === "morning") return "bg-morning";
  if (kind === "night") return "bg-night";
  if (kind === "shift8") return "bg-shift8";
  if (kind === "extra") return "bg-extra";
  if (kind === "vacation") return "bg-vacation";
  if (kind === "trip") return "bg-trip";
  if (kind === "pn") return "bg-pn";
  if (kind === "off") return "bg-off";
  return "bg-transparent";
}
