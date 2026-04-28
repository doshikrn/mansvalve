"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ProductShowcaseCarousel } from "@/components/sections/ProductShowcaseCarousel";
import type { PublicCatalogProduct } from "@/lib/public-catalog";
import {
  PREMIUM_VIEWPORT,
  premiumCardBlock,
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
    <section className="site-section">
      <div className="site-container">
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
              <p className="site-eyebrow">{copy.sectionEyebrow}</p>
              <h2 className="site-heading mt-2">{copy.sectionTitle}</h2>
              <p className="site-copy mt-2 max-w-[760px]">{copy.sectionLead}</p>
            </div>
            <Link href={copy.sectionCtaHref} className="site-link-button self-start sm:self-auto">
              {copy.sectionCtaLabel} <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div variants={premiumCardBlock}>
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
