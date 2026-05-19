"use client";

import { useEffect, useMemo, useState } from "react";

const CONSENT_VERSION = "2026-05-19";
const STORAGE_KEY = "finansanalytik_cookie_consent";

type ConsentState = {
  version: string;
  timestamp: string;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

type MetaPixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

function readConsent(): ConsentState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed.version !== CONSENT_VERSION) {
      return null;
    }
    return {
      version: CONSENT_VERSION,
      timestamp: String(parsed.timestamp || ""),
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
    };
  } catch {
    return null;
  }
}

function saveConsent(next: Pick<ConsentState, "analytics" | "marketing">) {
  const consent: ConsentState = {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    necessary: true,
    analytics: next.analytics,
    marketing: next.marketing,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  return consent;
}

function ensureGoogleConsentMode() {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtagShim(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });
}

function updateGoogleConsent(consent: ConsentState | null) {
  ensureGoogleConsentMode();
  window.gtag?.("consent", "update", {
    analytics_storage: consent?.analytics ? "granted" : "denied",
    ad_storage: consent?.marketing ? "granted" : "denied",
    ad_user_data: consent?.marketing ? "granted" : "denied",
    ad_personalization: consent?.marketing ? "granted" : "denied",
  });

  const gaId =
    process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  for (const id of [gaId, googleAdsId].filter(Boolean)) {
    (window as unknown as Record<string, boolean>)[`ga-disable-${id}`] = !(
      consent?.analytics || consent?.marketing
    );
  }
}

function loadScript(id: string, src: string) {
  if (document.getElementById(id)) {
    return;
  }
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function loadGoogleTags(consent: ConsentState | null) {
  const gaId =
    process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const ids = [gaId, googleAdsId].filter(Boolean) as string[];
  if (!ids.length || (!consent?.analytics && !consent?.marketing)) {
    return;
  }

  loadScript(
    "finansanalytik-google-tag",
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ids[0])}`,
  );
  window.gtag?.("js", new Date());
  for (const id of ids) {
    window.gtag?.("config", id, { anonymize_ip: true });
  }
}

function loadMetaPixel(consent: ConsentState | null) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!pixelId) {
    return;
  }

  if (!consent?.marketing) {
    window.fbq?.("consent", "revoke");
    return;
  }

  if (!window.fbq) {
    const fbq = function fbqShim(...args: unknown[]) {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
        return;
      }
      fbq.queue.push(args);
    } as MetaPixelFunction;
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    window._fbq = fbq;
  }

  window.fbq("consent", "grant");
  loadScript("finansanalytik-meta-pixel", "https://connect.facebook.net/en_US/fbevents.js");
  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
}

function applyConsent(consent: ConsentState | null) {
  updateGoogleConsent(consent);
  loadGoogleTags(consent);
  loadMetaPixel(consent);
}

function Toggle({
  checked,
  disabled,
  label,
  description,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  description: string;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="flex gap-4 border border-[#26313d] bg-[#0b0f14] p-4">
      <input
        checked={checked}
        className="mt-1 size-5 accent-emerald-300"
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        type="checkbox"
      />
      <span>
        <span className="block text-base font-black text-white">{label}</span>
        <span className="mt-1 block text-sm leading-6 text-[#a8b5c4]">
          {description}
        </span>
      </span>
    </label>
  );
}

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const hasChoice = useMemo(() => Boolean(consent), [consent]);

  useEffect(() => {
    ensureGoogleConsentMode();
    const initTimer = window.setTimeout(() => {
      const stored = readConsent();
      setConsent(stored);
      setAnalytics(Boolean(stored?.analytics));
      setMarketing(Boolean(stored?.marketing));
      applyConsent(stored);
      setIsReady(true);
    }, 0);

    function openSettings() {
      const current = readConsent();
      setConsent(current);
      setAnalytics(Boolean(current?.analytics));
      setMarketing(Boolean(current?.marketing));
      setIsPreferencesOpen(true);
    }

    window.addEventListener("finansanalytik:open-cookie-settings", openSettings);
    return () =>
      {
        window.clearTimeout(initTimer);
        window.removeEventListener(
        "finansanalytik:open-cookie-settings",
        openSettings,
        );
      };
  }, []);

  function commit(next: Pick<ConsentState, "analytics" | "marketing">) {
    const stored = saveConsent(next);
    setConsent(stored);
    setAnalytics(stored.analytics);
    setMarketing(stored.marketing);
    setIsPreferencesOpen(false);
    applyConsent(stored);
    window.dispatchEvent(new CustomEvent("finansanalytik:cookie-consent", { detail: stored }));
  }

  if (!isReady) {
    return null;
  }

  return (
    <>
      {!hasChoice ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#26313d] bg-[#07090b] p-4 text-zinc-50 shadow-2xl">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-3xl text-sm leading-6 text-[#d4dce6]">
              Vi använder nödvändiga cookies för att webbplatsen ska fungera.
              Med ditt samtycke använder vi även analys- och
              marknadsföringscookies för att förbättra tjänsten och mäta
              annonser.
            </p>
            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[520px]">
              <button
                className="bg-emerald-300 px-4 py-3 text-sm font-black text-[#04100b] hover:bg-emerald-200"
                onClick={() => commit({ analytics: true, marketing: true })}
                type="button"
              >
                Acceptera alla
              </button>
              <button
                className="border border-[#26313d] px-4 py-3 text-sm font-black text-white hover:border-emerald-300"
                onClick={() => commit({ analytics: false, marketing: false })}
                type="button"
              >
                Avvisa icke-nödvändiga
              </button>
              <button
                className="border border-[#26313d] px-4 py-3 text-sm font-black text-white hover:border-emerald-300"
                onClick={() => setIsPreferencesOpen(true)}
                type="button"
              >
                Anpassa
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isPreferencesOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[60] grid place-items-end bg-black/70 p-3 sm:place-items-center"
          role="dialog"
        >
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-[#26313d] bg-[#07090b] p-5 text-zinc-50 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
                  Cookieinställningar
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em]">
                  Hantera samtycke
                </h2>
              </div>
              <button
                className="border border-[#26313d] px-3 py-2 text-sm font-bold hover:border-emerald-300"
                onClick={() => setIsPreferencesOpen(false)}
                type="button"
              >
                Stäng
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <Toggle
                checked
                description="Webbplatsdrift, säkerhet, Stripe-betalning och lagring av ditt cookieval."
                disabled
                label="Nödvändiga"
              />
              <Toggle
                checked={analytics}
                description="Mätning av webbplatsanvändning och förbättring av tjänsten. Laddas inte utan samtycke."
                label="Analys"
                onChange={setAnalytics}
              />
              <Toggle
                checked={marketing}
                description="Meta Pixel, Google Ads-konvertering, remarketing och målgrupper. Laddas inte utan samtycke."
                label="Marknadsföring"
                onChange={setMarketing}
              />
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <button
                className="bg-emerald-300 px-4 py-3 text-sm font-black text-[#04100b] hover:bg-emerald-200"
                onClick={() => commit({ analytics: true, marketing: true })}
                type="button"
              >
                Acceptera alla
              </button>
              <button
                className="border border-[#26313d] px-4 py-3 text-sm font-black hover:border-emerald-300"
                onClick={() => commit({ analytics: false, marketing: false })}
                type="button"
              >
                Avvisa icke-nödvändiga
              </button>
              <button
                className="border border-[#26313d] px-4 py-3 text-sm font-black hover:border-emerald-300"
                onClick={() => commit({ analytics, marketing })}
                type="button"
              >
                Spara inställningar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
