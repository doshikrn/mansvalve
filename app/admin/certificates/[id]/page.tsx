import Link from "next/link";
import { notFound } from "next/navigation";

import { CertificateForm } from "@/components/admin/CertificateForm";
import { Button } from "@/components/ui/button";
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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  await requireAdmin(`/admin/certificates/${id}`);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {certificate.title}
          </h1>
          <p className="text-xs text-muted-foreground">id {certificate.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/certificates">← К списку</Link>
          </Button>
          <form action={boundDelete}>
            <Button type="submit" variant="destructive" size="sm">
              Удалить
            </Button>
          </form>
        </div>
      </div>

      <CertificateForm
        action={boundUpdate}
        certificate={certificate}
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
