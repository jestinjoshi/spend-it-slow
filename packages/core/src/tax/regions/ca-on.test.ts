import { describe, expect, it } from "vitest";
import { caOn } from "./ca-on";

/**
 * These assert INVARIANTS, not exact dollar amounts — the example constants in
 * ca-on.ts are placeholders to be verified against the CRA. When you confirm
 * real numbers, add a few exact fixtures here (known gross -> known net).
 */
describe("caOn region", () => {
  it("exposes the metadata the UI needs", () => {
    expect(caOn.id).toBe("ca-on");
    expect(caOn.currency).toBe("CAD");
    expect(caOn.taxYear).toBeGreaterThan(2020);
    expect(() => new Date(caOn.validUntil).toISOString()).not.toThrow();
    expect(caOn.source).toMatch(/^https:\/\//);
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
