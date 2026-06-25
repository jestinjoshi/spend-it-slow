"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getRegion,
  type IncomeSetup,
  isRateTableStale,
  type MultiPriceResult,
  priceInputSchema,
  priceToHoursMulti,
} from "@spenditslow/core";
import { CURRENCIES } from "@/lib/currencies";
import { getRates, type RatesResult } from "@/lib/rates";
import { loadSetup } from "@/lib/settings";
import { BUYMEACOFFEE_URL, disableNudge, recordCalculation } from "@/lib/support-nudge";
import { Result } from "./result";
import { SupportNudge } from "./support-nudge";
import { TaxInfo } from "./tax-info";
import { Card, Field, Select, TextInput } from "./ui";

export function Calculator() {
  const [hydrated, setHydrated] = useState(false);
  const [setup, setSetup] = useState<IncomeSetup | null>(null);
  const [price, setPrice] = useState("");
  const [priceCurrency, setPriceCurrency] = useState("CAD");
  const [ratesResult, setRatesResult] = useState<RatesResult | null>(null);
  const rates = ratesResult?.table ?? null;
  // The most recent non-null result, kept mounted while the wrapper collapses
  // so it shrinks away smoothly instead of vanishing.
  const [lastResult, setLastResult] = useState<MultiPriceResult | null>(null);
  const [showNudge, setShowNudge] = useState(false);
  const lastCountedRef = useRef("");

  // The currency results are expressed in: residency currency, else first source's.
  const baseCurrency = useMemo(() => {
    if (!setup) return undefined;
    const region = setup.residencyRegionId ? getRegion(setup.residencyRegionId) : undefined;
    return region?.currency ?? setup.sources[0]?.currency;
  }, [setup]);

  useEffect(() => {
    const saved = loadSetup();
    setSetup(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (baseCurrency) setPriceCurrency(baseCurrency);
  }, [baseCurrency]);

  // Fetch rates for the base currency (and cache for offline).
  useEffect(() => {
    if (!baseCurrency) return;
    getRates(baseCurrency).then(setRatesResult).catch(() => undefined);
  }, [baseCurrency]);

  const parsed = priceInputSchema.safeParse({ price, currency: priceCurrency });
  const priceValue = parsed.success ? parsed.data.price : null;

  const result = useMemo(() => {
    if (!setup || !parsed.success) return null;
    try {
      return priceToHoursMulti({
        price: parsed.data.price,
        priceCurrency: parsed.data.currency,
        sources: setup.sources,
        residencyRegionId: setup.residencyRegionId || undefined,
        rates: rates ?? undefined,
      });
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setup, priceValue, priceCurrency, rates]);

  // Rates are needed if any source isn't in the base currency, or the price isn't.
  const needsRates = useMemo(() => {
    if (!setup || !parsed.success) return false;
    const mixed = setup.sources.some((s) => s.currency !== baseCurrency);
    return mixed || parsed.data.currency !== baseCurrency;
  }, [setup, parsed.success, parsed.data?.currency, baseCurrency]);

  const hasForeignTaxedIncome = useMemo(
    () => Boolean(setup?.sources.some((s) => s.taxed && s.currency !== baseCurrency)),
    [setup, baseCurrency],
  );

  useEffect(() => {
    if (result) setLastResult(result);
  }, [result]);
  // Show the current result when present, otherwise the last one (during collapse).
  const displayed = result ?? lastResult;

  // Count each distinct, settled calculation; nudge for support every 15th one.
  useEffect(() => {
    if (!result || priceValue == null) return;
    const key = `${priceValue}-${priceCurrency}`;
    const id = setTimeout(() => {
      if (lastCountedRef.current === key) return;
      lastCountedRef.current = key;
      if (recordCalculation()) setShowNudge(true);
    }, 1000);
    return () => clearTimeout(id);
  }, [result, priceValue, priceCurrency]);

  if (!hydrated) {
    return <Card className="text-center text-muted">Loading…</Card>;
  }

  if (!setup) {
    return (
      <Card className="text-center">
        <h2 className="font-serif text-xl text-ink">First, set up your income</h2>
        <p className="mt-2 text-sm text-muted">
          Add what you earn, one source or many, and we&apos;ll show every price as hours of your
          life.
        </p>
        <Link
          href="/settings"
          className="mt-5 inline-block rounded-xl bg-accent px-5 py-2.5 font-medium text-paper transition hover:opacity-90"
        >
          Set up income
        </Link>
      </Card>
    );
  }

  // Conversion is needed but we have no usable rates, so surface a real error.
  const ratesError = needsRates && ratesResult?.status === "unavailable";

  const handleSure = () => {
    window.open(BUYMEACOFFEE_URL, "_blank", "noopener,noreferrer");
    disableNudge();
    setShowNudge(false);
  };
  const handleNever = () => {
    disableNudge();
    setShowNudge(false);
  };

  return (
    <Card>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <Field
          label="Price"
          htmlFor="price"
          error={price !== "" && !parsed.success ? parsed.error.issues[0]?.message : undefined}
        >
          <TextInput
            id="price"
            autoComplete="off"
            inputMode="decimal"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            autoFocus
          />
        </Field>
        <Field label="Currency" htmlFor="price-currency">
          <Select
            id="price-currency"
            value={priceCurrency}
            onChange={(e) => setPriceCurrency(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {ratesError && (
        <p className="mt-4 rounded-lg bg-warn-soft px-3 py-2 text-xs text-warn">
          {ratesResult?.reason === "service"
            ? "The exchange-rate service is currently unavailable, so we can’t convert between currencies right now."
            : "You appear to be offline and no exchange rates are saved yet."}{" "}
          Please try again later, or price the item in {baseCurrency}.
        </p>
      )}

      <div className={`reveal ${result ? "is-open" : ""}`}>
        <div>
          {displayed && (
            <>
              <Result result={displayed} />
              {setup.sources.length > 1 && (
                <p className="mt-3 text-center text-xs text-faint">
                  Blended across {setup.sources.length} income sources
                </p>
              )}
              {needsRates && rates && ratesResult?.status === "stale" && (
                <p className="mt-1 text-center text-xs text-warn">
                  {ratesResult.reason === "service"
                    ? "Exchange-rate service is down, "
                    : "Offline, "}
                  using saved rates from {rates.date}.
                </p>
              )}
              {needsRates && rates && ratesResult?.status === "fresh" && (
                <p className="mt-1 text-center text-xs text-faint">
                  Exchange rates as of {rates.date}
                  {isRateTableStale(rates, 7) ? " (may be outdated)" : ""}
                </p>
              )}
              <TaxInfo
                residencyRegionId={setup.residencyRegionId}
                hasForeignIncome={hasForeignTaxedIncome}
              />
            </>
          )}
        </div>
      </div>

      <SupportNudge
        open={showNudge}
        onSure={handleSure}
        onLater={() => setShowNudge(false)}
        onNever={handleNever}
      />
    </Card>
  );
}
