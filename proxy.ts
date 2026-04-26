import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_LOGIN_PATH,
  ADMIN_SESSION_COOKIE,
} from "@/lib/auth/config";
import { verifySession } from "@/lib/auth/session";

/**
 * Next.js 16 proxy (formerly `middleware.ts`). Runs on the Edge runtime and
 * uses only Edge-safe primitives (cookies + `jose` JWT verification) to
 * decide whether to let the request reach the admin app or redirect to the
 * login page.
 *
 * Fine-grained role/ownership checks live inside the server components and
 * actions where we have full DB access.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === ADMIN_LOGIN_PATH) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  if (session) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = ADMIN_LOGIN_PATH;
  loginUrl.search = `?redirect=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Protect the full admin surface. The login page short-circuits above.
  matcher: ["/admin/:path*"],
};
