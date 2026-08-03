import type { Metadata } from "next";
import Link from "next/link";

import { CheckoutButton } from "../components/CheckoutButton";
import { MobileStickyCta } from "../components/MobileStickyCta";
import { PaidIntentEvent } from "../components/PaidIntentEvent";
import { displayDate, getTodayTeaser, normalizeSwedishCopy, orderedTopics } from "../lib/report";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Prova Finansanalytik i 7 dagar för 9,99 kr",
  description:
    "Daglig svensk marknadsbrief med 10 analysområden. Prova 7 dagar för 9,99 kr, därefter 249 kr/mån. Avsluta när du vill.",
  alternates: {
    canonical: "/starta",
  },
  openGraph: {
    url: "/starta",
    title: "Prova Finansanalytik i 7 dagar för 9,99 kr",
    description:
      "Daglig svensk marknadsbrief med makro, räntor, börs, valutor, råvaror och riskbild samlat i en kort rapport.",
    images: [
      {
        url: "/og-finansanalytik.png",
        width: 1200,
        height: 630,
        alt: "Finansanalytik daglig marknadsanalys",
      },
    ],
  },
};

function cleanText(value: string | undefined, fallback: string) {
  return normalizeSwedishCopy(value || "").replace(/\s+/g, " ").trim() || fallback;
}

