import Image from "next/image";
import Link from "next/link";

import { AdminSeoPreview } from "@/components/admin/AdminSeoPreview";
import { Button } from "@/components/ui/button";

export type AdminProductPreviewData = {
  generatedDisplayName: string;
  displayName: string;
  h1: string;
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
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.7fr)]">
      <div className="space-y-4">
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="relative h-48 bg-muted">
            <Image
              src={preview.primaryImageUrl}
              alt={preview.primaryImageAlt}
              fill
              unoptimized
              sizes="(max-width: 1280px) 100vw, 520px"
              className="object-cover"
            />
          </div>
          <div className="space-y-3 p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Карточка каталога
              </p>
              <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug">
                {preview.displayName}
              </h3>
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
      <AdminSeoPreview
        title={preview.seoTitle}
        description={preview.seoDescription}
        url={preview.canonicalUrl}
      />
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
