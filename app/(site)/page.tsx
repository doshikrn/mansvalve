import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { WhyUs } from "@/components/sections/WhyUs";
import { Categories } from "@/components/sections/Categories";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { ContactHubSection } from "@/components/sections/ContactHubSection";
import { WhoWeSupply } from "@/components/sections/WhoWeSupply";
import { DeliveryCase } from "@/components/sections/DeliveryCase";
import { HomeCertificatesPreview } from "@/components/sections/trust/HomeCertificatesPreview";
import { HomeClientLogos } from "@/components/sections/trust/HomeClientLogos";
import { HomeTestimonials } from "@/components/sections/trust/HomeTestimonials";
import { HomeThankYouLetters } from "@/components/sections/trust/HomeThankYouLetters";
import { HomeTrustCases } from "@/components/sections/trust/HomeTrustCases";
import { COMPANY_BRAND_SEO } from "@/lib/company";
import { resolveHomePage } from "@/lib/site-content/public";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const home = await resolveHomePage();
  const title = home.meta.ogTitle;
  const description = home.meta.ogDescription;
  return {
    title,
    description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: "/",
      siteName: COMPANY_BRAND_SEO,
      locale: "ru_KZ",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function HomePage() {
  return (
    <>
      <div className="home-dark-zone">
        <Hero />
        <Categories />
        <WhyUs />
        <TrustStrip />
        <div className="home-flow-from-dark-band" aria-hidden />
      </div>
      <main className="home-light-zone">
        <WhoWeSupply />
        <HomeClientLogos />
        <HomeTrustCases />
        <HomeCertificatesPreview />
        <HomeTestimonials />
        <HomeThankYouLetters />
        <DeliveryCase />
        <HowItWorks />
        <ContactHubSection />
      </main>
    </>
  );
}
