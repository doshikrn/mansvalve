import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { PublicMotionProvider } from "@/components/motion/PublicMotionProvider";
import { MotionRuntimeCheck } from "@/components/motion/MotionRuntimeCheck";
import { getPublicCatalogCategories } from "@/lib/public-catalog";
import { resolveHeaderTopNav } from "@/lib/site-content/public";

/**
 * Layout shared by every page of the public marketing site. Lives in a
 * route group so `/admin/*` pages do not inherit the header/footer chrome.
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, topNav] = await Promise.all([
    getPublicCatalogCategories(),
    resolveHeaderTopNav(),
  ]);
  const categoryLinks = categories.slice(0, 6).map((c) => ({
    label: c.name,
    href: `/catalog/category/${c.slug}`,
  }));

  return (
    <PublicMotionProvider>
      <Header categoryLinks={categoryLinks} topBarLinks={topNav.links} />
      <main className="flex-1 bg-site-bg">{children}</main>
      <Footer />
      <FloatingWhatsApp />
      <MotionRuntimeCheck />
    </PublicMotionProvider>
  );
}
