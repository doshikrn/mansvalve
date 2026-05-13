import { notFound } from "next/navigation";

import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { CertificateForm } from "@/components/admin/CertificateForm";
import { DestructiveConfirmForm } from "@/components/admin/DestructiveConfirmForm";
import { Button } from "@/components/ui/button";
import { safeReturnTo } from "@/lib/admin/safe-return-to";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { getCertificateById } from "@/lib/services/certificates";
import { listRecentMediaAssets } from "@/lib/services/media";

import {
  deleteCertificateAction,
  updateCertificateAction,
} from "../actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EditCertificatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  await requireAdmin(`/admin/certificates/${id}`);

  const { returnTo: rawReturn } = await searchParams;
  const listHref = safeReturnTo(rawReturn, "/admin/certificates");

  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        База данных не настроена.
      </p>
    );
  }

  const [certificate, mediaAssets] = await Promise.all([
    getCertificateById(id),
    listRecentMediaAssets(80),
  ]);
  if (!certificate) notFound();

  const boundUpdate = updateCertificateAction.bind(null, id);
  const boundDelete = deleteCertificateAction.bind(null, id);

  return (
    <div className="max-w-3xl space-y-4">
      <AdminBreadcrumbs
        items={[
          { label: "Админка", href: "/admin" },
          { label: "Сертификаты", href: listHref },
          { label: certificate.title },
        ]}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {certificate.title}
          </h1>
          <p className="text-xs text-muted-foreground">id {certificate.id}</p>
        </div>
        <DestructiveConfirmForm
          action={boundDelete}
          confirmMessage="Удалить этот сертификат? Действие необратимо."
          className="shrink-0"
        >
          <input type="hidden" name="returnTo" value={listHref} />
          <Button type="submit" variant="destructive" size="sm">
            Удалить
          </Button>
        </DestructiveConfirmForm>
      </div>

      <CertificateForm
        action={boundUpdate}
        certificate={certificate}
        backHref={listHref}
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
      />
    </div>
  );
}
