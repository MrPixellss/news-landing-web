"use client";

import { useEffect } from "react";
import { trackProductEvent } from "../lib/tracking";

type ProductEventProps = {
  eventName: string;
  properties?: Record<string, unknown>;
};

export function ProductEvent({ eventName, properties = {} }: ProductEventProps) {
  useEffect(() => {
    trackProductEvent(eventName, properties);
  }, [eventName, properties]);

  return null;
}
