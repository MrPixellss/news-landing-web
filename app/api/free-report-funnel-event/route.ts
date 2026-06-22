import { NextResponse } from "next/server";

const allowedEvents = new Set([
  "sample_report_opened",
  "intro_offer_seen",
  "intro_offer_clicked",
  "locked_preview_clicked",
  "checkout_open",
  "checkout_abandoned",
]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    token?: string;
    eventName?: string;
    product?: string;
    sourcePath?: string;
    metadata?: Record<string, unknown>;
  } | null;

  const token = body?.token?.trim();
  const eventName = body?.eventName?.trim();
  if (!token || !eventName || !allowedEvents.has(eventName)) {
    return NextResponse.json({ recorded: false }, { status: 400 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://financial-analyst-api-vjrq.onrender.com";

  try {
    const response = await fetch(`${baseUrl}/api/leads/free-report/funnel-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        event_name: eventName,
        product: body?.product || "monthly_intro_week",
        source_path: body?.sourcePath,
        metadata: {
          handler: "frontend_funnel_event_proxy",
          ...(body?.metadata || {}),
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ recorded: false }, { status: response.status });
    }

    return NextResponse.json({ recorded: true });
  } catch {
    return NextResponse.json({ recorded: false }, { status: 502 });
  }
}
