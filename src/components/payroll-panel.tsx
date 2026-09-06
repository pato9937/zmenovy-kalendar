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
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="Tarifný plat €/mesiac"
              value={payroll.tariffMonthly}
              onCommit={(v) => setPayroll({ tariffMonthly: v })}
            />
            <NumberField
              label="PPÚ (priemer) €/h"
              value={payroll.ppuRate}
              onCommit={(v) => setPayroll({ ppuRate: v })}
            />
          </div>
          <p className="text-2xs text-subtle">
            Tarifný plat sa delí fondom hodín daného mesiaca — sadzba za hodinu tak nie je
            fixná, mení sa mesiac čo mesiac. PPÚ (priemerný zárobok) sa používa na dovolenku,
            sviatok a príplatok za nadčas — aktualizuj ho, keď ti ho firma prepočíta (kvartálne).
          </p>
        </Section>

        <Section title="Príplatky">
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Poobedný €/h" value={payroll.afternoonRate} onCommit={(v) => setPayroll({ afternoonRate: v })} />
            <NumberField label="Nočný — firemná €/h" value={payroll.nightRate} onCommit={(v) => setPayroll({ nightRate: v })} />
            <NumberField label="Min. mzda €/h (rok)" value={payroll.minWageHourly} onCommit={(v) => setPayroll({ minWageHourly: v })} />
            <NumberField label="So/Ne €/h" value={payroll.weekendRate} onCommit={(v) => setPayroll({ weekendRate: v })} />
            <NumberField label="Sviatok %" value={payroll.holidayPercent} onCommit={(v) => setPayroll({ holidayPercent: v })} />
            <NumberField label="Nadčas %" value={payroll.overtimePercent} onCommit={(v) => setPayroll({ overtimePercent: v })} />
          </div>
          <p className="text-2xs text-subtle">
            Nočný sa v praxi platí podľa vyššieho z dvoch čísel: firemná sadzba, alebo 40&nbsp;%
            z aktuálnej minimálnej mzdy — over si "Min. mzda" každý január, keď sa mení.
            So/Ne kolíše mesiac čo mesiac (videné 6,09–6,66&nbsp;€/h) — priebežne uprav podľa
            najnovšej pásky.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <TimeField label="Poobedný od" value={payroll.afternoonFrom} onChange={(v) => setPayroll({ afternoonFrom: v })} />
            <TimeField label="Poobedný do" value={payroll.afternoonTo} onChange={(v) => setPayroll({ afternoonTo: v })} />
            <TimeField label="Nočný od" value={payroll.nightFrom} onChange={(v) => setPayroll({ nightFrom: v })} />
            <TimeField label="Nočný do" value={payroll.nightTo} onChange={(v) => setPayroll({ nightTo: v })} />
          </div>
        </Section>

        <Section title="Výkonnostný bonus">
          <NumberField
            label="Výkon. bonus % (0–10)"
            value={payroll.vykonBonusPercent}
            onCommit={(v) => setPayroll({ vykonBonusPercent: Math.max(0, Math.min(10, v)) })}
          />
          <p className="text-2xs text-subtle">
            Diskrétny bonus 0–10 % zo (základná mzda + zákl. za nadčas) — dá ho nadriadený,
            nedá sa vypočítať vopred. Zadaj ho ručne za mesiac, keď ho poznáš.
          </p>
        </Section>

        <Section title="Skorší príchod">
          <NumberField
            label="Minúty navyše na zmenu"
            value={payroll.earlyArrivalMinutes}
            onCommit={(v) => setPayroll({ earlyArrivalMinutes: Math.max(0, v) })}
          />
          <p className="text-2xs text-subtle">
            Pripočíta sa automaticky ku každej rannej/nočnej zmene so štandardným časom
            (6:00–18:00 / 18:00–06:00). Ak si pre konkrétny deň čas ručne upravil, tento bonus sa
            už nepridáva — ráta sa presne to, čo je zadané.
          </p>
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
            label="Mesiace polročnej (½ tarifného platu)"
            value={payroll.halfYearMonths}
            onCommit={(v) => setPayroll({ halfYearMonths: v })}
          />
          <p className="text-2xs text-subtle">
            Polročná sa dopočíta sama ako polovica tarifného platu v mesiacoch, ktoré zadáš.
            Mesiace píš s čiarkou, napr. 5, 11.
          </p>
        </Section>

        <Section title="Zrážky z čistej">
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Strava €" value={payroll.food} onCommit={(v) => setPayroll({ food: v })} />
            <NumberField label="DDS €" value={payroll.dds} onCommit={(v) => setPayroll({ dds: v })} />
          </div>
        </Section>

        <Section title="Odvody a daň">
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Zdravotné %" value={payroll.healthRate} onCommit={(v) => setPayroll({ healthRate: v })} />
            <NumberField label="Nemocenské %" value={payroll.sicknessRate} onCommit={(v) => setPayroll({ sicknessRate: v })} />
            <NumberField label="Invalidné %" value={payroll.disabilityRate} onCommit={(v) => setPayroll({ disabilityRate: v })} />
            <NumberField label="Starobné %" value={payroll.pensionRate} onCommit={(v) => setPayroll({ pensionRate: v })} />
            <NumberField label="Nezamestnanosť %" value={payroll.unemploymentRate} onCommit={(v) => setPayroll({ unemploymentRate: v })} />
            <NumberField label="Odpočet na daňovníka €" value={payroll.nczd} onCommit={(v) => setPayroll({ nczd: v })} />
          </div>
          <p className="text-2xs text-subtle">
            Daň: 19 % zo základu (hrubá − odvody − odpočet na daňovníka).
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
