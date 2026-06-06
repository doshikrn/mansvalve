import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  FileText,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublicCatalogListingProducts } from "@/lib/public-catalog";
import { resolveHomeHero } from "@/lib/site-content/public";
import { buildCompanyWhatsAppUrl, COMPANY_GMAIL_COMPOSE_KP_URL } from "@/lib/company";

const HERO_BACKGROUND_IMAGE = "/images/hero-background.webp";
const HERO_BACKGROUND_SHARP_IMAGE = "/images/hero-background-sharp.webp";
const HERO_VALVE_MASK =
  "linear-gradient(to right, transparent 0%, transparent 44%, rgba(0,0,0,0.35) 52%, black 64%)";

export async function Hero() {
  const prods = await getPublicCatalogListingProducts();
  const heroContent = await resolveHomeHero(prods.length);

  const stats = [
    { val: heroContent.stat1Val, label: heroContent.stat1Label },
    { val: heroContent.stat2MarketingVal, label: heroContent.stat2Label },
    { val: heroContent.stat3Val, label: heroContent.stat3Label },
  ];

  const statIcons = [Clock, Package, MapPin] as const;
  const trustIcons = [FileText, Truck, BadgeCheck, ShieldCheck] as const;

  return (
    <section className="site-industrial-shell relative overflow-hidden border-b border-white/[0.06] lg:min-h-[min(700px,92vh)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <Image
          src={HERO_BACKGROUND_IMAGE}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="scale-[1.03] object-cover object-[58%_center] motion-reduce:scale-100"
        />
        <div
          className="absolute inset-0"
          style={{
            maskImage: HERO_VALVE_MASK,
            WebkitMaskImage: HERO_VALVE_MASK,
          }}
        >
          <Image
            src={HERO_BACKGROUND_SHARP_IMAGE}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="scale-[1.03] object-cover object-[58%_center] motion-reduce:scale-100"
          />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#061024_0%,rgba(6,16,36,0.94)_40%,rgba(6,16,36,0.72)_58%,rgba(6,16,36,0.42)_78%,rgba(6,16,36,0.28)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_90%_at_18%_42%,rgba(6,16,36,0.55)_0%,transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_72%_at_88%_58%,rgba(47,107,255,0.2)_0%,rgba(47,107,255,0.06)_42%,transparent_72%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-[20%] top-0 h-full w-[70%] bg-gradient-to-r from-[rgb(47_107_255_/_.06)] via-transparent to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(226,232,240,0.32) 1px, transparent 1px), linear-gradient(90deg, rgba(226,232,240,0.32) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />

      <div className="site-container relative z-10 py-10 sm:py-14 lg:py-16 xl:py-[4.5rem]">
        <div className="hero-enter-left max-w-3xl lg:max-w-[min(100%,640px)] xl:max-w-[min(100%,680px)]">
          <div className="site-industrial-chip mb-5 px-4 py-2 text-sm font-semibold transition-colors duration-300 hover:border-[#2F6BFF]/35">
            <MapPin className="h-4 w-4 shrink-0 text-[#2F6BFF]" />
            {heroContent.eyebrow}
          </div>

          <h1 className="mb-4 max-w-3xl text-4xl font-bold leading-[1.03] tracking-tight text-white drop-shadow-[0_18px_36px_rgba(0,0,0,0.32)] sm:text-5xl lg:text-[58px]">
            {heroContent.h1Line1}{" "}
            <span className="text-site-cta">{heroContent.h1Highlight}</span>
          </h1>

          <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-200 sm:text-[17px]">
            {heroContent.subhead}
          </p>

          <div className="relative flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button
              asChild
              size="lg"
              className="site-primary-cta h-auto min-h-[3.5rem] px-8 py-[0.875rem] text-base font-semibold tracking-tight sm:min-h-[3.625rem] sm:text-lg"
            >
              <a
                href={buildCompanyWhatsAppUrl(heroContent.kpWhatsAppMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center"
              >
                {heroContent.primaryCta}
                <ArrowRight className="ml-2.5 h-5 w-5 shrink-0" />
              </a>
            </Button>

            <Link
              href={COMPANY_GMAIL_COMPOSE_KP_URL}
              target="_blank"
              rel="noopener noreferrer"
              prefetch={false}
              className="group inline-flex min-h-[3.5rem] items-center justify-center gap-2 self-start rounded-lg border border-white/14 bg-white/[0.07] px-4 py-2.5 text-sm font-semibold text-slate-100 shadow-sm transition-all duration-300 hover:border-[#2F6BFF]/50 hover:bg-[#2F6BFF]/16 hover:text-white hover:shadow-[0_0_24px_rgb(47_107_255_/_.22)] sm:self-center"
            >
              <FileText className="h-4 w-4 shrink-0 text-[#2F6BFF] transition-colors group-hover:text-white" />
              <span>{heroContent.secondaryCta}</span>
            </Link>
          </div>

          <div className="site-trust-strip mt-6" role="list" aria-label="Преимущества поставщика">
            {heroContent.trustPoints.map((point, i) => {
              const Icon = trustIcons[i % trustIcons.length] ?? FileText;
              return (
                <span key={`${i}-${point.slice(0, 12)}`} className="site-trust-strip-item" role="listitem">
                  <Icon className="h-4 w-4 shrink-0 text-site-cta" aria-hidden strokeWidth={1.8} />
                  <span className="min-w-0">{point}</span>
                </span>
              );
            })}
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {stats.map((s, idx) => {
              const Icon = statIcons[idx] ?? Clock;
              return (
                <div
                  key={s.label}
                  className="site-industrial-proof-card flex gap-3 rounded-lg p-4 transition-colors duration-200 ease-out hover:border-white/18 hover:bg-white/[0.08]"
                >
                  <Icon
                    className="mt-1 h-5 w-5 shrink-0 text-site-soft-blue"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <div className="text-2xl font-bold tabular-nums tracking-tight text-white sm:text-[1.65rem] lg:text-[1.75rem]">
                      {s.val}
                    </div>
                    <div className="mt-1 max-w-[13rem] text-[10px] leading-snug text-white/[0.75] sm:text-[11px]">
                      {s.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
