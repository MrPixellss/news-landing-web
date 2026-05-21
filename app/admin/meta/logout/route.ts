import { NextRequest, NextResponse } from "next/server";
import { META_ADMIN_COOKIE } from "../../../lib/adminDashboardAuth";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/meta/login", request.url), {
    status: 303,
  });

  response.cookies.delete(META_ADMIN_COOKIE);

  return response;
}
