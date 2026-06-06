import "server-only";

import { randomUUID } from "node:crypto";
import path from "node:path";

import type { LeadAttachmentMeta } from "@/lib/leads/lead-attachment-types";
import { validateLeadAttachmentFile } from "@/lib/leads/lead-attachment-shared";
import { getStorageDriver } from "@/lib/storage";

export type { LeadAttachmentMeta } from "@/lib/leads/lead-attachment-types";

export { LEAD_ATTACHMENT_MAX_BYTES, validateLeadAttachmentFile } from "@/lib/leads/lead-attachment-shared";

function sanitizeFileName(name: string): string {
  const base = path.basename(name).replace(/[^\w.\-()+\s\u0400-\u04FF]/gi, "_").trim();
  return base.slice(0, 120) || "specification";
}

export async function uploadLeadAttachment(file: File): Promise<LeadAttachmentMeta> {
  const validationError = validateLeadAttachmentFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const safeName = sanitizeFileName(file.name);
  const ext = path.extname(safeName).toLowerCase() || ".bin";
  const key = `leads/attachments/${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const driver = getStorageDriver();
  const uploaded = await driver.upload({
    key,
    contentType: file.type || "application/octet-stream",
    body: buffer,
  });

  return {
    url: uploaded.url,
    fileName: safeName,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: uploaded.size,
  };
}
