import {
  formatMoney,
  hoursAsYearFraction,
  hoursToHuman,
  type PriceToHoursResult,
  type WorkSchedule,
} from "@spenditslow/core";

function formatHours(hours: number): string {
  if (hours < 0.1) return "a few minutes";
  return hours < 10 ? hours.toFixed(1) : Math.round(hours).toLocaleString();
}

function breakdownLabel(workDays: number, hours: number, minutes: number): string {
  const parts: string[] = [];
  if (workDays > 0) parts.push(`${workDays} work-day${workDays === 1 ? "" : "s"}`);
  if (hours > 0) parts.push(`${hours} hr${hours === 1 ? "" : "s"}`);
  if (minutes > 0) parts.push(`${minutes} min`);
  return parts.length ? parts.join(" · ") : "less than a minute";
}

export function Result({
  result,
  schedule,
  incomeCurrency,
}: {
  result: PriceToHoursResult;
  schedule: WorkSchedule;
  incomeCurrency: string;
}) {
  const human = hoursToHuman(result.hours, schedule);
  const yearPct = hoursAsYearFraction(result.hours, schedule) * 100;

  return (
    <div className="mt-6 text-center">
      <p className="text-sm text-muted">That costs you about</p>
      <p className="mt-1 font-serif text-6xl leading-none tracking-tight text-accent">
        {formatHours(result.hours)}
      </p>
      <p className="mt-1 text-lg text-ink">
        {result.hours === 1 ? "hour" : "hours"} of work
      </p>

      <p className="mt-4 text-sm text-muted">
        {breakdownLabel(human.workDays, human.hours, human.minutes)}
      </p>
      {yearPct >= 0.1 && (
        <p className="mt-1 text-xs text-faint">
          {yearPct < 100 ? `${yearPct.toFixed(1)}%` : `${(yearPct / 100).toFixed(1)}×`} of your
          working year
        </p>
      )}

      <p className="mt-4 text-xs text-faint">
        at {formatMoney(result.netHourly, incomeCurrency)}/hr take-home
      </p>
    </div>
  );
}
