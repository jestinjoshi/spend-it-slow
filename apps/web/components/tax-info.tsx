import { getRegion } from "@spenditslow/core";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * For the tax residency: a "valid through" badge, an automatic out-of-date
 * warning once the rules expire, a note when foreign income is involved, and
 * the always-on estimate disclaimer. All driven by the region's own metadata.
 */
export function TaxInfo({
  residencyRegionId,
  hasForeignIncome = false,
}: {
  residencyRegionId?: string;
  hasForeignIncome?: boolean;
}) {
  if (!residencyRegionId) return null;
  const region = getRegion(residencyRegionId);
  if (!region) return null;

  const stale = new Date() > new Date(region.validUntil);

  return (
    <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 text-xs text-muted">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 font-medium ${
            stale ? "bg-warn-soft text-warn" : "bg-accent-soft text-accent"
          }`}
        >
          Tax residency: {region.label} · {region.taxYear} rules
        </span>
        <span className="text-faint">valid through {formatDate(region.validUntil)}</span>
      </div>

      {stale && (
        <p className="rounded-lg bg-warn-soft px-3 py-2 text-warn">
          ⚠ These {region.label} tax rules may be out of date (last valid {region.taxYear}).
        </p>
      )}

      {hasForeignIncome && (
        <p className="text-faint">
          Foreign income is estimated at your residency&apos;s rates. Real tax may be higher once
          source-country taxes and foreign tax credits are accounted for.
        </p>
      )}

      <p className="leading-relaxed text-faint">
        After-tax figures are estimates and may be wrong. Not financial or tax advice. Based on{" "}
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
