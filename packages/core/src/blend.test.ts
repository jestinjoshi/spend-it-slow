import { describe, expect, it } from "vitest";
import { blendIncome, type BlendSource, priceToHoursMulti } from "./convert";
import type { RateTable } from "./currency";

const SCHEDULE = { hoursPerWeek: 40, daysPerWeek: 5, weeksPerYear: 52 }; // 2080 h, 260 days

const taxedCad = (amount: number): BlendSource => ({
  amount,
  period: "yearly",
  currency: "CAD",
  schedule: SCHEDULE,
  taxed: true,
});

describe("blendIncome — single tax residency", () => {
  it("uses the residency currency as the base", () => {
    const blend = blendIncome([taxedCad(80_000)], "ca-on");
    expect(blend.baseCurrency).toBe("CAD");
  });

  it("taxes the combined gross once (stacked), not per source", () => {
    // Two CAD incomes summing to 80k, taxed together, should equal one 80k income.
    const split = blendIncome([taxedCad(50_000), taxedCad(30_000)], "ca-on");
    const single = blendIncome([taxedCad(80_000)], "ca-on");
    expect(split.netAnnual).toBeCloseTo(single.netAnnual, 6);
  });

  it("stacking produces more tax than taxing each source independently", () => {
    const stacked = blendIncome([taxedCad(60_000), taxedCad(60_000)], "ca-on").netAnnual;
    const independent =
      blendIncome([taxedCad(60_000)], "ca-on").netAnnual +
      blendIncome([taxedCad(60_000)], "ca-on").netAnnual;
    // Independent taxation gives each its own low brackets + BPA, so keeps more.
    expect(independent).toBeGreaterThan(stacked);
  });

  it("treats untaxed sources as already take-home (added on top)", () => {
    const net: BlendSource = { ...taxedCad(10_000), taxed: false };
    const blend = blendIncome([taxedCad(80_000), net], "ca-on");
    const taxedOnly = blendIncome([taxedCad(80_000)], "ca-on");
    expect(blend.netAnnual).toBeCloseTo(taxedOnly.netAnnual + 10_000, 6);
  });

  it("applies no tax when there is no residency region", () => {
    const blend = blendIncome([taxedCad(80_000)]);
    expect(blend.netAnnual).toBe(80_000); // gross == net
  });
});

describe("blendIncome — worldwide income (Ontario resident)", () => {
  // Ontario resident earning from Vancouver (CAD), San Francisco (USD), Mumbai (INR).
  const rates: RateTable = {
    base: "CAD",
    date: "2026-06-01",
    rates: { CAD: 1, USD: 0.72, INR: 60 }, // 1 CAD = 0.72 USD = 60 INR
  };

  const sources: BlendSource[] = [
    { amount: 60_000, period: "yearly", currency: "CAD", schedule: SCHEDULE, taxed: true }, // Vancouver
    { amount: 36_000, period: "yearly", currency: "USD", schedule: SCHEDULE, taxed: true }, // SF -> 50k CAD
    { amount: 1_200_000, period: "yearly", currency: "INR", schedule: SCHEDULE, taxed: true }, // Mumbai -> 20k CAD
  ];

  it("converts all income to CAD and taxes the worldwide total once", () => {
    const blend = blendIncome(sources, "ca-on", rates);
    // worldwide gross = 60k + 50k + 20k = 130k CAD, taxed at Ontario rates as one amount
    const equivalent = blendIncome(
      [{ amount: 130_000, period: "yearly", currency: "CAD", schedule: SCHEDULE, taxed: true }],
      "ca-on",
      rates,
    );
    expect(blend.netAnnual).toBeCloseTo(equivalent.netAnnual, 4);
    expect(blend.baseCurrency).toBe("CAD");
  });

  it("requires rates to combine foreign-currency income", () => {
    expect(() => blendIncome(sources, "ca-on")).toThrow();
  });
});

describe("priceToHoursMulti", () => {
  it("divides the price by the blended residency rate", () => {
    const result = priceToHoursMulti({
      price: 100,
      priceCurrency: "CAD",
      sources: [{ ...taxedCad(52_000), taxed: false }], // net 52k / 2080 = 25/hr
      residencyRegionId: "ca-on",
    });
    expect(result.netHourly).toBeCloseTo(25);
    expect(result.hours).toBeCloseTo(4);
  });
});
