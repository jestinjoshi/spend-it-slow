import { z } from "zod";
import { PAY_PERIODS } from "./types";

/** Work-schedule settings, with the same defaults as DEFAULT_SCHEDULE. */
export const workScheduleSchema = z.object({
  hoursPerWeek: z.coerce.number().positive("Hours per week must be greater than 0").max(168),
  daysPerWeek: z.coerce.number().positive("Days per week must be greater than 0").max(7),
  weeksPerYear: z.coerce.number().positive("Weeks per year must be greater than 0").max(53),
});

/** The full income setup the user configures on the Settings page. */
export const incomeSettingsSchema = z.object({
  amount: z.coerce.number().positive("Enter an amount greater than 0"),
  period: z.enum(PAY_PERIODS),
  currency: z.string().trim().length(3, "Use a 3-letter currency code").toUpperCase(),
  schedule: workScheduleSchema,
  /** Empty / undefined means "treat my amount as already after-tax". */
  regionId: z.string().trim().optional(),
});

/** The price entered on the calculator's main page. */
export const priceInputSchema = z.object({
  price: z.coerce.number().positive("Enter a price greater than 0"),
  currency: z.string().trim().length(3, "Use a 3-letter currency code").toUpperCase(),
});

export type IncomeSettings = z.infer<typeof incomeSettingsSchema>;
export type PriceInput = z.infer<typeof priceInputSchema>;
