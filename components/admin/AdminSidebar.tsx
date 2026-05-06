"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Building2,
  FileCheck,
  FileText,
  FolderTree,
  Home,
  ImageIcon,
  Inbox,
  LayoutDashboard,
  Layers,
  Package,
  Settings,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const PRIMARY: Item[] = [
  { href: "/admin", label: "Обзор", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Заявки", icon: Inbox },
];

const CATALOG: Item[] = [
  { href: "/admin/products", label: "Товары", icon: Package },
  { href: "/admin/categories", label: "Категории", icon: FolderTree },
  { href: "/admin/categories#podkategorii", label: "Подкатегории", icon: Layers },
  { href: "/admin/certificates", label: "Сертификаты", icon: Award },
];

const CONTENT: Item[] = [
  { href: "/admin/content#home", label: "Главная", icon: Home },
  { href: "/admin/content#about", label: "О компании", icon: Building2 },
  { href: "/admin/content#contacts", label: "Контакты", icon: FileText },
  { href: "/admin/content#delivery", label: "Доставка", icon: Truck },
  { href: "/admin/content#certificates-page", label: "Страница сертификатов", icon: ShieldCheck },
  { href: "/admin/content#legal", label: "Политика и условия", icon: FileCheck },
  { href: "/admin/content#footer", label: "Подвал", icon: Layers },
];

const MORE: Item[] = [
  { href: "/admin/media", label: "Медиафайлы", icon: ImageIcon },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

function isActive(pathname: string, href: string, currentHash: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  const pathOnly = href.split("#")[0] ?? href;
  const hash = href.includes("#") ? `#${href.split("#")[1] ?? ""}` : "";
  if (hash) {
    return pathname === pathOnly && currentHash === hash;
  }
  if (pathOnly === "/admin/categories" && pathname.startsWith("/admin/categories")) {
    return true;
  }
  return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
}

function NavRow({ item, pathname, currentHash }: { item: Item; pathname: string; currentHash: string }) {
  const active = isActive(pathname, item.href, currentHash);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
        active
          ? "bg-blue-50 font-medium text-[#1D4ED8] ring-1 ring-inset ring-blue-200"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-[#1D4ED8]" : "text-slate-400")} aria-hidden />
      {item.label}
    </Link>
  );
}

function NavGroup({
  title,
  items,
  pathname,
  currentHash,
}: {
  title: string;
  items: Item[];
  pathname: string;
  currentHash: string;
}) {
  return (
    <div className="pt-4 first:pt-0">
      <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.href + item.label}>
            <NavRow item={item} pathname={pathname} currentHash={currentHash} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    const syncHash = () => setCurrentHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[#E2E8F0] bg-white">
      <div className="flex h-14 items-center border-b border-[#E2E8F0] px-4">
        <Link href="/admin" className="text-sm font-semibold tracking-tight text-slate-900">
          MANSVALVE
        </Link>
        <span className="ml-2 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-500">
          Админ
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Разделы админки">
        <NavGroup title="Разделы" items={PRIMARY} pathname={pathname} currentHash={currentHash} />
        <NavGroup title="Каталог" items={CATALOG} pathname={pathname} currentHash={currentHash} />
        <NavGroup title="Страницы сайта" items={CONTENT} pathname={pathname} currentHash={currentHash} />
        <NavGroup title="Медиа и настройки" items={MORE} pathname={pathname} currentHash={currentHash} />
      </nav>
      <div className="border-t border-[#E2E8F0] px-4 py-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-[#1D4ED8] hover:underline"
        >
          Открыть публичный сайт →
        </Link>
      </div>
    </aside>
  );
}
