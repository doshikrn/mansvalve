import type { Metadata } from "next";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminSession } from "@/lib/auth/current-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // The /admin/login page is public; everything else is guarded by the
  // Edge middleware. When we get here without a session it means the user
  // is on the login page — render children without the chrome.
  if (!session) {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/40 p-6">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-1 bg-muted/20">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader session={session} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
