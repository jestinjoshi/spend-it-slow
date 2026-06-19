import { describe, expect, it } from "vitest";
import { netHourlyForIncome, priceToHours } from "./convert";
import type { RateTable } from "./currency";
import { DEFAULT_SCHEDULE } from "./types";

const rates: RateTable = {
  base: "USD",
  date: "2026-06-01",
  rates: { USD: 1, CAD: 1.25 },
};

describe("netHourlyForIncome", () => {
  it("treats income as net when no region is given", () => {
    const net = netHourlyForIncome({
      amount: 50_000,
      period: "yearly",
      currency: "CAD",
      schedule: DEFAULT_SCHEDULE,
    });
    // 50,000 / 2080 hours
    expect(net).toBeCloseTo(50_000 / 2080);
  });

  it("applies tax when a region is given (net < gross-equivalent)", () => {
    const grossNet = netHourlyForIncome({
      amount: 100_000,
      period: "yearly",
      currency: "CAD",
      schedule: DEFAULT_SCHEDULE,
      regionId: "ca-on",
    });
    const noTax = 100_000 / 2080;
    expect(grossNet).toBeGreaterThan(0);
    expect(grossNet).toBeLessThan(noTax);
  });

  it("throws on an unknown region", () => {
    expect(() =>
      netHourlyForIncome({
        amount: 100,
        period: "hourly",
        currency: "CAD",
        schedule: DEFAULT_SCHEDULE,
        regionId: "zz-zz",
      }),
    ).toThrow();
  });
});

describe("priceToHours", () => {
  const income = {
    amount: 52_000,
    period: "yearly" as const,
    currency: "CAD",
    schedule: DEFAULT_SCHEDULE,
  };

  it("divides price by net hourly when currencies match", () => {
    const { hours, netHourly } = priceToHours({
      price: 100,
      priceCurrency: "CAD",
      income,
    });
    expect(netHourly).toBeCloseTo(25);
    expect(hours).toBeCloseTo(4);
  });

  it("converts the price first when currencies differ", () => {
    const { hours, priceInIncomeCurrency } = priceToHours({
      price: 100, // USD
      priceCurrency: "USD",
      income,
      rates,
    });
    expect(priceInIncomeCurrency).toBeCloseTo(125); // 100 USD -> 125 CAD
    expect(hours).toBeCloseTo(5); // 125 / 25
  });

  it("requires rates when currencies differ", () => {
    expect(() =>
      priceToHours({ price: 100, priceCurrency: "USD", income }),
    ).toThrow();
  });
});
