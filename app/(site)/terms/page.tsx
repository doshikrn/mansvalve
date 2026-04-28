import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/lib/company";
import { applyPlaceholders, applySiteBrandingPlaceholders } from "@/lib/site-content/models";
import { resolveTermsPage } from "@/lib/site-content/public";

function termsContactLine(text: string) {
  const b = {
    companyName: COMPANY.name,
    legalName: COMPANY.legalName,
    addressFull: COMPANY.address.full,
  };
  return applySiteBrandingPlaceholders(applyPlaceholders(text, COMPANY.name), b)
    .replaceAll("{{EMAIL}}", COMPANY.email)
    .replaceAll("{{PHONE_DISPLAY}}", COMPANY.phoneDisplay);
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await resolveTermsPage();
  const socialTitle = `${t.metaTitle} | ${COMPANY.name}`;
  return {
    title: t.metaTitle,
    description: termsContactLine(t.metaDescription),
    alternates: { canonical: "/terms" },
    openGraph: {
      title: socialTitle,
      description: termsContactLine(t.metaDescription),
      url: "/terms",
      siteName: COMPANY.name,
      locale: "ru_KZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: termsContactLine(t.metaDescription),
    },
  };
}

export default async function TermsPage() {
  const page = await resolveTermsPage();
  const before = applySiteBrandingPlaceholders(
    applyPlaceholders(page.introBeforePrivacyLink, COMPANY.name),
    {
      companyName: COMPANY.name,
      legalName: COMPANY.legalName,
      addressFull: COMPANY.address.full,
    },
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{page.h1}</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-600">
        <p>
          {before}
          <Link href="/privacy" className="font-medium text-site-primary hover:underline">
            {page.privacyLinkLabel}
          </Link>
          {page.introAfterPrivacyLink}
        </p>
        <p>{page.paragraph2}</p>
        <p>{termsContactLine(page.contactLine)}</p>
      </div>
    </div>
  );
}
