import { useMemo, useState } from "react";
import { CalendarRange, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/logo";
import { cn } from "@/lib/utils";
import { todayISO, formatDayLong } from "@/lib/dates";
import { KIND_LABEL, type PatternType } from "@/lib/shifts";
import { useShiftStore } from "@/lib/store";

const PATTERN: Array<{ kind: "morning" | "night" | "off"; label: string }> = [
  { kind: "morning", label: "R" },
  { kind: "morning", label: "R" },
  { kind: "night", label: "N" },
  { kind: "night", label: "N" },
  { kind: "off", label: "V" },
  { kind: "off", label: "V" },
  { kind: "off", label: "V" },
  { kind: "off", label: "V" },
];

interface SetupWizardProps {
  mode: "first" | "regen";
  onClose?: () => void;
}

export function SetupWizard({ mode, onClose }: SetupWizardProps) {
  const generate = useShiftStore((s) => s.generate);
  const existingPattern = useShiftStore((s) => s.pattern);
  const existingStart = useShiftStore((s) => s.patternStart);

  const [type, setType] = useState<PatternType>(existingPattern ?? "rot12");
  const [start, setStart] = useState(existingStart ?? todayISO());
  const [keepManual, setKeepManual] = useState(true);

  const previewLabel = useMemo(() => {
    if (type === "rot12") {
      return "2 ranné · 2 nočné · 4 voľno — opakuje sa 5 rokov";
    }
    if (type === "week8alt") {
      return "Týždeň ranná, týždeň poobedná (7,5 h), víkendy voľno — 5 rokov";
    }
    return "Pondelok–piatok 7,5 h, víkendy voľno — 5 rokov";
  }, [type]);

  function submit() {
    generate({
      type,
      start,
      overwriteManual: mode === "first" ? true : !keepManual,
    });
    onClose?.();
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="flex items-center gap-3">
        <LogoMark className="size-10 rounded-xl shadow-border" />
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Kalendár zmien
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Zmeny</h1>
        </div>
      </header>

      <div className="mt-10 space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight text-balance">
          {mode === "first" ? "Ako máš zmeny?" : "Nová rotácia"}
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
          Vyber začiatok prvej rannej a rotácia sa vykreslí na päť rokov. Každý deň
          potom vieš zmeniť, posunúť, zmazať alebo doplniť navyše.
        </p>
      </div>

      <div className="mt-8 grid gap-3">
        <button
          type="button"
          onClick={() => setType("rot12")}
          className={cn(
            "rounded-2xl p-4 text-left shadow-border transition-[transform,background-color] duration-150 ease-out active:scale-[0.98]",
            type === "rot12" ? "bg-surface-2" : "bg-card",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">12-hodinová rotácia</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {KIND_LABEL.morning} 6:00–18:00, {KIND_LABEL.night} 18:00–6:00
                nasledujúceho dňa · 11 h práce + 1 h pauza
              </p>
            </div>
            {type === "rot12" ? (
              <Check className="size-5 text-morning" strokeWidth={2.2} />
            ) : null}
          </div>
          <div className="mt-4 flex gap-1">
            {PATTERN.map((cell, i) => (
              <span
                key={`${cell.kind}-${i}`}
                className={cn(
                  "flex h-8 flex-1 items-center justify-center rounded-md text-2xs font-semibold",
                  cell.kind === "morning" && "bg-morning-dim text-morning",
                  cell.kind === "night" && "bg-night-dim text-night",
                  cell.kind === "off" && "bg-off-dim text-off-fg",
                )}
              >
                {cell.label}
              </span>
            ))}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setType("week8")}
          className={cn(
            "rounded-2xl p-4 text-left shadow-border transition-[transform,background-color] duration-150 ease-out active:scale-[0.98]",
            type === "week8" ? "bg-surface-2" : "bg-card",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">Týždenné 7,5-hodinové</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Klasický fond Po–Pia, predvolene 6:00–13:30
              </p>
            </div>
            {type === "week8" ? (
              <Check className="size-5 text-shift8" strokeWidth={2.2} />
            ) : null}
          </div>
          <div className="mt-4 flex gap-1">
            {["8", "8", "8", "8", "8", "V", "V"].map((label, i) => (
              <span
                key={`${label}-${i}`}
                className={cn(
                  "flex h-8 flex-1 items-center justify-center rounded-md text-2xs font-semibold",
                  label === "8" ? "bg-shift8-dim text-shift8" : "bg-off-dim text-off-fg",
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setType("week8alt")}
          className={cn(
            "rounded-2xl p-4 text-left shadow-border transition-[transform,background-color] duration-150 ease-out active:scale-[0.98]",
            type === "week8alt" ? "bg-surface-2" : "bg-card",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">Striedavá ranná/poobedná (7,5 h)</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Týždeň ranná (6:00–13:30), týždeň poobedná (14:00–21:30) — strieda sa
              </p>
            </div>
            {type === "week8alt" ? (
              <Check className="size-5 text-shift8" strokeWidth={2.2} />
            ) : null}
          </div>
          <div className="mt-4 flex flex-col gap-1">
            <div className="flex gap-1">
              {["R", "R", "R", "R", "R", "V", "V"].map((label, i) => (
                <span
                  key={`w1-${label}-${i}`}
                  className={cn(
                    "flex h-7 flex-1 items-center justify-center rounded-md text-2xs font-semibold",
                    label === "R" ? "bg-morning-dim text-morning" : "bg-off-dim text-off-fg",
                  )}
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              {["P", "P", "P", "P", "P", "V", "V"].map((label, i) => (
                <span
                  key={`w2-${label}-${i}`}
                  className={cn(
                    "flex h-7 flex-1 items-center justify-center rounded-md text-2xs font-semibold",
                    label === "P" ? "bg-shift8-dim text-shift8" : "bg-off-dim text-off-fg",
                  )}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </button>
      </div>

      <label className="mt-8 block">
        <span className="text-sm font-medium text-foreground">
          {type === "rot12" ? "Dátum prvej rannej" : "Od ktorého dňa začínaš"}
        </span>
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="mt-2 h-12 w-full rounded-xl bg-card px-3 text-base text-foreground shadow-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <span className="mt-2 block text-sm text-muted-foreground">
          {start ? formatDayLong(start) : "Vyber dátum"}
        </span>
      </label>

      <p className="mt-3 text-sm text-muted-foreground">{previewLabel}</p>

      {mode === "regen" ? (
        <label className="mt-5 flex items-center gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={keepManual}
            onChange={(e) => setKeepManual(e.target.checked)}
            className="size-4 accent-morning"
          />
          Ponechať ručné úpravy
        </label>
      ) : null}

      <div className="mt-auto flex flex-col gap-2 pt-10">
        <Button size="lg" className="w-full" onClick={submit} disabled={!start}>
          <CalendarRange className="size-4" />
          Vygenerovať 5 rokov
        </Button>
        {mode === "regen" && onClose ? (
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Zrušiť
          </Button>
        ) : null}
      </div>
    </div>
  );
}
