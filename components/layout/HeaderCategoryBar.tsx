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
    <div className="hidden border-t border-white/10 bg-[#0c2342] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:block">
      <div className="mx-auto flex max-w-[1320px] items-stretch px-5 sm:px-7 lg:px-10">
        <nav
          className="flex min-h-[56px] w-full flex-wrap items-center gap-x-4 gap-y-2 py-2 lg:min-h-[60px] lg:flex-nowrap lg:gap-x-6 lg:gap-y-0 lg:py-2.5"
          aria-label="Категории каталога"
        >
          <Link
            href="/catalog"
            className="flex shrink-0 items-center gap-2 rounded-lg bg-white/[0.14] px-4 py-2.5 text-sm font-bold text-white shadow-sm ring-1 ring-white/25 transition hover:bg-white/[0.22] hover:ring-white/40 lg:px-5"
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
                  className="block whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-medium text-white/92 transition hover:bg-white/12 hover:text-white lg:px-4"
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
