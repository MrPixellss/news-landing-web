import { NextResponse } from "next/server";

const COUNTRY_HEADER_NAMES = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country-code",
];

export function GET(request: Request) {
  const headers = request.headers;
  const rawCountry = COUNTRY_HEADER_NAMES.map((name) => headers.get(name))
    .find(Boolean)
    ?.trim()
    .toUpperCase();

  const country = rawCountry && /^[A-Z]{2}$/.test(rawCountry) ? rawCountry : "SE";

  return NextResponse.json(
    { country },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
