"use client";

import { useEffect } from "react";

/**
 * The "buy me a coffee" support nudge. Dumb/controlled: the parent decides when
 * it's open and what each choice does (persisting to localStorage).
 *  - Sure: open the support page, then stop asking
 *  - Maybe later: close; it'll ask again after more calculations
 *  - Don't ask me again: stop asking for good
 */
export function SupportNudge({
  open,
  onSure,
  onLater,
  onNever,
}: {
  open: boolean;
  onSure: () => void;
  onLater: () => void;
  onNever: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onLater();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onLater]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      {/* Backdrop; clicking it is a non-committal "maybe later". */}
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        className="absolute inset-0 bg-ink/40"
        onClick={onLater}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-nudge-title"
        className="enter-soft relative w-full max-w-sm rounded-[var(--radius-xl)] border border-line bg-card p-6 text-center shadow-[0_8px_32px_rgba(32,32,29,0.18)]"
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
          <CoffeeIcon />
        </div>

        <h2 id="support-nudge-title" className="font-serif text-xl text-ink">
          Enjoying Spend It Slow?
        </h2>
        <p className="mt-2 text-sm text-muted">
          It's free and open source, with no ads and no tracking. If it's helping you spend a little
          more slowly, you can support its development with a coffee.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          {/* biome-ignore lint/a11y/noAutofocus: focusing the primary action in a modal is expected */}
          <button
            type="button"
            autoFocus
            onClick={onSure}
            className="rounded-xl bg-accent px-5 py-2.5 font-medium text-paper transition hover:opacity-90"
          >
            Sure!
          </button>
          <button
            type="button"
            onClick={onLater}
            className="rounded-xl border border-line px-5 py-2.5 text-sm text-muted transition hover:text-accent"
          >
            Maybe later
          </button>
          <button
            type="button"
            onClick={onNever}
            className="mt-1 text-xs text-faint underline-offset-2 transition hover:text-muted hover:underline"
          >
            Don't ask me again
          </button>
        </div>
      </div>
    </div>
  );
}

function CoffeeIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" x2="6" y1="2" y2="4" />
      <line x1="10" x2="10" y1="2" y2="4" />
      <line x1="14" x2="14" y1="2" y2="4" />
    </svg>
  );
}
