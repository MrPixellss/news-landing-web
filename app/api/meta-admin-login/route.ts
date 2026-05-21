import { NextRequest, NextResponse } from "next/server";
import {
  createMetaAdminSessionToken,
  getMetaAdminDashboardSecret,
  META_ADMIN_COOKIE,
} from "../../lib/adminDashboardAuth";

export async function POST(request: NextRequest) {
  const secret = getMetaAdminDashboardSecret();

  if (!secret) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const password = String(formData.get("password") || "").trim();

  if (password !== secret) {
    return NextResponse.redirect(new URL("/admin/meta/login?error=1", request.url), {
      status: 303,
    });
  }

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
