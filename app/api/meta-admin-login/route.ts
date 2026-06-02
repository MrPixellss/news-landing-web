import { NextRequest, NextResponse } from "next/server";
import {
  createMetaAdminSessionToken,
  getMetaAdminDashboardSecret,
  isMetaAdminPasswordValid,
  META_ADMIN_COOKIE,
} from "../../lib/adminDashboardAuth";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  return (forwardedFor.split(",", 1)[0] || request.headers.get("x-real-ip") || "unknown")
    .trim()
    .slice(0, 100);
}

function isRateLimited(key: string) {
  const now = Date.now();
  const current = loginAttempts.get(key);
  if (!current || current.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > LOGIN_MAX_ATTEMPTS;
}

export async function POST(request: NextRequest) {
  const secret = getMetaAdminDashboardSecret();

  if (!secret) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const key = clientKey(request);
  if (isRateLimited(key)) {
    return NextResponse.redirect(new URL("/admin/meta/login?error=rate", request.url), {
      status: 303,
    });
  }

  const formData = await request.formData();
  const password = String(formData.get("password") || "").trim();

  if (!isMetaAdminPasswordValid(password, secret)) {
    return NextResponse.redirect(new URL("/admin/meta/login?error=1", request.url), {
      status: 303,
    });
  }

  loginAttempts.delete(key);

  const response = NextResponse.redirect(new URL("/admin/meta", request.url), {
    status: 303,
  });

  response.cookies.set(META_ADMIN_COOKIE, createMetaAdminSessionToken(secret), {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
