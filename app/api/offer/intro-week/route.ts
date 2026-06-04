import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim() || "";

  if (!token) {
    return NextResponse.redirect(new URL("/?offer=missing", url.origin), 307);
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://financial-analyst-api-vjrq.onrender.com";
  const target = new URL(
    `/api/leads/free-report/offers/intro-week/${encodeURIComponent(token)}`,
    baseUrl,
  );

  for (const [key, value] of url.searchParams.entries()) {
    if (key === "token") {
      continue;
    }
    if (
      key.startsWith("utm_") ||
      key === "fbclid" ||
      key === "gclid" ||
      key === "msclkid"
    ) {
      target.searchParams.set(key, value);
    }
  }

  return NextResponse.redirect(target, 307);
}
