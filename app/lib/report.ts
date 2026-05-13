export type ReportBlock = {
  slug: string;
  name: string;
  headline: string;
  teaser: string;
  confidence: number | null;
};

export type TodayTeaserResponse = {
  date: string;
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
  { slug: "fx", name: "Valutor och FX" },
  { slug: "commodities-energy", name: "Råvaror och energi" },
  { slug: "crypto", name: "Krypto och digitala tillgångar" },
  { slug: "banking-credit", name: "Bank och kredit" },
  { slug: "regulation-fincrime", name: "Reglering och finansiell brottslighet" },
  { slug: "geopolitics-risks", name: "Geopolitik och marknadsrisker" },
];

export const fallbackData: TodayTeaserResponse = {
  date: new Date().toISOString().slice(0, 10),
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

export function confidenceLabel(confidence: number | null | undefined) {
  if (confidence == null) {
    return "Ny";
  }
  return `${Math.round(confidence * 100)}%`;
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
