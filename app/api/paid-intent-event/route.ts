import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.text();
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://financial-analyst-api-vjrq.onrender.com";
  const forwardedFor =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "";
  const userAgent = request.headers.get("user-agent") || "";
  const referer = request.headers.get("referer") || "";

  try {
    const response = await fetch(`${baseUrl}/api/leads/paid-intent-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(forwardedFor ? { "X-Forwarded-For": forwardedFor } : {}),
        ...(userAgent ? { "User-Agent": userAgent } : {}),
        ...(referer ? { Referer: referer } : {}),
      },
      body,
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ recorded: false, reason: "paid_intent_event_proxy_failed" });
  }
}
