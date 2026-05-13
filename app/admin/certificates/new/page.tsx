import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { CertificateForm } from "@/components/admin/CertificateForm";
import { safeReturnTo } from "@/lib/admin/safe-return-to";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { listRecentMediaAssets } from "@/lib/services/media";

import { createCertificateAction } from "../actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NewCertificatePage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  await requireAdmin("/admin/certificates/new");

  const { returnTo: rawReturn } = await searchParams;
  const listHref = safeReturnTo(rawReturn, "/admin/certificates");
  const listReturnTo = safeReturnTo(rawReturn, "") || null;

  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        База данных не настроена.
      </p>
    );
  }

  const mediaAssets = await listRecentMediaAssets(80);

  return (
    <div className="max-w-3xl space-y-4">
      <AdminBreadcrumbs
        items={[
          { label: "Админка", href: "/admin" },
          { label: "Сертификаты", href: listHref },
          { label: "Новый сертификат" },
        ]}
      />
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Новый сертификат</h1>
        <p className="text-sm text-muted-foreground">
          Добавьте документ и настройте публикацию на странице сертификатов.
        </p>
      </div>

      <CertificateForm
        action={createCertificateAction}
        mediaLibrary={mediaAssets.map((asset) => ({
          id: asset.id,
          url: asset.url,
          mimeType: asset.mimeType,
          sizeBytes: asset.sizeBytes,
          width: asset.width,
          height: asset.height,
          alt: asset.alt,
          driver: asset.driver,
          createdAt:
            asset.createdAt instanceof Date
              ? asset.createdAt.toISOString()
              : String(asset.createdAt),
          usedInProducts: asset.usedInProducts,
        }))}
        backHref={listHref}
        listReturnTo={listReturnTo}
      />
    </div>
  );
}
