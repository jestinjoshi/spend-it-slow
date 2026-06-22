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

/** A single named income source. `taxed` decides whether the residency tax applies. */
export const incomeSourceSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1, "Give this income a name").max(40),
  amount: z.coerce.number().positive("Enter an amount greater than 0"),
  period: z.enum(PAY_PERIODS),
  currency: z.string().trim().length(3, "Use a 3-letter currency code").toUpperCase(),
  schedule: workScheduleSchema,
  /** true = gross income taxed at the residency; false = already take-home. */
  taxed: z.boolean(),
});

/**
 * The full income setup: a single tax residency applied to all gross income,
 * plus one or more income sources. An empty `residencyRegionId` means no tax is
 * applied (every amount is treated as take-home).
 */
export const incomeSetupSchema = z.object({
  residencyRegionId: z.string().trim().optional(),
  sources: z.array(incomeSourceSchema).min(1, "Add at least one income source"),
});

/** The price entered on the calculator's main page. */
export const priceInputSchema = z.object({
  price: z.coerce.number().positive("Enter a price greater than 0"),
  currency: z.string().trim().length(3, "Use a 3-letter currency code").toUpperCase(),
});

export type IncomeSettings = z.infer<typeof incomeSettingsSchema>;
export type IncomeSource = z.infer<typeof incomeSourceSchema>;
export type IncomeSetup = z.infer<typeof incomeSetupSchema>;
export type PriceInput = z.infer<typeof priceInputSchema>;
