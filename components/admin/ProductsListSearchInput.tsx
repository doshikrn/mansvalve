"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Keeps `q` in the URL (debounced) so filters survive refresh/back and stay shareable.
 * Other query params are preserved; `page` resets when the search text changes.
 */
export function ProductsListSearchInput({
  name,
  defaultValue,
  placeholder,
  className,
}: {
  name: string;
  defaultValue: string;
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync controlled input when URL changes (back/forward)
    setValue(params.get("q") ?? "");
  }, [params]);

  useEffect(() => {
    const fromUrl = params.get("q") ?? "";
    if (value === fromUrl) return;
    const t = window.setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      const trimmed = value.trim();
      if (trimmed) next.set("q", trimmed);
      else next.delete("q");
      next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 400);
    return () => window.clearTimeout(t);
  }, [value, pathname, router, params]);

  return (
    <input
      type="search"
      name={name}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      className={className}
    />
  );
}
