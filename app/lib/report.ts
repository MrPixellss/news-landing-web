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
  daily_price_cents?: number;
  daily_price_currency?: string;
  daily_price_label?: string;
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
  daily_price_cents?: number;
  daily_price_currency?: string;
  daily_price_label?: string;
  weekly_cta_enabled: boolean;
  topic: FullTopicReport;
};

export type FullTopicReport = ReportBlock & {
  full_report_body: string;
  sections: TopicReportSection[];
  market_snapshot?: MarketSnapshotItem[];
  language_warnings?: {
    topic_slug: string;
    language_model: string;
    action: string;
  }[];
};

export type MarketSnapshotItem = {
  instrument_id: string;
  label: string;
  symbol: string;
  currency: string;
  unit: string;
  latest_date: string;
  latest_value: number;
  daily_change?: number | null;
  daily_change_pct?: number | null;
  period_start_date?: string | null;
  period_change?: number | null;
  period_change_pct?: number | null;
  points: {
    date: string;
    value: number;
  }[];
};

export type PaidReportResponse = {
  date: string;
  language?: string;
  report_title: string;
  report_intro: string;
  weekly_cta_enabled: boolean;
  access: {
    type: string;
    primary_topic_slug: string;
    primary_topic_name: string;
    topic_count: number;
  };
  topics: FullTopicReport[];
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
  daily_price_eur: 49,
  daily_price_cents: 4900,
  daily_price_currency: "sek",
  daily_price_label: "49 kr",
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

export async function getPaidReport(
  token: string,
): Promise<PaidReportResponse | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://financial-analyst-api-vjrq.onrender.com";

  try {
    const response = await fetch(`${baseUrl}/api/report/paid/${encodeURIComponent(token)}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as PaidReportResponse;
  } catch {
    return null;
  }
}

export function priceLabel(data: {
  daily_price_label?: string;
  daily_price_cents?: number;
  daily_price_currency?: string;
  daily_price_eur?: number;
}) {
  if (data.daily_price_label) {
    return data.daily_price_label;
  }

  const cents = data.daily_price_cents;
  const currency = data.daily_price_currency?.toUpperCase();
  if (typeof cents === "number" && currency) {
    const amount = cents / 100;
    return `${Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2)} ${currency}`;
  }

  return `${data.daily_price_eur ?? 3} SEK`;
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
  const normalized = (text || "")
    .replaceAll("\r\n", "\n")
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
    .replaceAll("funding markets", "finansieringsmarknader")
    .replaceAll("credit spreads", "kreditspreadar")
    .replaceAll("growth", "tillväxt")
    .replaceAll("inflation", "inflation")
    .replaceAll("recession risk", "recessionsrisk")
    .replaceAll("equities", "aktier")
    .replaceAll("banks", "banker")
    .replaceAll("rates", "räntor")
    .replaceAll("credit", "kredit")
    .replaceAll("cyclical sectors", "cykliska sektorer");

  return normalized
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
