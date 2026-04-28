import "server-only";

import { COMPANY } from "@/lib/company";
import { isDatabaseConfigured } from "@/lib/db/client";
import { getContentBlock } from "@/lib/services/content-blocks";

import { SITE_CONTENT_KEYS } from "./keys";
import {
  mergeAboutCopy,
  mergeAboutMeta,
  mergeAboutPage,
  mergeCertificatesPage,
  mergeContactsCopy,
  mergeContactsMeta,
  mergeContactsPage,
  mergeDeliveryPage,
  mergeFooterMain,
  mergeFooterPreCta,
  mergeFooterTrustBar,
  mergeHeaderTopNav,
  mergeHomeCategories,
  mergeHomeDeliveryCase,
  mergeHomeFaq,
  mergeHomeHero,
  mergeHomeHowItWorks,
  mergeHomeMeta,
  mergeHomeProductShowcases,
  mergeHomeWhoWeSupply,
  mergeHomeWhyUs,
  mergePrivacyPage,
  mergeRequestCta,
  mergeTermsPage,
  mergeTrustStrip,
  type AboutCopyContent,
  type AboutPageContent,
  type CertificatesPageContent,
  type ContactsCopyContent,
  type ContactsPageContent,
  type DeliveryPageContent,
  type FooterMainContent,
  type FooterPreCtaContent,
  type FooterTrustBarContent,
  type HeaderTopNavContent,
  type HomeCategoriesContent,
  type HomeDeliveryCaseContent,
  type HomeFaqContent,
  type HomeHeroContent,
  type HomeHowItWorksContent,
  type HomeMetaContent,
  type HomeProductShowcasesContent,
  type HomeWhoWeSupplyContent,
  type HomeWhyUsContent,
  type PageMetaContent,
  type PrivacyPageContent,
  type RequestCtaContent,
  type TermsPageContent,
  type TrustStripContent,
} from "./models";

async function loadData(key: string): Promise<unknown> {
  if (!isDatabaseConfigured()) return undefined;
  try {
    const row = await getContentBlock(key);
    return row?.data ?? undefined;
  } catch {
    return undefined;
  }
}

export async function resolveHomeHero(productCount: number): Promise<HomeHeroContent> {
  const data = await loadData(SITE_CONTENT_KEYS.homeHero);
  return mergeHomeHero(data, productCount);
}

export async function resolveHomeProductShowcases(): Promise<HomeProductShowcasesContent> {
  const data = await loadData(SITE_CONTENT_KEYS.homeProductShowcases);
  return mergeHomeProductShowcases(data);
}

export async function resolveTrustStrip(): Promise<TrustStripContent> {
  const data = await loadData(SITE_CONTENT_KEYS.homeTrustStrip);
  return mergeTrustStrip(data);
}

export async function resolveRequestCta(): Promise<RequestCtaContent> {
  const data = await loadData(SITE_CONTENT_KEYS.homeRequestCta);
  return mergeRequestCta(data);
}

export async function resolveHomeFaq(): Promise<HomeFaqContent> {
  const data = await loadData(SITE_CONTENT_KEYS.homeFaq);
  return mergeHomeFaq(data);
}

export async function resolveHomeMeta(): Promise<HomeMetaContent> {
  const data = await loadData(SITE_CONTENT_KEYS.homeMeta);
  return mergeHomeMeta(data, COMPANY.name);
}

export async function resolveAboutCopy(): Promise<AboutCopyContent> {
  const data = await loadData(SITE_CONTENT_KEYS.aboutCopy);
  return mergeAboutCopy(data);
}

export async function resolveAboutMeta(): Promise<PageMetaContent> {
  const data = await loadData(SITE_CONTENT_KEYS.aboutMeta);
  return mergeAboutMeta(data, COMPANY.name);
}

export async function resolveContactsCopy(): Promise<ContactsCopyContent> {
  const data = await loadData(SITE_CONTENT_KEYS.contactsCopy);
  return mergeContactsCopy(data);
}

