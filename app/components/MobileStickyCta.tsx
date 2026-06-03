"use client";

import { useEffect, useState } from "react";
import { trackProductEvent } from "../lib/tracking";

type MobileStickyCtaProps = {
  href: string;
  label: string;
  eventName: string;
  hideWhenVisibleSelector?: string;
};

export function MobileStickyCta({
  href,
  label,
  eventName,
  hideWhenVisibleSelector,
}: MobileStickyCtaProps) {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    if (!hideWhenVisibleSelector) {
      return;
    }

    const target = document.querySelector(hideWhenVisibleSelector);
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHidden(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.25 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hideWhenVisibleSelector]);

  if (isHidden) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-emerald-300/50 bg-[#07090b]/98 p-4 shadow-[0_-18px_40px_rgba(0,0,0,0.55)] backdrop-blur md:hidden">
      <a
        className="block bg-emerald-300 px-5 py-4 text-center text-sm font-black text-[#04100b] shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-100/40 transition hover:bg-emerald-200"
        href={href}
        onClick={() =>
          trackProductEvent(eventName, {
            source: "mobile_sticky",
            target: href,
          })
        }
      >
        {label}
      </a>
    </div>
  );
}
