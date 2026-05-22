"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Debounced `q` in URL for /admin/media — server filters by storage_key / url (partial).
 */
export function MediaLibrarySearch({ initialQ }: { initialQ: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(initialQ);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync controlled input when URL changes (back/forward)
    setValue(params.get("q") ?? "");
  }, [params]);

  useEffect(() => {
    const fromUrl = params.get("q") ?? "";
    if (value === fromUrl) return;
    const t = window.setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      const trimmed = value.trim().slice(0, 200);
      if (trimmed) next.set("q", trimmed);
      else next.delete("q");
      next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 400);
    return () => window.clearTimeout(t);
  }, [value, pathname, router, params]);

  return (
    <div className="flex max-w-md flex-col gap-1">
      <Label htmlFor="media-q" className="text-xs font-medium text-muted-foreground">
        Поиск по имени файла или storage key
      </Label>
      <Input
        id="media-q"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Например zadvizhka, products/…"
        autoComplete="off"
      />
    </div>
  );
}
