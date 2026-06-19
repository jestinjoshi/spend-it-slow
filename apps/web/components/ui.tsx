import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes } from "react";

/** A labelled field with optional error + hint text. */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-faint">{hint}</p>}
      {error && <p className="text-xs text-warn">{error}</p>}
    </div>
  );
}

const controlClasses =
  "w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-ink outline-none " +
  "transition focus:border-accent focus:ring-2 focus:ring-accent/20 placeholder:text-faint";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${controlClasses} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${controlClasses} ${props.className ?? ""}`} />;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[var(--radius-xl)] border border-line bg-card p-6 shadow-[0_1px_2px_rgba(32,32,29,0.04)] ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
