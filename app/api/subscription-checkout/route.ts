import { NextResponse } from "next/server";
import {
  isValidCheckoutEmail,
  normalizeCheckoutEmail,
  normalizeCheckoutTopicSlug,
} from "../../lib/checkout";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    topicSlug?: string;
    product?: string;
    marketingOptIn?: boolean;
    customerEmail?: string;
    customerCountry?: string;
    billingPostalCode?: string;
    returnPath?: string;
    trackingMarketingConsent?: boolean;
    trackingEventId?: string;
    trackingFbp?: string;
    trackingFbc?: string;
  } | null;
  const topicSlug = normalizeCheckoutTopicSlug(body?.topicSlug);
  const product = (body?.product || "monthly_access").trim();
  const customerEmail = normalizeCheckoutEmail(body?.customerEmail);
  const returnPath =
    body?.returnPath?.trim().startsWith("/") && !body.returnPath.trim().startsWith("//")
      ? body.returnPath.trim()
      : "/";

  if (!["monthly_access", "half_year_access", "monthly_access_intro_week"].includes(product)) {
    return NextResponse.json({ error: "Okänd produkt." }, { status: 400 });
  }

  if (!isValidCheckoutEmail(customerEmail)) {
    return NextResponse.json(
      { error: "Ange en giltig e-postadress för leverans." },
      { status: 400 },
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://financial-analyst-api-vjrq.onrender.com";

  try {
    const response = await fetch(`${baseUrl}/api/subscriptions/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic_slug: topicSlug,
        product,
        marketing_opt_in: Boolean(body?.marketingOptIn),
        customer_email: customerEmail,
        customer_country: body?.customerCountry,
        billing_postal_code: body?.billingPostalCode,
        return_path: returnPath,
        tracking_marketing_consent: Boolean(body?.trackingMarketingConsent),
        tracking_event_id: body?.trackingEventId,
        tracking_fbp: body?.trackingFbp,
        tracking_fbc: body?.trackingFbc,
      }),
      cache: "no-store",
    });
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
