"use client";

import { useMemo, useRef, useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type MediaUrlOption = {
  id: string;
  url: string;
  mimeType: string;
  alt: string | null;
};

type Props = {
  label: string;
  name: string;
  defaultValue: string;
  initialLibrary: MediaUrlOption[];
  description?: string;
  uploadFolder?: string;
};

type UploadedAsset = {
  id: string;
  url: string;
  mimeType: string;
  alt: string | null;
};

export function MediaUrlField({
  label,
  name,
  defaultValue,
  initialLibrary,
  description,
  uploadFolder = "content",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState(defaultValue);
  const [library, setLibrary] = useState(initialLibrary);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageLibrary = useMemo(
    () => library.filter((asset) => asset.mimeType.startsWith("image/")),
    [library],
  );
  const selectedAsset = imageLibrary.find((asset) => asset.url === value);

  async function uploadFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Можно загрузить только изображение.");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", uploadFolder);
    formData.set("alt", label);

    setUploading(true);
    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as
        | { ok: true; asset: UploadedAsset }
        | { ok: false; error?: string };

      if (!response.ok || !payload.ok) {
        setError(!payload.ok && payload.error ? payload.error : "Не удалось загрузить изображение.");
        return;
      }

      setLibrary((current) => [payload.asset, ...current]);
      setValue(payload.asset.url);
      setOpen(false);
    } catch {
      setError("Не удалось загрузить изображение.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-[#E2E8F0] bg-white p-3">
      <div className="space-y-1">
        <Label htmlFor={name} className="text-slate-700">
          {label}
        </Label>
        {description ? <p className="text-xs leading-relaxed text-slate-500">{description}</p> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-[96px,1fr]">
        <div className="flex h-20 w-24 items-center justify-center overflow-hidden rounded-lg border border-[#E2E8F0] bg-slate-50">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={selectedAsset?.alt ?? label} className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-slate-300" aria-hidden />
          )}
        </div>
        <div className="space-y-2">
          <input
            id={name}
            name={name}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="/images/example.webp"
            className="flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-slate-900 shadow-sm"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="inline-flex h-9 items-center rounded-lg border border-[#CBD5E1] px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Выбрать из медиатеки
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-3 text-xs font-medium text-white transition hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden />
              {uploading ? "Загрузка..." : "Загрузить"}
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => setValue("")}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                Очистить
              </button>
            ) : null}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) void uploadFile(file);
            }}
          />
        </div>
      </div>

      {open ? (
        <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto rounded-lg border border-[#E2E8F0] bg-slate-50 p-2 sm:grid-cols-5">
          {imageLibrary.length ? (
            imageLibrary.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => {
                  setValue(asset.url);
                  setOpen(false);
                }}
                className={cn(
                  "group aspect-square overflow-hidden rounded-md border bg-white ring-offset-2 transition hover:border-[#1D4ED8] hover:ring-2 hover:ring-blue-100",
                  asset.url === value ? "border-[#1D4ED8] ring-2 ring-blue-100" : "border-[#E2E8F0]",
                )}
                title={asset.alt ?? asset.url}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.url} alt={asset.alt ?? ""} className="h-full w-full object-cover" />
              </button>
            ))
          ) : (
            <p className="col-span-full px-2 py-6 text-center text-xs text-slate-500">
              В медиатеке пока нет изображений. Загрузите файл здесь или в разделе «Медиа».
            </p>
          )}
        </div>
      ) : null}

      {error ? <p className="text-xs font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
