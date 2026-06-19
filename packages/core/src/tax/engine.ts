import type { TaxBracket } from "./types";

/**
 * Apply a set of progressive (marginal) brackets to an income.
 * Brackets must be sorted ascending by `upTo`, with the final bracket
 * using `upTo: null` for the top, open-ended band.
 */
export function progressiveTax(income: number, brackets: TaxBracket[]): number {
  if (income <= 0) return 0;
  let tax = 0;
  let lower = 0;
  for (const bracket of brackets) {
    const upper = bracket.upTo ?? Number.POSITIVE_INFINITY;
    if (income > lower) {
      const taxableInBand = Math.min(income, upper) - lower;
      tax += taxableInBand * bracket.rate;
    }
    lower = upper;
    if (income <= upper) break;
  }
  return tax;
}

/**
 * A non-refundable credit: reduces tax owed by `amount * rate`, never below 0.
 * Used for basic personal amounts.
 */
export function nonRefundableCredit(tax: number, amount: number, rate: number): number {
  return Math.max(0, tax - amount * rate);
}

/**
 * A flat contribution charged on earnings between an exemption floor and a
 * ceiling (e.g. CPP). Earnings below the floor and above the ceiling are
 * ignored.
 */
export function cappedContribution(
  income: number,
  rate: number,
  floor: number,
  ceiling: number,
): number {
  const base = Math.min(Math.max(income, floor), ceiling) - floor;
  return Math.max(0, base) * rate;
}
