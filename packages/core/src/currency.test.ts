import { describe, expect, it } from "vitest";
import { convertCurrency, isRateTableStale, type RateTable } from "./currency";

const table: RateTable = {
  base: "EUR",
  date: "2026-06-01",
  rates: { USD: 1.1, CAD: 1.5, EUR: 1 },
};

describe("convertCurrency", () => {
  it("returns the amount unchanged for same currency", () => {
    expect(convertCurrency(100, "USD", "USD", table)).toBe(100);
  });

  it("converts from the base currency", () => {
    expect(convertCurrency(10, "EUR", "USD", table)).toBeCloseTo(11);
  });

  it("converts to the base currency", () => {
    expect(convertCurrency(11, "USD", "EUR", table)).toBeCloseTo(10);
  });

  it("cross-converts between two non-base currencies", () => {
    // 110 USD -> 100 EUR -> 150 CAD
    expect(convertCurrency(110, "USD", "CAD", table)).toBeCloseTo(150);
  });

  it("throws on an unknown currency", () => {
    expect(() => convertCurrency(1, "JPY", "USD", table)).toThrow();
  });
});

describe("isRateTableStale", () => {
  it("is not stale within the window", () => {
    expect(isRateTableStale(table, 7, new Date("2026-06-05"))).toBe(false);
  });

  it("is stale past the window", () => {
    expect(isRateTableStale(table, 7, new Date("2026-06-20"))).toBe(true);
  });
});
