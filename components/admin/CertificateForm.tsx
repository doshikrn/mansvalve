"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  MediaUpload,
  type MediaLibraryItem,
  type SelectedMediaItem,
} from "@/components/admin/MediaUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { CertificateFormState } from "@/app/admin/certificates/actions";
import type { CertificateListItem } from "@/lib/services/certificates";

type Action = (
  state: CertificateFormState,
  formData: FormData,
) => Promise<CertificateFormState>;

type Props = {
  action: Action;
  mediaLibrary: MediaLibraryItem[];
  certificate?: CertificateListItem | null;
};

const INITIAL: CertificateFormState = {};

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CertificateForm({ action, mediaLibrary, certificate }: Props) {
  const [state, runAction] = useActionState(action, INITIAL);

  const initialSelected: SelectedMediaItem[] = certificate
    ? [
        {
          mediaId: certificate.mediaAssetId,
          url: certificate.mediaUrl,
          alt: certificate.mediaAlt ?? "",
          isPrimary: true,
          sortOrder: 0,
        },
      ]
    : [];

  return (
    <form action={runAction} className="space-y-6">
      <section className="space-y-3 rounded-xl border border-border bg-background p-4">
        <h2 className="text-sm font-semibold tracking-tight">Основное</h2>

        <Field
          label="Название сертификата"
          name="title"
          required
          error={state.fieldErrors?.title}
        >
          <Input name="title" defaultValue={certificate?.title ?? ""} required />
        </Field>

        <Field label="Описание" name="description" error={state.fieldErrors?.description}>
          <Textarea
            name="description"
            rows={4}
            defaultValue={certificate?.description ?? ""}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Дата документа" name="issuedAt" error={state.fieldErrors?.issuedAt}>
            <Input
              name="issuedAt"
              type="date"
              defaultValue={toDateInputValue(certificate?.issuedAt ?? null)}
            />
          </Field>
          <Field
            label="Порядок сортировки"
            name="sortOrder"
            error={state.fieldErrors?.sortOrder}
          >
            <Input
              name="sortOrder"
              type="number"
              defaultValue={certificate?.sortOrder ?? 0}
            />
          </Field>
        </div>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={certificate?.isActive ?? true}
            className="size-4 rounded border-border accent-foreground"
          />
          <span>Показывать на публичной странице</span>
        </label>
      </section>

      <section className="space-y-2">
        <MediaUpload
          title="Файл/превью сертификата"
          initialLibrary={mediaLibrary}
          initialSelected={initialSelected}
          hiddenInputName="mediaPayload"
          uploadFolder="certificates"
          allowAttach
          attachOnUpload
        />
        <p className="text-xs text-muted-foreground">
          Используется первое (основное) прикреплённое изображение/документ.
        </p>
        {state.fieldErrors?.mediaPayload ? (
          <p className="text-xs text-destructive">{state.fieldErrors.mediaPayload}</p>
        ) : null}
      </section>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="border-t border-border pt-4">
        <SubmitButton isEdit={Boolean(certificate)} />
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  name,
  required,
  error,
}: {
  label: string;
  children: React.ReactNode;
  name: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? "Сохраняем…"
        : isEdit
          ? "Сохранить изменения"
          : "Создать сертификат"}
    </Button>
  );
}
