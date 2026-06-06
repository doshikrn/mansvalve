"use client";

import { motion } from "framer-motion";
import { ProductShowcaseCarousel } from "@/components/sections/ProductShowcaseCarousel";
import type { PublicCatalogProduct } from "@/lib/public-catalog";
import {
  PREMIUM_VIEWPORT,
  premiumIntroBlock,
  premiumStaggerContainer,
} from "@/lib/motion";

export type CategoriesCopy = {
  sectionEyebrow: string;
  sectionTitle: string;
  sectionLead: string;
  sectionCtaHref: string;
  sectionCtaLabel: string;
  carouselEyebrow: string;
  carouselTitle: string;
  carouselLinkLabel: string;
  carouselLinkHref?: string;
  carouselBadgeLabel: string;
};

type CategoriesClientProps = {
  products: PublicCatalogProduct[];
  copy: CategoriesCopy;
};

export function CategoriesClient({ products, copy }: CategoriesClientProps) {
  return (
    <section className="relative overflow-hidden border-t border-slate-200 bg-[#f5f8fc] py-10 sm:py-12 lg:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_18%_0%,rgba(47,107,255,0.08),transparent_58%)]" aria-hidden />
      <div className="site-container relative z-[2]">
        <motion.div
          className="flex flex-col"
          variants={premiumStaggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={PREMIUM_VIEWPORT}
        >
          <motion.div
            variants={premiumIntroBlock}
            className="mb-6 flex flex-col gap-4 sm:mb-8 lg:mb-9"
          >
            <div className="min-w-0">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-site-primary">
                {copy.sectionEyebrow}
              </p>
              <h2 className="mt-2 max-w-3xl text-2xl font-bold tracking-tight text-site-ink sm:text-3xl lg:text-4xl">
                {copy.sectionTitle}
              </h2>
              <p className="mt-2 max-w-[760px] text-base leading-relaxed text-site-muted sm:text-lg">
                {copy.sectionLead}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductShowcaseCarousel
              products={products}
              eyebrow={copy.carouselEyebrow}
              title={copy.carouselTitle}
              linkLabel={copy.carouselLinkLabel}
              linkHref={copy.carouselLinkHref}
              variant="catalog"
              catalogBadgeLabel={copy.carouselBadgeLabel}
              showCatalogButton={false}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
