import Link from "next/link";

export type AdminBreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: AdminBreadcrumbItem[];
  className?: string;
};

export function AdminBreadcrumbs({ items, className }: Props) {
  if (!items.length) return null;

  return (
    <nav aria-label="Навигация" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 ? (
                <span className="text-muted-foreground/60" aria-hidden>
                  /
                </span>
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="font-medium text-foreground/80 underline-offset-4 hover:text-foreground hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
