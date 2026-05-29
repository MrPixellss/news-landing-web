import { NextResponse } from "next/server";
import { isValidCheckoutEmail, normalizeCheckoutEmail } from "../../lib/checkout";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://financial-analyst-api-vjrq.onrender.com";

function cleanToken(value: string | null) {
  return (value || "").trim();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = cleanToken(url.searchParams.get("token"));

  if (!token) {
    return NextResponse.json({ error: "Saknad prenumerationslänk." }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/subscriptions/manage/${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: payload.detail || "Prenumerationslänken kunde inte öppnas." },
        { status: response.status },
      );
    }

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { error: "Prenumerationen kunde inte hämtas just nu." },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    action?: string;
    token?: string;
    email?: string;
  } | null;
  const action = (body?.action || "").trim();

  if (action === "request_link") {
    const email = normalizeCheckoutEmail(body?.email);
    if (!isValidCheckoutEmail(email)) {
      return NextResponse.json({ error: "Ange en giltig e-postadress." }, { status: 400 });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/subscriptions/manage/request-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        return NextResponse.json(
          { error: payload.detail || "Länken kunde inte skickas just nu." },
          { status: response.status },
        );
      }

      return NextResponse.json(payload);
    } catch {
      return NextResponse.json(
        { error: "Länken kunde inte skickas just nu." },
        { status: 502 },
      );
    }
  }

  if (action === "cancel") {
    const token = cleanToken(body?.token || "");
    if (!token) {
      return NextResponse.json({ error: "Saknad prenumerationslänk." }, { status: 400 });
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/subscriptions/manage/${encodeURIComponent(token)}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        },
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        return NextResponse.json(
          { error: payload.detail || "Prenumerationen kunde inte avslutas." },
          { status: response.status },
        );
      }

      return NextResponse.json(payload);
    } catch {
      return NextResponse.json(
        { error: "Prenumerationen kunde inte avslutas just nu." },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({ error: "Okänd åtgärd." }, { status: 400 });
}
