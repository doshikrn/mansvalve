import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import { GlobalClickTracker } from "@/components/analytics/GlobalClickTracker";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { JsonLd } from "@/components/seo/JsonLd";
import { COMPANY } from "@/lib/company";
import { getSiteBaseUrl } from "@/lib/site-url";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/structured-data";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteBaseUrl()),
  title: {
    default: `${COMPANY.name} — трубопроводная арматура, задвижки, краны, клапаны в Казахстане`,
    template: `%s | ${COMPANY.name}`,
  },
  description:
    "B2B поставки трубопроводной арматуры по Казахстану: задвижки, краны, клапаны, затворы DN15–DN1000. КП за 1 день, ГОСТ/DIN/ISO, склад в Алматы, доставка по РК.",
  keywords:
    "задвижки, краны шаровые, затворы, клапаны, промышленная арматура, Казахстан, ГОСТ, DN, PN",
  openGraph: {
    title: `${COMPANY.name} — трубопроводная арматура в Казахстане`,
    description:
      "B2B поставки трубопроводной арматуры: задвижки, краны, клапаны, затворы. КП за 1 день, сертификаты ГОСТ/DIN/ISO, доставка по РК.",
    siteName: COMPANY.name,
    locale: "ru_KZ",
    type: "website",
  },
};

/**
 * Root layout renders only chrome that must appear on every URL under the
 * domain: font, GTM bootstrap, global JSON-LD and click/page_view analytics.
 *
 * Public-site chrome (Header / Footer / FloatingWhatsApp) lives in the
 * `(site)` route group so admin pages don't inherit it. Admin-specific
 * chrome lives in `app/admin/layout.tsx`.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = buildOrganizationJsonLd();
  const webSiteJsonLd = buildWebSiteJsonLd();
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim();
  const hasGtm = Boolean(gtmId);

  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {hasGtm && (
          <Script id="gtm-bootstrap" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}
        {hasGtm && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <JsonLd id="organization-jsonld" data={organizationJsonLd} />
        <JsonLd id="website-jsonld" data={webSiteJsonLd} />
        <GlobalClickTracker />
        <Suspense>
          <PageViewTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
