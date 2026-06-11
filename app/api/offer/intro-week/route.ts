import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL("/?offer=closed#pricing", url.origin), 307);
}
