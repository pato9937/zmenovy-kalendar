import { useEffect, useMemo, useRef, useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  getDay,
  isToday,
  isWeekend,
  startOfMonth,
} from "date-fns";
import { cn } from "@/lib/utils";
import { formatTimeShort, toISODate, WEEKDAYS } from "@/lib/dates";
import { getHoliday } from "@/lib/holidays";
import type { DayShift, ShiftKind } from "@/lib/shifts";

interface CalendarMonthProps {
  cursor: Date;
  days: Record<string, DayShift>;
  selected: string | null;
  moveSource: string | null;
  onSelect: (iso: string) => void;
  onSwipeMonth: (delta: number) => void;
  onSwap: (from: string, to: string) => void;
  onMoveStart: (iso: string) => void;
}

export function CalendarMonth({
  cursor,
  days,
  selected,
  moveSource,
  onSelect,
  onSwipeMonth,
  onSwap,
  onMoveStart,
}: CalendarMonthProps) {
  const touch = useRef<{ x: number; y: number } | null>(null);
  const ignoreSwipe = useRef(false);
  const [overIso, setOverIso] = useState<string | null>(null);
  const [finePointer, setFinePointer] = useState(false);
  const cells = useMemo(() => buildCells(cursor), [cursor]);

  useEffect(() => {
    setFinePointer(window.matchMedia("(pointer: fine)").matches);
  }, []);

  return (
    <div
      className="rounded-2xl bg-card p-3 shadow-border sm:p-4"
      onTouchStart={(e) => {
        const t = e.changedTouches[0];
        if (!t) return;
        ignoreSwipe.current = false;
        touch.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        const start = touch.current;
        const t = e.changedTouches[0];
        touch.current = null;
        if (ignoreSwipe.current || !start || !t) return;
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy)) return;
        onSwipeMonth(dx < 0 ? 1 : -1);
      }}
    >
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={cn(
              "pb-2 text-center text-2xs font-medium uppercase tracking-wider",
              i >= 5 ? "text-subtle" : "text-muted-foreground",
            )}
          >
            {d}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (!cell) {
            return <div key={`empty-${i}`} className="h-16" />;
          }
          return (
            <DayCell
              key={cell.iso}
              iso={cell.iso}
              date={cell.date}
              shift={days[cell.iso]}
              selected={selected === cell.iso}
              moveSource={moveSource === cell.iso}
              moveTarget={Boolean(moveSource) && moveSource !== cell.iso}
              dropTarget={overIso === cell.iso}
              draggable={finePointer}
              onSelect={onSelect}
              onSwap={onSwap}
              onMoveStart={(iso) => {
                ignoreSwipe.current = true;
                onMoveStart(iso);
              }}
              onDragActive={(active, over) => {
                ignoreSwipe.current = active;
                setOverIso(over);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function buildCells(cursor: Date) {
  const start = startOfMonth(cursor);
  const end = endOfMonth(cursor);
  const leading = (getDay(start) + 6) % 7;
  const monthDays = eachDayOfInterval({ start, end });
  const cells: Array<{ iso: string; date: Date } | null> = [];
  for (let i = 0; i < leading; i += 1) cells.push(null);
  for (const date of monthDays) {
    cells.push({ iso: toISODate(date), date });
  }
  const trailing = (7 - (cells.length % 7)) % 7;
  for (let i = 0; i < trailing; i += 1) cells.push(null);
  return cells;
}

function DayCell({
  iso,
  date,
  shift,
  selected,
  moveSource,
  moveTarget,
  dropTarget,
  draggable,
  onSelect,
  onSwap,
  onMoveStart,
  onDragActive,
}: {
  iso: string;
  date: Date;
  shift: DayShift | undefined;
  selected: boolean;
  moveSource: boolean;
  moveTarget: boolean;
  dropTarget: boolean;
  draggable: boolean;
  onSelect: (iso: string) => void;
  onSwap: (from: string, to: string) => void;
  onMoveStart: (iso: string) => void;
  onDragActive: (active: boolean, over: string | null) => void;
}) {
  const holiday = getHoliday(iso);
  const weekend = isWeekend(date);
  const kind: ShiftKind = shift?.kind ?? "off";
  const today = isToday(date);
  const press = useRef<{ id: number; x: number; y: number } | null>(null);
  const skipClick = useRef(false);

  function clearPress() {
    if (press.current) {
      window.clearTimeout(press.current.id);
      press.current = null;
    }
  }

  return (
    <button
      type="button"
      draggable={draggable}
      onClick={() => {
        if (skipClick.current) {
          skipClick.current = false;
          return;
        }
        onSelect(iso);
      }}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse") return;
        clearPress();
        press.current = {
          x: e.clientX,
          y: e.clientY,
          id: window.setTimeout(() => {
            press.current = null;
            skipClick.current = true;
            if (typeof navigator !== "undefined" && "vibrate" in navigator) {
              navigator.vibrate(12);
            }
            onMoveStart(iso);
          }, 420),
        };
      }}
      onPointerMove={(e) => {
        if (!press.current) return;
        if (Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y) > 12) {
          clearPress();
        }
      }}
      onPointerUp={clearPress}
      onPointerCancel={clearPress}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", iso);
        e.dataTransfer.effectAllowed = "move";
        onDragActive(true, null);
      }}
      onDragEnd={() => onDragActive(false, null)}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragActive(true, iso);
      }}
      onDrop={(e) => {
        e.preventDefault();
        const from = e.dataTransfer.getData("text/plain");
        onDragActive(false, null);
        if (from && from !== iso) onSwap(from, iso);
      }}
      aria-label={iso}
      className={cn(
        "relative flex h-[4.5rem] flex-col items-start overflow-hidden rounded-lg p-1.5 text-left outline-none touch-manipulation",
        "transition-[transform,background-color,box-shadow] duration-150 ease-out",
        "focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]",
        cellTone(kind, weekend),
        today && "ring-1 ring-foreground/50",
        selected && "ring-2 ring-foreground",
        moveSource && "ring-2 ring-morning",
        (moveTarget || dropTarget) && "outline-dashed outline-1 outline-foreground/35",
      )}
    >
      <span className="flex w-full items-start justify-between gap-0.5">
        <span
          className={cn(
            "text-xs font-semibold tabular-nums leading-none",
            holiday
              ? "text-holiday"
              : kind === "off" && !weekend
                ? "text-off-fg"
                : weekend || kind === "off"
                  ? "text-muted-foreground"
                  : "text-inherit",
          )}
        >
          {date.getDate()}
        </span>
        {shift?.note ? (
          <span className="mt-0.5 size-1 shrink-0 rounded-full bg-current opacity-70" />
        ) : null}
      </span>
      {holiday && kind !== "off" ? (
        <span className="mt-0.5 w-full truncate text-2xs leading-none text-holiday">
          Sviatok
        </span>
      ) : null}
      {kind !== "off" && kind !== "vacation" && kind !== "trip" && shift ? (
        <span className="mt-auto w-full truncate whitespace-nowrap text-2xs font-medium tabular-nums leading-tight">
          {formatTimeShort(shift.start)}–{formatTimeShort(shift.end)}
          {shift.end && shift.start && shift.end <= shift.start ? (
            <span className="opacity-70">+1</span>
          ) : null}
        </span>
      ) : kind === "vacation" ? (
        <span className="mt-auto w-full truncate text-2xs font-medium leading-tight">
          Dovolenka
        </span>
      ) : kind === "trip" ? (
        <span className="mt-auto w-full truncate text-2xs font-medium leading-tight">
          Cesta
        </span>
      ) : holiday ? (
        <span className="mt-auto w-full truncate text-2xs leading-tight text-holiday">
          Sviatok
        </span>
      ) : null}
    </button>
  );
}

function cellTone(kind: ShiftKind, weekend: boolean) {
  if (kind === "morning") return "bg-morning-dim text-morning";
  if (kind === "night") return "bg-night-dim text-night";
  if (kind === "shift8") return "bg-shift8-dim text-shift8";
  if (kind === "extra") return "bg-extra-dim text-extra";
  if (kind === "vacation") return "bg-vacation-dim text-vacation";
  if (kind === "trip") return "bg-trip-dim text-trip";
  if (weekend) return "bg-weekend text-subtle";
  return "bg-off-dim text-off-fg";
}
