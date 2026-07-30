"use client";

import { useEffect } from "react";
import { trackPaidIntentEvent } from "../lib/tracking";

type PaidIntentEventProps = {
  eventName: string;
  properties?: Record<string, unknown>;
};

export function PaidIntentEvent({ eventName, properties = {} }: PaidIntentEventProps) {
  useEffect(() => {
    trackPaidIntentEvent(eventName, properties);
  }, [eventName, properties]);

  return null;
}
