import { cappedContribution, nonRefundableCredit, progressiveTax } from "../engine";
import type { TaxBracket, TaxRegion } from "../types";

/**
 * Ontario, Canada — reference implementation.
 *
 * ⚠️ The constants below are EXAMPLE values modelled on the 2024 tax year and
 * are NOT guaranteed accurate. Verify every number against the CRA and Ontario
 * Ministry of Finance before relying on this, and bump `taxYear` / `validUntil`
 * when you update them. This intentionally simplifies some rules (notably the
 * CPP2 second ceiling and the federal BPA phase-out at high incomes).
 */

const FEDERAL_BRACKETS: TaxBracket[] = [
  { upTo: 55_867, rate: 0.15 },
  { upTo: 111_733, rate: 0.205 },
  { upTo: 173_205, rate: 0.26 },
  { upTo: 246_752, rate: 0.29 },
  { upTo: null, rate: 0.33 },
];

const ONTARIO_BRACKETS: TaxBracket[] = [
  { upTo: 51_446, rate: 0.0505 },
  { upTo: 102_894, rate: 0.0915 },
  { upTo: 150_000, rate: 0.1116 },
  { upTo: 220_000, rate: 0.1216 },
  { upTo: null, rate: 0.1316 },
];

const FEDERAL_BPA = 15_705; // basic personal amount, credited at lowest rate
const ONTARIO_BPA = 12_399;

// Ontario surtax on provincial tax above two thresholds.
const SURTAX_T1 = 5_554;
const SURTAX_R1 = 0.2;
const SURTAX_T2 = 7_108;
const SURTAX_R2 = 0.36;

// CPP (simplified: single ceiling, ignores CPP2) and EI for 2024.
const CPP = { rate: 0.0595, exemption: 3_500, ceiling: 68_500 };
const EI = { rate: 0.0166, maxInsurable: 63_200 };

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
  taxYear: 2024,
  validUntil: "2025-12-31",
  source: "https://www.canada.ca/en/revenue-agency/services/tax/individuals.html",
  computeNetAnnual(grossAnnual) {
    const gross = Math.max(0, grossAnnual);

    const federal = nonRefundableCredit(
      progressiveTax(gross, FEDERAL_BRACKETS),
      FEDERAL_BPA,
      0.15,
    );

    const ontarioBase = nonRefundableCredit(
      progressiveTax(gross, ONTARIO_BRACKETS),
      ONTARIO_BPA,
      0.0505,
    );
    const provincial = ontarioBase + ontarioSurtax(ontarioBase);

    const cpp = cappedContribution(gross, CPP.rate, CPP.exemption, CPP.ceiling);
    const ei = Math.min(gross, EI.maxInsurable) * EI.rate;

    const total = federal + provincial + cpp + ei;
    const netAnnual = gross - total;

    return {
      grossAnnual: gross,
      netAnnual,
      breakdown: { federal, provincial, cpp, ei },
      effectiveRate: gross > 0 ? total / gross : 0,
    };
  },
};
