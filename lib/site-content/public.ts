import "server-only";

import { COMPANY } from "@/lib/company";
import { isDatabaseConfigured } from "@/lib/db/client";
import { getContentBlock } from "@/lib/services/content-blocks";

import { SITE_CONTENT_KEYS } from "./keys";
import {
  mergeAboutCopy,
  mergeAboutMeta,
  mergeContactsCopy,
  mergeContactsMeta,
  mergeHomeFaq,
  mergeHomeHero,
  mergeHomeMeta,
  mergeHomeProductShowcases,
  mergeRequestCta,
  mergeTrustStrip,
  type AboutCopyContent,
  type ContactsCopyContent,
  type HomeFaqContent,
  type HomeHeroContent,
  type HomeMetaContent,
  type HomeProductShowcasesContent,
  type PageMetaContent,
  type RequestCtaContent,
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
