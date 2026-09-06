import { useState } from "react";
import { format } from "date-fns";
import { sk } from "date-fns/locale/sk";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NumberField } from "@/components/ui/number-field";
import {
  computeMonthPayroll,
  EMPTY_EXTRAS,
  formatEur,
  monthKey,
} from "@/lib/payroll";
import { useShiftStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function WageCard({
  cursor,
  onOpenRates,
}: {
  cursor: Date;
  onOpenRates: () => void;
}) {
  const days = useShiftStore((s) => s.days);
  const standardDailyHours = useShiftStore((s) => s.standardDailyHours);
  const patternStart = useShiftStore((s) => s.patternStart);
  const payroll = useShiftStore((s) => s.payroll);
  const monthExtras = useShiftStore((s) => s.monthExtras);
  const setMonthExtras = useShiftStore((s) => s.setMonthExtras);
  const [open, setOpen] = useState(false);

  const key = monthKey(cursor);
  const extras = monthExtras[key] ?? EMPTY_EXTRAS;
  const p = computeMonthPayroll({
    days,
    cursor,
    standardDailyHours,
    patternStart,
    cfg: payroll,
    extras,
  });

  return (
    <section className="rounded-2xl bg-card px-4 py-3 shadow-border">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Mzda · {format(cursor, "LLLL", { locale: sk })}
          </p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums text-night">
            {formatEur(p.net)}
          </p>
          <p className="text-xs text-muted-foreground">
            čistá · hrubá{" "}
            <span className="tabular-nums text-foreground">{formatEur(p.gross)}</span>
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Mzdové sadzby" onClick={onOpenRates}>
          <SlidersHorizontal className="size-4" />
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <NumberField
          label="Dovolenka navyše (h)"
          value={extras.vacationHours}
          onCommit={(v) => setMonthExtras(key, { vacationHours: Math.max(0, v) })}
        />
        <NumberField
          label="Iné v hrubom (€)"
          value={extras.extraGross}
          onCommit={(v) => setMonthExtras(key, { extraGross: v })}
        />
        <NumberField
          label="Fond — Úväzok (h)"
          value={extras.fundHoursOverride ?? 0}
          onCommit={(v) => setMonthExtras(key, { fundHoursOverride: v > 0 ? v : undefined })}
        />
        <NumberField
          label="Prenesené saldo (h)"
          value={extras.balanceAdjustmentHours ?? 0}
          onCommit={(v) => setMonthExtras(key, { balanceAdjustmentHours: v !== 0 ? v : undefined })}
        />
        <NumberField
          label="Ročné zúčt. dane (€)"
          value={extras.annualTaxSettlement ?? 0}
          onCommit={(v) => setMonthExtras(key, { annualTaxSettlement: v !== 0 ? v : undefined })}
        />
      </div>
      <p className="mt-1 text-2xs text-subtle">
        Fond kolíše mesiac čo mesiac a nedá sa spoľahlivo predpočítať — odpíš číslo "Úväzok" z pásky
        (0 = automatický odhad z kalendára). "Dovolenka navyše" sa pripočíta k dňom označeným v
        kalendári ako Dovolenka — ak už máš dni vyplnené priamo v kalendári, tu nechaj 0.
        "Prenesené saldo" je z poslednej pásky ("Saldo nadčasov") — kladné aj záporné číslo, appka
        ho naprieč mesiacmi nesleduje sama. Vypláca sa max. 32 h nadčasu za mesiac. "Ročné zúčt.
        dane" je jednorazová položka z pásky (zvyčajne raz ročne) — zadaj ako kladné číslo
        (refundácia), aj keď je na páske so znamienkom mínus.
      </p>
      {p.perDiemTotal ? (
        <p className="mt-1 text-2xs text-subtle">
          Diéty z pracovných ciest tento mesiac: <span className="text-foreground">{formatEur(p.perDiemTotal)}</span> — nie sú súčasťou hrubej/čistej mzdy vyššie, platia sa mimo appky.
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-2 w-full text-left text-xs font-medium text-muted-foreground"
      >
        {open ? "Skryť rozpis" : "Rozpis mzdy"}
      </button>

      {open ? (
        <div className="mt-2 space-y-3 border-t border-border pt-2">
          <LineGroup
            title="Hrubá"
            rows={[
              ["Základ", `${p.workHours.toString().replace(".", ",")} h`, p.base],
              p.vacationHours ? ["Dovolenka", `${p.vacationHours.toString().replace(".", ",")} h`, p.vacationPay] : null,
              p.afternoonHours ? ["Poobedný", `${fmtH(p.afternoonHours)}`, p.afternoonPay] : null,
              p.nightHours ? ["Nočný", `${fmtH(p.nightHours)}`, p.nightPay] : null,
              p.weekendHours ? ["So / Ne", `${fmtH(p.weekendHours)}`, p.weekendPay] : null,
              p.holidayHours ? ["Sviatok 100 %", `${fmtH(p.holidayHours)}`, p.holidayPay] : null,
              p.overtimeHours ? ["Nadčas 25 %", `${fmtH(p.overtimeHours)}`, p.overtimePay] : null,
              p.travel ? ["Cestovné", null, p.travel] : null,
              p.attendance ? ["Prítomnostná", null, p.attendance] : null,
              p.halfYear ? ["Polročná", "½ základu", p.halfYear] : null,
              p.extraGross ? ["Iné", null, p.extraGross] : null,
            ]}
            total={p.gross}
            totalLabel="Hrubý príjem"
          />
          <LineGroup
            title="Odvody a daň"
            rows={[
              ["Zdravotné", `${fmtPct(payroll.healthRate)}`, -p.health],
              ["Nemocenské", `${fmtPct(payroll.sicknessRate)}`, -p.sickness],
              ["Invalidné", `${fmtPct(payroll.disabilityRate)}`, -p.disability],
              ["Starobné", `${fmtPct(payroll.pensionRate)}`, -p.pension],
              ["Nezamestnanosť", `${fmtPct(payroll.unemploymentRate)}`, -p.unemployment],
              ["Daň", `základ ${formatEur(p.taxBase)}`, -p.tax],
              ["Strava", null, -p.food],
              ["DDS", null, -p.dds],
              p.annualTaxSettlement ? ["Ročné zúčt. dane", "jednorazovo", p.annualTaxSettlement] : null,
            ]}
            total={p.net}
            totalLabel="Čistá na účet"
            emphasize
          />
        </div>
      ) : (
        <p className="mt-1 text-2xs text-subtle">
          Odhad podľa kalendára a tvojich sadzieb. Nadčas {fmtH(p.overtimeHours)} nad fondom{" "}
          {fmtH(p.fundHours)}.
        </p>
      )}
    </section>
  );
}

function fmtH(n: number): string {
  const body = Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
  return `${body} h`;
}

function fmtPct(n: number): string {
  const body = Number.isInteger(n) ? String(n) : String(n).replace(".", ",");
  return `${body} %`;
}

function LineGroup({
  title,
  rows,
  total,
  totalLabel,
  emphasize,
}: {
  title: string;
  rows: Array<[string, string | null, number] | null>;
  total: number;
  totalLabel: string;
  emphasize?: boolean;
}) {
  return (
    <div>
      <p className="text-2xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      <ul className="mt-1 space-y-0.5">
        {rows.map((row) => {
          if (!row) return null;
          const [label, meta, amount] = row;
          return (
            <li key={label} className="flex items-baseline justify-between gap-2 text-sm">
              <span className="text-muted-foreground">
                {label}
                {meta ? <span className="text-subtle"> · {meta}</span> : null}
              </span>
              <span className="tabular-nums text-foreground">{formatEur(amount)}</span>
            </li>
          );
        })}
      </ul>
      <p
        className={cn(
          "mt-1 flex items-baseline justify-between border-t border-border pt-1 text-sm font-medium",
          emphasize && "text-night",
        )}
      >
        <span>{totalLabel}</span>
        <span className="tabular-nums">{formatEur(total)}</span>
      </p>
    </div>
  );
}
