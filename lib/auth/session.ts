import { jwtVerify, SignJWT } from "jose";

import {
  getSessionSecret,
  getSessionTtlSeconds,
  type AdminRole,
} from "./config";

/**
 * Minimal, Edge-runtime safe session layer. We intentionally avoid server-
 * side session storage and keep everything in a signed JWT cookie so the
 * `middleware.ts` file (which must run on Edge) can validate sessions
 * without touching Postgres.
 *
 * Password hashing, user lookups and rotation happen only inside the Node
 * runtime (see `./password.ts` and `./current-user.ts`).
 */

const JWT_ISSUER = "mansvalve-admin";
const JWT_AUDIENCE = "mansvalve-admin";

export type AdminSessionPayload = {
  sub: string; // admin user id as string
  email: string;
  role: AdminRole;
  name?: string;
};

export async function signSession(payload: AdminSessionPayload): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(now + getSessionTtlSeconds())
    .setSubject(payload.sub)
    .sign(getSessionSecret());
}

export async function verifySession(
  token: string | undefined | null,
): Promise<AdminSessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    const sub = typeof payload.sub === "string" ? payload.sub : null;
    const email = typeof payload.email === "string" ? payload.email : null;
    const role = typeof payload.role === "string" ? (payload.role as AdminRole) : null;
    const name = typeof payload.name === "string" ? payload.name : undefined;

    if (!sub || !email || !role) return null;

    return { sub, email, role, name };
  } catch {
    return null;
  }
}
