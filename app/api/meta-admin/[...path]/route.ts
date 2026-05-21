import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

async function forwardMetaAdminRequest(request: Request, context: RouteContext) {
  const { path = [] } = await context.params;
  const adminKey = request.headers.get("x-admin-api-key")?.trim();

  if (!adminKey) {
    return NextResponse.json({ error: "Admin API key saknas." }, { status: 401 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://financial-analyst-api-vjrq.onrender.com";
  const sourceUrl = new URL(request.url);
  const targetUrl = `${baseUrl.replace(/\/$/, "")}/api/${path.join("/")}${sourceUrl.search}`;
  const method = request.method.toUpperCase();
  const body = method === "GET" || method === "HEAD" ? undefined : await request.text();
  const contentType = request.headers.get("content-type") || "application/json";

  try {
    const response = await fetch(targetUrl, {
      method,
      headers: {
        "Content-Type": contentType,
        "X-Admin-API-Key": adminKey,
      },
      body,
      cache: "no-store",
    });
    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Backend kunde inte nås just nu." },
      { status: 502 },
    );
  }
}

export async function GET(request: Request, context: RouteContext) {
  return forwardMetaAdminRequest(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return forwardMetaAdminRequest(request, context);
}
