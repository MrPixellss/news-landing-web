import { NextResponse } from "next/server";
import { isValidCheckoutEmail, normalizeCheckoutEmail } from "../../lib/checkout";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    consentAccepted?: boolean;
    consentText?: string;
    consentVersion?: string;
    sourcePath?: string;
    topicSlug?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    trackingMarketingConsent?: boolean;
    trackingEventId?: string;
    trackingFbp?: string;
    trackingFbc?: string;
    eventSourceUrl?: string;
    turnstileToken?: string;
    companyWebsite?: string;
  } | null;
  const email = normalizeCheckoutEmail(body?.email);

  if (!isValidCheckoutEmail(email)) {
    return NextResponse.json({ error: "Ange en giltig e-postadress." }, { status: 400 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://financial-analyst-api-vjrq.onrender.com";
  const forwardedFor =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "";
  const userAgent = request.headers.get("user-agent") || "";
  const referer = request.headers.get("referer") || "";
  const forwardedHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (forwardedFor) {
    forwardedHeaders["X-Forwarded-For"] = forwardedFor;
  }
  if (userAgent) {
    forwardedHeaders["User-Agent"] = userAgent;
  }
  if (referer) {
    forwardedHeaders.Referer = referer;
  }

  try {
    const response = await fetch(`${baseUrl}/api/leads/free-report`, {
      method: "POST",
      headers: forwardedHeaders,
      body: JSON.stringify({
        email,
        consent_accepted: Boolean(body?.consentAccepted),
        consent_text: body?.consentText,
        consent_version: body?.consentVersion,
        source_path: body?.sourcePath,
        topic_slug: body?.topicSlug,
        utm_source: body?.utmSource,
        utm_medium: body?.utmMedium,
        utm_campaign: body?.utmCampaign,
        utm_content: body?.utmContent,
        tracking_marketing_consent: Boolean(body?.trackingMarketingConsent),
        tracking_event_id: body?.trackingEventId,
        tracking_fbp: body?.trackingFbp,
        tracking_fbc: body?.trackingFbc,
        event_source_url: body?.eventSourceUrl,
        turnstile_token: body?.turnstileToken,
        honeypot: body?.companyWebsite,
      }),
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: payload.detail || "Rapporten kunde inte skickas just nu." },
        { status: response.status },
      );
    }

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { error: "Rapporten kunde inte skickas just nu." },
      { status: 502 },
    );
  }
}
