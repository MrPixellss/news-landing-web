const generalReportTopicSlugs = new Set([
  "full_report",
  "daily_report",
  "daily_report_bundle",
  "all_topics",
  "bundle",
]);

export function normalizeCheckoutEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

export function isValidCheckoutEmail(value: unknown) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizeCheckoutEmail(value));
}

export function normalizeCheckoutTopicSlug(value: unknown) {
  const slug = String(value || "").trim().toLowerCase();
  if (!slug || generalReportTopicSlugs.has(slug)) {
    return "macro";
  }
  return slug;
}
