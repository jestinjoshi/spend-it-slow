import { describe, expect, it } from "vitest";
import { annualHours, netHourlyFromAnnual, toAnnualGross } from "./income";
import { DEFAULT_SCHEDULE } from "./types";

describe("toAnnualGross", () => {
  const s = DEFAULT_SCHEDULE; // 40h/wk, 5d/wk, 52wk/yr -> 2080 h/yr

  it("annualizes hourly pay using hours/week and weeks/year", () => {
    expect(toAnnualGross(25, "hourly", s)).toBe(25 * 40 * 52);
  });

  it("annualizes daily pay using days/week and weeks/year", () => {
    expect(toAnnualGross(200, "daily", s)).toBe(200 * 5 * 52);
  });

  it("annualizes weekly pay", () => {
    expect(toAnnualGross(1000, "weekly", s)).toBe(1000 * 52);
  });

  it("annualizes monthly pay", () => {
    expect(toAnnualGross(5000, "monthly", s)).toBe(60_000);
  });

  it("passes yearly pay through unchanged", () => {
    expect(toAnnualGross(80_000, "yearly", s)).toBe(80_000);
  });
});

describe("annualHours / netHourlyFromAnnual", () => {
  it("computes total paid hours per year", () => {
    expect(annualHours(DEFAULT_SCHEDULE)).toBe(2080);
  });

  it("derives net hourly from a net annual figure", () => {
    expect(netHourlyFromAnnual(52_000, DEFAULT_SCHEDULE)).toBe(25);
  });

  it("throws when the schedule yields zero hours", () => {
    expect(() =>
      netHourlyFromAnnual(1000, { hoursPerWeek: 0, daysPerWeek: 0, weeksPerYear: 0 }),
    ).toThrow();
  });
});
