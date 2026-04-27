"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  match?: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Дашборд", match: (p) => p === "/admin" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/certificates", label: "Сертификаты" },
  { href: "/admin/leads", label: "Заявки" },
  { href: "/admin/media", label: "Медиа" },
  { href: "/admin/content", label: "Контент" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <Link href="/admin" className="text-sm font-semibold tracking-tight">
          Mansvalve Admin
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = item.match
              ? item.match(pathname)
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-8 items-center rounded-md px-3 text-sm transition",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-sidebar-border px-4 py-3 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          ← Публичный сайт
        </Link>
      </div>
    </aside>
  );
}
