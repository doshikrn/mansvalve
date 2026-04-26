"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  ADMIN_HOME_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_SESSION_COOKIE,
  getSessionTtlSeconds,
  type AdminRole,
} from "@/lib/auth/config";
import { verifyPassword } from "@/lib/auth/password";
import { signSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200),
  redirectTo: z.string().max(500).optional(),
});

export type LoginState = {
  error?: string;
  email?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo") || undefined,
  });

  if (!parsed.success) {
    return {
      error: "Проверьте email и пароль.",
      email: String(formData.get("email") ?? ""),
    };
  }

  const { email, password, redirectTo } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  let user: typeof adminUsers.$inferSelect | undefined;
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, normalizedEmail))
      .limit(1);
    user = rows[0];
  } catch (error) {
    console.error("[admin-login] db error", error);
    return {
      error: "Сервис авторизации недоступен. Проверьте конфигурацию БД.",
      email: normalizedEmail,
    };
  }

  if (!user || !user.isActive) {
    // Constant-time-ish response: always hit bcrypt even on missing user.
    await verifyPassword(password, "$2a$12$invalidhashinvalidhashinvalidhashinvalidhash");
    return { error: "Неверный email или пароль.", email: normalizedEmail };
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return { error: "Неверный email или пароль.", email: normalizedEmail };
  }

  try {
    const db = getDb();
    await db
      .update(adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsers.id, user.id));
  } catch (error) {
    console.error("[admin-login] failed to update last_login_at", error);
  }

  const token = await signSession({
    sub: String(user.id),
    email: user.email,
    role: user.role as AdminRole,
    name: user.name ?? undefined,
  });

  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getSessionTtlSeconds(),
  });

  const target = sanitizeRedirect(redirectTo) ?? ADMIN_HOME_PATH;
  redirect(target);
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  redirect(ADMIN_LOGIN_PATH);
}

function sanitizeRedirect(raw: string | undefined): string | null {
  if (!raw) return null;
  // Only allow relative redirects that stay within the admin area.
  if (!raw.startsWith("/admin")) return null;
  return raw;
}
