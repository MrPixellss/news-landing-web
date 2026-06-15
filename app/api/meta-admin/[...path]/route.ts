import { NextRequest, NextResponse } from "next/server";
import {
  getMetaAdminDashboardSecret,
  isMetaAdminSessionTokenValid,
  META_ADMIN_COOKIE,
} from "../../../lib/adminDashboardAuth";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

async function forwardMetaAdminRequest(request: NextRequest, context: RouteContext) {
  const dashboardSecret = getMetaAdminDashboardSecret();
  const sessionToken = request.cookies.get(META_ADMIN_COOKIE)?.value;

  if (!isMetaAdminSessionTokenValid(sessionToken, dashboardSecret)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { path = [] } = await context.params;
  const backendPath = path.join("/");
  const isAllowedPath = path[0] === "meta" || backendPath === "ai/meta/propose-creatives";
  if (!isAllowedPath) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const adminKey =
    process.env.BACKEND_ADMIN_API_KEY?.trim() ||
    process.env.ADMIN_API_KEY?.trim() ||
    "";
  if (!adminKey) {
    return NextResponse.json({ error: "Backend admin key saknas i servermiljön." }, { status: 503 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://financial-analyst-api-vjrq.onrender.com";
  const sourceUrl = new URL(request.url);
  const targetUrl = `${baseUrl.replace(/\/$/, "")}/api/${backendPath}${sourceUrl.search}`;
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

export async function GET(request: NextRequest, context: RouteContext) {
  return forwardMetaAdminRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return forwardMetaAdminRequest(request, context);
}
