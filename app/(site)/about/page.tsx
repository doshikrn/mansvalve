import type { Metadata } from "next";
import Image from "next/image";
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
import {
  applyAboutCounts,
  applyPlaceholders,
  MARKETING_CATALOG_LINK_COUNT,
  resolveAboutStatDisplayValue,
} from "@/lib/site-content/models";
import { resolveAboutCopy, resolveAboutPage } from "@/lib/site-content/public";
import { warnInvalidMediaUrl } from "@/lib/media-url";

const ADVANTAGE_ICONS = [Clock, ShieldCheck, Truck, FileText] as const;
const B2B_ICONS = [Users, Globe, BadgeCheck] as const;

/* ── SEO ──────────────────────────────────────────────────────────── */

export async function generateMetadata(): Promise<Metadata> {
  const about = await resolveAboutPage();
  const socialTitle = `${about.metaTitle} | ${COMPANY.name}`;
  return {
    title: about.metaTitle,
    description: about.metaDescription,
    alternates: {
      canonical: "/about",
    },
    openGraph: {
      title: socialTitle,
      description: about.metaDescription,
      url: "/about",
      siteName: COMPANY.name,
      locale: "ru_KZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: about.metaDescription,
    },
  };
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function AboutPage() {
  const [categories, products, aboutCopy, about] = await Promise.all([
    getPublicCatalogCategories(),
    getPublicCatalogProducts(),
    resolveAboutCopy(),
    resolveAboutPage(),
  ]);
  if (about.headerImageSrc) {
    warnInvalidMediaUrl(about.headerImageSrc, "AboutPage:header");
  }
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
    productsMarketing: MARKETING_CATALOG_LINK_COUNT,
  });
  const h1 = applyPlaceholders(about.h1Template, COMPANY.name);
  const whyTitle = applyPlaceholders(about.whyChooseTitleTemplate, COMPANY.name);
  const statValues = about.statSlots.map((slot) =>
    resolveAboutStatDisplayValue(slot, {
      marketingDisplay: MARKETING_CATALOG_LINK_COUNT,
      categories: categoryCount,
    }),
  );
  const isRemote = (u: string) =>
    u.startsWith("http://") || u.startsWith("https://") || u.startsWith("//");

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
                  {about.breadcrumbCurrent}
                </span>
              </li>
            </ol>
          </nav>

          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {h1}
          </h1>
          <p className="max-w-2xl text-lg text-slate-500">{headerLead}</p>

          {about.headerImageSrc ? (
            <div className="relative mt-8 max-h-72 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <Image
                src={about.headerImageSrc}
                alt=""
                width={1600}
                height={640}
                className="h-auto max-h-72 w-full object-cover"
                unoptimized={isRemote(about.headerImageSrc)}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Overview ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Left — text */}
          <div>
            <h2 className="mb-5 text-2xl font-bold text-slate-900">{about.whoWeTitle}</h2>
            <div className="space-y-4 text-base leading-relaxed text-slate-600">
              {overviewParagraphs.map((para, i) => (
                <p key={`about-p-${i}`}>{para}</p>
              ))}
            </div>
          </div>

          {/* Right — stats */}
          <div className="flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-6">
              {about.statSlots.map((slot, i) => (
                <div
                  key={`${slot.label}-${i}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                  <p className="text-3xl font-bold tracking-tight text-site-primary">
                    {statValues[i]}
                  </p>
                  <p className="mt-1.5 text-sm text-slate-500">{slot.label}</p>
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
              <h2 className="text-2xl font-bold text-slate-900">{about.whatWeSupplyTitle}</h2>
              <p className="mt-2 text-slate-500">{productGroupsLine}</p>
            </div>
            <Link
              href="/catalog"
              className="flex items-center gap-1.5 text-sm font-semibold text-site-primary hover:text-site-primary-hover transition-colors"
            >
              {about.catalogLinkLabel} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalog/category/${cat.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-site-primary hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] transition-colors group-hover:bg-site-primary/10">
                  <Package className="h-6 w-6 text-site-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-site-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {cat.subcategories.length}{" "}
                    {cat.subcategories.length === 1 ? "подкатегория" : "подкатегории"}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-site-primary" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Advantages ──────────────────────────────────────────────── */}
      <div className="border-t border-slate-100 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-10 text-2xl font-bold text-slate-900">{whyTitle}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {about.advantages.map((adv, idx) => {
              const Icon = ADVANTAGE_ICONS[idx] ?? Clock;
              return (
                <div
                  key={`${adv.title}-${idx}`}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-6"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-site-primary/15 text-site-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-900">{adv.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{adv.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── B2B section ─────────────────────────────────────────────── */}
      <div className="border-t border-slate-100 bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            {about.b2bCards.map((card, idx) => {
              const Icon = B2B_ICONS[idx] ?? Users;
              return (
                <div
                  key={`${card.title}-${idx}`}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-7"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF]">
                    <Icon className="h-5 w-5 text-site-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{card.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Certifications strip ─────────────────────────────────────── */}
      <div className="border-t border-slate-100 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-slate-400">
            {about.standardsEyebrow}
          </p>
          <div className="flex flex-wrap gap-4">
            {about.certifications.map(({ label, sub }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3"
              >
                <ShieldCheck className="h-4 w-4 shrink-0 text-site-primary" />
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
      <div className="bg-site-primary py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">{aboutCopy.ctaTitle}</h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-white/90">{aboutCopy.ctaSubtitle}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="rounded-xl bg-white text-base font-semibold text-site-primary-hover hover:bg-[#EFF6FF]"
              asChild
            >
              <Link href="/catalog">
                {about.ctaCatalogLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl border-white/40 text-base font-semibold text-white hover:bg-white/10"
              asChild
            >
              <Link href="/contacts">{about.ctaContactsLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
