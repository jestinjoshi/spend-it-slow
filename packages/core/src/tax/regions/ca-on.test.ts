import { describe, expect, it } from "vitest";
import { caOn } from "./ca-on";

/**
 * Mixes invariant checks with exact 2026 fixtures. The fixture figures are
 * hand-calculated from the published 2026 federal/Ontario rates so they catch
 * any accidental change to the constants. Recompute them whenever the tax year
 * is updated.
 */
describe("caOn region", () => {
  it("exposes the metadata the UI needs", () => {
    expect(caOn.id).toBe("ca-on");
    expect(caOn.currency).toBe("CAD");
    expect(caOn.taxYear).toBe(2026);
    expect(() => new Date(caOn.validUntil).toISOString()).not.toThrow();
    expect(caOn.source).toMatch(/^https:\/\//);
  });

  it("matches the hand-calculated 2026 fixture for a $80,000 salary", () => {
    const r = caOn.computeNetAnnual(80_000);
    // EI maxed (68,900 × 1.63%); CPP base maxed (71,100 × 5.95%) + CPP2 (5,400 × 4%).
    expect(r.breakdown.ei).toBeCloseTo(1_123.07, 2);
    expect(r.breakdown.cpp).toBeCloseTo(4_446.45, 2);
    // federal 10,292.73 + ON 4,454.52 + CPP 4,446.45 + EI 1,123.07 deductions.
    expect(r.netAnnual).toBeCloseTo(59_683.23, 1);
    expect(r.effectiveRate).toBeCloseTo(0.254, 3);
  });

  it("applies CPP2 above the YMPE (max $416 at/above YAMPE)", () => {
    const r = caOn.computeNetAnnual(120_000);
    // CPP base maxes at 4,230.45; CPP2 maxes at 416 → 4,646.45.
    expect(r.breakdown.cpp).toBeCloseTo(4_646.45, 2);
  });

  it("returns zero tax for zero income", () => {
    const r = caOn.computeNetAnnual(0);
    expect(r.netAnnual).toBe(0);
    expect(r.effectiveRate).toBe(0);
  });

  it("never returns net greater than gross", () => {
    for (const gross of [20_000, 50_000, 100_000, 250_000]) {
      const r = caOn.computeNetAnnual(gross);
      expect(r.netAnnual).toBeLessThan(gross);
      expect(r.netAnnual).toBeGreaterThan(0);
    }
  });

  it("is progressive: higher income means a higher effective rate", () => {
    const low = caOn.computeNetAnnual(40_000).effectiveRate;
    const high = caOn.computeNetAnnual(200_000).effectiveRate;
    expect(high).toBeGreaterThan(low);
  });

  it("breaks tax down into the expected components", () => {
    const r = caOn.computeNetAnnual(80_000);
    expect(Object.keys(r.breakdown).sort()).toEqual(["cpp", "ei", "federal", "provincial"]);
  });
});
