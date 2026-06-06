import type { LeadAttachmentMeta } from "@/lib/leads/lead-attachment-types";

export function getLeadAttachmentFromAttribution(
  attribution: unknown,
): LeadAttachmentMeta | null {
  if (!attribution || typeof attribution !== "object" || Array.isArray(attribution)) {
    return null;
  }

  const attachment = (attribution as Record<string, unknown>).attachment;
  if (!attachment || typeof attachment !== "object" || Array.isArray(attachment)) {
    return null;
  }

  const record = attachment as Record<string, unknown>;
  const url = typeof record.url === "string" ? record.url.trim() : "";
  const fileName = typeof record.fileName === "string" ? record.fileName.trim() : "";
  if (!url) return null;

  return {
    url,
    fileName: fileName || "Спецификация",
    mimeType:
      typeof record.mimeType === "string" ? record.mimeType : "application/octet-stream",
    sizeBytes: typeof record.sizeBytes === "number" ? record.sizeBytes : 0,
  };
}
