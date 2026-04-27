import Link from "next/link";

import { CertificateForm } from "@/components/admin/CertificateForm";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { listRecentMediaAssets } from "@/lib/services/media";

import { createCertificateAction } from "../actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NewCertificatePage() {
  await requireAdmin("/admin/certificates/new");

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Новый сертификат</h1>
          <p className="text-sm text-muted-foreground">
            Добавьте документ и настройте публикацию на странице сертификатов.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/certificates">← К списку</Link>
        </Button>
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
      />
    </div>
  );
}
