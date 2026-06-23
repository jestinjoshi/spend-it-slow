import type { TaxRegion } from "./types";
import { caOn } from "./regions/ca-on";

/**
 * Every supported region. To add a new one: create a file in `regions/`,
 * import it here, and add it to this array. Nothing else needs to change,
 * the UI discovers regions through `listRegions()`.
 */
const REGIONS: TaxRegion[] = [
  caOn,
  // add new regions here
];

const byId = new Map<string, TaxRegion>(REGIONS.map((r) => [r.id, r]));

export function listRegions(): TaxRegion[] {
  return [...byId.values()];
}

export function getRegion(id: string): TaxRegion | undefined {
  return byId.get(id);
}

export const DEFAULT_REGION_ID = caOn.id;
