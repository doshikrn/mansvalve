import Link from "next/link";

import { ProductImageFrame } from "@/components/product/ProductImageFrame";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/ui/button";

export type AdminProductPreviewData = {
  generatedDisplayName: string;
  displayName: string;
  h1: string;
  shortDescription: string;
  seoTitle: string;
  seoDescription: string;
  canonicalPath: string;
  canonicalUrl: string;
  primaryImageUrl: string;
  primaryImageAlt: string;
  imageCount: number;
};

type Props = {
  preview: AdminProductPreviewData;
};

export function AdminProductPreview({ preview }: Props) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <ProductImageFrame
          src={preview.primaryImageUrl}
          alt={preview.primaryImageAlt}
          unoptimized
          sizes="(max-width: 1280px) 100vw, 520px"
          className="h-48 rounded-none"
          safeAreaClassName="p-5"
        >
          <div className="absolute left-3 top-3">
            <AdminStatusBadge tone={preview.imageCount > 0 ? "manual" : "auto"}>
              {preview.imageCount > 0 ? "PRIMARY IMAGE" : "FALLBACK IMAGE"}
            </AdminStatusBadge>
          </div>
        </ProductImageFrame>
        <div className="space-y-3 p-4">
          <div>
            <p className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Карточка каталога <AdminStatusBadge tone="readonly" />
            </p>
            <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug">
              {preview.displayName}
            </h3>
            {preview.shortDescription.trim() ? (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {preview.shortDescription}
              </p>
            ) : null}
          </div>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <PreviewRow label="H1" value={preview.h1} />
            <PreviewRow label="Изображений" value={String(preview.imageCount)} />
            <PreviewRow label="Публичный URL" value={preview.canonicalPath} />
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={preview.canonicalUrl} target="_blank" rel="noopener noreferrer">
                Открыть на сайте
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 break-words font-medium text-foreground">{value}</dd>
    </div>
  );
}
