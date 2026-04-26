/**
 * Shared admin-auth constants. Kept in their own module so both the Node
 * runtime (server actions, API handlers) and the Edge runtime (middleware)
 * can import them without pulling in the database client.
 */

export const ADMIN_SESSION_COOKIE = "mansvalve_admin_session";
export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_HOME_PATH = "/admin";

export const ADMIN_ROLES = ["admin", "editor", "viewer"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export function getSessionTtlSeconds(): number {
  const raw = process.env.ADMIN_SESSION_TTL_HOURS;
  const hours = raw ? Number(raw) : 12;
  if (!Number.isFinite(hours) || hours <= 0) return 12 * 3600;
  return Math.floor(hours * 3600);
}

export function getSessionSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing or too short (>= 24 chars required).",
    );
  }
  return new TextEncoder().encode(secret);
}
