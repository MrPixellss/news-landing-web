"use client";

import { useEffect } from "react";
import { marketingConsentGranted, trackMetaEvent } from "../lib/tracking";

export function TrackingEvent({
  eventName,
  eventSourceUrl,
}: {
  eventName: "ViewContent" | "Lead" | "InitiateCheckout" | "Purchase" | "Subscribe";
  eventSourceUrl?: string;
}) {
  useEffect(() => {
    let sent = false;
    function trackOnce() {
      if (sent) {
        return;
      }
      if (!marketingConsentGranted()) {
        return;
      }
      trackMetaEvent(eventName, { eventSourceUrl });
      sent = true;
    }

    trackOnce();
    function handleConsent(event: Event) {
      const detail = (event as CustomEvent<{ marketing?: boolean }>).detail;
      if (detail?.marketing) {
        trackOnce();
      }
    }

    window.addEventListener("finansanalytik:cookie-consent", handleConsent);
    return () => window.removeEventListener("finansanalytik:cookie-consent", handleConsent);
  }, [eventName, eventSourceUrl]);

  return null;
}
