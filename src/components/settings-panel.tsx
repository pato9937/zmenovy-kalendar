import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { useShiftStore } from "@/lib/store";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewRotation: () => void;
  onOpenPayroll: () => void;
}

export function SettingsPanel({ open, onOpenChange, onNewRotation, onOpenPayroll }: SettingsPanelProps) {
  const standardDailyHours = useShiftStore((s) => s.standardDailyHours);
  const setStandardHours = useShiftStore((s) => s.setStandardHours);
  const setTimes = useShiftStore((s) => s.setTimes);
  const reset = useShiftStore((s) => s.reset);
  const morningStart = useShiftStore((s) => s.morningStart);
  const morningEnd = useShiftStore((s) => s.morningEnd);
  const nightStart = useShiftStore((s) => s.nightStart);
  const nightEnd = useShiftStore((s) => s.nightEnd);
  const shift8Start = useShiftStore((s) => s.shift8Start);
  const shift8End = useShiftStore((s) => s.shift8End);
  const [confirmReset, setConfirmReset] = useState(false);

  const standalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && Boolean((window.navigator as { standalone?: boolean }).standalone)));

  const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent || "");

  return (
    <Drawer
      open={open}
      onOpenChange={(v) => {
        setConfirmReset(false);
        onOpenChange(v);
      }}
      title="Nastavenia"
      description="Fond, časy a rotácia. Dáta ostávajú len v tomto telefóne."
    >
      <div className="space-y-6 pb-4">
        <section>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Denný fond
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[7.5, 8].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setStandardHours(h)}
                className={
                  standardDailyHours === h
                    ? "h-11 rounded-xl bg-surface-3 text-sm font-medium text-foreground"
                    : "h-11 rounded-xl bg-surface-2 text-sm text-muted-foreground"
                }
              >
                {h === 7.5 ? "7,5 h" : "8 h"}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Počíta sa ako na pracovnom kalendári: pracovné dni bez víkendov a dní
            pracovného pokoja. 12-hodinová zmena = 11 h práce + 1 h pauza.
          </p>
        </section>

        <section className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Časy zmien
          </p>
          <TimeRow
            label="Ranná"
            start={morningStart}
            end={morningEnd}
            onChange={(start, end) => setTimes({ morningStart: start, morningEnd: end }, true)}
          />
          <TimeRow
            label="Nočná"
            start={nightStart}
            end={nightEnd}
            overnight
            onChange={(start, end) => setTimes({ nightStart: start, nightEnd: end }, true)}
          />
          <TimeRow
            label="8-hodinová"
            start={shift8Start}
            end={shift8End}
            onChange={(start, end) => setTimes({ shift8Start: start, shift8End: end }, true)}
          />
        </section>

        {!standalone ? (
          <section className="rounded-xl bg-surface-2 p-3 text-sm leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">
              {isAndroid ? "Pridať na plochu (Android)" : "Pridať na plochu iPhonu"}
            </p>
            {isAndroid ? (
              <ol className="mt-2 list-decimal space-y-1 pl-4">
                <li>Otvor appku v Chrome</li>
                <li>Ťukni na ⋮ (tri bodky vpravo hore)</li>
                <li>Inštalovať appku / Pridať na plochu</li>
              </ol>
            ) : (
              <ol className="mt-2 list-decimal space-y-1 pl-4">
                <li>Otvor appku v Safari</li>
                <li>Ťukni na Zdieľať</li>
                <li>Pridať na plochu</li>
              </ol>
            )}
          </section>
        ) : null}

        <div className="flex flex-col gap-2">
          <Button variant="subtle" onClick={onOpenPayroll}>
            Mzdové sadzby
          </Button>
          <Button
            variant="subtle"
            onClick={() => {
              onOpenChange(false);
              onNewRotation();
            }}
          >
            Nová rotácia
          </Button>
          {confirmReset ? (
            <Button
              variant="destructive"
              onClick={() => {
                reset();
                setConfirmReset(false);
                onOpenChange(false);
              }}
            >
              Naozaj vymazať všetko
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setConfirmReset(true)}>
              Vymazať kalendár
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}

function TimeRow({
  label,
  start,
  end,
  overnight,
  onChange,
}: {
  label: string;
  start: string;
  end: string;
  overnight?: boolean;
  onChange: (start: string, end: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 text-sm text-foreground">{label}</span>
      <input
        type="time"
        value={start}
        onChange={(e) => onChange(e.target.value, end)}
        className="h-10 flex-1 rounded-lg bg-surface-2 px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <span className="text-subtle">–</span>
      <input
        type="time"
        value={end}
        onChange={(e) => onChange(start, e.target.value)}
        className="h-10 flex-1 rounded-lg bg-surface-2 px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {overnight ? <span className="w-8 text-2xs text-muted-foreground">+1</span> : <span className="w-8" />}
    </div>
  );
}
