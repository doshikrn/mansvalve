import { cn } from "@/lib/utils";

type Props = {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export function AdminSectionCard({
  id,
  title,
  description,
  badge,
  children,
  defaultOpen = true,
  className,
}: Props) {
  return (
    <details
      id={id}
      open={defaultOpen}
      className={cn(
        "group scroll-mt-24 rounded-xl border border-border bg-background shadow-sm",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-xl px-4 py-4 outline-none transition hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring">
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold tracking-tight">{title}</span>
            {badge ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {badge}
              </span>
            ) : null}
          </span>
          {description ? (
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              {description}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 shrink-0 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground group-open:hidden">
          Открыть
        </span>
        <span className="mt-0.5 hidden shrink-0 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground group-open:inline">
          Свернуть
        </span>
      </summary>
      <div className="space-y-4 border-t border-border px-4 pb-5 pt-4">
        {children}
      </div>
    </details>
  );
}
