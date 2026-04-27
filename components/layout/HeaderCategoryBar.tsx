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
    <>
      <div className="hidden border-t border-white/10 bg-[#0c2342] shadow-inner md:block">
        <div className="mx-auto flex max-w-[1320px] items-stretch px-5 sm:px-7 lg:px-10">
          <nav
            className="flex min-h-[56px] w-full items-center gap-1 py-1 lg:min-h-[60px] lg:gap-0"
            aria-label="Категории каталога"
          >
            <Link
              href="/catalog"
              className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 lg:px-4"
            >
              <LayoutGrid className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              Все категории
            </Link>

            <span className="mx-2 hidden h-6 w-px shrink-0 bg-white/20 lg:inline-block" aria-hidden />

            <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-1 lg:flex-nowrap lg:gap-x-0 lg:overflow-x-auto [&::-webkit-scrollbar]:h-1.5">
              {links.map((item) => (
                <li key={item.href} className="shrink-0">
                  <Link
                    href={item.href}
                    className="block whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium text-white/95 transition hover:bg-white/10 lg:px-3.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#0c2342] md:hidden">
        <div className="mx-auto flex max-w-[1320px] items-center px-5 py-2 sm:px-7">
          <Link
            href="/catalog"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
          >
            <LayoutGrid className="h-4 w-4" aria-hidden />
            Каталог и категории
          </Link>
        </div>
      </div>
    </>
  );
}
