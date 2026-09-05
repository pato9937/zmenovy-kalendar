import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function parseAmount(raw: string): number | null {
  const t = raw.trim().replace(/\u00a0/g, "").replace(/\s/g, "").replace(",", ".");
  if (!t || t === "-" || t === "." || t === ",") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function formatAmount(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return String(n);
}

export function NumberField({
  label,
  value,
  onCommit,
  className,
  inputClassName,
}: {
  label: string;
  value: number;
  onCommit: (v: number) => void;
  className?: string;
  inputClassName?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    setDraft(null);
  }, [value]);

  function commit(raw: string) {
    const parsed = parseAmount(raw);
    onCommit(parsed === null ? 0 : parsed);
    setDraft(null);
  }

  return (
    <label className={cn("block rounded-xl bg-surface-2 px-3 py-2", className)}>
      <span className="text-2xs text-muted-foreground">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        enterKeyHint="done"
        autoComplete="off"
        value={draft === null ? formatAmount(value) : draft}
        onFocus={() => setDraft("")}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className={cn(
          "mt-0.5 w-full bg-transparent text-sm tabular-nums text-foreground outline-none",
          inputClassName,
        )}
      />
    </label>
  );
}

export function parseMonths(raw: string): number[] {
  const seen = new Set<number>();
  for (const part of raw.split(/[,;\s]+/)) {
    if (!part) continue;
    const n = Number(part.replace(",", "."));
    if (Number.isInteger(n) && n >= 1 && n <= 12) seen.add(n);
  }
  return [...seen].sort((a, b) => a - b);
}

export function MonthsField({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number[];
  onCommit: (v: number[]) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = value.join(", ");

  useEffect(() => {
    setDraft(null);
  }, [shown]);

  return (
    <label className="block rounded-xl bg-surface-2 px-3 py-2">
      <span className="text-2xs text-muted-foreground">{label}</span>
      <input
        type="text"
        inputMode="text"
        enterKeyHint="done"
        autoComplete="off"
        placeholder="6, 12"
        value={draft === null ? shown : draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => {
          onCommit(parseMonths(e.target.value));
          setDraft(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="mt-0.5 w-full bg-transparent text-sm tabular-nums text-foreground outline-none placeholder:text-subtle"
      />
    </label>
  );
}
