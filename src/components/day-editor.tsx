import { ArrowLeftRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { formatDayLong, formatHours, formatRange, isOvernight } from "@/lib/dates";
import { getHoliday } from "@/lib/holidays";
import { BREAK_12H, KIND_LABEL, netWorkHours, type ShiftKind } from "@/lib/shifts";
import { useShiftStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const KINDS: ShiftKind[] = ["morning", "night", "shift8", "extra", "vacation", "off"];

interface DayEditorProps {
  iso: string | null;
  onClose: () => void;
  onMove: (iso: string) => void;
}

export function DayEditor({ iso, onClose, onMove }: DayEditorProps) {
  const days = useShiftStore((s) => s.days);
  const setKind = useShiftStore((s) => s.setKind);
  const updateDay = useShiftStore((s) => s.updateDay);
  const morningStart = useShiftStore((s) => s.morningStart);
  const morningEnd = useShiftStore((s) => s.morningEnd);
  const nightStart = useShiftStore((s) => s.nightStart);
  const nightEnd = useShiftStore((s) => s.nightEnd);
  const shift8Start = useShiftStore((s) => s.shift8Start);
  const shift8End = useShiftStore((s) => s.shift8End);

  const shift = iso ? days[iso] : undefined;
  const holiday = iso ? getHoliday(iso) : null;
  const kind: ShiftKind = shift?.kind ?? "off";

  return (
    <Drawer
      open={Boolean(iso)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={iso ? formatDayLong(iso) : "Deň"}
      description={
        holiday
          ? holiday.name
          : kind === "vacation"
            ? `Dovolenka · ${(shift?.hours ?? 0).toString().replace(".", ",")} h`
            : kind !== "off" && shift
              ? formatRange(shift.start, shift.end, true)
              : "Voľný deň"
      }
    >
      {iso ? (
        <div className="space-y-5 pb-2">
          {holiday ? (
            <p className="rounded-xl bg-holiday-dim px-3 py-2 text-sm text-holiday">
              {holiday.rest
                ? `Deň pracovného pokoja — ${holiday.name}`
                : `Sviatok, pracuje sa — ${holiday.name}`}
            </p>
          ) : null}

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Typ zmeny
            </p>
            <div className="grid grid-cols-2 gap-2">
              {KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(iso, k)}
                  className={cn(
                    "h-11 rounded-xl px-3 text-sm font-medium shadow-border transition-[transform,background-color] duration-150 ease-out active:scale-[0.97]",
                    k === "off" && "col-span-2",
                    kind === k ? chipActive(k) : "bg-surface-2 text-muted-foreground",
                  )}
                >
                  {KIND_LABEL[k]}
                </button>
              ))}
            </div>
          </div>

          {kind === "vacation" ? (
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Hodiny dovolenky</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                min={0}
                value={shift?.hours ?? 11}
                onChange={(e) => {
                  const v = Number(e.target.value.replace(",", "."));
                  updateDay(iso, { hours: Number.isFinite(v) ? Math.max(0, v) : 0, kind: "vacation", start: "", end: "" });
                }}
                className="mt-1 h-11 w-full rounded-xl bg-surface-2 px-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span className="mt-1 block text-2xs text-subtle">
                Zvyčajne toľko, koľko by bola trvala zmena, ktorú dovolenka nahrádza (12 h zmena = 11 h platených). Platí sa z priemeru PPÚ.
              </span>
            </label>
          ) : null}

          {kind !== "off" && kind !== "vacation" ? (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Od</span>
                <input
                  type="time"
                  value={shift?.start || defaultStart(kind, { morningStart, nightStart, shift8Start })}
                  onChange={(e) =>
                    updateDay(iso, { start: e.target.value, kind })
                  }
                  className="mt-1 h-11 w-full rounded-xl bg-surface-2 px-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">
                  Do {shift && isOvernight(shift.start || "18:00", shift.end || "06:00") ? "(ďalší deň)" : ""}
                </span>
                <input
                  type="time"
                  value={shift?.end || defaultEnd(kind, { morningEnd, nightEnd, shift8End })}
                  onChange={(e) => updateDay(iso, { end: e.target.value, kind })}
                  className="mt-1 h-11 w-full rounded-xl bg-surface-2 px-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <p className="col-span-2 text-sm text-muted-foreground">
                {(() => {
                  const net = shift
                    ? netWorkHours(kind, shift.start, shift.end)
                    : 0;
                  const showBreak =
                    (kind === "morning" || kind === "night") && BREAK_12H > 0;
                  return (
                    <>
                      Práca{" "}
                      <span className="tabular-nums text-foreground">{formatHours(net)}</span>
                      {showBreak ? ` · ${formatHours(BREAK_12H)} pauza` : null}
                      {shift?.manual ? " · upravené ručne" : null}
                    </>
                  );
                })()}
              </p>
            </div>
          ) : null}

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Poznámka</span>
            <input
              type="text"
              value={shift?.note ?? ""}
              placeholder="Napr. záskok, nadčas…"
              onChange={(e) => updateDay(iso, { note: e.target.value, kind })}
              className="mt-1 h-11 w-full rounded-xl bg-surface-2 px-3 text-base text-foreground outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <div className="flex gap-2">
            <Button
              variant="subtle"
              className="flex-1"
              onClick={() => {
                onMove(iso);
                onClose();
              }}
            >
              <ArrowLeftRight className="size-4" />
              Presunúť
            </Button>
            {kind !== "off" ? (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => setKind(iso, "off")}
              >
                <Trash2 className="size-4" />
                Zmazať
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

function chipActive(kind: ShiftKind) {
  if (kind === "morning") return "bg-morning-dim text-morning";
  if (kind === "night") return "bg-night-dim text-night";
  if (kind === "shift8") return "bg-shift8-dim text-shift8";
  if (kind === "extra") return "bg-extra-dim text-extra";
  if (kind === "vacation") return "bg-vacation-dim text-vacation";
  return "bg-off-dim text-off-fg";
}

function defaultStart(kind: ShiftKind, times: { morningStart: string; nightStart: string; shift8Start: string }) {
  if (kind === "night") return times.nightStart;
  if (kind === "shift8") return times.shift8Start;
  return times.morningStart;
}

function defaultEnd(kind: ShiftKind, times: { morningEnd: string; nightEnd: string; shift8End: string }) {
  if (kind === "night") return times.nightEnd;
  if (kind === "shift8") return times.shift8End;
  return times.morningEnd;
}
