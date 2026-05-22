import { Suspense } from "react";

import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { MediaLibrarySearch } from "@/components/admin/MediaLibrarySearch";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { listMediaAssets } from "@/lib/services/media";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 48;

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  await requireAdmin("/admin/media");
  const params = await searchParams;

  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        База данных не настроена. После настройки можно загружать и управлять
        изображениями здесь.
      </p>
    );
  }

  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const qRaw = params.q?.trim().slice(0, 200) ?? "";
  const media = await listMediaAssets({
    page,
    pageSize: PAGE_SIZE,
    search: qRaw || undefined,
  });
  const lastPage = Math.max(1, Math.ceil(media.total / PAGE_SIZE));

  const library = media.items.map((asset) => ({
    id: asset.id,
    url: asset.url,
    storageKey: asset.storageKey,
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
    usedInCertificates: asset.usedInCertificates ?? 0,
  }));

  const buildPageHref = (p: number) => {
    const sp = new URLSearchParams();
    if (qRaw) sp.set("q", qRaw);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/admin/media?${qs}` : "/admin/media";
  };

  return (
    <div className="space-y-4">
      <AdminBreadcrumbs
        items={[
          { label: "Админка", href: "/admin" },
          { label: "Медиа" },
        ]}
      />
      <header className="space-y-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Медиа</h1>
          <p className="text-sm text-muted-foreground">
            Центральная библиотека изображений и документов для товаров, сертификатов и контентных блоков.
            {qRaw ? (
              <>
                {" "}
                По запросу «{qRaw}»: найдено {media.total}.
              </>
            ) : (
              <> Всего файлов: {media.total}.</>
            )}
          </p>
        </div>
        <Suspense
          fallback={
            <p className="text-xs text-muted-foreground">Загрузка поиска…</p>
          }
        >
          <MediaLibrarySearch initialQ={qRaw} />
        </Suspense>
      </header>

      <MediaUpload
        title="Библиотека медиафайлов"
        initialLibrary={library}
        uploadFolder="content"
        accept="all"
        allowDelete
      />

      {lastPage > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Страница {page} из {lastPage}
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Button asChild variant="outline" size="sm">
                <Link href={buildPageHref(page - 1)}>← Назад</Link>
              </Button>
            ) : null}
            {page < lastPage ? (
              <Button asChild variant="outline" size="sm">
                <Link href={buildPageHref(page + 1)}>Вперёд →</Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
