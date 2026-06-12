import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    offerToken?: string;
    marketingOptIn?: boolean;
    customerCountry?: string;
    billingPostalCode?: string;
    returnPath?: string;
    trackingMarketingConsent?: boolean;
    trackingEventId?: string;
    trackingFbp?: string;
    trackingFbc?: string;
  } | null;

  const offerToken = body?.offerToken?.trim();
  if (!offerToken) {
    return NextResponse.json({ error: "Erbjudandelänken saknas." }, { status: 400 });
  }

  const returnPath =
    body?.returnPath?.trim().startsWith("/") && !body.returnPath.trim().startsWith("//")
      ? body.returnPath.trim()
      : `/rapport/${encodeURIComponent(offerToken)}`;

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://financial-analyst-api-vjrq.onrender.com";

  try {
    const response = await fetch(
      `${baseUrl}/api/leads/free-report/offers/intro-week/${encodeURIComponent(offerToken)}/checkout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketing_opt_in: Boolean(body?.marketingOptIn),
          customer_country: body?.customerCountry,
          billing_postal_code: body?.billingPostalCode,
          return_path: returnPath,
          tracking_marketing_consent: Boolean(body?.trackingMarketingConsent),
          tracking_event_id: body?.trackingEventId,
          tracking_fbp: body?.trackingFbp,
          tracking_fbc: body?.trackingFbc,
        }),
        cache: "no-store",
      },
    );
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: payload.detail || "Stripe Checkout kunde inte startas." },
        { status: response.status },
      );
    }

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { error: "Betalningen kunde inte startas just nu." },
      { status: 502 },
    );
  }
}
