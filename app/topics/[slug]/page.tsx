import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutButton } from "../../components/CheckoutButton";
import { FreeReportForm } from "../../components/FreeReportForm";
import { TrackingEvent } from "../../components/TrackingEvent";
import {
  displayDate,
  getTopicReport,
  getTodayTeaser,
  normalizeSwedishCopy,
  orderedTopics,
  shortPreview,
} from "../../lib/report";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type TopicPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const topicSeoDescriptions = new Map([
  [
    "macro",
    "Daglig svensk makroanalys om inflation, tillväxt, konjunktur, räntespann och marknadens riskaptit.",
  ],
  [
    "central-banks-rates",
    "Analys av centralbanker, styrräntor, inflationssignaler och hur räntebanan påverkar svenska investerare.",
  ],
  [
    "stocks",
    "Daglig börsanalys om aktier, sektorer, vinstförväntningar, multiplar och marknadens viktigaste risksignaler.",
  ],
  [
    "bonds",
    "Analys av obligationsmarknad, kreditspreadar, duration, finansieringsrisk och räntedrivna marknadssignaler.",
  ],
  [
    "fx",
    "Daglig analys av valutor, växelkurser, kronan, euro, dollar och kapitalflöden som påverkar marknaden.",
  ],
  [
    "commodities-energy",
    "Analys av råvaror och energi med fokus på olja, gas, el, lagerdata, geopolitik och inflationspåverkan.",
  ],
  [
    "crypto",
    "Daglig analys av krypto och digitala tillgångar med fokus på riskaptit, reglering, likviditet och marknadssignaler.",
  ],
  [
    "banking-credit",
    "Analys av banker, kredit, bolåneräntor, utlåning, kapitalrisk och finansiell stabilitet.",
  ],
  [
    "regulation-fincrime",
    "Analys av finansiell reglering, tillsyn, penningtvätt, sanktionsrisk och regulatoriska beslut.",
  ],
  [
    "geopolitics-risks",
    "Analys av geopolitik, konflikter, handelsrisk, försörjningskedjor och hur riskbilden påverkar marknader.",
  ],
]);

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = orderedTopics.find((item) => item.slug === slug);

  if (!topic) {
    return {
      title: "Marknadsområde saknas",
      description: "Det begärda marknadsområdet kunde inte hittas.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    topicSeoDescriptions.get(slug) ||
    `Daglig svensk marknadsanalys inom ${topic.name.toLowerCase()} baserad på primärkällor, nyheter och regelstyrd analys.`;

  return {
    title: `${topic.name} - daglig analys`,
    description,
    alternates: {
      canonical: `/topics/${slug}`,
    },
    openGraph: {
      type: "article",
      url: `/topics/${slug}`,
      title: `${topic.name} - daglig analys`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${topic.name} - daglig analys`,
      description,
    },
  };
}

const sectionLabels = new Map([
  ["executive_view", "Slutsats"],
  ["key_signals", "Viktigaste signaler"],
  ["market_read_through", "Marknadstolkning"],
  ["risk_view", "Riskbild"],
  ["scenario_map", "Scenarier"],
]);

const repeatedSectionLabels = new RegExp(
  `^(${Array.from(sectionLabels.values()).join("|")})\\s*[:.-]?\\s*`,
  "i",
);

function sentenceKey(value: string) {
  return value.toLowerCase().replace(/[^a-zåäö0-9]+/gi, " ").trim();
}

function looksBrokenPublicSentence(value: string, headline = "") {
  const lower = value.toLowerCase();
  const key = sentenceKey(value);
  const headlineKey = sentenceKey(headline);

  return (
    value.length > 260 ||
    key === headlineKey ||
    lower.includes("kärnan är den kan") ||
    lower.includes("marknadseffekten är att") ||
    lower.includes("; marknads") ||
    lower.includes(" current ") ||
    lower.includes(" investors ") ||
    lower.includes("the first market impact") ||
    lower.split(";").length > 1 ||
    lower.split(",").length > 5
  );
}

function cleanPublicSentence(value: string, headline = "") {
  const sentence = normalizeSwedishCopy(value)
    .replace(repeatedSectionLabels, "")
    .replace(/^[-•]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();

  if (sentence.length < 60 || looksBrokenPublicSentence(sentence, headline)) {
    return "";
  }

  return sentence.length > 240 ? `${sentence.slice(0, 237).trim()}...` : sentence;
}

function fallbackPreview(topicName: string) {
  return `Dagens analys sammanfattar de viktigaste signalerna inom ${topicName.toLowerCase()} och visar vad som kan påverka riskbilden under dagen.`;
}

function fallbackHighlights(topicName: string) {
  const normalizedTopic = topicName.toLowerCase();
  return [
    `Vilka signaler som driver dagens bild inom ${normalizedTopic}.`,
    "Hur rörelser i räntor, valuta, aktier och råvaror hänger ihop.",
    "Vilka datapunkter som kan bekräfta eller försvaga huvudscenariot.",
    "Vad som är värt att följa innan nästa marknadsöppning.",
  ];
}

function safePublicPreview(topicName: string, headline: string, source: string) {
  const candidate = source
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => cleanPublicSentence(sentence, headline))
    .find(Boolean);

  return candidate || fallbackPreview(topicName);
}

function uniqueAnalysisHighlights(
  fullReportBody: string,
  preview: string,
  sections: NonNullable<Awaited<ReturnType<typeof getTopicReport>>>["topic"]["sections"],
) {
  const sectionText = sections
    .flatMap((section) => [
      section.body || "",
      ...(Array.isArray(section.items) ? section.items : []),
    ])
    .join(" ");
  const source = [fullReportBody, sectionText, preview].filter(Boolean).join("\n");
  const candidates = source
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) =>
      normalizeSwedishCopy(sentence)
        .replace(repeatedSectionLabels, "")
        .replace(/^[-•]\s*/, "")
        .trim(),
    )
    .map((sentence) =>
      sentence.length > 260 ? `${sentence.slice(0, 257).trim()}...` : sentence,
    )
    .filter((sentence) => sentence.length >= 80);
  const seen = new Set<string>();

  return candidates
    .filter((sentence) => {
      const key = sentence.toLowerCase().replace(/[^a-zåäö0-9]+/gi, " ").trim();
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 4);
}

function searchParamValue(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value || "").toLowerCase().trim();
}

function isFreeReportEmailVisit(
  params: Record<string, string | string[] | undefined>,
) {
  const utmSource = searchParamValue(params, "utm_source");
  const utmMedium = searchParamValue(params, "utm_medium");
  const utmCampaign = searchParamValue(params, "utm_campaign");
  const utmContent = searchParamValue(params, "utm_content");

  return (
    utmSource === "email" ||
    utmMedium === "free_followup" ||
    utmMedium === "free_report" ||
    utmCampaign.includes("free_report") ||
    utmContent.startsWith("followup_")
  );
}

export default async function TopicPage({ params, searchParams }: TopicPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const hideFreeReportOffer = isFreeReportEmailVisit(resolvedSearchParams);
  const topic = orderedTopics.find((item) => item.slug === slug);

  if (!topic) {
    notFound();
  }

  const [data, topicReport] = await Promise.all([
    getTodayTeaser(),
    getTopicReport(slug),
  ]);
  const block = data.blocks.find((item) => item.slug === slug);
  const latestTopicReport = topicReport?.topic ? topicReport : null;
  const reportTopic = latestTopicReport?.topic;
  const hasContent = Boolean(reportTopic || block);
  const reportDate = displayDate(
    latestTopicReport?.date || data.date || data.expected_date,
  );
  const headline =
    normalizeSwedishCopy(reportTopic?.headline || block?.headline) ||
    "Analytiken för området bearbetas";
  const fullReportBody =
    normalizeSwedishCopy(reportTopic?.full_report_body || block?.teaser) ||
    "";
  const sections = reportTopic?.sections || [];
  const previewSource = normalizeSwedishCopy(
    reportTopic?.teaser || block?.teaser || fullReportBody,
  );
  const preview =
    shortPreview(previewSource, 3) ||
    "Områdets analys visas här när tillräckligt många signaler har passerat reglerna.";
  const lockedHighlights = uniqueAnalysisHighlights(
    fullReportBody,
    preview,
    sections,
  );
  const publicPreview = safePublicPreview(topic.name, headline, preview || previewSource);
  const publicHighlightsRaw = lockedHighlights.filter(
    (highlight) => !looksBrokenPublicSentence(highlight, headline),
  );
  const publicHighlights =
    publicHighlightsRaw.length >= 3 ? publicHighlightsRaw : fallbackHighlights(topic.name);
  const publicLockedParagraphs = publicHighlights.slice(0, 4);
  const lockedCtaTitle = hideFreeReportOffer
    ? "Fortsätt med löpande marknadsaccess"
    : "Lås upp dagens fullständiga briefing";
  const lockedCtaDescription = hideFreeReportOffer
    ? "Du har redan fått gratisrapporten. Månadsaccess ger hela marknadsbilden varje morgon och inkluderar dagens övriga 9 marknadsrapporter."
    : "Få hela denna analys och dagens övriga 9 marknadsrapporter. Ingen prenumeration krävs.";

  return (
    <main className={`min-h-screen bg-[#07090b] text-zinc-50 ${hasContent ? "pb-28 md:pb-0" : ""}`}>
      <TrackingEvent eventName="ViewContent" />
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center gap-3 border-b border-[#1a222c] pb-5">
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
        </header>

        <section className="pt-9">
          <Link
            href="/"
            className="inline-flex text-base font-bold text-emerald-300 transition hover:text-emerald-200"
          >
            ← Alla områden
          </Link>

          <div className="mt-9 border-b border-[#1a222c] pb-9">
            <p className="font-mono text-sm font-bold tracking-[0.28em] text-emerald-300">
              {reportDate}
            </p>
            <h1 className="mt-5 max-w-5xl text-[44px] font-bold leading-[0.94] tracking-[-0.04em] sm:text-6xl lg:text-[72px]">
              {topic.name}
            </h1>
            <p className="mt-7 max-w-4xl text-xl leading-9 text-[#d3dbe5]">
              {headline}
            </p>
          </div>
        </section>

        <section className="py-8">
          <article className="border border-[#26313d] bg-[#0d1117] p-6 text-center md:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
              Snabb slutsats
            </p>
            <h2 className="mx-auto mt-4 max-w-5xl text-3xl font-bold leading-tight tracking-[-0.02em] md:text-4xl">
              {headline}
            </h2>
            <p className="mx-auto mt-6 max-w-4xl text-lg leading-9 text-[#c7d1dd]">
              {publicPreview}
            </p>
          </article>

          {publicHighlights.length ? (
            <article className="mt-5 border border-[#26313d] bg-[#0d1117] p-6 md:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
                I hela rapporten
              </p>
              <div className="mt-5 space-y-4">
                {publicHighlights.map((highlight, index) => (
                  <div
                    key={highlight}
                    className="grid gap-4 border-l-2 border-emerald-300/70 bg-[#0b0f14] p-4 sm:grid-cols-[42px_minmax(0,1fr)]"
                  >
                    <span className="font-mono text-sm font-bold text-emerald-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base leading-7 text-[#c7d1dd]">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ) : null}

          <article className="mt-5 border border-[#26313d] bg-[#0d1117] p-6 md:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
              Förhandsvisning
            </p>
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="mt-4 text-2xl font-bold tracking-[-0.02em]">
                Kort utdrag ur analysen
              </h2>
              <p className="mt-5 text-lg leading-9 text-[#c7d1dd]">
                {publicPreview}
              </p>
            </div>

            <div className="relative mt-7 overflow-hidden border border-[#26313d] bg-[#0b0f14]">
              <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                <div className="space-y-5 p-7 blur-[5px]">
                  {publicLockedParagraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-base leading-8 text-[#d4dce6]"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {publicLockedParagraphs.map((paragraph) => (
                    <p
                      key={`locked-repeat-${paragraph}`}
                      className="text-base leading-8 text-[#d4dce6]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f14]/20 via-[#0b0f14]/78 to-[#0b0f14]" />
              <div className="relative z-10 grid min-h-[700px] place-items-center p-5 py-8 sm:min-h-[660px] lg:min-h-[620px]">
                <div className="w-full max-w-sm border border-emerald-300/55 bg-[#07090b]/95 p-5 text-center shadow-2xl">
                  <p className="text-xl font-black">
                    {lockedCtaTitle}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#a8b5c4]">
                    {lockedCtaDescription}
                  </p>
                  {hideFreeReportOffer ? (
                    <>
                      <CheckoutButton
                        buttonLabel="Starta månadsaccess - 249 kr/mån"
                        description="Du får dagliga fullständiga rapporter, veckosammanfattning och månadsutsikt via e-post under aktiv period."
                        priceLabel="249 kr/mån"
                        product="monthly_access"
                        productName="Månadsaccess"
                        topicSlug={slug}
                      />
                      <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                        Moms ingår
                      </p>
                      <CheckoutButton
                        buttonClassName="mt-3 w-full border border-emerald-300/70 px-5 py-3 text-sm font-black text-emerald-300 transition hover:bg-emerald-300 hover:text-[#06100c] disabled:cursor-wait disabled:opacity-70"
                        buttonLabel="Välj halvårsaccess - 1 199 kr"
                        description="Du får 6 månaders tillgång till Finansanalytik med dagliga rapporter, veckosammanfattning och månadsutsikt via e-post."
                        priceLabel="1 199 kr"
                        product="half_year_access"
                        productName="Halvårsaccess"
                        topicSlug={slug}
                      />
                      <p className="mt-4 border border-[#26313d] bg-[#0b0f14] p-4 text-sm font-bold leading-6 text-[#c7d1dd]">
                        Du har redan fått gratisrapporten via e-post. Nästa
                        steg är löpande access till hela analyspaketet.
                      </p>
                      <CheckoutButton
                        buttonClassName="mt-3 w-full border border-[#26313d] px-5 py-3 text-sm font-black text-[#c7d1dd] transition hover:border-emerald-300 hover:text-emerald-300 disabled:cursor-wait disabled:opacity-70"
                        buttonLabel="Läs bara dagens rapport - 49 kr"
                        priceLabel="49 kr"
                        product="day_pass"
                        productName="Dagsrapport"
                        topicSlug={slug}
                      />
                    </>
                  ) : (
                    <>
                      <CheckoutButton
                        priceLabel="49 kr"
                        topicSlug={slug}
                      />
                      <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                        Moms ingår
                      </p>
                      <div className="my-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7f91a7]">
                        <span className="h-px flex-1 bg-[#26313d]" />
                        <span>eller testa först</span>
                        <span className="h-px flex-1 bg-[#26313d]" />
                      </div>
                      <FreeReportForm
                        compact
                        sourcePath={`/topics/${slug}`}
                        topicSlug={slug}
                      />
                    </>
                  )}
                  <p className="mt-3 text-sm leading-6 text-[#8d9aaa]">
                    Efter betalning skickas rapporten till e-postadressen du
                    anger hos Stripe.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {!hasContent ? (
            <p className="mt-5 border border-[#26313d] bg-[#0d1117] p-5 text-sm leading-6 text-[#a8b5c4]">
              Området är aktivt men dagens analys har ännu inte tillräckligt
              många godkända signaler.
            </p>
          ) : null}
        </section>
      </div>
      {hasContent ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-emerald-300/50 bg-[#07090b]/98 p-4 shadow-[0_-18px_40px_rgba(0,0,0,0.55)] backdrop-blur md:hidden">
          <div className="mx-auto max-w-md border border-[#26313d] bg-[#0d1117] p-3">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                  {hideFreeReportOffer ? "Månadsaccess" : "Dagspass"}
                </p>
                <p className="mt-1 text-sm font-bold text-zinc-50">
                  {hideFreeReportOffer ? "Dagliga rapporter" : "Dagens 10 analyser"}
                </p>
              </div>
              <p className="text-right text-sm font-black text-zinc-50">
                {hideFreeReportOffer ? "249 kr/mån" : "49 kr"}
                <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#8d9aaa]">
                  moms ingår
                </span>
              </p>
            </div>
            {hideFreeReportOffer ? (
              <CheckoutButton
                buttonClassName="w-full bg-emerald-300 px-5 py-5 text-sm font-black text-[#04100b] shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-100/40 transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-70"
                buttonLabel="Starta månadsaccess - 249 kr/mån"
                description="Du får dagliga fullständiga rapporter, veckosammanfattning och månadsutsikt via e-post under aktiv period."
                priceLabel="249 kr/mån"
                product="monthly_access"
                productName="Månadsaccess"
                topicSlug={slug}
              />
            ) : (
              <CheckoutButton
                buttonClassName="w-full bg-emerald-300 px-5 py-5 text-sm font-black text-[#04100b] shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-100/40 transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-70"
                buttonLabel="Köp dagspass - 49 kr"
                priceLabel="49 kr"
                topicSlug={slug}
              />
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
