import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NotFoundContent() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:py-28">
      <p className="text-5xl font-bold tracking-tight text-site-primary sm:text-6xl">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Страница не найдена
      </h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
        Возможно, страница была перемещена или удалена.
      </p>
      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button asChild size="lg" className="min-h-11 px-6">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" aria-hidden />
            На главную
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="min-h-11 px-6">
          <Link href="/catalog">
            В каталог
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}
