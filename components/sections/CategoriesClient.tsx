"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    <section className="relative mt-[60px] mb-[80px] overflow-hidden bg-transparent px-0">
      <div className="site-container relative">
        <motion.div
          className="flex flex-col"
          variants={premiumStaggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={PREMIUM_VIEWPORT}
        >
          <motion.div
            variants={premiumIntroBlock}
            className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="min-w-0">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#2F6BFF]">
                {copy.sectionEyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                {copy.sectionTitle}
              </h2>
              <p className="mt-2 max-w-[760px] text-base leading-relaxed text-slate-400 sm:text-lg">
                {copy.sectionLead}
              </p>
            </div>
            <Link
              href={copy.sectionCtaHref}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-lg border border-[#2F6BFF]/40 bg-[#2F6BFF]/12 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:border-[#2F6BFF]/55 hover:bg-[#2F6BFF]/20 hover:shadow-[0_0_28px_rgb(47_107_255_/_.22)] active:scale-[0.98] sm:self-auto"
            >
              {copy.sectionCtaLabel} <ArrowRight className="h-4 w-4" />
            </Link>
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
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
