import { createHash, timingSafeEqual } from "crypto";

export const META_ADMIN_COOKIE = "finansanalytik_meta_admin";

export function getMetaAdminDashboardSecret() {
  return process.env.META_ADMIN_DASHBOARD_PASSWORD?.trim() || "";
}

export function createMetaAdminSessionToken(secret: string) {
  return createHash("sha256")
    .update(`finansanalytik-meta-admin:${secret}`)
    .digest("hex");
}

export function isMetaAdminSessionTokenValid(token: string | undefined, secret: string) {
  if (!token || !secret) {
    return false;
  }

  const expected = createMetaAdminSessionToken(secret);
  const tokenBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);

  return (
    tokenBuffer.length === expectedBuffer.length &&
    timingSafeEqual(tokenBuffer, expectedBuffer)
  );
}
