export interface HumanDuration {
  workDays: number;
  hours: number;
  minutes: number;
}

/**
 * Break a raw hours figure into work-days / hours / minutes, where a "work day"
 * is `hoursPerWorkDay` long (derived from the user's schedule, or a blended
 * figure across multiple income sources) — so the breakdown matches how they
 * actually work rather than a fixed 8-hour day.
 */
export function hoursToHuman(totalHours: number, hoursPerWorkDay: number): HumanDuration {
  const safeHoursPerDay = hoursPerWorkDay > 0 ? hoursPerWorkDay : 1;
  const workDays = Math.floor(totalHours / safeHoursPerDay);
  const remainderHours = totalHours - workDays * safeHoursPerDay;
  const hours = Math.floor(remainderHours);
  const minutes = Math.round((remainderHours - hours) * 60);
  return { workDays, hours, minutes };
}

/** Express hours as a fraction of a full working year. */
export function hoursAsYearFraction(totalHours: number, annualWorkHours: number): number {
  return annualWorkHours > 0 ? totalHours / annualWorkHours : 0;
}

/** Format a money amount with the right currency symbol for a given locale. */
export function formatMoney(amount: number, currency: string, locale = "en-CA"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}
