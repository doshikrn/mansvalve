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
    <section className="site-industrial-shell border-b border-white/[0.06]">
      <Image
        src="/images/category-zadvizhki.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none absolute inset-0 object-cover opacity-[0.16] mix-blend-screen"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#061024_0%,rgba(6,16,36,0.92)_35%,rgba(6,16,36,0.58)_62%,#061024_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-[20%] top-0 h-full w-[70%] bg-gradient-to-r from-[rgb(47_107_255_/_.08)] via-transparent to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 top-1/2 h-[min(120%,900px)] w-[min(100vw,720px)] -translate-y-1/2 rounded-full opacity-[0.20]"
        style={{
          background: "radial-gradient(circle at center, #2F6BFF 0%, transparent 68%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_62%_at_96%_16%,rgba(34,197,94,0.08)_0%,rgba(34,197,94,0.02)_36%,transparent_62%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.02)_45%,rgba(255,255,255,0.04)_100%)] lg:block"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(226,232,240,0.32) 1px, transparent 1px), linear-gradient(90deg, rgba(226,232,240,0.32) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />
      <div className="site-container relative py-10 sm:py-14 lg:py-16">
        <div className="grid gap-9 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.9fr)] lg:items-center lg:gap-10 xl:gap-12">
          <div className="hero-enter-left">
            <div className="site-industrial-chip mb-5 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition-colors duration-300 hover:border-[#2F6BFF]/35">
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

          <div
            className="hero-enter-right site-featured-radius flex flex-col overflow-hidden border border-white/[0.14] bg-[#07111f]"
            style={{ boxShadow: "var(--shadow-site-showcase)" }}
          >
            <div className="relative min-h-[240px] flex-1 sm:min-h-[300px] lg:min-h-[340px]">
              <Image
                src="/задвижки.png"
                alt="Промышленная трубопроводная арматура MANSVALVE GROUP"
                fill
                priority
                quality={88}
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,16,36,0.2)_0%,rgba(6,16,36,0.08)_42%,rgba(6,16,36,0.42)_100%)]" aria-hidden />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_30%,rgba(47,107,255,0.14),transparent_38%)]" aria-hidden />
              <div className="absolute left-4 top-4 rounded-lg border border-white/12 bg-[#061024]/92 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white shadow-lg sm:left-5 sm:top-5">
                {heroContent.featuredEyebrow}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 border-t border-white/10 bg-[#061024] p-3 sm:grid-cols-3 sm:gap-2.5 sm:p-4">
              {[
                { title: "ГОСТ / DIN / ISO", desc: "Сертификаты и паспорта", Icon: ShieldCheck },
                { title: "15 минут", desc: "КП в рабочее время", Icon: Clock },
                { title: "B2B / B2G", desc: "Договор, НДС, поставка", Icon: BadgeCheck },
              ].map(({ title, desc, Icon }) => (
                <div
                  key={title}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-3"
                >
                  <Icon className="mb-2 h-4 w-4 text-site-cta" strokeWidth={2} aria-hidden />
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-white">{title}</p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-300">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
