import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CopyToClipboard } from "@/components/contacts/CopyToClipboard";
import { COMPANY } from "@/lib/company";
import { applyPlaceholders, applySiteBrandingPlaceholders } from "@/lib/site-content/models";
import { resolvePrivacyPage } from "@/lib/site-content/public";

function brandInput() {
  return {
    companyName: COMPANY.name,
    legalName: COMPANY.legalName,
    addressFull: COMPANY.address.full,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const p = await resolvePrivacyPage();
  const b = brandInput();
  const title = applySiteBrandingPlaceholders(applyPlaceholders(p.metaTitle, b.companyName), b);
  const description = applySiteBrandingPlaceholders(
    applyPlaceholders(p.metaDescription, b.companyName),
    b,
  );
  const ogDesc = applySiteBrandingPlaceholders(
    applyPlaceholders(p.ogDescription, b.companyName),
    b,
  );
  const twDesc = applySiteBrandingPlaceholders(
    applyPlaceholders(p.twitterDescription, b.companyName),
    b,
  );
  const socialTitle = `${title} | ${COMPANY.name}`;
  return {
    title,
    description,
    alternates: {
      canonical: "/privacy",
    },
    openGraph: {
      title: socialTitle,
      description: ogDesc,
      url: "/privacy",
      siteName: COMPANY.name,
      locale: "ru_KZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: twDesc,
    },
  };
}

export default async function PrivacyPage() {
  const p = await resolvePrivacyPage();
  const b = brandInput();
  const subtitle = applySiteBrandingPlaceholders(
    applyPlaceholders(p.subtitleTemplate, b.companyName),
    b,
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-12">
          <nav aria-label="Хлебные крошки" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm">
              <li>
                <Link href="/" className="text-slate-500 transition-colors hover:text-slate-900">
                  Главная
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-400" />
              </li>
              <li>
                <span className="font-medium text-slate-900" aria-current="page">
                  {p.breadcrumbLabel}
                </span>
              </li>
            </ol>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {p.h1}
          </h1>
          <p className="mt-2 text-slate-500">{subtitle}</p>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="prose prose-slate max-w-none text-slate-600">
          {p.introParagraphs.map((para, i) => (
            <p key={`intro-${i}`}>
              {applySiteBrandingPlaceholders(applyPlaceholders(para, b.companyName), b)}
            </p>
          ))}

          {p.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="!mt-10 text-xl font-semibold text-slate-900">{section.heading}</h2>
              {section.bodyParagraphs.map((para, i) => (
                <p key={`${section.heading}-p-${i}`}>
                  {applySiteBrandingPlaceholders(applyPlaceholders(para, b.companyName), b)}
                </p>
              ))}
              {section.bullets && section.bullets.length > 0 ? (
                <ul>
                  {section.bullets.map((item) => (
                    <li key={item}>
                      {applySiteBrandingPlaceholders(applyPlaceholders(item, b.companyName), b)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <h2 className="!mt-10 text-xl font-semibold text-slate-900">{p.contact.sectionHeading}</h2>
          <p>
            {applySiteBrandingPlaceholders(
              applyPlaceholders(p.contact.intro, b.companyName),
              b,
            )}
          </p>
          <ul>
            <li>
              электронная почта:{" "}
              <CopyToClipboard
                variant="minimal"
                value={COMPANY.email}
                messageForCopyToast={COMPANY.email}
                kind="email"
                className="text-site-primary-hover"
              >
                {COMPANY.email}
              </CopyToClipboard>
              .
            </li>
            <li>
              телефон:{" "}
              <CopyToClipboard
                variant="minimal"
                value={COMPANY.phoneE164}
                messageForCopyToast={COMPANY.phoneDisplay}
                kind="phone"
                className="text-site-primary-hover"
              >
                {COMPANY.phoneDisplay}
              </CopyToClipboard>
              .
            </li>
          </ul>
          <p>
            {applySiteBrandingPlaceholders(
              applyPlaceholders(p.contact.outro, b.companyName),
              b,
            )}
          </p>
        </div>
      </article>
    </div>
  );
}
