import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductShowcaseCarousel } from "@/components/sections/ProductShowcaseCarousel";
import { getPublicCatalogProducts } from "@/lib/public-catalog";
import { pickProductsBySlugs } from "@/lib/product-showcase";
import { resolveHomeProductShowcases } from "@/lib/site-content/public";

export async function Categories() {
  const [products, showcaseContent] = await Promise.all([
    getPublicCatalogProducts(),
    resolveHomeProductShowcases(),
  ]);

  const hits = pickProductsBySlugs(products, showcaseContent.catalogHitSlugs, 7);

  return (
    <section className="site-section">
      <div className="site-container">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="site-eyebrow">Каталог MANSVALVE GROUP</p>
            <h2 className="site-heading mt-2">Хиты продаж каталога</h2>
            <p className="site-copy mt-2 max-w-[760px]">
              Позиции, которые чаще всего запрашивают подрядчики, монтажные
              бригады и промышленные заказчики для комплектации объектов.
              Быстро уточним наличие, срок поставки и комплект документов.
            </p>
          </div>
          <Link href="/catalog" className="site-link-button self-start sm:self-auto">
            Все позиции <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ProductShowcaseCarousel
          products={hits}
          eyebrow="Хит продаж"
          title="Чаще всего выбирают для объектов"
          linkLabel="Каталог"
          linkHref="/catalog"
          variant="catalog"
        />
      </div>
    </section>
  );
}
