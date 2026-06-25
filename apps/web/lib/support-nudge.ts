const KEY = "spenditslow.support.v1";
const PROMPT_EVERY = 15;

export const BUYMEACOFFEE_URL = "https://buymeacoffee.com/jestinjoshi";

interface SupportState {
  /** Total distinct calculations the user has made. */
  count: number;
  /** Whether the user chose "don't ask me again" (or already said "Sure"). */
  disabled: boolean;
}

function read(): SupportState {
  if (typeof window === "undefined") return { count: 0, disabled: false };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SupportState>;
      return { count: Number(parsed.count) || 0, disabled: Boolean(parsed.disabled) };
    }
  } catch {
    // ignore malformed state
  }
  return { count: 0, disabled: false };
}

function write(state: SupportState): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage unavailable; nudge just won't persist
  }
}

/**
 * Record one calculation. Returns true if the support nudge should be shown now
 * (i.e. every PROMPT_EVERY calculations, unless the user disabled it).
 */
export function recordCalculation(): boolean {
  const state = read();
  if (state.disabled) return false;
  const count = state.count + 1;
  write({ count, disabled: false });
  return count % PROMPT_EVERY === 0;
}

/** Stop showing the nudge for good (used by "Sure" and "Don't ask me again"). */
export function disableNudge(): void {
  write({ ...read(), disabled: true });
}
