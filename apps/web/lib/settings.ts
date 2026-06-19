import {
  DEFAULT_REGION_ID,
  DEFAULT_SCHEDULE,
  type IncomeSettings,
  incomeSettingsSchema,
} from "@spenditslow/core";

const KEY = "spenditslow.settings.v1";

/** Sensible starting point for a first-time visitor (Ontario, hourly). */
export const DEFAULT_SETTINGS: IncomeSettings = {
  amount: 25,
  period: "hourly",
  currency: "CAD",
  schedule: DEFAULT_SCHEDULE,
  regionId: DEFAULT_REGION_ID,
};

/** Load and validate settings from localStorage, or null if none/invalid. */
export function loadSettings(): IncomeSettings | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const result = incomeSettingsSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function saveSettings(settings: IncomeSettings): void {
  window.localStorage.setItem(KEY, JSON.stringify(settings));
}

export function clearSettings(): void {
  window.localStorage.removeItem(KEY);
}
