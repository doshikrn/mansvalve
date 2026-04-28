import type { Metadata } from "next";
import { CssReveal } from "@/components/motion/CssReveal";
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
      <Hero />
      <CssReveal>
        <TrustStrip />
      </CssReveal>
      <CssReveal delay={0.04}>
        <Categories />
      </CssReveal>
      <CssReveal delay={0.06}>
        <WhyUs />
      </CssReveal>
      <CssReveal delay={0.04}>
        <WhoWeSupply />
      </CssReveal>
      <CssReveal delay={0.06}>
        <DeliveryCase />
      </CssReveal>
      <CssReveal delay={0.04}>
        <HowItWorks />
      </CssReveal>
      <CssReveal delay={0.06}>
        <RequestCTA />
      </CssReveal>
      <CssReveal delay={0.04}>
        <FAQ />
      </CssReveal>
    </>
  );
}
