import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Listing root path to keep context (/catalog or /catalog/category/[slug]) */
  basePath: string;
  /** Current search params to preserve through navigation */
  searchParams: Record<string, string | undefined>;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildHref(page: number): string {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(searchParams)) {
      if (val && key !== "page") params.set(key, val);
    }
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const pages = getPageRange(currentPage, totalPages);

  return (
    <nav
      aria-label="Навигация по каталогу"
      className="mt-8 flex flex-wrap items-center justify-center gap-1.5 rounded-lg border border-site-border bg-white px-3 py-3 shadow-sm"
    >
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-transparent text-slate-600 transition-colors hover:border-site-border hover:bg-slate-50"
          aria-label="Предыдущая страница"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center text-slate-300">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === null ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex h-10 w-8 items-center justify-center text-sm text-slate-400"
          >
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(page)}
            className={cn(
              "flex h-10 min-w-10 items-center justify-center rounded-md border px-2 text-sm font-semibold transition-colors",
              page === currentPage
                ? "border-site-primary bg-site-primary text-white"
                : "border-transparent text-slate-600 hover:border-site-border hover:bg-slate-50",
            )}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        ),
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-transparent text-slate-600 transition-colors hover:border-site-border hover:bg-slate-50"
          aria-label="Следующая страница"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center text-slate-300">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}

/** Produces a compact page range: [1, null, 4, 5, 6, null, 20] */
function getPageRange(
  current: number,
  total: number,
): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, total]);
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.add(i);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | null)[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push(null);
    }
    result.push(sorted[i]);
  }
  return result;
}
