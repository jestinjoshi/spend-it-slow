// Types & schedule
export type { PayPeriod, WorkSchedule } from "./types";
export { PAY_PERIODS, DEFAULT_SCHEDULE } from "./types";

// Income normalization
export { annualHours, toAnnualGross, netHourlyFromAnnual } from "./income";

// Currency
export type { RateTable } from "./currency";
export { convertCurrency, isRateTableStale } from "./currency";

// Headline calculation
export type {
  IncomeProfile,
  BlendSource,
  BlendedIncome,
  MultiPriceResult,
  PriceToHoursInput,
  PriceToHoursResult,
} from "./convert";
export {
  priceToHours,
  priceToHoursMulti,
  netHourlyForIncome,
  netAnnualForIncome,
  blendIncome,
} from "./convert";

// Formatting
export type { HumanDuration } from "./format";
export { hoursToHuman, hoursAsYearFraction, formatMoney } from "./format";

// Validation schemas
export type { IncomeSettings, IncomeSource, IncomeSetup, PriceInput } from "./schema";
export {
  workScheduleSchema,
  incomeSettingsSchema,
  incomeSourceSchema,
  incomeSetupSchema,
  priceInputSchema,
} from "./schema";

// Tax module
export type { TaxBracket, TaxRegion, TaxResult } from "./tax/index";
export {
  progressiveTax,
  nonRefundableCredit,
  cappedContribution,
  listRegions,
  getRegion,
  DEFAULT_REGION_ID,
} from "./tax/index";
