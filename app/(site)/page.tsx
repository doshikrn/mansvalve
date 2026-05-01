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
import { COMPANY_BRAND_SEO } from "@/lib/company";
import { resolveHomeMeta } from "@/lib/site-content/public";

const HOME_SEO_TITLE = "MANSVALVE GROUP — промышленная трубопроводная арматура в Казахстане";
const HOME_SEO_DESCRIPTION =
  "MANSVALVE GROUP поставляет промышленную трубопроводную арматуру, инженерное оборудование и комплектующие для предприятий, строительных объектов, ТЭЦ, водоканалов, нефтегазового сектора и государственных закупок. Работаем с B2B-клиентами по всему Казахстану. Подготовим коммерческое предложение за 15 минут в рабочее время.";

export async function generateMetadata(): Promise<Metadata> {
  await resolveHomeMeta();
  return {
    title: HOME_SEO_TITLE,
    description: HOME_SEO_DESCRIPTION,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: HOME_SEO_TITLE,
      description: HOME_SEO_DESCRIPTION,
      url: "/",
      siteName: COMPANY_BRAND_SEO,
      type: "website",
      locale: "ru_KZ",
    },
    twitter: {
      card: "summary_large_image",
      title: HOME_SEO_TITLE,
      description: HOME_SEO_DESCRIPTION,
    },
  };
}

export default function HomePage() {
  return (
    <>
      <div className="home-dark-zone">
        <Hero />
        <TrustStrip />
        <Categories />
        <WhyUs />
        <div className="home-flow-from-dark-band" aria-hidden />
      </div>
      <main className="home-light-zone">
        <WhoWeSupply />
        <DeliveryCase />
        <HowItWorks />
        <RequestCTA />
        <FAQ />
      </main>
    </>
  );
}
