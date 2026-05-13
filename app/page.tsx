export const dynamic = "force-dynamic";
export const revalidate = 0;

type ReportBlock = {
  slug: string;
  name: string;
  headline: string;
  teaser: string;
  confidence: number;
};

type TodayTeaserResponse = {
  date: string;
  language?: string;
  title: string;
  intro: string;
  blocks: ReportBlock[];
  daily_price_eur: number;
  weekly_cta_enabled: boolean;
};

const orderedTopics = [
  { slug: "macro", name: "Makroekonomi" },
  { slug: "central-banks-rates", name: "Centralbanker och räntor" },
  { slug: "stocks", name: "Aktier och börs" },
  { slug: "bonds", name: "Obligationer och kreditmarknad" },
  { slug: "fx", name: "Valutor och FX" },
  { slug: "commodities-energy", name: "Råvaror och energi" },
  { slug: "crypto", name: "Krypto och digitala tillgångar" },
  { slug: "banking-credit", name: "Bank och kredit" },
  { slug: "regulation-fincrime", name: "Reglering och finansiell brottslighet" },
  { slug: "geopolitics-risks", name: "Geopolitik och marknadsrisker" },
];

const fallbackData: TodayTeaserResponse = {
  date: new Date().toISOString().slice(0, 10),
  language: "sv",
  title: "",
  intro: "",
  blocks: [],
  daily_price_eur: 5,
  weekly_cta_enabled: true,
};

async function getTodayTeaser(): Promise<TodayTeaserResponse> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://financial-analyst-api-vjrq.onrender.com";

  try {
    const response = await fetch(`${baseUrl}/api/report/today-teaser`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return fallbackData;
    }

    return (await response.json()) as TodayTeaserResponse;
  } catch {
    return fallbackData;
  }
}

export default async function HomePage() {
  const data = await getTodayTeaser();

  const blocksBySlug = new Map(data.blocks.map((block) => [block.slug, block]));
  const hasReportContent =
    Boolean(data.title?.trim()) ||
    Boolean(data.intro?.trim()) ||
    data.blocks.length > 0;
  const pageTitle = hasReportContent ? data.title : "Analysen förbereds";
  const pageIntro = hasReportContent
    ? data.intro
    : "Vi samlar primärkällor, rensar materialet och låter det passera våra kvalitetsregler. När dagens rapport är klar visas slutsatserna här.";

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-10">
          <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/50">
            Daglig finansiell analys · {data.date}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                {pageTitle}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-7 text-white/70 md:text-lg">
                {pageIntro}
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                I dagens genomgång
              </p>

              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/75">
                <li>10 marknadsteman med separata regler</li>
                <li>Primärkällor sparas innan analysen byggs</li>
                <li>Kvalitet, routing och analys loggas steg för steg</li>
                <li>Fördjupad rapport öppnas senare via betalflödet</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {orderedTopics.map((topic, index) => {
            const block = blocksBySlug.get(topic.slug);

            return (
              <article
                key={topic.slug}
                className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                    Tema {String(index + 1).padStart(2, "0")}
                  </p>

                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-white/45">
                    {block?.confidence != null
                      ? `${Math.round(block.confidence * 100)}%`
                      : "-"}
                  </span>
                </div>

                <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                  {topic.name}
                </h2>

                <p className="mt-4 text-sm font-medium leading-7 text-white/90">
                  {block?.headline ?? "Väntar på signaler"}
                </p>

                <p className="mt-4 text-sm leading-7 text-white/65">
                  {block?.teaser ??
                    "Blocket visas när källor har samlats in, rensats och passerat kvalitetsreglerna."}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
