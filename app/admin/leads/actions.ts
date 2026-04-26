"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/current-user";
import { leadStatusValues } from "@/lib/db/schema";
import { getLeadById, updateLead } from "@/lib/services/leads";

const statusSchema = z.enum(leadStatusValues);

const updateLeadSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: statusSchema,
  internalNote: z.string().max(16_000).optional().default(""),
});

export type UpdateLeadState = { ok: boolean; error?: string };

export async function updateLeadAction(
  _prev: UpdateLeadState | undefined,
  formData: FormData,
): Promise<UpdateLeadState> {
  await requireAdmin("/admin/leads");

  const parsed = updateLeadSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    internalNote: formData.get("internalNote"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().formErrors.join(" ") || "Некорректные данные." };
  }

  const { id, status, internalNote } = parsed.data;
  const existing = await getLeadById(id);
  if (!existing) {
    return { ok: false, error: "Заявка не найдена." };
  }

  await updateLead(id, {
    status,
    internalNote: internalNote.trim() ? internalNote.trim() : null,
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  return { ok: true };
}
