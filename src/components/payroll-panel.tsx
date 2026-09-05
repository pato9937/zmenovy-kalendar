import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { MonthsField, NumberField } from "@/components/ui/number-field";
import { DEFAULT_PAYROLL, type PayrollConfig } from "@/lib/payroll";
import { useShiftStore } from "@/lib/store";

interface PayrollPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayrollPanel({ open, onOpenChange }: PayrollPanelProps) {
  const payroll = useShiftStore((s) => s.payroll);
  const setPayroll = useShiftStore((s) => s.setPayroll);

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Mzdové sadzby"
      description="Predvyplnené podľa tvojej pásky. Každú položku vieš zmeniť — výpočet ostane v telefóne."
    >
      <div className="space-y-6 pb-4">
        <Section title="Základ">
          <NumberField
            label="Hodinová sadzba €/h"
            value={payroll.hourlyRate}
            onCommit={(v) => setPayroll({ hourlyRate: v })}
          />
        </Section>

        <Section title="Príplatky">
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Poobedný €/h" value={payroll.afternoonRate} onCommit={(v) => setPayroll({ afternoonRate: v })} />
            <NumberField label="Nočný €/h" value={payroll.nightRate} onCommit={(v) => setPayroll({ nightRate: v })} />
            <NumberField label="So / Ne €/h" value={payroll.weekendRate} onCommit={(v) => setPayroll({ weekendRate: v })} />
            <NumberField label="Sviatok %" value={payroll.holidayPercent} onCommit={(v) => setPayroll({ holidayPercent: v })} />
            <NumberField label="Nadčas %" value={payroll.overtimePercent} onCommit={(v) => setPayroll({ overtimePercent: v })} />
          </div>
          <p className="text-2xs text-subtle">
            Poobedný {payroll.afternoonFrom}–{payroll.afternoonTo}, nočný {payroll.nightFrom}–{payroll.nightTo}.
            Nadčas = hodiny nad fondom, 25 % z hodinovky navyše.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <TimeField label="Poobedný od" value={payroll.afternoonFrom} onChange={(v) => setPayroll({ afternoonFrom: v })} />
            <TimeField label="Poobedný do" value={payroll.afternoonTo} onChange={(v) => setPayroll({ afternoonTo: v })} />
            <TimeField label="Nočný od" value={payroll.nightFrom} onChange={(v) => setPayroll({ nightFrom: v })} />
            <TimeField label="Nočný do" value={payroll.nightTo} onChange={(v) => setPayroll({ nightTo: v })} />
          </div>
        </Section>

        <Section title="Pravidelné príplatky">
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Cestovné €" value={payroll.travel} onCommit={(v) => setPayroll({ travel: v })} />
            <NumberField label="Prítomnostná €" value={payroll.attendance} onCommit={(v) => setPayroll({ attendance: v })} />
            <NumberField
              label="Každý 3. mesiac €"
              value={payroll.attendanceBonus}
              onCommit={(v) => setPayroll({ attendanceBonus: v })}
            />
          </div>
          <MonthsField
            label="Mesiace prítomnostnej 140 €"
            value={payroll.attendanceMonths}
            onCommit={(v) => setPayroll({ attendanceMonths: v })}
          />
          <MonthsField
            label="Mesiace polročnej (½ základu)"
            value={payroll.halfYearMonths}
            onCommit={(v) => setPayroll({ halfYearMonths: v })}
          />
          <p className="text-2xs text-subtle">
            Polročná sa dopočíta sama ako polovica základnej mzdy (hodiny × sadzba) v mesiacoch, ktoré zadáš. Mesiace píš s čiarkou, napr. 6, 12.
          </p>
        </Section>

        <Section title="Zrážky z čistej">
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Strava €" value={payroll.food} onCommit={(v) => setPayroll({ food: v })} />
            <NumberField label="DDS €" value={payroll.dds} onCommit={(v) => setPayroll({ dds: v })} />
          </div>
        </Section>

        <Section title="Odvody 2026">
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Zdravotné %" value={payroll.healthRate} onCommit={(v) => setPayroll({ healthRate: v })} />
            <NumberField label="Nemocenské %" value={payroll.sicknessRate} onCommit={(v) => setPayroll({ sicknessRate: v })} />
            <NumberField label="Invalidné %" value={payroll.disabilityRate} onCommit={(v) => setPayroll({ disabilityRate: v })} />
            <NumberField label="Starobné %" value={payroll.pensionRate} onCommit={(v) => setPayroll({ pensionRate: v })} />
            <NumberField label="Nezamestnanosť %" value={payroll.unemploymentRate} onCommit={(v) => setPayroll({ unemploymentRate: v })} />
            <NumberField label="NČZD €" value={payroll.nczd} onCommit={(v) => setPayroll({ nczd: v })} />
          </div>
          <p className="text-2xs text-subtle">
            Zamestnanec 2026: ZP 5 % + SP 9,4 %. Daň 19 % z (hrubá − odvody − NČZD).
          </p>
        </Section>

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setPayroll({ ...DEFAULT_PAYROLL } satisfies PayrollConfig)}
        >
          Obnoviť predvolené sadzby
        </Button>
      </div>
    </Drawer>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      {children}
    </section>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block rounded-xl bg-surface-2 px-3 py-2">
      <span className="text-2xs text-muted-foreground">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full bg-transparent text-sm tabular-nums text-foreground outline-none"
      />
    </label>
  );
}
