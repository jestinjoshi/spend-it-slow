/**
 * An exchange-rate snapshot, shaped like the Frankfurter API response.
 * `rates` are quoted relative to `base`. Persist the whole table so the app
 * can keep converting offline, and show `date` as the "rates as of" label.
 */
export interface RateTable {
  base: string;
  date: string;
  rates: Record<string, number>;
}

/** Rate of `currency` relative to the table's base (base itself is 1). */
function rateOf(currency: string, table: RateTable): number {
  if (currency === table.base) return 1;
  const rate = table.rates[currency];
  if (rate === undefined) {
    throw new Error(`No exchange rate for ${currency} in table based on ${table.base}.`);
  }
  return rate;
}

/**
 * Convert an amount from one currency to another using a rate table. Works
 * regardless of which currency the table is based on (cross-rate via base).
 */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  table: RateTable,
): number {
  if (from === to) return amount;
  const amountInBase = amount / rateOf(from, table);
  return amountInBase * rateOf(to, table);
}

/** Whether a cached rate table is older than `maxAgeDays` (for staleness UI). */
export function isRateTableStale(table: RateTable, maxAgeDays: number, now = new Date()): boolean {
  const asOf = new Date(table.date);
  const ageMs = now.getTime() - asOf.getTime();
  return ageMs > maxAgeDays * 24 * 60 * 60 * 1000;
}
