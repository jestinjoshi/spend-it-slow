"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  type IncomeSettings,
  incomeSettingsSchema,
  listRegions,
  PAY_PERIODS,
} from "@spenditslow/core";
import { CURRENCIES } from "@/lib/currencies";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "@/lib/settings";
import { Card, Field, Select, TextInput } from "./ui";

const PERIOD_LABELS: Record<(typeof PAY_PERIODS)[number], string> = {
  hourly: "Per hour",
  daily: "Per day",
  weekly: "Per week",
  monthly: "Per month",
  yearly: "Per year",
};

export function SettingsForm() {
  const router = useRouter();
  const regions = listRegions();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<IncomeSettings>({
    resolver: zodResolver(incomeSettingsSchema),
    defaultValues: DEFAULT_SETTINGS,
  });

  // Hydrate from saved settings on mount.
  useEffect(() => {
    const saved = loadSettings();
    if (saved) reset(saved);
  }, [reset]);

  const period = watch("period");

  function onSubmit(values: IncomeSettings) {
    saveSettings(values);
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Card className="flex flex-col gap-4">
        <h2 className="font-serif text-lg text-ink">Your income</h2>

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <Field label="I'm paid" htmlFor="amount" error={errors.amount?.message}>
            <TextInput
              id="amount"
              inputMode="decimal"
              step="any"
              {...register("amount")}
            />
          </Field>
          <Field label="Currency" htmlFor="currency" error={errors.currency?.message}>
            <Select id="currency" {...register("currency")}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="How often" htmlFor="period" error={errors.period?.message}>
          <Select id="period" {...register("period")}>
            {PAY_PERIODS.map((p) => (
              <option key={p} value={p}>
                {PERIOD_LABELS[p]}
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      <Card className="flex flex-col gap-4">
        <div>
          <h2 className="font-serif text-lg text-ink">Your work schedule</h2>
          <p className="mt-1 text-xs text-faint">
            These turn your pay into an hourly figure — the result is only as honest as these.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Hours / week" htmlFor="hpw" error={errors.schedule?.hoursPerWeek?.message}>
            <TextInput id="hpw" inputMode="decimal" {...register("schedule.hoursPerWeek")} />
          </Field>
          <Field label="Days / week" htmlFor="dpw" error={errors.schedule?.daysPerWeek?.message}>
            <TextInput id="dpw" inputMode="decimal" {...register("schedule.daysPerWeek")} />
          </Field>
          <Field label="Weeks / year" htmlFor="wpy" error={errors.schedule?.weeksPerYear?.message}>
            <TextInput id="wpy" inputMode="decimal" {...register("schedule.weeksPerYear")} />
          </Field>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <div>
          <h2 className="font-serif text-lg text-ink">Tax</h2>
          <p className="mt-1 text-xs text-faint">
            We&apos;ll estimate your after-tax take-home. Pick &ldquo;Already after-tax&rdquo; if the
            amount above is your take-home pay.
          </p>
        </div>

        <Field label="Tax region" htmlFor="region">
          <Select id="region" {...register("regionId")}>
            <option value="">Already after-tax (no tax applied)</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label} ({r.taxYear})
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      <button
        type="submit"
        className="rounded-xl bg-accent px-5 py-3 font-medium text-paper transition hover:opacity-90"
      >
        Save
      </button>
    </form>
  );
}
