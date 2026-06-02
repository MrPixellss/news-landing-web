"use client";

import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      reset: () => void;
    };
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export function isTurnstileEnabled() {
  return Boolean(TURNSTILE_SITE_KEY);
}

export function readTurnstileToken(form: HTMLFormElement) {
  if (!TURNSTILE_SITE_KEY) {
    return "";
  }
  return String(new FormData(form).get("cf-turnstile-response") || "").trim();
}

export function resetTurnstile() {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.turnstile?.reset();
  } catch {
    // Turnstile reset is best-effort; do not block form UX.
  }
}

export function TurnstileField({ compact = false }: { compact?: boolean }) {
  if (!TURNSTILE_SITE_KEY) {
    return null;
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
      />
      <div
        className="mt-4"
        aria-label="Sakerhetskontroll"
      >
        <div
          className="cf-turnstile"
          data-sitekey={TURNSTILE_SITE_KEY}
          data-theme="dark"
          data-size={compact ? "compact" : "normal"}
        />
      </div>
    </>
  );
}
