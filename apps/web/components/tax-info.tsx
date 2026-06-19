import { getRegion } from "@spenditslow/core";

/**
 * Shows, for the active tax region: a "valid through" badge, an automatic
 * out-of-date warning once the rules expire, and the always-on estimate
 * disclaimer. All driven by the region's own metadata — never hardcoded.
 */
export function TaxInfo({ regionId }: { regionId?: string }) {
  if (!regionId) return null;
  const region = getRegion(regionId);
  if (!region) return null;

  const validUntil = new Date(region.validUntil);
  const stale = new Date() > validUntil;
  const validLabel = validUntil.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 text-xs text-muted">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-accent-soft px-2.5 py-1 font-medium text-accent">
          {region.label} · {region.taxYear} tax rules
        </span>
        <span className="text-faint">valid through {validLabel}</span>
      </div>

      {stale && (
        <p className="rounded-lg bg-warn-soft px-3 py-2 text-warn">
          ⚠ These {region.label} tax rules may be out of date (last valid {region.taxYear}). The
          numbers below could be inaccurate.
        </p>
      )}

      <p className="leading-relaxed text-faint">
        After-tax figures are estimates and may be wrong — not financial or tax advice. Based on{" "}
        {region.label}, {region.taxYear} rules.{" "}
        <a
          href={region.source}
          target="_blank"
          rel="noreferrer"
          className="text-accent underline underline-offset-2"
        >
          Source ↗
        </a>
      </p>
    </div>
  );
}
