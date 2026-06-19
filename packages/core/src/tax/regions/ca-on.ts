import { cappedContribution, nonRefundableCredit, progressiveTax } from "../engine";
import type { TaxBracket, TaxRegion } from "../types";

/**
 * Ontario, Canada — 2026 tax year.
 *
 * Figures below are the indexed 2026 federal and Ontario amounts (CRA 2.0%
 * federal / 1.9% Ontario indexation). Sources:
 *  - Federal brackets + BPA, CPP/EI: canada.ca (CRA)
 *  - Ontario brackets, surtax, BPA: Ontario Ministry of Finance
 *  - Cross-checked against taxtips.ca 2026 tables.
 *
 * This estimates take-home pay = gross − (federal income tax + Ontario income
 * tax incl. surtax + CPP base + CPP2 + EI). It intentionally does NOT model the
 * federal CPP/EI tax credits or the enhanced-CPP income deduction, so it errs
 * slightly high on tax (a little low on net) — fine for a "what does it cost"
 * estimate. Update these constants and `validUntil` each tax year.
 */

// --- Federal (2026) ---
const FEDERAL_BRACKETS: TaxBracket[] = [
  { upTo: 58_523, rate: 0.14 },
  { upTo: 117_045, rate: 0.205 },
  { upTo: 181_440, rate: 0.26 },
  { upTo: 258_482, rate: 0.29 },
  { upTo: null, rate: 0.33 },
];
const FEDERAL_LOWEST_RATE = 0.14;
// Basic personal amount phases from the max down to the min across the 2nd-top
// bracket ($181,440 → $258,482) for high earners.
const FEDERAL_BPA_MAX = 16_452;
const FEDERAL_BPA_MIN = 14_829;
const FEDERAL_BPA_PHASE_START = 181_440;
const FEDERAL_BPA_PHASE_END = 258_482;

function federalBpa(income: number): number {
  if (income <= FEDERAL_BPA_PHASE_START) return FEDERAL_BPA_MAX;
  if (income >= FEDERAL_BPA_PHASE_END) return FEDERAL_BPA_MIN;
  const phased =
    (FEDERAL_BPA_MAX - FEDERAL_BPA_MIN) *
    ((income - FEDERAL_BPA_PHASE_START) / (FEDERAL_BPA_PHASE_END - FEDERAL_BPA_PHASE_START));
  return FEDERAL_BPA_MAX - phased;
}

// --- Ontario (2026) ---
const ONTARIO_BRACKETS: TaxBracket[] = [
  { upTo: 53_891, rate: 0.0505 },
  { upTo: 107_785, rate: 0.0915 },
  { upTo: 150_000, rate: 0.1116 },
  { upTo: 220_000, rate: 0.1216 },
  { upTo: null, rate: 0.1316 },
];
const ONTARIO_LOWEST_RATE = 0.0505;
const ONTARIO_BPA = 12_989;

// Ontario surtax on provincial tax above two thresholds (2026).
const SURTAX_T1 = 5_818;
const SURTAX_R1 = 0.2;
const SURTAX_T2 = 7_446;
const SURTAX_R2 = 0.36;

// --- Payroll (2026) ---
const CPP = { rate: 0.0595, exemption: 3_500, ympe: 74_600 };
const CPP2 = { rate: 0.04, ympe: 74_600, yampe: 85_000 };
const EI = { rate: 0.0163, maxInsurable: 68_900 };

function ontarioSurtax(provincialBaseTax: number): number {
  let surtax = 0;
  if (provincialBaseTax > SURTAX_T1) surtax += (provincialBaseTax - SURTAX_T1) * SURTAX_R1;
  if (provincialBaseTax > SURTAX_T2) surtax += (provincialBaseTax - SURTAX_T2) * SURTAX_R2;
  return surtax;
}

export const caOn: TaxRegion = {
  id: "ca-on",
  label: "Ontario, Canada",
  currency: "CAD",
  taxYear: 2026,
  validUntil: "2026-12-31",
  source:
    "https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html",
  computeNetAnnual(grossAnnual) {
    const gross = Math.max(0, grossAnnual);

    const federal = nonRefundableCredit(
      progressiveTax(gross, FEDERAL_BRACKETS),
      federalBpa(gross),
      FEDERAL_LOWEST_RATE,
    );

    const ontarioBase = nonRefundableCredit(
      progressiveTax(gross, ONTARIO_BRACKETS),
      ONTARIO_BPA,
      ONTARIO_LOWEST_RATE,
    );
    const provincial = ontarioBase + ontarioSurtax(ontarioBase);

    const cppBase = cappedContribution(gross, CPP.rate, CPP.exemption, CPP.ympe);
    const cpp2 = cappedContribution(gross, CPP2.rate, CPP2.ympe, CPP2.yampe);
    const cpp = cppBase + cpp2;

    const ei = Math.min(gross, EI.maxInsurable) * EI.rate;

    const total = federal + provincial + cpp + ei;

    return {
      grossAnnual: gross,
      netAnnual: gross - total,
      breakdown: { federal, provincial, cpp, ei },
      effectiveRate: gross > 0 ? total / gross : 0,
    };
  },
};
