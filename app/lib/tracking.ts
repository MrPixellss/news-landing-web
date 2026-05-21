"use client";

const CONSENT_STORAGE_KEY = "finansanalytik_cookie_consent";
const META_EVENTS = new Set([
  "ViewContent",
  "Lead",
  "InitiateCheckout",
  "Purchase",
  "Subscribe",
]);

type TrackingOptions = {
  email?: string;
  value?: number;
  currency?: string;
  eventSourceUrl?: string;
  eventId?: string;
};

type MetaTrackingContext = {
  trackingMarketingConsent: boolean;
  trackingEventId?: string;
  trackingFbp?: string;
  trackingFbc?: string;
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function marketingConsentGranted() {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) {
      return false;
    }
    const parsed = JSON.parse(raw) as { marketing?: boolean };
    return Boolean(parsed.marketing);
  } catch {
    return false;
  }
}

function readCookie(name: string) {
  const prefix = `${name}=`;
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
}

function eventId(eventName: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${eventName}.${crypto.randomUUID()}`;
  }
  return `${eventName}.${Date.now()}.${Math.random().toString(16).slice(2)}`;
}

export function metaTrackingContext(eventName: string): MetaTrackingContext {
  if (typeof window === "undefined" || !marketingConsentGranted()) {
    return {
      trackingMarketingConsent: false,
    };
  }
  return {
    trackingMarketingConsent: true,
    trackingEventId: eventId(eventName),
    trackingFbp: readCookie("_fbp"),
    trackingFbc: readCookie("_fbc"),
  };
}

export function trackMetaEvent(eventName: string, options: TrackingOptions = {}) {
  if (typeof window === "undefined" || !META_EVENTS.has(eventName)) {
    return;
  }
  const hasMarketingConsent = marketingConsentGranted();
  if (!hasMarketingConsent) {
    return;
  }

  const id = options.eventId || eventId(eventName);
  const eventSourceUrl = options.eventSourceUrl || window.location.href;
  const payload = {
    event_name: eventName,
    event_source_url: eventSourceUrl,
    event_id: id,
    email: options.email,
    marketing_consent: true,
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc"),
    value: options.value,
    currency: options.currency,
  };

  window.fbq?.(
    "track",
    eventName,
    {
      value: options.value,
      currency: options.currency,
    },
    { eventID: id },
  );

  fetch("/api/meta-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Tracking must never block the product flow.
  });
}
