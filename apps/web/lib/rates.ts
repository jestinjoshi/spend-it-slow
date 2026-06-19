import type { RateTable } from "@spenditslow/core";

const KEY = "spenditslow.rates.v1";

function readCache(): RateTable | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RateTable) : null;
  } catch {
    return null;
  }
}

/**
 * Get exchange rates for a base currency. Tries the network (via our own
 * cached proxy) first, then falls back to the last successfully fetched table
 * from localStorage so conversions keep working offline.
 *
 * `convertCurrency` can cross-convert through any base, so a cached table from
 * a previous session is still usable even if its base differs.
 */
export async function getRates(base: string): Promise<RateTable | null> {
  try {
    const res = await fetch(`/api/rates?base=${encodeURIComponent(base)}`);
    if (res.ok) {
      const table = (await res.json()) as RateTable;
      window.localStorage.setItem(KEY, JSON.stringify(table));
      return table;
    }
  } catch {
    // offline or API down — fall through to cache
  }
  return readCache();
}
