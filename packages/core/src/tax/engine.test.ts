import { describe, expect, it } from "vitest";
import { cappedContribution, nonRefundableCredit, progressiveTax } from "./engine";
import type { TaxBracket } from "./types";

const brackets: TaxBracket[] = [
  { upTo: 10_000, rate: 0.1 },
  { upTo: 20_000, rate: 0.2 },
  { upTo: null, rate: 0.3 },
];

describe("progressiveTax", () => {
  it("is zero for zero or negative income", () => {
    expect(progressiveTax(0, brackets)).toBe(0);
    expect(progressiveTax(-5, brackets)).toBe(0);
  });

  it("taxes only within the first bracket", () => {
    expect(progressiveTax(5_000, brackets)).toBeCloseTo(500);
  });

  it("applies marginal rates across bracket boundaries", () => {
    // 10k@10% + 5k@20% = 1000 + 1000
    expect(progressiveTax(15_000, brackets)).toBeCloseTo(2_000);
  });

  it("applies the open-ended top bracket", () => {
    // 10k@10% + 10k@20% + 10k@30% = 1000 + 2000 + 3000
    expect(progressiveTax(30_000, brackets)).toBeCloseTo(6_000);
  });
});

describe("nonRefundableCredit", () => {
  it("reduces tax by amount * rate", () => {
    expect(nonRefundableCredit(1_000, 5_000, 0.1)).toBe(500);
  });

  it("never goes below zero", () => {
    expect(nonRefundableCredit(100, 5_000, 0.1)).toBe(0);
  });
});

describe("cappedContribution", () => {
  it("ignores earnings below the floor", () => {
    expect(cappedContribution(2_000, 0.05, 3_500, 60_000)).toBe(0);
  });

  it("charges between floor and ceiling", () => {
    expect(cappedContribution(10_000, 0.05, 3_500, 60_000)).toBeCloseTo((10_000 - 3_500) * 0.05);
  });

  it("caps at the ceiling", () => {
    expect(cappedContribution(100_000, 0.05, 3_500, 60_000)).toBeCloseTo((60_000 - 3_500) * 0.05);
  });
});
