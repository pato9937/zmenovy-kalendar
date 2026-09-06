import { useEffect, useMemo, useState } from "react";
import { addMonths, format, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { CalendarMonth } from "@/components/calendar-month";
import { DayEditor } from "@/components/day-editor";
import { InstallHint } from "@/components/install-hint";
import { LogoMark } from "@/components/logo";
import { PayrollPanel } from "@/components/payroll-panel";
import { SettingsPanel } from "@/components/settings-panel";
import { SetupWizard } from "@/components/setup-wizard";
import { StatsBar } from "@/components/stats-bar";
import { UpcomingStrip } from "@/components/upcoming-strip";
import { WageCard } from "@/components/wage-card";
import { YearView } from "@/components/year-view";
import { formatMonthTitle, fromISODate, todayISO } from "@/lib/dates";
import { KIND_LABEL, rotationEndISO } from "@/lib/shifts";
import { useShiftStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function CalendarApp() {
  const hasHydrated = useShiftStore((s) => s.hasHydrated);
  const setupDone = useShiftStore((s) => s.setupDone);
  const days = useShiftStore((s) => s.days);
  const swap = useShiftStore((s) => s.swap);
  const patternStart = useShiftStore((s) => s.patternStart);
  const pattern = useShiftStore((s) => s.pattern);
  const generate = useShiftStore((s) => s.generate);

  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [view, setView] = useState<"month" | "year">("month");
  const [selected, setSelected] = useState<string | null>(null);
  const [moveSource, setMoveSource] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [payrollOpen, setPayrollOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    const finish = () => useShiftStore.setState({ hasHydrated: true });
    const unsub = useShiftStore.persist.onFinishHydration(finish);
    if (useShiftStore.persist.hasHydrated()) {
      finish();
      return unsub;
    }
    void useShiftStore.persist.rehydrate();
    const fallback = window.setTimeout(finish, 80);
    return () => {
      unsub();
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated || !setupDone || !pattern || !patternStart) return;
    const end = rotationEndISO(patternStart);
    if (days[end]) return;
    generate({ type: pattern, start: patternStart, overwriteManual: false });
  }, [hasHydrated, setupDone, pattern, patternStart, days, generate]);

  useEffect(() => {
    if (!setupDone || !patternStart) return;
    const start = fromISODate(patternStart);
    if (new Date() < start) setCursor(startOfMonth(start));
  }, [setupDone, patternStart]);

  const title = useMemo(
    () => (view === "year" ? format(cursor, "yyyy") : formatMonthTitle(cursor)),
    [cursor, view],
  );

  if (!hasHydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <LogoMark className="size-12 rounded-2xl" />
      </div>
    );
  }

  if (!setupDone || wizardOpen) {
    return (
      <main className="min-h-dvh bg-background text-foreground">
        <SetupWizard
          mode={setupDone ? "regen" : "first"}
          onClose={setupDone ? () => setWizardOpen(false) : undefined}
        />
      </main>
    );
  }

  function go(delta: number) {
    setCursor((c) => (view === "year" ? addMonths(c, delta * 12) : addMonths(c, delta)));
  }

  function handleSelect(iso: string) {
    if (moveSource) {
      if (iso !== moveSource) {
        swap(moveSource, iso);
        toast(`Zmena presunutá na ${iso.split("-").reverse().join(".")}`);
      }
      setMoveSource(null);
      return;
    }
    setSelected(iso);
  }

  function handleSwap(from: string, to: string) {
    if (from === to) return;
    swap(from, to);
    toast("Zmeny vymenené");
    setMoveSource(null);
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <LogoMark className="size-9 rounded-xl" />
            <div>
              <p className="text-2xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Kalendár zmien
              </p>
              <h1 className="text-lg font-semibold leading-tight tracking-tight">Zmeny</h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Nastavenia"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings2 className="size-5" />
          </Button>
        </header>

        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="icon-sm" aria-label="Späť" onClick={() => go(-1)}>
            <ChevronLeft className="size-5" />
          </Button>
          <div className="text-center">
            <h2 className="text-lg font-semibold capitalize tracking-tight">{title}</h2>
            <div className="mt-1 inline-flex rounded-full bg-surface-2 p-0.5">
              <button
                type="button"
                onClick={() => setView("month")}
                className={cn(
                  "h-9 rounded-full px-3 text-xs font-medium",
                  view === "month" ? "bg-card text-foreground" : "text-muted-foreground",
                )}
              >
                Mesiac
              </button>
              <button
                type="button"
                onClick={() => setView("year")}
                className={cn(
                  "h-9 rounded-full px-3 text-xs font-medium",
                  view === "year" ? "bg-card text-foreground" : "text-muted-foreground",
                )}
              >
                Rok
              </button>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Ďalej" onClick={() => go(1)}>
            <ChevronRight className="size-5" />
          </Button>
        </div>

        {moveSource ? (
          <div className="flex items-center justify-between rounded-xl bg-morning-dim px-3 py-2 text-sm text-morning">
            <span>Ťukni na deň, kam chceš zmenu presunúť</span>
            <button type="button" className="font-medium" onClick={() => setMoveSource(null)}>
              Zrušiť
            </button>
          </div>
        ) : null}

        {view === "month" ? (
          <>
            <StatsBar cursor={cursor} />
            <WageCard cursor={cursor} onOpenRates={() => setPayrollOpen(true)} />
            <CalendarMonth
              cursor={cursor}
              days={days}
              selected={selected}
              moveSource={moveSource}
              onSelect={handleSelect}
              onSwipeMonth={(delta) => setCursor((c) => addMonths(c, delta))}
              onSwap={handleSwap}
              onMoveStart={(iso) => {
                setMoveSource(iso);
                toast("Podržané — ťukni cieľový deň");
              }}
            />
            <UpcomingStrip onSelect={handleSelect} />
            <Legend />
            <button
              type="button"
              onClick={() => setCursor(startOfMonth(new Date()))}
              className="self-center text-sm text-muted-foreground"
            >
              Dnes · {todayISO().split("-").reverse().join(".")}
            </button>
            <InstallHint />
          </>
        ) : (
          <>
            <YearView
              year={cursor.getFullYear()}
              days={days}
              onPickMonth={(month) => {
                setCursor(startOfMonth(new Date(cursor.getFullYear(), month, 1)));
                setView("month");
              }}
            />
            {patternStart ? (
              <p className="text-center text-xs text-muted-foreground">
                Rotácia od {patternStart.split("-").reverse().join(".")}
              </p>
            ) : null}
          </>
        )}
      </div>

      <DayEditor
        iso={selected}
        onClose={() => setSelected(null)}
        onMove={(iso) => {
          setMoveSource(iso);
          toast(`Presun: ${KIND_LABEL[days[iso]?.kind ?? "off"]}`);
        }}
      />
      <SettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onNewRotation={() => setWizardOpen(true)}
        onOpenPayroll={() => {
          setSettingsOpen(false);
          setPayrollOpen(true);
        }}
      />
      <PayrollPanel open={payrollOpen} onOpenChange={setPayrollOpen} />
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          className: "bg-card text-foreground border-border",
        }}
      />
    </main>
  );
}

function Legend() {
  const items = [
    { label: "Ranná", className: "bg-morning" },
    { label: "Nočná", className: "bg-night" },
    { label: "8 h", className: "bg-shift8" },
    { label: "Navyše", className: "bg-extra" },
    { label: "Dovolenka", className: "bg-vacation" },
    { label: "Voľno", className: "bg-off" },
    { label: "Víkend", className: "bg-weekend ring-1 ring-border" },
    { label: "Sviatok", className: "bg-off ring-1 ring-holiday" },
  ];
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-2xs text-muted-foreground">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span className={cn("size-2 rounded-sm", item.className)} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
