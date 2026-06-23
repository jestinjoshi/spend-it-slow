/** A single marginal tax bracket. */
export interface TaxBracket {
  /** Upper income bound of this bracket; null means "no upper limit". */
  upTo: number | null;
  /** Marginal rate applied within this bracket, e.g. 0.0505 for 5.05%. */
  rate: number;
}

/** The result of running a gross annual income through a region's tax rules. */
export interface TaxResult {
  grossAnnual: number;
  netAnnual: number;
  /** Per-component tax amounts, e.g. { federal, provincial, cpp, ei }. */
  breakdown: Record<string, number>;
  /** Total tax + deductions divided by gross income (0–1). */
  effectiveRate: number;
}

/**
 * A self-contained tax region. Adding support for a new place means
 * implementing this interface in `regions/` and registering it, see
 * `regions/_template.ts` and docs/adding-a-region.md.
 */
export interface TaxRegion {
  /** Stable id, `country-region` lowercase, e.g. "ca-on". */
  id: string;
  /** Human label, e.g. "Ontario, Canada". */
  label: string;
  /** ISO 4217 currency these rules assume, e.g. "CAD". */
  currency: string;
  /** Tax year these rules represent. */
  taxYear: number;
  /** ISO date after which these rules should be reviewed (drives the UI badge). */
  validUntil: string;
  /** Official source URL the numbers were taken from. */
  source: string;
  /** Pure function: gross annual income in, full tax breakdown out. */
  computeNetAnnual(grossAnnual: number): TaxResult;
}
