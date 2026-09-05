import { format } from "date-fns";
import { sk } from "date-fns/locale/sk";

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function isOvernight(start: string, end: string): boolean {
  return toMinutes(end) <= toMinutes(start);
}

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function durationHours(start: string, end: string): number {
  let mins = toMinutes(end) - toMinutes(start);
  if (mins <= 0) mins += 24 * 60;
  return Math.round((mins / 60) * 100) / 100;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":");
  return `${Number(h)}:${m ?? "00"}`;
}

export function formatTimeShort(time: string): string {
  const [h, m] = time.split(":");
  if (m && m !== "00") return `${Number(h)}:${m}`;
  return String(Number(h ?? "0"));
}

export function formatRange(start: string, end: string, overnightNote = false): string {
  if (!start || !end) return "";
  const range = `${formatTime(start)}–${formatTime(end)}`;
  if (overnightNote && isOvernight(start, end)) {
    return `${range} nasledujúceho dňa`;
  }
  return range;
}

export function formatHours(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  const body = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1).replace(".", ",");
  return `${body} h`;
}

export function formatDelta(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  const abs = Math.abs(rounded);
  const body = Number.isInteger(abs) ? String(abs) : abs.toFixed(1).replace(".", ",");
  if (rounded > 0) return `+${body} h`;
  if (rounded < 0) return `−${body} h`;
  return "0 h";
}

export function formatMonthTitle(cursor: Date): string {
  return format(cursor, "LLLL yyyy", { locale: sk });
}

export function formatDayLong(iso: string): string {
  return format(fromISODate(iso), "EEEE d. MMMM yyyy", { locale: sk });
}

export const WEEKDAYS = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"] as const;
