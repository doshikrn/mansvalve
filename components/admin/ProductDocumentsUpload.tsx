"use client";

import { useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { MediaLibraryItem } from "@/components/admin/MediaUpload";

type DocumentKind = "specification" | "questionnaire" | "documentation";

type SelectedDocument = {
  mediaId: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  alt: string | null;
  storageKey?: string;
};

type Props = {
  library: MediaLibraryItem[];
  initial: {
    specification: SelectedDocument | null;
    questionnaire: SelectedDocument | null;
    documentation: SelectedDocument | null;
  };
  hiddenInputName?: string;
  uploadFolder?: string;
};

const ACCEPTED_DOC_EXT = ".pdf,.doc,.docx,.xls,.xlsx";

const FIELD_META: Record<DocumentKind, { title: string; button: string }> = {
  specification: {
    title: "Файл-спецификация",
    button: "Скачать файл-спецификацию",
  },
  questionnaire: {
    title: "Опросный лист",
    button: "Скачать опросный лист",
  },
  documentation: {
    title: "Документация",
    button: "Документация",
  },
};

export function ProductDocumentsUpload({
  library,
  initial,
  hiddenInputName = "documentsPayload",
  uploadFolder = "products/documents",
}: Props) {
  const [selected, setSelected] = useState(initial);
  const [activePicker, setActivePicker] = useState<DocumentKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<DocumentKind | null>(null);

  const fileInputRefs = {
    specification: useRef<HTMLInputElement | null>(null),
    questionnaire: useRef<HTMLInputElement | null>(null),
    documentation: useRef<HTMLInputElement | null>(null),
  };

  const payload = useMemo(
    () =>
      JSON.stringify({
        specificationMediaId: selected.specification?.mediaId ?? null,
        questionnaireMediaId: selected.questionnaire?.mediaId ?? null,
        documentationMediaId: selected.documentation?.mediaId ?? null,
      }),
    [selected],
  );

  function setDocument(kind: DocumentKind, doc: SelectedDocument | null) {
    setSelected((prev) => ({ ...prev, [kind]: doc }));
    setActivePicker(null);
  }

  async function handleUpload(kind: DocumentKind, file: File) {
    setError(null);
    setUploading(kind);
    try {
      const uploaded = await uploadDocument(file, uploadFolder);
      setDocument(kind, uploaded);
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Не удалось загрузить документ.";
      setError(message);
    } finally {
      setUploading(null);
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-border bg-background p-4">
      <div>
        <h3 className="text-sm font-semibold tracking-tight">Документы товара</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Для каждой позиции можно прикрепить отдельный файл: спецификацию, опросный
          лист и документацию.
        </p>
      </div>

      <input type="hidden" name={hiddenInputName} value={payload} />

      <div className="grid gap-3">
        {(Object.keys(FIELD_META) as DocumentKind[]).map((kind) => {
          const current = selected[kind];
          const isUploading = uploading === kind;
          return (
            <div key={kind} className="rounded-lg border border-border p-3">
              <p className="text-sm font-medium">{FIELD_META[kind].title}</p>
              {current ? (
                <div className="mt-1">
                  <p className="truncate text-xs text-muted-foreground">
                    {describeFile(current)}
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Файл не прикреплен.</p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isUploading}
                  onClick={() => fileInputRefs[kind].current?.click()}
                >
                  {isUploading ? "Загрузка…" : "Загрузить файл"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setActivePicker((prev) => (prev === kind ? null : kind))}
                >
                  Выбрать из библиотеки
                </Button>
                {current ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => setDocument(kind, null)}
                  >
                    Убрать
                  </Button>
                ) : null}
              </div>

              <input
                ref={fileInputRefs[kind]}
                type="file"
                accept={ACCEPTED_DOC_EXT}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.currentTarget.value = "";
                  if (!file) return;
                  void handleUpload(kind, file);
                }}
              />

              {activePicker === kind ? (
                <div className="mt-3 max-h-40 overflow-y-auto rounded-md border border-border">
                  {library.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-muted-foreground">
                      Библиотека документов пуста.
                    </p>
                  ) : (
                    library.map((item) => (
                      <button
                        key={`${kind}-${item.id}`}
                        type="button"
                        onClick={() =>
                          setDocument(kind, {
                            mediaId: item.id,
                            url: item.url,
                            mimeType: item.mimeType,
                            sizeBytes: item.sizeBytes,
                            alt: item.alt,
                            storageKey: item.storageKey,
                          })
                        }
                        className="flex w-full items-center justify-between gap-2 border-b border-border px-3 py-2 text-left text-xs last:border-b-0 hover:bg-muted/50"
                      >
                        <span className="truncate">
                          {describeFile({
                            mediaId: item.id,
                            url: item.url,
                            mimeType: item.mimeType,
                            sizeBytes: item.sizeBytes,
                            alt: item.alt,
                            storageKey: item.storageKey,
                          })}
                        </span>
                        <span className="shrink-0 text-muted-foreground">
                          {formatBytes(item.sizeBytes)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </section>
  );
}

function describeFile(item: SelectedDocument): string {
  const fromAlt = item.alt?.trim();
  if (fromAlt) return fromAlt;
  const storageTail = item.storageKey?.split("/").pop();
  if (storageTail) return storageTail;
  const urlTail = item.url.split("/").pop();
  return urlTail || item.mediaId;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function uploadDocument(
  file: File,
  folder: string,
): Promise<SelectedDocument> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/admin/media", {
    method: "POST",
    body: formData,
  });
  const body = (await response.json().catch(() => null)) as
    | {
        ok?: boolean;
        error?: string;
        asset?: {
          id: string;
          url: string;
          mimeType: string;
          sizeBytes: number;
          alt: string | null;
          storageKey?: string;
        };
      }
    | null;

  if (!response.ok || body?.ok !== true || !body.asset) {
    throw new Error(body?.error || "Не удалось загрузить файл.");
  }

  return {
    mediaId: body.asset.id,
    url: body.asset.url,
    mimeType: body.asset.mimeType,
    sizeBytes: body.asset.sizeBytes,
    alt: body.asset.alt,
    storageKey: body.asset.storageKey,
  };
}
