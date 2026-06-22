import {
  DEFAULT_REGION_ID,
  DEFAULT_SCHEDULE,
  type IncomeSetup,
  type IncomeSource,
  incomeSettingsSchema,
  incomeSetupSchema,
} from "@spenditslow/core";

const KEY = "spenditslow.setup.v1";
const LEGACY_SINGLE_KEY = "spenditslow.settings.v1";

/** Sensible starting point for a first-time visitor: Ontario residency, one job. */
export const DEFAULT_SETUP: IncomeSetup = {
  residencyRegionId: DEFAULT_REGION_ID,
  sources: [
    {
      id: "main",
      label: "Main job",
      amount: 25,
      period: "hourly",
      currency: "CAD",
      schedule: DEFAULT_SCHEDULE,
      taxed: true,
    },
  ],
};

/** Create a blank income source with a fresh id (for the "add income" button). */
export function newIncomeSource(): IncomeSource {
  return {
    id: typeof crypto !== "undefined" ? crypto.randomUUID() : `src-${Date.now()}`,
    label: "",
    amount: 0,
    period: "hourly",
    currency: "CAD",
    schedule: DEFAULT_SCHEDULE,
    taxed: true,
  };
}

/** Load the income setup, migrating a legacy single-income setup if present. */
export function loadSetup(): IncomeSetup | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(KEY);
  if (raw) {
    try {
      const result = incomeSetupSchema.safeParse(JSON.parse(raw));
      if (result.success) return result.data;
    } catch {
      // fall through to migration / null
    }
  }

  // Migrate a previously saved single income into a residency + one source.
  const legacy = window.localStorage.getItem(LEGACY_SINGLE_KEY);
  if (legacy) {
    try {
      const result = incomeSettingsSchema.safeParse(JSON.parse(legacy));
      if (result.success) {
        const { regionId, ...rest } = result.data;
        return {
          residencyRegionId: regionId ?? "",
          sources: [{ id: "main", label: "Main income", ...rest, taxed: Boolean(regionId) }],
        };
      }
    } catch {
      // ignore
    }
  }

  return null;
}

export function saveSetup(setup: IncomeSetup): void {
  window.localStorage.setItem(KEY, JSON.stringify(setup));
  window.localStorage.removeItem(LEGACY_SINGLE_KEY);
}
