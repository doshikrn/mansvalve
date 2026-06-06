"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import type { HeaderCategoryLink } from "@/components/layout/header-types";

type HeaderCategoryBarProps = {
  links: HeaderCategoryLink[];
};

/**
 * Синяя полоса категорий под основным хедером (визуальный слой как у B2B-референсов).
 */
export function HeaderCategoryBar({ links }: HeaderCategoryBarProps) {
  return (
    <div className="hidden border-t border-white/[0.08] bg-[var(--color-site-header-categories)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] md:block">
      <div className="mx-auto flex max-w-[1320px] items-stretch px-5 sm:px-7 lg:px-10">
        <nav
          className="flex min-h-[52px] w-full flex-wrap items-center gap-x-3 gap-y-2 py-2 lg:min-h-[56px] lg:flex-nowrap lg:gap-x-5 lg:gap-y-0 lg:py-2"
          aria-label="Категории каталога"
        >
          <Link
            href="/catalog"
            className="flex shrink-0 items-center gap-2 rounded-lg bg-site-primary px-4 py-2.5 text-sm font-bold text-white shadow-[0_16px_30px_-22px_rgba(47,107,255,0.85)] ring-1 ring-white/12 transition hover:bg-site-primary-hover hover:ring-white/20 lg:px-5"
          >
            <LayoutGrid className="h-[18px] w-[18px] shrink-0 opacity-95" aria-hidden strokeWidth={2} />
            Все категории
          </Link>

          <span className="hidden h-7 w-px shrink-0 bg-white/25 lg:inline-block" aria-hidden />

          <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 lg:flex-nowrap lg:gap-x-4 lg:overflow-x-auto lg:pb-0.5 [&::-webkit-scrollbar]:h-1.5">
            {links.map((item) => (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                className="block whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-medium text-slate-200 transition hover:bg-white/[0.08] hover:text-white lg:px-3.5 lg:py-2.5 lg:text-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
