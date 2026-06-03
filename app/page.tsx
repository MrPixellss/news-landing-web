import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutButton } from "./components/CheckoutButton";
import { FreeReportForm } from "./components/FreeReportForm";
import { MobileStickyCta } from "./components/MobileStickyCta";
import { PricingSection } from "./components/PricingSection";
import {
  displayDate,
  getTodayTeaser,
  normalizeSwedishCopy,
  orderedTopics,
  shortPreview,
} from "./lib/report";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "AI-stödd daglig marknadsanalys",
  description:
    "Få dagens marknadsbild gratis: en svensk morgonbrief med 10 analysområden, primärkällor och tydlig riskbild direkt till din e-post.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
    title: "Finansanalytik - AI-stödd daglig marknadsanalys",
    description:
      "Få dagens marknadsbild gratis: en svensk morgonbrief med 10 analysområden och tydlig riskbild direkt till din e-post.",
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

const teaserFallbacks = [
  "Dagens signaler sammanställs från flera källor.",
  "Fokus ligger på vad som förändrats och varför det kan påverka riskbilden.",
  "Full analys finns i rapporten.",
];

function normalizeTeaserSentence(value: string) {
  return normalizeSwedishCopy(value)
    .replace(/\s*;\s*marknadseffekten är att\s*/gi, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

function looksBrokenTeaserSentence(value: string, headline: string) {
  const lower = value.toLowerCase();
  const headlineKey = headline.toLowerCase().replace(/[^a-zåäö0-9]+/gi, " ").trim();
  const valueKey = lower.replace(/[^a-zåäö0-9]+/gi, " ").trim();

  return (
    value.length > 170 ||
    valueKey === headlineKey ||
    lower.includes("kärnan är den kan") ||
    lower.includes("marknadseffekten är att") ||
    lower.includes("current rule-based") ||
    lower.includes("the first market impact") ||
    lower.includes("investors may") ||
    lower.includes("english") ||
    lower.split(",").length > 4
  );
}

function teaserBullets(headline: string, teaser: string) {
  const candidates = teaser.split(/(?<=[.!?])\s+/)
    .map(normalizeTeaserSentence)
    .filter((item) => item.length >= 28 && !looksBrokenTeaserSentence(item, headline));
  const normalizedFallbacks = teaserFallbacks.filter(
    (item) => !looksBrokenTeaserSentence(item, headline),
  );
  const source = candidates.length ? candidates : normalizedFallbacks;
  const seen = new Set<string>();

  return source
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 1);
}

export default async function HomePage() {
  const data = await getTodayTeaser();
  const hasBlocks = data.blocks.length > 0;
  const hasFreshReport = data.is_fresh !== false && hasBlocks;
  const blocksBySlug = new Map(
    hasBlocks ? data.blocks.map((block) => [block.slug, block]) : [],
  );
  const reportDate = displayDate(
    hasBlocks ? data.date : data.expected_date || data.date,
  );
  const reportLabel = hasFreshReport ? "Dagens rapport" : "Senaste briefing";
  const primaryTopic = orderedTopics[0];

  return (
    <main className="min-h-screen bg-[#07090b] pb-24 text-zinc-50 md:pb-0">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 border-b border-[#1a222c] pb-5">
          <Link
            href="/"
            className="flex items-center gap-3 transition hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/70"
            aria-label="Till startsidan"
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
            href="#pricing"
            className="hidden border border-[#26313d] px-4 py-3 text-sm font-bold text-[#d7e1eb] transition hover:border-emerald-300 hover:text-emerald-300 sm:inline-flex"
          >
            Priser
          </a>
        </header>

        <section className="grid gap-8 border-b border-[#1a222c] py-10 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:py-14">
          <div>
            <p className="font-mono text-sm font-bold tracking-[0.28em] text-emerald-300">
              {reportDate}
            </p>
            <h1 className="mt-5 max-w-5xl text-[44px] font-bold leading-[0.94] tracking-[-0.04em] sm:text-6xl lg:text-[82px]">
              Få dagens marknadsbild gratis
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#c7d1dd]">
              En komplett svensk marknadsbrief med 10 analysområden, byggd på
              primärkällor och daglig data. Skickas direkt till din e-post.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "10 områden i en samlad rapport",
                "Makro, ränta, börs, valutor, råvaror och riskbild",
                "Byggd på nyheter, offentliga källor och primärdata",
                "Inte investeringsrådgivning",
                "1 gratisrapport per e-postadress",
              ].map((item) => (
                <div key={item} className="border border-[#26313d] bg-[#0d1117] p-4">
                  <p className="text-sm font-black text-emerald-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="gratis-rapport" className="border border-[#26313d] bg-[#0d1117] p-5 md:p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
              Gratisrapport
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em]">
              Få dagens marknadsbild gratis
            </h2>
            <p className="mt-3 text-base leading-7 text-[#c7d1dd]">
              Ange e-post och godkänn utskick. Rapporten skickas direkt och
              innehåller dagens samlade marknadsbild med 10 analysområden.
            </p>
            <div className="mt-5">
              <FreeReportForm sourcePath="/" topicSlug={primaryTopic.slug} />
            </div>
          </div>
        </section>

        <section className="border-b border-[#1a222c] py-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
                {reportLabel}
              </p>
              <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-[-0.03em] md:text-4xl">
                10 ämnen, varje ämne med teaser, teser och låst fullanalys
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#a8b5c4]">
              Full rapport kan fås gratis en gång via e-post eller köpas som
              dagspass för 49 kr.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {orderedTopics.map((topic, index) => {
              const block = blocksBySlug.get(topic.slug);
              const headline =
                normalizeSwedishCopy(block?.headline) ||
                "Dagens signaler sammanställs";
              const preview =
                shortPreview(normalizeSwedishCopy(block?.teaser), 2) ||
                "När dagens källor har passerat kvalitetssil visas ett kort utdrag ur analysen här.";
              const bullets = teaserBullets(headline, preview);

              return (
                <article
                  key={topic.slug}
                  className="flex min-h-[420px] flex-col border border-[#26313d] bg-[#0d1117] p-5"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
                    Område {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-5 text-xl font-bold leading-tight tracking-[-0.02em]">
                    {topic.name}
                  </h3>
                  <p className="mt-5 text-base font-black leading-6">
                    {headline}
                  </p>
                  <ul className="mt-4 space-y-3">
                    {bullets.map((item) => (
                      <li
                        key={item}
                        className="border-l-2 border-emerald-300/70 pl-3 text-sm leading-6 text-[#c7d1dd]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 line-clamp-4 text-sm leading-6 text-[#a8b5c4]">
                    {preview}
                  </p>
                  <div className="relative mt-5 h-20 overflow-hidden border border-[#1f2934] bg-[#0b0f14]">
                    <div className="space-y-2 p-4 blur-[4px]">
                      <p className="h-3 w-11/12 bg-[#314052]" />
                      <p className="h-3 w-10/12 bg-[#314052]" />
                      <p className="h-3 w-8/12 bg-[#314052]" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0b0f14]" />
                  </div>
                  <div className="mt-auto grid gap-2 pt-5">
                    <a
                      href="#gratis-rapport"
                      className="border border-emerald-300/70 px-4 py-3 text-center text-sm font-black text-emerald-300 transition hover:bg-emerald-300 hover:text-[#06100c]"
                    >
                      Få hela gratis
                    </a>
                    <CheckoutButton
                      buttonClassName="w-full border border-[#26313d] bg-[#111820] px-4 py-3 text-sm font-black text-white transition hover:border-emerald-300 hover:text-emerald-300 disabled:cursor-wait disabled:opacity-70"
                      buttonLabel="Köp dagspass - 49 kr"
                      priceLabel="49 kr"
                      topicSlug={topic.slug}
                    />
                    <Link
                      href={`/topics/${topic.slug}`}
                      className="text-center text-sm font-bold text-[#a8b5c4] transition hover:text-emerald-300"
                    >
                      Läs förhandsvisning →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 border-b border-[#1a222c] py-10 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
              För vem
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em]">
              Byggt för marknadsöverblick, inte köp- eller säljsignaler
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:col-span-2">
            {[
              "Privata investerare som följer räntor, börs och risk.",
              "Aktiva marknadsföljare som vill spara tid varje morgon.",
              "Företagare och CFO:er som påverkas av makro, valuta och kredit.",
              "Rådgivare och analytiker som behöver snabb marknadsöverblick.",
            ].map((item) => (
              <div key={item} className="border border-[#26313d] bg-[#0d1117] p-5">
                <p className="text-base font-bold leading-7 text-[#d7e1eb]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 border-b border-[#1a222c] py-10 lg:grid-cols-3">
          <div className="border border-[#26313d] bg-[#0d1117] p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
              Källor
            </p>
            <h3 className="mt-3 text-2xl font-bold">Primärkällor först</h3>
            <p className="mt-4 text-base leading-7 text-[#c7d1dd]">
              Centralbanker, myndigheter, regulatorer, bolagsinformation och
              sparade originalkällor prioriteras i analysflödet.
            </p>
          </div>
          <div className="border border-[#26313d] bg-[#0d1117] p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
              Metodik
            </p>
            <h3 className="mt-3 text-2xl font-bold">Regelstyrd pipeline</h3>
            <p className="mt-4 text-base leading-7 text-[#c7d1dd]">
              Dokument passerar kvalitetssil, ämnesstyrning och analytikerregler
              innan rapporten sammanställs.
            </p>
          </div>
          <div className="border border-[#26313d] bg-[#0d1117] p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
              Viktigt
            </p>
            <h3 className="mt-3 text-2xl font-bold">Inte rådgivning</h3>
            <p className="mt-4 text-base leading-7 text-[#c7d1dd]">
              Finansanalytik är informations- och utbildningsmaterial. Det är
              inte investeringsrådgivning eller en rekommendation att köpa eller
              sälja tillgångar.
            </p>
          </div>
        </section>

        <PricingSection primaryTopicSlug={primaryTopic.slug} />
      </div>
      <MobileStickyCta
        eventName="mobile_free_report_sticky_click"
        hideWhenVisibleSelector="#gratis-rapport"
        href="#gratis-rapport"
        label="Få gratisrapport"
      />
    </main>
  );
}
