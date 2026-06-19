import { convertCurrency, type RateTable } from "./currency";
import { netHourlyFromAnnual, toAnnualGross } from "./income";
import type { PayPeriod, WorkSchedule } from "./types";
import { getRegion } from "./tax/registry";

export interface IncomeProfile {
  amount: number;
  period: PayPeriod;
  currency: string;
  schedule: WorkSchedule;
  /**
   * Tax region id (e.g. "ca-on"). When omitted, the amount is treated as
   * already net (take-home) and no tax is applied.
   */
  regionId?: string;
}

export interface PriceToHoursInput {
  /** The price of the item the user is considering. */
  price: number;
  /** Currency of that price (may differ from the user's income currency). */
  priceCurrency: string;
  income: IncomeProfile;
  /** Required only when `priceCurrency` differs from the income currency. */
  rates?: RateTable;
}

export interface PriceToHoursResult {
  /** Work time the purchase costs, in hours. */
  hours: number;
  /** Net (after-tax, if a region was given) hourly rate used. */
  netHourly: number;
  /** Price expressed in the user's income currency. */
  priceInIncomeCurrency: number;
}

/** Net hourly take-home for an income profile, applying tax if a region is set. */
export function netHourlyForIncome(income: IncomeProfile): number {
  const grossAnnual = toAnnualGross(income.amount, income.period, income.schedule);

  if (!income.regionId) {
    return netHourlyFromAnnual(grossAnnual, income.schedule);
  }

  const region = getRegion(income.regionId);
  if (!region) {
    throw new Error(`Unknown tax region: ${income.regionId}`);
  }
  const { netAnnual } = region.computeNetAnnual(grossAnnual);
  return netHourlyFromAnnual(netAnnual, income.schedule);
}

/**
 * The headline calculation: how many hours of work a price costs.
 * Converts currency first (if needed), then divides by net hourly pay.
 */
export function priceToHours(input: PriceToHoursInput): PriceToHoursResult {
  const { price, priceCurrency, income, rates } = input;

  let priceInIncomeCurrency = price;
  if (priceCurrency !== income.currency) {
    if (!rates) {
      throw new Error("Exchange rates are required to convert between currencies.");
    }
    priceInIncomeCurrency = convertCurrency(price, priceCurrency, income.currency, rates);
  }

  const netHourly = netHourlyForIncome(income);
  if (netHourly <= 0) {
    throw new Error("Net hourly pay must be greater than 0.");
  }

  return {
    hours: priceInIncomeCurrency / netHourly,
    netHourly,
    priceInIncomeCurrency,
  };
}