export default async function StartaPage() {
  const data = await getTodayTeaser();
  const hasBlocks = data.blocks.length > 0;
  const blocksBySlug = new Map(
    hasBlocks ? data.blocks.map((block) => [block.slug, block]) : [],
  );
  const reportDate = displayDate(
    hasBlocks ? data.date : data.expected_date || data.date,
  );
  const primaryTopic = orderedTopics[0];
  const primaryBlock = blocksBySlug.get(primaryTopic.slug);

  return (
    <main className="min-h-screen bg-[#07090b] pb-24 text-zinc-50 md:pb-0">
      <PaidIntentEvent
        eventName="paid_landing_loaded"
        properties={{
          product: "monthly_intro_week",
          topicSlug: primaryTopic.slug,
          sourcePath: "/starta",
          offer: "7_days_9_99_then_249_month",
        }}
      />
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 border-b border-[#1a222c] pb-5">
          <Link
            aria-label="Till startsidan"
            className="flex items-center gap-3 transition hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/70"
            href="/"
          >
            <span className="grid size-10 place-items-center bg-emerald-300 text-sm font-black text-[#06100c]">
              F
            </span>
            <span>
              <span className="block text-lg font-bold leading-tight">Finansanalytik</span>
              <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
                Daglig marknadsanalys
              </span>
            </span>
          </Link>
          <a
            className="hidden border border-[#26313d] px-4 py-3 text-sm font-bold text-[#d7e1eb] transition hover:border-emerald-300 hover:text-emerald-300 sm:inline-flex"
            href="#starta-checkout"
          >
            Prova 7 dagar
          </a>
        </header>

        <section className="grid gap-8 border-b border-[#1a222c] py-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center lg:py-14">
          <div>
            <p className="font-mono text-sm font-bold tracking-[0.28em] text-emerald-300">
              {reportDate}
            </p>
            <h1 className="mt-5 max-w-5xl text-[42px] font-bold leading-[0.96] tracking-[-0.04em] sm:text-6xl lg:text-[78px]">
              Prova hela marknadsbriefen i 7 dagar
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#c7d1dd]">
              Finansanalytik samlar makro, räntor, börs, valutor, råvaror och
              riskbild i en svensk morgonbrief. Börja med provvecka för 9,99 kr.
            </p>
            <div className="mt-7 max-w-md">
              <CheckoutButton
                buttonLabel="Starta provveckan - 9,99 kr"
                checkoutPath="/api/subscription-checkout"
                description="Du får dagliga fullständiga rapporter, veckosammanfattning och månadsutsikt via e-post. Första 7 dagarna kostar 9,99 kr, därefter 249 kr/mån tills prenumerationen avslutas."
                priceLabel="9,99 kr"
                product="monthly_intro_week"
                productName="Månadsaccess provvecka"
                topicSlug={primaryTopic.slug}
              />
              <p className="mt-3 text-sm font-bold leading-6 text-[#9facbb]">
                Öppnar säker Stripe-betalning. Du kan avsluta när du vill.
              </p>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "9,99 kr första 7 dagarna",
                "Därefter 249 kr/mån",
                "Avsluta när du vill",
                "Inte investeringsrådgivning",
              ].map((item) => (
                <div key={item} className="border border-[#26313d] bg-[#0d1117] p-4">
                  <p className="text-sm font-black text-emerald-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <aside id="starta-checkout" className="border border-emerald-300 bg-[#101821] p-5 shadow-[0_0_0_1px_rgba(52,211,153,0.25)] md:p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-emerald-300">
              Starta här
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em]">
              7 dagar för 9,99 kr
            </h2>
            <p className="mt-3 text-base leading-7 text-[#d7e1eb]">
              Du får full daglig rapport under provveckan. Efter 7 dagar fortsätter
              månadsaccess för 249 kr/mån tills du avslutar.
            </p>
            <div className="mt-5 grid gap-3">
              {[
                "Dagliga fullständiga rapporter via e-post",
                "10 analysområden i samma briefing",
                "Veckosammanfattning och månadsutsikt ingår",
              ].map((item) => (
                <p key={item} className="border-l-2 border-emerald-300/80 pl-3 text-sm font-bold leading-6 text-[#e5edf6]">
                  {item}
                </p>
              ))}
            </div>
            <CheckoutButton
              buttonLabel="Prova 7 dagar - 9,99 kr"
              checkoutPath="/api/subscription-checkout"
              description="Du får dagliga fullständiga rapporter, veckosammanfattning och månadsutsikt via e-post. Första 7 dagarna kostar 9,99 kr, därefter 249 kr/mån tills prenumerationen avslutas."
              priceLabel="9,99 kr"
              product="monthly_intro_week"
              productName="Månadsaccess provvecka"
              topicSlug={primaryTopic.slug}
            />
            <p className="mt-4 text-xs leading-5 text-[#9facbb]">
              Betalning sker säkert via Stripe. Moms ingår där det är tillämpligt.
            </p>
          </aside>
        </section>

        <section className="grid gap-5 border-b border-[#1a222c] py-10 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
              Dagens ton
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em]">
              Se formatet innan du betalar
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#a8b5c4]">
              Rapporten är byggd för överblick och beslutskontext, inte för
              snabba köp- eller säljsignaler.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="border border-[#26313d] bg-[#0d1117] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
                {primaryTopic.name}
              </p>
              <h3 className="mt-4 text-xl font-black leading-tight">
                {cleanText(primaryBlock?.headline, "Dagens makrobild sammanställs i rapporten.")}
              </h3>
              <p className="mt-4 text-sm leading-6 text-[#c7d1dd]">
                {cleanText(
                  primaryBlock?.teaser,
                  "Full analys, slutsatser och källor öppnas i den betalda rapporten.",
                ).slice(0, 260)}
              </p>
            </article>
            <article className="border border-[#26313d] bg-[#0d1117] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
                Vad ingår
              </p>
              <div className="mt-4 grid gap-2 text-sm font-bold text-[#d7e1eb] sm:grid-cols-2">
                {orderedTopics.slice(0, 10).map((topic) => (
                  <span key={topic.slug} className="border border-[#26313d] px-3 py-2">
                    {topic.name}
                  </span>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="grid gap-5 border-b border-[#1a222c] py-10 lg:grid-cols-3">
          <div className="border border-[#26313d] bg-[#0d1117] p-5">
            <h2 className="text-2xl font-bold tracking-[-0.03em]">Rätt för dig om</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-[#c7d1dd]">
              <li>Du vill följa marknaden löpande, inte bara samla nyhetslänkar.</li>
              <li>Du accepterar svensk text, tydliga källor och kompakt format.</li>
              <li>Du vill betala först när värdet är konkret.</li>
            </ul>
          </div>
          <div className="border border-[#26313d] bg-[#0d1117] p-5">
            <h2 className="text-2xl font-bold tracking-[-0.03em]">Inte rätt om</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-[#c7d1dd]">
              <li>Du söker trading-signaler eller individuella investeringsråd.</li>
              <li>Du vill ha gratis lead magnet utan avsikt att testa produkten.</li>
              <li>Du inte vill få rapporten via e-post.</li>
            </ul>
          </div>
          <div id="provrapport" className="border border-[#26313d] bg-[#0d1117] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
              Behöver du se formatet?
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em]">
              Provtexten finns på sidan
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#a8b5c4]">
              Reklamtrafiken går inte längre in i en gratis leadgen-form. I stället
              visar vi dagens ton, ämnena som ingår och en tydlig väg till provveckan.
            </p>
            <a
              className="mt-5 inline-flex border border-emerald-300 px-4 py-3 text-sm font-black text-emerald-300 transition hover:bg-emerald-300 hover:text-[#04100b]"
              href="#starta-checkout"
            >
              Gå till provveckan
            </a>
          </div>
        </section>
      </div>

      <MobileStickyCta
        eventName="paid_mobile_sticky_click"
        hideWhenVisibleSelector="#starta-checkout"
        href="#starta-checkout"
        label="Prova 7 dagar - 9,99 kr"
        paidIntentEventName="paid_cta_click"
        paidIntentProperties={{
          offer: "7_days_9_99_then_249_month",
          product: "monthly_intro_week",
          topicSlug: primaryTopic.slug,
        }}
      />
    </main>
  );
}
