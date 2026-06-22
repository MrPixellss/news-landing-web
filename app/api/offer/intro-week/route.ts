import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim();
  const source = url.searchParams.get("source")?.trim();

  if (!token) {
    return NextResponse.redirect(new URL("/#pricing", url.origin), 307);
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://financial-analyst-api-vjrq.onrender.com";

  const eventName =
    source === "locked_preview"
      ? "locked_preview_clicked"
      : source === "intro_offer"
        ? "intro_offer_clicked"
        : "email_cta_click";
  const sourceQuery = source ? `&source=${encodeURIComponent(source)}` : "";
  const sourcePath = `/api/offer/intro-week?token=${encodeURIComponent(token)}${sourceQuery}`;
  await fetch(`${baseUrl}/api/leads/free-report/funnel-event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      event_name: eventName,
      product: "monthly_intro_week",
      source_path: sourcePath,
      metadata: { handler: "frontend_offer_redirect", source: source || "email" },
    }),
    cache: "no-store",
  }).catch(() => {
    // Tracking must never block the offer link.
  });
  await fetch(`${baseUrl}/api/leads/free-report/funnel-event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      event_name: "offer_opened",
      product: "monthly_intro_week",
      source_path: `/rapport/${token}`,
      metadata: { handler: "frontend_offer_redirect" },
    }),
    cache: "no-store",
  }).catch(() => {
    // Tracking must never block the offer link.
  });

  return NextResponse.redirect(
    new URL(`/rapport/${encodeURIComponent(token)}?offer=intro-week#intro-week`, url.origin),
    307,
  );
}
