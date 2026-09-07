import { addDays, subDays } from "date-fns";
import { toISODate } from "./dates";

export interface Holiday {
  name: string;
  short: string;
  /** Deň pracovného pokoja — odpočíta sa z fondu. */
  rest: boolean;
}

const FIXED: Array<{ m: number; d: number; name: string; short: string }> = [
  { m: 1, d: 1, name: "Deň vzniku Slovenskej republiky", short: "Ústava" },
  { m: 1, d: 6, name: "Traja králi", short: "Králi" },
  { m: 5, d: 1, name: "Sviatok práce", short: "Práca" },
  { m: 5, d: 8, name: "Deň víťazstva nad fašizmom", short: "Víťazstvo" },
  { m: 7, d: 5, name: "Sviatok svätého Cyrila a Metoda", short: "Cyril" },
  { m: 8, d: 29, name: "Výročie SNP", short: "SNP" },
  { m: 9, d: 1, name: "Deň Ústavy Slovenskej republiky", short: "Ústava" },
  { m: 9, d: 15, name: "Sedembolestná Panna Mária", short: "Mária" },
  { m: 11, d: 1, name: "Sviatok všetkých svätých", short: "Svätí" },
  { m: 11, d: 17, name: "Deň boja za slobodu a demokraciu", short: "17. nov" },
  { m: 12, d: 24, name: "Štedrý deň", short: "Štedrý" },
  { m: 12, d: 25, name: "Prvý sviatok vianočný", short: "Vianoce" },
  { m: 12, d: 26, name: "Druhý sviatok vianočný", short: "Vianoce" },
];

function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/**
 * Dni pracovného pokoja podľa Zákonníka práce / kalendar.aktuality.sk.
 * Štátny sviatok ≠ automaticky voľno:
 * - 1. 9. od 2024 nie je dňom pracovného pokoja (trvalo)
 * - 17. 11. od 2025 nie je dňom pracovného pokoja (trvalo)
 * - 8. 5. 2026 nie je dňom pracovného pokoja (dočasne, len 2026, konsolidačná novela č. 261/2025 Z. z.)
 * - 15. 9. 2026 nie je dňom pracovného pokoja (dočasne, len 2026, konsolidačná novela č. 261/2025 Z. z.)
 */
function isRestHoliday(year: number, m: number, d: number): boolean {
  if (m === 9 && d === 1) return false;
  if (m === 11 && d === 17 && year >= 2025) return false;
  if (m === 5 && d === 8 && year === 2026) return false;
  if (m === 9 && d === 15 && year === 2026) return false;
  return true;
}

const cache = new Map<number, Map<string, Holiday>>();

export function holidaysForYear(year: number): Map<string, Holiday> {
  const hit = cache.get(year);
  if (hit) return hit;

  const map = new Map<string, Holiday>();
  for (const h of FIXED) {
    map.set(toISODate(new Date(year, h.m - 1, h.d)), {
      name: h.name,
      short: h.short,
      rest: isRestHoliday(year, h.m, h.d),
    });
  }
  const easter = easterSunday(year);
  map.set(toISODate(subDays(easter, 2)), {
    name: "Veľký piatok",
    short: "Piatok",
    rest: true,
  });
  map.set(toISODate(addDays(easter, 1)), {
    name: "Veľkonočný pondelok",
    short: "Veľká noc",
    rest: true,
  });
  cache.set(year, map);
  return map;
}

export function getHoliday(iso: string): Holiday | null {
  const year = Number(iso.slice(0, 4));
  if (!Number.isFinite(year)) return null;
  return holidaysForYear(year).get(iso) ?? null;
}

export function isPublicHoliday(iso: string): boolean {
  return getHoliday(iso) !== null;
}

export function isDayOfRest(iso: string): boolean {
  return getHoliday(iso)?.rest === true;
}