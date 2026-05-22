"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Activity,
  Award,
  Building2,
  FileCheck,
  FileSpreadsheet,
  FileText,
  FolderTree,
  GitBranch,
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
  { href: "/admin/products/import", label: "Импорт Excel", icon: FileSpreadsheet },
  { href: "/admin/products/series", label: "Серии и шаблоны", icon: GitBranch },
  { href: "/admin/catalog-health", label: "Здоровье каталога", icon: Activity },
  { href: "/admin/categories?view=categories", label: "Категории", icon: FolderTree },
  { href: "/admin/categories?view=subcategories", label: "Подкатегории", icon: Layers },
  { href: "/admin/certificates", label: "Сертификаты", icon: Award },
];

const CONTENT: Item[] = [
  { href: "/admin/content?section=home", label: "Главная", icon: Home },
  { href: "/admin/content?section=about", label: "О компании", icon: Building2 },
  { href: "/admin/content?section=contacts", label: "Контакты", icon: FileText },
  { href: "/admin/content?section=delivery", label: "Доставка", icon: Truck },
  { href: "/admin/content?section=certificates-page", label: "Страница сертификатов", icon: ShieldCheck },
  { href: "/admin/content?section=legal", label: "Политика и условия", icon: FileCheck },
  { href: "/admin/content?section=footer", label: "Подвал", icon: Layers },
];

const MORE: Item[] = [
  { href: "/admin/media", label: "Медиафайлы", icon: ImageIcon },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

function splitHref(href: string): { path: string; query: URLSearchParams } {
  const [path, queryString = ""] = href.split("?");
  return { path: path ?? href, query: new URLSearchParams(queryString) };
}

function isActive(pathname: string, href: string, currentSearchParams: URLSearchParams): boolean {
  if (href === "/admin") return pathname === "/admin";
  const { path, query } = splitHref(href);
  const section = query.get("section");
  const view = query.get("view");

  if (section) {
    return pathname === path && currentSearchParams.get("section") === section;
  }
  if (view) {
    if (pathname === path) {
      return (currentSearchParams.get("view") ?? "categories") === view;
    }
    // На подстраницах /admin/categories/[id]/... подсветим «Категории» как
    // дефолтный раздел, а «Подкатегории» — когда пользователь зашёл в
    // конкретную подкатегорию.
    if (path === "/admin/categories") {
      const inSubcategory = /\/admin\/categories\/\d+\/subcategories(\b|\/)/.test(pathname);
      if (view === "subcategories" && inSubcategory) return true;
      if (view === "categories" && pathname.startsWith("/admin/categories/") && !inSubcategory) {
        return true;
      }
    }
    return false;
  }
  // Импорт — отдельный пункт; не подсвечивать общий «Товары» на /admin/products/import.
  if (href === "/admin/products" && pathname.startsWith("/admin/products/import")) {
    return false;
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

function NavRow({
  item,
  pathname,
  currentSearchParams,
}: {
  item: Item;
  pathname: string;
  currentSearchParams: URLSearchParams;
}) {
  const active = isActive(pathname, item.href, currentSearchParams);
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
  currentSearchParams,
}: {
  title: string;
  items: Item[];
  pathname: string;
  currentSearchParams: URLSearchParams;
}) {
  return (
    <div className="pt-4 first:pt-0">
      <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.href + item.label}>
            <NavRow item={item} pathname={pathname} currentSearchParams={currentSearchParams} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();

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
        <NavGroup title="Разделы" items={PRIMARY} pathname={pathname} currentSearchParams={currentSearchParams} />
        <NavGroup title="Каталог" items={CATALOG} pathname={pathname} currentSearchParams={currentSearchParams} />
        <NavGroup title="Страницы сайта" items={CONTENT} pathname={pathname} currentSearchParams={currentSearchParams} />
        <NavGroup title="Медиа и настройки" items={MORE} pathname={pathname} currentSearchParams={currentSearchParams} />
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
