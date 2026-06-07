import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { NotFoundContent } from "@/components/layout/NotFoundContent";
import { PublicMotionProvider } from "@/components/motion/PublicMotionProvider";
import { MotionRuntimeCheck } from "@/components/motion/MotionRuntimeCheck";
import { getPublicCatalogCategories } from "@/lib/public-catalog";
import { resolveHeaderTopNav } from "@/lib/site-content/public";

/**
 * Global 404 for URLs that never matched a `(site)` page. Public marketing
 * routes that call `notFound()` use `app/(site)/not-found.tsx` instead.
 */
export default async function NotFound() {
  const [categories, topNav] = await Promise.all([
    getPublicCatalogCategories(),
    resolveHeaderTopNav(),
  ]);
  const categoryLinks = categories.slice(0, 6).map((c) => ({
    label: c.name,
    href: `/catalog/${c.slug}`,
  }));

  return (
    <PublicMotionProvider>
      <Header categoryLinks={categoryLinks} topBarLinks={topNav.links} />
      <main className="flex-1 bg-site-bg">
        <NotFoundContent />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <MotionRuntimeCheck />
    </PublicMotionProvider>
  );
}
