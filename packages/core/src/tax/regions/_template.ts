/**
 * Region template: copy this file to add support for a new place.
 *
 * Checklist:
 *  1. Copy to `regions/<country>-<region>.ts` (e.g. "us-ca.ts", "uk.ts").
 *  2. Fill in the metadata and the tax math below. Cite `source` for every
 *     number so it stays auditable, and set `validUntil` to when the rules
 *     should next be reviewed.
 *  3. Register it in `registry.ts`.
 *  4. Add a test next to the file (copy `ca-on.test.ts`) with fixtures that
 *     assert the invariants. CI will not accept a region without tests.
 *
 * Keep `computeNetAnnual` PURE: gross in, result out. No dates, no I/O.
 */
import { progressiveTax } from "../engine";
import type { TaxBracket, TaxRegion } from "../types";

const BRACKETS: TaxBracket[] = [
  // { upTo: 10_000, rate: 0.1 },
  // { upTo: null, rate: 0.2 },
];

export const template: TaxRegion = {
  id: "xx-yy",
  label: "Region, Country",
  currency: "XXX",
  taxYear: 2026,
  validUntil: "2026-12-31",
  source: "https://example.gov/tax",
  computeNetAnnual(grossAnnual) {
    const gross = Math.max(0, grossAnnual);
    const incomeTax = progressiveTax(gross, BRACKETS);
    const total = incomeTax; // + payroll contributions, surtaxes, credits...
    return {
      grossAnnual: gross,
      netAnnual: gross - total,
      breakdown: { incomeTax },
      effectiveRate: gross > 0 ? total / gross : 0,
    };
  },
};
