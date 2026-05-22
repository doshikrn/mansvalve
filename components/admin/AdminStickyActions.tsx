import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  backHref: string;
  backLabel?: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Sticky save/cancel bar for long admin forms (scroll container is admin main).
 */
export function AdminStickyActions({
  backHref,
  backLabel = "Назад",
  children,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 mt-6 flex flex-col gap-3 border-t border-border bg-background/95 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_-18px_rgba(15,23,42,0.18)] backdrop-blur-sm supports-[backdrop-filter]:bg-background/85 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <Button asChild variant="outline" size="sm" className="w-full shrink-0 sm:w-auto">
        <Link href={backHref}>{backLabel}</Link>
      </Button>
    </div>
  );
}