export async function resolveContactsMeta(): Promise<PageMetaContent> {
  const data = await loadData(SITE_CONTENT_KEYS.contactsMeta);
  return mergeContactsMeta(data, {
    companyName: COMPANY.name,
    phoneDisplay: COMPANY.phoneDisplay,
    email: COMPANY.email,
    city: COMPANY.address.city,
  });
}

export async function resolveHeaderTopNav(): Promise<HeaderTopNavContent> {
  const data = await loadData(SITE_CONTENT_KEYS.headerTopNav);
  return mergeHeaderTopNav(data);
}

export async function resolveHomeCategories(): Promise<HomeCategoriesContent> {
  const data = await loadData(SITE_CONTENT_KEYS.homeCategories);
  return mergeHomeCategories(data);
}

export async function resolveHomeWhyUs(): Promise<HomeWhyUsContent> {
  const data = await loadData(SITE_CONTENT_KEYS.homeWhyUs);
  return mergeHomeWhyUs(data);
}

export async function resolveHomeHowItWorks(): Promise<HomeHowItWorksContent> {
  const data = await loadData(SITE_CONTENT_KEYS.homeHowItWorks);
  return mergeHomeHowItWorks(data);
}

export async function resolveHomeWhoWeSupply(): Promise<HomeWhoWeSupplyContent> {
  const data = await loadData(SITE_CONTENT_KEYS.homeWhoWeSupply);
  return mergeHomeWhoWeSupply(data);
}

export async function resolveHomeDeliveryCase(): Promise<HomeDeliveryCaseContent> {
  const data = await loadData(SITE_CONTENT_KEYS.homeDeliveryCase);
  return mergeHomeDeliveryCase(data);
}

export async function resolveFooterPreCta(): Promise<FooterPreCtaContent> {
  const data = await loadData(SITE_CONTENT_KEYS.footerPreCta);
  return mergeFooterPreCta(data);
}

export async function resolveFooterTrustBar(): Promise<FooterTrustBarContent> {
  const data = await loadData(SITE_CONTENT_KEYS.footerTrustBar);
  return mergeFooterTrustBar(data);
}

export async function resolveFooterMain(): Promise<FooterMainContent> {
  const data = await loadData(SITE_CONTENT_KEYS.footerMain);
  return mergeFooterMain(data);
}

export async function resolveAboutPage(): Promise<AboutPageContent> {
  const data = await loadData(SITE_CONTENT_KEYS.pageAbout);
  const legacyMeta = await loadData(SITE_CONTENT_KEYS.aboutMeta);
  return mergeAboutPage(data, legacyMeta, COMPANY.name);
}

export async function resolveContactsPage(): Promise<ContactsPageContent> {
  const data = await loadData(SITE_CONTENT_KEYS.pageContacts);
  const legacyMeta = await loadData(SITE_CONTENT_KEYS.contactsMeta);
  const legacyCopy = await loadData(SITE_CONTENT_KEYS.contactsCopy);
  return mergeContactsPage(data, legacyMeta, legacyCopy, {
    companyName: COMPANY.name,
    phoneDisplay: COMPANY.phoneDisplay,
    email: COMPANY.email,
    city: COMPANY.address.city,
  });
}

export async function resolveDeliveryPage(): Promise<DeliveryPageContent> {
  const data = await loadData(SITE_CONTENT_KEYS.pageDelivery);
  return mergeDeliveryPage(data);
}

export async function resolveCertificatesPage(): Promise<CertificatesPageContent> {
  const data = await loadData(SITE_CONTENT_KEYS.pageCertificates);
  return mergeCertificatesPage(data);
}

export async function resolvePrivacyPage(): Promise<PrivacyPageContent> {
  const data = await loadData(SITE_CONTENT_KEYS.pagePrivacy);
  return mergePrivacyPage(data);
}

export async function resolveTermsPage(): Promise<TermsPageContent> {
  const data = await loadData(SITE_CONTENT_KEYS.pageTerms);
  return mergeTermsPage(data);
}
