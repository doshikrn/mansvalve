import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_LOGIN_PATH, ADMIN_SESSION_COOKIE } from "./config";
import { verifySession, type AdminSessionPayload } from "./session";

/**
 * Reads the admin session JWT from the incoming request cookies and returns
 * the payload if valid. Use this inside server components, server actions
 * and route handlers (Node runtime).
 */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  return verifySession(token);
}

/**
 * Guard helper for admin routes. Redirects to the login page with a
 * `redirect` query param if the request is unauthenticated.
 */
export async function requireAdmin(
  redirectTo?: string,
): Promise<AdminSessionPayload> {
  const session = await getAdminSession();
  if (session) return session;

  const target = redirectTo
    ? `${ADMIN_LOGIN_PATH}?redirect=${encodeURIComponent(redirectTo)}`
    : ADMIN_LOGIN_PATH;
  redirect(target);
}
