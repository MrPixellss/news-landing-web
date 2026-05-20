import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    topicSlug?: string;
    marketingOptIn?: boolean;
    customerEmail?: string;
    customerCountry?: string;
    billingPostalCode?: string;
  } | null;
  const topicSlug = body?.topicSlug?.trim();

  if (!topicSlug) {
    return NextResponse.json({ error: "Saknat analysområde." }, { status: 400 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://financial-analyst-api-vjrq.onrender.com";

  try {
    const response = await fetch(`${baseUrl}/api/payments/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic_slug: topicSlug,
        marketing_opt_in: Boolean(body?.marketingOptIn),
        customer_email: body?.customerEmail,
        customer_country: body?.customerCountry,
        billing_postal_code: body?.billingPostalCode,
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
