import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { WhyUs } from "@/components/sections/WhyUs";
import { Categories } from "@/components/sections/Categories";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FAQ } from "@/components/sections/FAQ";
import { RequestCTA } from "@/components/sections/RequestCTA";
import { WhoWeSupply } from "@/components/sections/WhoWeSupply";
import { DeliveryCase } from "@/components/sections/DeliveryCase";
import { COMPANY } from "@/lib/company";
import { resolveHomeMeta } from "@/lib/site-content/public";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await resolveHomeMeta();
  return {
    title: meta.ogTitle,
    description: meta.ogDescription,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: "/",
      siteName: COMPANY.name,
      type: "website",
      locale: "ru_KZ",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.ogTitle,
      description: meta.ogDescription,
    },
  };
}

export default function HomePage() {
  return (
    <>
      <div className="home-flow-strip">
        <Hero />
        <TrustStrip />
        <Categories />
        <WhyUs />
      </div>
      <WhoWeSupply />
      <DeliveryCase />
      <HowItWorks />
      <RequestCTA />
      <FAQ />
    </>
  );
}
