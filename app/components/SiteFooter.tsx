"use client";

import Link from "next/link";

export function SiteFooter() {
  function openCookieSettings() {
    window.dispatchEvent(new Event("finansanalytik:open-cookie-settings"));
  }

  return (
    <footer className="border-t border-[#1a222c] bg-[#07090b] text-zinc-50">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div>
          <p className="text-base font-bold">Finansanalytik</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#8d9aaa]">
            Daglig svensk marknadsbrief som samlar makro, räntor, börs,
            valutor, råvaror och riskbild i en kort rapport baserad på
            primärkällor och data.
          </p>
        </div>

        <nav
          aria-label="Juridiska länkar"
          className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold text-[#c7d1dd]"
        >
          <Link className="hover:text-emerald-300" href="/kopvillkor">
            Köpvillkor
          </Link>
          <Link className="hover:text-emerald-300" href="/integritetspolicy">
            Integritetspolicy
          </Link>
          <Link className="hover:text-emerald-300" href="/cookiepolicy">
            Cookiepolicy
          </Link>
          <Link className="hover:text-emerald-300" href="/kontakt">
            Kontakt
          </Link>
          <button
            className="font-bold text-[#c7d1dd] hover:text-emerald-300"
            onClick={openCookieSettings}
            type="button"
          >
            Cookieinställningar
          </button>
        </nav>
      </div>
    </footer>
  );
}
