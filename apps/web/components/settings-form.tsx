"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { type IncomeSetup, incomeSetupSchema, listRegions, PAY_PERIODS } from "@spenditslow/core";
import { CURRENCIES } from "@/lib/currencies";
import { DEFAULT_SETUP, loadSetup, newIncomeSource, saveSetup } from "@/lib/settings";
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
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<IncomeSetup>({
    resolver: zodResolver(incomeSetupSchema),
    defaultValues: DEFAULT_SETUP,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "sources" });
  const residency = watch("residencyRegionId");

  useEffect(() => {
    const saved = loadSetup();
    if (saved) reset(saved);
  }, [reset]);

  function onSubmit(values: IncomeSetup) {
    saveSetup(values);
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Card className="flex flex-col gap-3">
        <div>
          <h2 className="font-serif text-lg text-ink">Tax residency</h2>
          <p className="mt-1 text-xs text-faint">
            Where you&apos;re a tax resident. All your gross income, wherever it&apos;s earned, is
            combined and taxed here, the way worldwide income actually works.
          </p>
        </div>
        <Field label="I'm a tax resident of" htmlFor="residency">
          <Select id="residency" {...register("residencyRegionId")}>
            <option value="">No tax (I&apos;ll enter take-home amounts)</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label} ({r.taxYear})
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      <p className="text-sm text-muted">
        Add every income you earn, each with its own currency and schedule. Results are shown in
        {residency ? " your residency's currency." : " the first income's currency."}
      </p>

      {fields.map((field, index) => {
        const sourceErrors = errors.sources?.[index];
        return (
          <Card key={field.id} className="flex flex-col gap-4 enter-soft">
            <div className="flex items-center justify-between gap-2">
              <input
                {...register(`sources.${index}.label`)}
                placeholder="Income name (e.g. Vancouver job)"
                className="w-full bg-transparent font-serif text-lg text-ink outline-none placeholder:text-faint"
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="shrink-0 rounded-lg px-2 py-1 text-xs text-muted transition hover:text-warn"
                  aria-label={`Remove income ${index + 1}`}
                >
                  Remove
                </button>
              )}
            </div>
            {sourceErrors?.label && (
              <p className="-mt-2 text-xs text-warn">{sourceErrors.label.message}</p>
            )}

            <div className="grid grid-cols-[1fr_auto_auto] gap-3">
              <Field label="I'm paid" htmlFor={`amount-${index}`} error={sourceErrors?.amount?.message}>
                <TextInput
                  id={`amount-${index}`}
                  inputMode="decimal"
                  step="any"
                  {...register(`sources.${index}.amount`)}
                />
              </Field>
              <Field label="Currency" htmlFor={`currency-${index}`}>
                <Select id={`currency-${index}`} {...register(`sources.${index}.currency`)}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="How often" htmlFor={`period-${index}`}>
                <Select id={`period-${index}`} {...register(`sources.${index}.period`)}>
                  {PAY_PERIODS.map((p) => (
                    <option key={p} value={p}>
                      {PERIOD_LABELS[p]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field
                label="Hours / week"
                htmlFor={`hpw-${index}`}
                error={sourceErrors?.schedule?.hoursPerWeek?.message}
              >
                <TextInput id={`hpw-${index}`} inputMode="decimal" {...register(`sources.${index}.schedule.hoursPerWeek`)} />
              </Field>
              <Field
                label="Days / week"
                htmlFor={`dpw-${index}`}
                error={sourceErrors?.schedule?.daysPerWeek?.message}
              >
                <TextInput id={`dpw-${index}`} inputMode="decimal" {...register(`sources.${index}.schedule.daysPerWeek`)} />
              </Field>
              <Field
                label="Weeks / year"
                htmlFor={`wpy-${index}`}
                error={sourceErrors?.schedule?.weeksPerYear?.message}
              >
                <TextInput id={`wpy-${index}`} inputMode="decimal" {...register(`sources.${index}.schedule.weeksPerYear`)} />
              </Field>
            </div>

            <Field
              label="This amount is"
              htmlFor={`taxed-${index}`}
              hint={
                residency
                  ? "Gross income is taxed at your residency. Choose take-home if it's already net."
                  : "With no residency set, everything is treated as take-home."
              }
            >
              <Controller
                control={control}
                name={`sources.${index}.taxed`}
                render={({ field }) => (
                  <Select
                    id={`taxed-${index}`}
                    value={field.value ? "true" : "false"}
                    onChange={(e) => field.onChange(e.target.value === "true")}
                    onBlur={field.onBlur}
                    disabled={!residency}
                  >
                    <option value="true">Gross (before tax)</option>
                    <option value="false">Already take-home</option>
                  </Select>
                )}
              />
            </Field>
          </Card>
        );
      })}

      <button
        type="button"
        onClick={() => append(newIncomeSource())}
        className="rounded-xl border border-dashed border-line py-3 text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
      >
        + Add another income
      </button>

      <button
        type="submit"
        className="rounded-xl bg-accent px-5 py-3 font-medium text-paper transition hover:opacity-90"
      >
        Save
      </button>
    </form>
  );
}
