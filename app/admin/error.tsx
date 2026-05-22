"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] segment error", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-amber-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Раздел временно не загрузился</h1>
        <p className="mt-2 text-sm text-slate-600">
          Попробуйте обновить страницу. Если сообщение появляется снова и снова — сообщите
          разработчику.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button type="button" size="sm" onClick={() => reset()}>
            Повторить
          </Button>
          <Button type="button" size="sm" variant="outline" asChild>
            <Link href="/admin">В обзор админки</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
