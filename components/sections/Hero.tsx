import Link from "next/link";
import { ArrowRight, Clock, FileText, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductShowcaseCarousel } from "@/components/sections/ProductShowcaseCarousel";
import { getPublicCatalogProducts } from "@/lib/public-catalog";
import { pickProductsBySlugs } from "@/lib/product-showcase";
import { resolveHomeHero, resolveHomeProductShowcases } from "@/lib/site-content/public";
import { buildCompanyWhatsAppUrl, COMPANY_GMAIL_COMPOSE_KP_URL } from "@/lib/company";

export async function Hero() {
  const [prods, showcaseContent] = await Promise.all([
    getPublicCatalogProducts(),
    resolveHomeProductShowcases(),
  ]);
  const heroContent = await resolveHomeHero(prods.length);
  const featured = pickProductsBySlugs(prods, showcaseContent.heroProductSlugs, 5);

  const stats = [
    { val: heroContent.stat1Val, label: heroContent.stat1Label },
    { val: heroContent.stat2MarketingVal, label: heroContent.stat2Label },
    { val: heroContent.stat3Val, label: heroContent.stat3Label },
  ];

  const statIcons = [Clock, Package, MapPin] as const;

  return (
    <section className="relative overflow-hidden border-b border-site-deep bg-site-deep">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(15,27,45,0.98)_0%,rgba(18,40,67,0.98)_48%,rgba(21,49,80,0.95)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_78%_70%_at_-12%_18%,rgba(29,78,216,0.42)_0%,rgba(29,78,216,0.14)_42%,transparent_70%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_62%_at_96%_16%,rgba(234,88,12,0.12)_0%,rgba(234,88,12,0.035)_36%,transparent_62%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.05)_45%,rgba(255,255,255,0.08)_100%)] lg:block"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(226,232,240,0.32) 1px, transparent 1px), linear-gradient(90deg, rgba(226,232,240,0.32) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.5)_0%,transparent_34%,rgba(2,6,23,0.62)_100%)]"
        aria-hidden
      />

      <div className="site-container relative py-16 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.14fr] lg:items-start lg:gap-10 xl:gap-12">
          <div className="hero-enter-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.08] px-4 py-1.5 text-sm font-semibold text-slate-200 shadow-sm">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
              {heroContent.eyebrow}
            </div>

            <h1 className="mb-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[56px]">
              {heroContent.h1Line1}{" "}
              <span className="text-[#bfdbfe]">{heroContent.h1Highlight}</span>
            </h1>

            <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-300 sm:text-[17px]">
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
                className="group inline-flex min-h-[3.5rem] items-center justify-center gap-2 self-start rounded-lg border border-white/15 bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-sm transition-colors hover:border-white/30 hover:bg-white/[0.12] hover:text-white sm:self-center"
              >
                <FileText className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-white" />
                <span>{heroContent.secondaryCta}</span>
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {heroContent.trustPoints.map((point, i) => (
                <span
                  key={`${i}-${point.slice(0, 12)}`}
                  className="rounded-lg border border-white/12 bg-white/[0.07] px-3 py-1 text-xs font-semibold text-slate-200 shadow-sm"
                >
                  {point}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-8 border-t border-white/15 pt-8 sm:flex-row sm:gap-0 sm:divide-x sm:divide-white/15">
              {stats.map((s, idx) => {
                const Icon = statIcons[idx] ?? Clock;
                return (
                  <div
                    key={s.label}
                    className="flex gap-3 rounded-lg transition-colors duration-200 ease-out hover:bg-white/[0.05] motion-reduce:hover:bg-transparent sm:flex-1 sm:px-6 first:sm:pl-0 last:sm:pr-0"
                  >
                    <Icon
                      className="mt-1 h-5 w-5 shrink-0 text-site-cta"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <div className="text-2xl font-bold tabular-nums tracking-tight text-white sm:text-[1.65rem] lg:text-[1.75rem]">
                        {s.val}
                      </div>
                      <div className="mt-1 max-w-[13rem] text-[10px] leading-snug text-slate-400 sm:text-[11px]">
                        {s.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hero-enter-right lg:mt-4 lg:translate-y-2">
            <ProductShowcaseCarousel
              products={featured}
              eyebrow={heroContent.featuredEyebrow}
              title={heroContent.featuredTitle}
              linkLabel="Каталог"
              linkHref="/catalog"
              variant="hero"
              heroRibbonLabel={heroContent.heroShowcaseRibbonLabel}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
