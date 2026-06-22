import type { RateTable } from "@spenditslow/core";

const KEY = "spenditslow.rates.v1";

export type RatesStatus = "fresh" | "stale" | "unavailable";

export interface RatesResult {
  /** Usable rate table, or null when fresh fetch failed and nothing is cached. */
  table: RateTable | null;
  /** fresh = just fetched; stale = served from cache after a failed fetch; unavailable = no rates at all. */
  status: RatesStatus;
  /** Why a fresh fetch failed (when status isn't "fresh"). */
  reason?: "offline" | "service";
}

function readCache(): RateTable | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RateTable) : null;
  } catch {
    return null;
  }
}

/**
 * Get exchange rates for a base currency. Tries our cached proxy first, then
 * falls back to the last successfully fetched table from localStorage so
 * conversions keep working offline.
 *
 * Reports status so the UI can tell the user when the FX service is down:
 *  - a thrown fetch means we couldn't reach our own server → "offline"
 *  - a non-OK response means the proxy couldn't reach the FX provider → "service"
 */
export async function getRates(base: string): Promise<RatesResult> {
  let reason: "offline" | "service" = "offline";

  try {
    const res = await fetch(`/api/rates?base=${encodeURIComponent(base)}`);
    if (res.ok) {
      const table = (await res.json()) as RateTable;
      window.localStorage.setItem(KEY, JSON.stringify(table));
      return { table, status: "fresh" };
    }
    // We reached our server but it couldn't get rates from the FX provider.
    reason = "service";
  } catch {
    // Couldn't even reach our server, so the user is offline.
    reason = "offline";
  }

  const cached = readCache();
  return cached
    ? { table: cached, status: "stale", reason }
    : { table: null, status: "unavailable", reason };
}
