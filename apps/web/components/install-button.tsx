"use client";

import { useEffect, useRef, useState } from "react";

// `beforeinstallprompt` isn't in the standard DOM lib types.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const pillClass =
  "rounded-full border border-accent/40 bg-accent-soft px-3 py-1 text-xs font-medium " +
  "text-accent transition hover:bg-accent hover:text-paper";

/**
 * A header "Install" pill that only appears when the PWA is genuinely
 * installable. On Chromium it fires the real install prompt; on iOS Safari
 * (which has no install API) it shows Add-to-Home-Screen instructions instead.
 * Renders nothing on browsers that can't install, or once already installed.
 */
export function InstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIosSafari, setIsIosSafari] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Already running as an installed app?
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    if (standalone) {
      setInstalled(true);
      return;
    }

    // iOS Safari has no beforeinstallprompt; detect it for the manual hint.
    const ua = window.navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios|android/i.test(ua);
    setIsIosSafari(isIos && isSafari);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Close the iOS hint when clicking elsewhere.
  useEffect(() => {
    if (!showIosHint) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setShowIosHint(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [showIosHint]);

  if (installed) return null;

  // Chromium: the real install prompt.
  if (deferred) {
    return (
      <button
        type="button"
        className={pillClass}
        onClick={async () => {
          await deferred.prompt();
          const { outcome } = await deferred.userChoice;
          if (outcome === "accepted") setInstalled(true);
          setDeferred(null);
        }}
      >
        Install
      </button>
    );
  }

  // iOS Safari: a hint, since install can't be triggered programmatically.
  if (isIosSafari) {
    return (
      <div ref={wrapRef} className="relative">
        <button
          type="button"
          className={pillClass}
          aria-expanded={showIosHint}
          onClick={() => setShowIosHint((v) => !v)}
        >
          Install
        </button>
        {showIosHint && (
          <div className="absolute right-0 top-full z-10 mt-2 w-60 rounded-xl border border-line bg-card p-3 text-left text-xs leading-relaxed text-muted shadow-[0_4px_16px_rgba(32,32,29,0.1)]">
            To install, tap the <span className="font-medium text-ink">Share</span> button in
            Safari, then choose{" "}
            <span className="font-medium text-ink">Add to Home Screen</span>.
          </div>
        )}
      </div>
    );
  }

  // Not installable on this browser.
  return null;
}
