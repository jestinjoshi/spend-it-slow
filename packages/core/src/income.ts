import type { PayPeriod, WorkSchedule } from "./types";

/** Total paid hours in a year for a given schedule. */
export function annualHours(schedule: WorkSchedule): number {
  return schedule.hoursPerWeek * schedule.weeksPerYear;
}

/**
 * Normalize any pay amount + period into a gross annual figure, using the
 * user's work schedule. This is the single entry point the tax module needs,
 * since income-tax brackets are defined annually.
 */
export function toAnnualGross(
  amount: number,
  period: PayPeriod,
  schedule: WorkSchedule,
): number {
  switch (period) {
    case "hourly":
      return amount * schedule.hoursPerWeek * schedule.weeksPerYear;
    case "daily":
      return amount * schedule.daysPerWeek * schedule.weeksPerYear;
    case "weekly":
      return amount * schedule.weeksPerYear;
    case "monthly":
      return amount * 12;
    case "yearly":
      return amount;
  }
}

/**
 * Convert a net (after-tax) annual figure into a net hourly rate, the number
 * the calculator divides a price by.
 */
export function netHourlyFromAnnual(netAnnual: number, schedule: WorkSchedule): number {
  const hours = annualHours(schedule);
  if (hours <= 0) {
    throw new Error("Work schedule must result in more than 0 hours per year.");
  }
  return netAnnual / hours;
}
