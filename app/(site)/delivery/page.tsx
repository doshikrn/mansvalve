import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Package, Truck, FileText, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/lib/company";
import { applyPlaceholders } from "@/lib/site-content/models";
import { resolveDeliveryPage } from "@/lib/site-content/public";
import { warnInvalidMediaUrl } from "@/lib/media-url";

const BULLET_ICONS = [Package, Truck, Clock, FileText] as const;

function isRemoteMedia(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//");
}

export async function generateMetadata(): Promise<Metadata> {
  const d = await resolveDeliveryPage();
  const title = applyPlaceholders(d.metaTitle, COMPANY.name);
  const description = applyPlaceholders(d.metaDescription, COMPANY.name);
  const ogDesc = applyPlaceholders(d.ogDescription, COMPANY.name);
  const twDesc = applyPlaceholders(d.twitterDescription, COMPANY.name);
  const socialTitle = `${title} | ${COMPANY.name}`;
  return {
    title,
    description,
    alternates: {
      canonical: "/delivery",
    },
    openGraph: {
      title: socialTitle,
      description: ogDesc,
      url: "/delivery",
      siteName: COMPANY.name,
      locale: "ru_KZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: twDesc,
    },
  };
}

export default async function DeliveryPage() {
  const raw = await resolveDeliveryPage();
  if (raw.pageImageSrc) warnInvalidMediaUrl(raw.pageImageSrc, "DeliveryPage:hero");
  const d = {
    ...raw,
    metaTitle: applyPlaceholders(raw.metaTitle, COMPANY.name),
    metaDescription: applyPlaceholders(raw.metaDescription, COMPANY.name),
    ogDescription: applyPlaceholders(raw.ogDescription, COMPANY.name),
    twitterDescription: applyPlaceholders(raw.twitterDescription, COMPANY.name),
    lead: applyPlaceholders(raw.lead, COMPANY.name),
    calloutIntro: applyPlaceholders(raw.calloutIntro, COMPANY.name),
    footerCheckLine: applyPlaceholders(raw.footerCheckLine, COMPANY.name),
    bullets: raw.bullets.map((b) => ({
      text: applyPlaceholders(b.text, COMPANY.name),
    })),
  };

  return (
    <div className="min-h-screen bg-site-bg">
      <div className="border-b border-site-border bg-site-card">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <p className="text-sm font-medium text-site-primary">{d.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {d.h1}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">{d.lead}</p>
          {d.pageImageSrc ? (
            <div className="relative mt-8 h-80 w-full overflow-hidden rounded-2xl border border-site-border bg-site-bg">
              <Image
                src={d.pageImageSrc}
                alt=""
                fill
                className="object-cover"
                unoptimized={isRemoteMedia(d.pageImageSrc)}
                sizes="(max-width: 1280px) 100vw, 80rem"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-start gap-2 rounded-lg border border-site-border bg-[#EFF6FF] px-4 py-3 text-sm text-slate-700">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-site-primary" aria-hidden />
          <p>
            {d.calloutIntro} <span className="font-medium">{d.calloutCityLabel}</span> — дальнейшая
            логистика по согласованию.
          </p>
        </div>

        <ul className="space-y-4">
          {d.bullets.map(({ text }, idx) => {
            const Icon = BULLET_ICONS[idx] ?? Package;
            return (
              <li key={`${idx}-${text.slice(0, 24)}`} className="flex gap-3 text-slate-700">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-site-bg text-site-primary ring-1 ring-site-border">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <p className="pt-0.5 leading-relaxed">{text}</p>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Check className="h-4 w-4 text-green-600" aria-hidden />
            {d.footerCheckLine}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="bg-site-primary text-white hover:bg-site-primary-hover">
            <Link href="/#request-section">{d.ctaPrimaryLabel}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contacts">{d.ctaSecondaryLabel}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
