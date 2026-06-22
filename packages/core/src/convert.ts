import { convertCurrency, type RateTable } from "./currency";
import { annualHours, netHourlyFromAnnual, toAnnualGross } from "./income";
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

/** Net (after-tax, if a region is set) annual income for one source, in its own currency. */
export function netAnnualForIncome(income: IncomeProfile): number {
  const grossAnnual = toAnnualGross(income.amount, income.period, income.schedule);
  if (!income.regionId) return grossAnnual;

  const region = getRegion(income.regionId);
  if (!region) {
    throw new Error(`Unknown tax region: ${income.regionId}`);
  }
  return region.computeNetAnnual(grossAnnual).netAnnual;
}

/** Net hourly take-home for a single income, applying tax if a region is set. */
export function netHourlyForIncome(income: IncomeProfile): number {
  return netHourlyFromAnnual(netAnnualForIncome(income), income.schedule);
}

/** One income within a multi-source setup with a single tax residency. */
export interface BlendSource {
  amount: number;
  period: PayPeriod;
  currency: string;
  schedule: WorkSchedule;
  /** true = gross income, taxed at the residency; false = already take-home. */
  taxed: boolean;
}

export interface BlendedIncome {
  /** Blended take-home rate per hour, in `baseCurrency`. */
  netHourly: number;
  /** Total net (after-tax) income per year across all sources, in `baseCurrency`. */
  netAnnual: number;
  /** Total paid hours worked per year across all sources. */
  annualHours: number;
  /** Total work-days per year across all sources (for the human breakdown). */
  annualWorkDays: number;
  /** Currency the blended figures are expressed in. */
  baseCurrency: string;
  sourceCount: number;
}

/**
 * Combine multiple income sources into a single blended take-home hourly rate,
 * modelling a single **tax residency**: all gross (taxed) sources are converted
 * to the residency currency, summed, and taxed once with stacked brackets —
 * matching how a tax resident is taxed on worldwide income. Sources flagged as
 * already take-home are converted and added on top, untaxed.
 *
 * Foreign income is approximated at the residency's rates (it ignores foreign
 * tax credits / higher source-country taxes), so for foreign earnings the real
 * tax may be higher. See README.
 *
 * When no residency region is given, nothing is taxed (every amount is treated
 * as take-home) and the base currency is the first source's currency.
 */
export function blendIncome(
  sources: BlendSource[],
  residencyRegionId?: string,
  rates?: RateTable,
): BlendedIncome {
  if (sources.length === 0) {
    throw new Error("At least one income source is required.");
  }

  const region = residencyRegionId ? getRegion(residencyRegionId) : undefined;
  if (residencyRegionId && !region) {
    throw new Error(`Unknown tax region: ${residencyRegionId}`);
  }

  const baseCurrency = region ? region.currency : sources[0]!.currency;

  const toBase = (amount: number, from: string): number => {
    if (from === baseCurrency) return amount;
    if (!rates) {
      throw new Error("Exchange rates are required to combine incomes in different currencies.");
    }
    return convertCurrency(amount, from, baseCurrency, rates);
  };

  let grossTaxable = 0;
  let netUntaxed = 0;
  let totalHours = 0;
  let totalWorkDays = 0;

  for (const source of sources) {
    const grossAnnual = toAnnualGross(source.amount, source.period, source.schedule);
    if (source.taxed && region) {
      grossTaxable += toBase(grossAnnual, source.currency);
    } else {
      // already take-home, or there is no residency region to tax with
      netUntaxed += toBase(grossAnnual, source.currency);
    }
    totalHours += annualHours(source.schedule);
    totalWorkDays += source.schedule.daysPerWeek * source.schedule.weeksPerYear;
  }

  if (totalHours <= 0) {
    throw new Error("Income sources must total more than 0 work hours per year.");
  }

  // Tax the combined taxable income once, at the residency's stacked brackets.
  const taxedNet = region ? region.computeNetAnnual(grossTaxable).netAnnual : grossTaxable;
  const netAnnual = taxedNet + netUntaxed;

  return {
    netHourly: netAnnual / totalHours,
    netAnnual,
    annualHours: totalHours,
    annualWorkDays: totalWorkDays,
    baseCurrency,
    sourceCount: sources.length,
  };
}

// ---- price → hours ----

function hoursAtRate(
  price: number,
  priceCurrency: string,
  netHourly: number,
  incomeCurrency: string,
  rates?: RateTable,
): { hours: number; priceInIncomeCurrency: number } {
  let priceInIncomeCurrency = price;
  if (priceCurrency !== incomeCurrency) {
    if (!rates) {
      throw new Error("Exchange rates are required to convert between currencies.");
    }
    priceInIncomeCurrency = convertCurrency(price, priceCurrency, incomeCurrency, rates);
  }
  if (netHourly <= 0) {
    throw new Error("Net hourly pay must be greater than 0.");
  }
  return { hours: priceInIncomeCurrency / netHourly, priceInIncomeCurrency };
}

export interface PriceToHoursInput {
  price: number;
  priceCurrency: string;
  income: IncomeProfile;
  rates?: RateTable;
}

export interface PriceToHoursResult {
  hours: number;
  netHourly: number;
  priceInIncomeCurrency: number;
}

/** Headline calculation for a single income source. */
export function priceToHours(input: PriceToHoursInput): PriceToHoursResult {
  const netHourly = netHourlyForIncome(input.income);
  const { hours, priceInIncomeCurrency } = hoursAtRate(
    input.price,
    input.priceCurrency,
    netHourly,
    input.income.currency,
    input.rates,
  );
  return { hours, netHourly, priceInIncomeCurrency };
}

export interface MultiPriceResult extends BlendedIncome {
  /** Work time the purchase costs, in hours. */
  hours: number;
  /** The price expressed in the blended base currency. */
  priceInBaseCurrency: number;
}

/** Headline calculation across multiple blended income sources with one tax residency. */
export function priceToHoursMulti(input: {
  price: number;
  priceCurrency: string;
  sources: BlendSource[];
  residencyRegionId?: string;
  rates?: RateTable;
}): MultiPriceResult {
  const blend = blendIncome(input.sources, input.residencyRegionId, input.rates);
  const { hours, priceInIncomeCurrency } = hoursAtRate(
    input.price,
    input.priceCurrency,
    blend.netHourly,
    blend.baseCurrency,
    input.rates,
  );
  return { ...blend, hours, priceInBaseCurrency: priceInIncomeCurrency };
}
