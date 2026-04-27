"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/current-user";
import {
  createCertificate,
  deleteCertificate,
  updateCertificate,
  type CertificateWritePayload,
} from "@/lib/services/certificates";

const certificateSchema = z.object({
  title: z.string().trim().min(2).max(300),
  description: z.string().trim().max(8000).optional().default(""),
  issuedAt: z
    .union([z.string().trim(), z.literal("")])
    .optional()
    .transform((value) => {
      const raw = typeof value === "string" ? value.trim() : "";
      if (!raw) return null;
      const date = new Date(raw);
      return Number.isNaN(date.getTime()) ? null : date;
    }),
  sortOrder: z.coerce.number().int().optional().transform((v) => v ?? 0),
  isActive: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")])
    .optional()
    .transform((v) => v === "on" || v === "true"),
});

const mediaPayloadSchema = z
  .array(
    z.object({
      mediaId: z.string().uuid(),
      sortOrder: z.number().int().nonnegative().optional().default(0),
      isPrimary: z.boolean().optional().default(false),
    }),
  )
  .min(1);

export type CertificateFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function parseCertificateMedia(formData: FormData): string | null {
  const raw = formData.get("mediaPayload");
  if (typeof raw !== "string" || !raw.trim()) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const result = mediaPayloadSchema.safeParse(parsed);
  if (!result.success) return null;

  const ordered = [...result.data].sort((a, b) => a.sortOrder - b.sortOrder);
  const primary = ordered.find((item) => item.isPrimary);
  return (primary ?? ordered[0])?.mediaId ?? null;
}

function parseForm(formData: FormData):
  | { ok: true; payload: CertificateWritePayload }
  | { ok: false; error: string; fieldErrors?: Record<string, string> } {
  const parsed = certificateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { ok: false, error: "Проверьте форму.", fieldErrors };
  }

  const mediaAssetId = parseCertificateMedia(formData);
  if (!mediaAssetId) {
    return {
      ok: false,
      error: "Выберите сертификат в медиабиблиотеке (или загрузите новый).",
      fieldErrors: { mediaPayload: "Файл сертификата обязателен." },
    };
  }

  return {
    ok: true,
    payload: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      mediaAssetId,
      issuedAt: parsed.data.issuedAt,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    },
  };
}

export async function createCertificateAction(
  _prev: CertificateFormState,
  formData: FormData,
): Promise<CertificateFormState> {
  await requireAdmin("/admin/certificates/new");
  const parsed = parseForm(formData);
  if (!parsed.ok) {
    return { error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  let id: number;
  try {
    id = await createCertificate(parsed.payload);
  } catch (error) {
    console.error("[certificates] create failed", error);
    return { error: "Не удалось создать сертификат." };
  }

  revalidatePath("/certificates");
  revalidatePath("/admin/certificates");
  redirect(`/admin/certificates/${id}`);
}

export async function updateCertificateAction(
  id: number,
  _prev: CertificateFormState,
  formData: FormData,
): Promise<CertificateFormState> {
  await requireAdmin(`/admin/certificates/${id}`);
  const parsed = parseForm(formData);
  if (!parsed.ok) {
    return { error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  try {
    await updateCertificate(id, parsed.payload);
  } catch (error) {
    console.error("[certificates] update failed", error);
    return { error: "Не удалось обновить сертификат." };
  }

  revalidatePath("/certificates");
  revalidatePath("/admin/certificates");
  revalidatePath(`/admin/certificates/${id}`);
  return {};
}

export async function deleteCertificateAction(id: number): Promise<void> {
  await requireAdmin("/admin/certificates");
  try {
    await deleteCertificate(id);
  } catch (error) {
    console.error("[certificates] delete failed", error);
    throw error;
  }

  revalidatePath("/certificates");
  revalidatePath("/admin/certificates");
  redirect("/admin/certificates");
}
