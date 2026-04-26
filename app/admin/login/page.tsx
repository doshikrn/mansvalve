import { redirect } from "next/navigation";

import { ADMIN_HOME_PATH } from "@/lib/auth/config";
import { getAdminSession } from "@/lib/auth/current-user";

import { LoginForm } from "./LoginForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const existing = await getAdminSession();
  const params = await searchParams;

  if (existing) {
    redirect(params.redirect && params.redirect.startsWith("/admin") ? params.redirect : ADMIN_HOME_PATH);
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-sm">
      <div className="mb-6 text-center">
        <div className="text-base font-semibold tracking-tight">
          Mansvalve Admin
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Войдите, чтобы продолжить
        </div>
      </div>
      <LoginForm redirectTo={params.redirect ?? null} />
    </div>
  );
}
