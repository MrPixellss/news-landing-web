export type ReportBlock = {
  slug: string;
  name: string;
  headline: string;
  teaser: string;
  confidence: number | null;
};

export type TodayTeaserResponse = {
  date: string;
  expected_date?: string;
  is_fresh?: boolean;
  freshness_status?: string;
  language?: string;
  title: string;
  intro: string;
  blocks: ReportBlock[];
  daily_price_eur: number;
  weekly_cta_enabled: boolean;
};

export type TopicReportSection = {
  id?: string;
  title?: string;
  body?: string;
  items?: string[];
};

export type TopicReportResponse = {
  date: string;
  expected_date?: string;
  is_fresh?: boolean;
  freshness_status?: string;
  language?: string;
  report_title: string;
  report_intro: string;
  daily_price_eur: number;
  weekly_cta_enabled: boolean;
  topic: ReportBlock & {
    full_report_body: string;
    sections: TopicReportSection[];
  };
};

export const orderedTopics = [
  { slug: "macro", name: "Makroekonomi" },
  { slug: "central-banks-rates", name: "Centralbanker och räntor" },
  { slug: "stocks", name: "Aktier och börs" },
  { slug: "bonds", name: "Obligationer och kreditmarknad" },
  { slug: "fx", name: "Valutor och växelkurser" },
  { slug: "commodities-energy", name: "Råvaror och energi" },
  { slug: "crypto", name: "Krypto och digitala tillgångar" },
  { slug: "banking-credit", name: "Bank och kredit" },
  { slug: "regulation-fincrime", name: "Reglering och finansiell brottslighet" },
  { slug: "geopolitics-risks", name: "Geopolitik och marknadsrisker" },
];

const fallbackDate = new Date().toISOString().slice(0, 10);

export const fallbackData: TodayTeaserResponse = {
  date: fallbackDate,
  expected_date: fallbackDate,
  is_fresh: false,
  freshness_status: "preparing",
  language: "sv",
  title: "",
  intro: "",
  blocks: [],
  daily_price_eur: 5,
  weekly_cta_enabled: true,
};

export async function getTodayTeaser(): Promise<TodayTeaserResponse> {
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

export async function getTopicReport(
  slug: string,
): Promise<TopicReportResponse | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://financial-analyst-api-vjrq.onrender.com";

  try {
    const response = await fetch(`${baseUrl}/api/report/topic/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as TopicReportResponse;
  } catch {
    return null;
  }
}

export function shortPreview(text: string, maxSentences = 2) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) {
    return "";
  }

  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  return (sentences.length ? sentences.slice(0, maxSentences).join(" ") : clean)
    .slice(0, 520)
    .trim();
}

export function displayDate(value: string | undefined) {
  return (value || new Date().toISOString().slice(0, 10)).replaceAll("-", ".");
}

export function normalizeSwedishCopy(text: string | undefined) {
  return (text || "")
    .replaceAll("topic routing", "ämnesstyrning")
    .replaceAll("Topic routing", "Ämnesstyrning")
    .replaceAll("USA-inflation", "amerikansk inflation")
    .replaceAll("USA:s inflation", "amerikansk inflation")
    .replaceAll("FX", "växelkurser")
    .replaceAll("EUR", "euro")
    .replaceAll("IPO-optimism", "börsnoteringsoptimism")
    .replaceAll("“higher for longer”", "högre räntor under längre tid")
    .replaceAll("”higher for longer”", "högre räntor under längre tid")
    .replaceAll('"higher for longer"', "högre räntor under längre tid")
    .replaceAll("higher for longer", "högre räntor under längre tid")
    .replaceAll("Higher for longer", "Högre räntor under längre tid")
    .replaceAll(
      "the central analytical question is: Does the signal change the market view on growth, inflation, or recession risk?",
      "den centrala analysfrågan är om signalen ändrar marknadens syn på tillväxt, inflation eller recessionsrisk.",
    )
    .replaceAll(
      "Macro surprises reprice earnings expectations, discount rates, credit risk, and cyclical exposure.",
      "Makroöverraskningar påverkar vinstförväntningar, räntor, kreditrisk och cyklisk exponering.",
    )
    .replaceAll("market view", "marknadssyn")
    .replaceAll("growth", "tillväxt")
    .replaceAll("inflation", "inflation")
    .replaceAll("recession risk", "recessionsrisk")
    .replaceAll("equities", "aktier")
    .replaceAll("rates", "räntor")
    .replaceAll("credit", "kredit")
    .replaceAll("cyclical sectors", "cykliska sektorer")
    .replace(/\s+/g, " ")
    .trim();
}
