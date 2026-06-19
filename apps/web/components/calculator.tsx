"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  type IncomeSettings,
  isRateTableStale,
  priceInputSchema,
  priceToHours,
  type RateTable,
} from "@spenditslow/core";
import { CURRENCIES } from "@/lib/currencies";
import { getRates } from "@/lib/rates";
import { loadSettings } from "@/lib/settings";
import { Result } from "./result";
import { TaxInfo } from "./tax-info";
import { Card, Field, Select, TextInput } from "./ui";

export function Calculator() {
  const [hydrated, setHydrated] = useState(false);
  const [settings, setSettings] = useState<IncomeSettings | null>(null);
  const [price, setPrice] = useState("");
  const [priceCurrency, setPriceCurrency] = useState("CAD");
  const [rates, setRates] = useState<RateTable | null>(null);

  // Load saved settings once on the client.
  useEffect(() => {
    const saved = loadSettings();
    setSettings(saved);
    if (saved) setPriceCurrency(saved.currency);
    setHydrated(true);
  }, []);

  // Fetch exchange rates for the income currency (and cache them for offline).
  useEffect(() => {
    if (!settings) return;
    getRates(settings.currency).then(setRates).catch(() => undefined);
  }, [settings]);

  const parsed = priceInputSchema.safeParse({ price, currency: priceCurrency });
  const priceValue = parsed.success ? parsed.data.price : null;

  const needsRates = Boolean(settings && parsed.success && parsed.data.currency !== settings.currency);
  const ratesMissing = needsRates && !rates;

  const result = useMemo(() => {
    if (!settings || !parsed.success) return null;
    try {
      return priceToHours({
        price: parsed.data.price,
        priceCurrency: parsed.data.currency,
        income: settings,
        rates: rates ?? undefined,
      });
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, priceValue, priceCurrency, rates]);

  if (!hydrated) {
    return <Card className="text-center text-muted">Loading…</Card>;
  }

  if (!settings) {
    return (
      <Card className="text-center">
        <h2 className="font-serif text-xl text-ink">First, set up your income</h2>
        <p className="mt-2 text-sm text-muted">
          Tell us what you earn and we&apos;ll show every price as hours of your life.
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

  return (
    <Card>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <Field label="Price" htmlFor="price" error={price !== "" && !parsed.success ? parsed.error.issues[0]?.message : undefined}>
          <TextInput
            id="price"
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

      {ratesMissing && (
        <p className="mt-4 rounded-lg bg-warn-soft px-3 py-2 text-xs text-warn">
          Connect to the internet once to fetch exchange rates, or enter the price in{" "}
          {settings.currency}.
        </p>
      )}

      {result && (
        <>
          <Result result={result} schedule={settings.schedule} incomeCurrency={settings.currency} />
          {needsRates && rates && (
            <p className="mt-3 text-center text-xs text-faint">
              Exchange rates as of {rates.date}
              {isRateTableStale(rates, 7) ? " (may be outdated)" : ""}
            </p>
          )}
          <TaxInfo regionId={settings.regionId} />
        </>
      )}
    </Card>
  );
}
