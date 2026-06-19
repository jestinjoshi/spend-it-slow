/**
 * Currencies supported by the Frankfurter API (ECB reference set). Keep this in
 * sync with what the API returns; these are the ones a user can pick from.
 */
export const CURRENCIES = [
  "AUD",
  "BRL",
  "CAD",
  "CHF",
  "CNY",
  "EUR",
  "GBP",
  "INR",
  "JPY",
  "MXN",
  "NZD",
  "SGD",
  "USD",
  "ZAR",
] as const;

export type Currency = (typeof CURRENCIES)[number];
