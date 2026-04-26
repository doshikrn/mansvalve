import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  Truck,
  Clock,
  FileText,
  BadgeCheck,
  ArrowRight,
  Package,
  Users,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPublicCatalogCategories,
  getPublicCatalogProducts,
} from "@/lib/public-catalog";
import { COMPANY } from "@/lib/company";
import { applyAboutCounts, applyPlaceholders } from "@/lib/site-content/models";
import { resolveAboutCopy, resolveAboutMeta } from "@/lib/site-content/public";

/* ── SEO ──────────────────────────────────────────────────────────── */

export async function generateMetadata(): Promise<Metadata> {
  const meta = await resolveAboutMeta();
  const socialTitle = `${meta.title} | ${COMPANY.name}`;
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: "/about",
    },
    openGraph: {
      title: socialTitle,
      description: meta.description,
      url: "/about",
      siteName: COMPANY.name,
      locale: "ru_KZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: meta.description,
    },
  };
}

/* ── Static data ─────────────────────────────────────────────────── */

const ADVANTAGES = [
  {
    icon: Clock,
    title: "Комплект за 1 рабочий день",
    desc: "Подбираем арматуру под ваш объект от DN15 до DN1000 с полным пакетом сертификатов и доставкой по Казахстану.",
  },
  {
    icon: ShieldCheck,
    title: "Гарантия 100% герметичности",
    desc: "Гидроиспытание каждой единицы перед отгрузкой. При обнаружении дефекта — возврат средств в тот же день.",
  },
  {
    icon: Truck,
    title: "Экономия до 25%",
    desc: "Прямые поставки с заводов-изготовителей и собственный склад в Казахстане — без посредников и скрытых наценок.",
  },
  {
    icon: FileText,
    title: "КП под тендер за 2 часа",
    desc: "Готовим коммерческое предложение и спецификацию с гарантией соответствия ГОСТ, DIN и PN-стандартам.",
  },
] as const;

const CERTIFICATIONS = [
  { label: "ГОСТ", sub: "Стандарты СНГ" },
  { label: "DIN", sub: "Немецкий стандарт" },
  { label: "ISO", sub: "Международный" },
  { label: "PN 10–64", sub: "Давления" },
] as const;

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function AboutPage() {
  const [categories, products, aboutCopy] = await Promise.all([
    getPublicCatalogCategories(),
    getPublicCatalogProducts(),
    resolveAboutCopy(),
  ]);
  const categoryCount = categories.length;
  const productCount = products.length;
  const headerLead = applyPlaceholders(aboutCopy.headerLead, COMPANY.name);
  const overviewParagraphs = aboutCopy.overviewParagraphs.map((p) =>
    applyPlaceholders(p, COMPANY.name),
  );
  const productGroupsLine = applyAboutCounts(aboutCopy.productGroupsLine, {
    company: COMPANY.name,
    categories: categoryCount,
    products: productCount,
  });

  const stats = [
    { value: `${productCount}+`, label: "позиции в каталоге" },
    { value: String(categoryCount), label: "категорий арматуры" },
    { value: "DN15–DN1000", label: "диапазон диаметров" },
    { value: "2 ч", label: "подготовка КП" },
  ] as const;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">

          {/* Breadcrumbs */}
          <nav aria-label="Хлебные крошки" className="mb-5">
            <ol className="flex items-center gap-1.5 text-sm">
              <li>
                <Link href="/" className="text-slate-500 hover:text-slate-900 transition-colors">
                  Главная
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-400" />
              </li>
              <li>
                <span className="font-medium text-slate-900" aria-current="page">
                  О компании
                </span>
              </li>
            </ol>
          </nav>

          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            О компании {COMPANY.name}
          </h1>
          <p className="max-w-2xl text-lg text-slate-500">{headerLead}</p>
        </div>
      </div>

      {/* ── Overview ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">

          {/* Left — text */}
          <div>
            <h2 className="mb-5 text-2xl font-bold text-slate-900">
              Кто мы
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-slate-600">
              {overviewParagraphs.map((para, i) => (
                <p key={`about-p-${i}`}>{para}</p>
              ))}
            </div>
          </div>

          {/* Right — stats */}
          <div className="flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-6">
              {stats.map(({ value, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                  <p className="text-3xl font-bold tracking-tight text-blue-700">
                    {value}
                  </p>
                  <p className="mt-1.5 text-sm text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Product groups ───────────────────────────────────────────── */}
      <div className="border-t border-slate-100 bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Что мы поставляем
              </h2>
              <p className="mt-2 text-slate-500">{productGroupsLine}</p>
            </div>
            <Link
              href="/catalog"
              className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-600 transition-colors"
            >
              Открыть каталог <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalog/category/${cat.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 transition-colors group-hover:bg-blue-100">
                  <Package className="h-6 w-6 text-blue-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {cat.subcategories.length}{" "}
                    {cat.subcategories.length === 1 ? "подкатегория" : "подкатегории"}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-blue-500" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Advantages ──────────────────────────────────────────────── */}
      <div className="border-t border-slate-100 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-10 text-2xl font-bold text-slate-900">
            Почему выбирают {COMPANY.name}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ADVANTAGES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-6"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── B2B section ─────────────────────────────────────────────── */}
      <div className="border-t border-slate-100 bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">

            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <Users className="h-5 w-5 text-blue-700" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                Работаем с юридическими лицами
              </h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Заключаем договоры поставки, выставляем счета и накладные,
                предоставляем полный пакет документов для бухгалтерии
                и тендерной документации.
              </p>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <Globe className="h-5 w-5 text-blue-700" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                Доставка по всему Казахстану
              </h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Алматы, Астана, Шымкент, Атырау, Актобе и другие города.
                Доставляем транспортными компаниями и собственным
                автотранспортом со страхованием груза.
              </p>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <BadgeCheck className="h-5 w-5 text-blue-700" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                Сертифицированная продукция
              </h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Каждое изделие сопровождается паспортом качества,
                сертификатом соответствия и протоколом гидроиспытаний.
                Стандарты: ГОСТ, DIN, ISO.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Certifications strip ─────────────────────────────────────── */}
      <div className="border-t border-slate-100 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Стандарты и сертификаты
          </p>
          <div className="flex flex-wrap gap-4">
            {CERTIFICATIONS.map(({ label, sub }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3"
              >
                <ShieldCheck className="h-4 w-4 shrink-0 text-blue-700" />
                <div>
                  <p className="text-sm font-bold text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA banner ──────────────────────────────────────────────── */}
      <div className="bg-blue-700 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
            {aboutCopy.ctaTitle}
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-blue-200">{aboutCopy.ctaSubtitle}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="rounded-xl bg-white text-base font-semibold text-blue-800 hover:bg-blue-50"
              asChild
            >
              <Link href="/catalog">
                Перейти в каталог
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl border-white/40 text-base font-semibold text-white hover:bg-white/10"
              asChild
            >
              <Link href="/contacts">Связаться с нами</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
