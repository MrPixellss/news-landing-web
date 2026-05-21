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

  try {
    const response = await fetch(`${baseUrl}/api/meta/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(forwardedFor ? { "X-Forwarded-For": forwardedFor } : {}),
        ...(userAgent ? { "User-Agent": userAgent } : {}),
      },
      body,
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ status: "skipped", reason: "meta_event_proxy_failed" });
  }
}
