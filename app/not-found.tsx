import Link from "next/link";
import { ArrowRight, Home, Phone, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { COMPANY, COMPANY_PHONE_HREF, buildCompanyWhatsAppUrl } from "@/lib/company";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-site-bg text-site-fg">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-site-primary">
            Ошибка 404
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Страница не найдена
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            Возможно, ссылка устарела или адрес был введен с ошибкой. Перейдите в каталог,
            вернитесь на главную или свяжитесь с менеджером MANSVALVE GROUP.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/catalog">
                <Search className="mr-2 h-4 w-4" />
                Открыть каталог
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                На главную
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href={COMPANY_PHONE_HREF}>
                <Phone className="mr-2 h-4 w-4" />
                {COMPANY.phoneDisplay}
              </a>
            </Button>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Задвижки", href: "/catalog/zadvizhki" },
              { label: "Затворы дисковые", href: "/catalog/zatvory" },
              { label: "Краны шаровые", href: "/catalog/krany-sharovye" },
              { label: "Клапаны обратные", href: "/catalog/klapany" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center justify-between rounded-lg border border-site-border bg-site-card px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-site-primary hover:text-site-primary"
              >
                {link.label}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>

          <p className="mt-8 text-sm text-slate-500">
            Если нужна помощь с подбором, напишите в{" "}
            <a
              href={buildCompanyWhatsAppUrl("Здравствуйте! Нужна помощь с подбором арматуры.")}
              className="font-semibold text-site-primary hover:text-site-primary-hover"
            >
              WhatsApp
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
