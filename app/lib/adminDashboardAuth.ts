import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export const META_ADMIN_COOKIE = "finansanalytik_meta_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

export function getMetaAdminDashboardSecret() {
  return process.env.META_ADMIN_DASHBOARD_PASSWORD?.trim() || "";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signSessionBody(secret: string, body: string) {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

export function createMetaAdminSessionToken(secret: string) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    v: 1,
    iat: issuedAt,
    exp: issuedAt + SESSION_TTL_SECONDS,
    nonce: randomBytes(16).toString("base64url"),
  };
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = signSessionBody(secret, body);
  return `v1.${body}.${signature}`;
}

export function isMetaAdminPasswordValid(password: string, secret: string) {
  if (!password || !secret) {
    return false;
  }
  const passwordBuffer = Buffer.from(password);
  const secretBuffer = Buffer.from(secret);
  return (
    passwordBuffer.length === secretBuffer.length &&
    timingSafeEqual(passwordBuffer, secretBuffer)
  );
}

export function isMetaAdminSessionTokenValid(token: string | undefined, secret: string) {
  if (!token || !secret) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") {
    return false;
  }

  const [, body, signature] = parts;
  const expected = signSessionBody(secret, body);
  const tokenBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    tokenBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(tokenBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as { exp?: number };
    return typeof payload.exp === "number" && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
