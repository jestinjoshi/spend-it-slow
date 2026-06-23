/** How often the user is paid. */
export const PAY_PERIODS = ["hourly", "daily", "weekly", "monthly", "yearly"] as const;

export type PayPeriod = (typeof PAY_PERIODS)[number];

/**
 * The work-schedule assumptions used to translate between pay periods and
 * an hourly figure. These are deliberately user-editable and surfaced in the
 * UI. The final "hours" number is only as honest as these values.
 */
export interface WorkSchedule {
  /** Paid hours worked in a typical week. */
  hoursPerWeek: number;
  /** Days worked in a typical week (used to annualize a daily rate). */
  daysPerWeek: number;
  /** Paid weeks in a year (lower this to account for unpaid leave). */
  weeksPerYear: number;
}

export const DEFAULT_SCHEDULE: WorkSchedule = {
  hoursPerWeek: 40,
  daysPerWeek: 5,
  weeksPerYear: 52,
};
