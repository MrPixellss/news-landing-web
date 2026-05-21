import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://financial-analyst-api-vjrq.onrender.com";

  if (!token) {
    return new NextResponse("Länken saknas.", { status: 400 });
  }

  try {
    const response = await fetch(
      `${baseUrl}/api/leads/unsubscribe/${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
    const html = await response.text();
    return new NextResponse(html, {
      status: response.status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return new NextResponse("Avregistreringen kunde inte slutföras just nu.", {
      status: 502,
    });
  }
}
