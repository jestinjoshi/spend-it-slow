import { annualHours } from "./income";
import type { WorkSchedule } from "./types";

export interface HumanDuration {
  workDays: number;
  hours: number;
  minutes: number;
}

/**
 * Break a raw hours figure into work-days / hours / minutes, where a "work
 * day" is defined by the user's schedule (hoursPerWeek / daysPerWeek), not a
 * fixed 8 hours — so the breakdown matches how they actually work.
 */
export function hoursToHuman(totalHours: number, schedule: WorkSchedule): HumanDuration {
  const hoursPerWorkDay =
    schedule.daysPerWeek > 0 ? schedule.hoursPerWeek / schedule.daysPerWeek : schedule.hoursPerWeek;

  const safeHoursPerDay = hoursPerWorkDay > 0 ? hoursPerWorkDay : 1;
  const workDays = Math.floor(totalHours / safeHoursPerDay);
  const remainderHours = totalHours - workDays * safeHoursPerDay;
  const hours = Math.floor(remainderHours);
  const minutes = Math.round((remainderHours - hours) * 60);

  return { workDays, hours, minutes };
}

/** Express hours as a fraction of a full working year (for "is it worth it" framing). */
export function hoursAsYearFraction(totalHours: number, schedule: WorkSchedule): number {
  const yearHours = annualHours(schedule);
  return yearHours > 0 ? totalHours / yearHours : 0;
}

/** Format a money amount with the right currency symbol for a given locale. */
export function formatMoney(amount: number, currency: string, locale = "en-CA"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}
