export const LEAD_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

function getFileExtension(fileName: string): string {
  const match = fileName.match(/\.[^.\\/]+$/i);
  return match ? match[0].toLowerCase() : "";
}

const ALLOWED_EXTENSIONS = new Set([".pdf", ".xlsx", ".xls", ".docx", ".doc", ".txt"]);

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

export function validateLeadAttachmentFile(file: File): string | null {
  if (file.size <= 0) {
    return "Файл пустой. Выберите другой файл.";
  }

  if (file.size > LEAD_ATTACHMENT_MAX_BYTES) {
    return "Файл слишком большой. Максимальный размер — 10 МБ.";
  }

  const ext = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return "Неподдерживаемый формат. Разрешены: PDF, XLS, XLSX, DOC, DOCX, TXT.";
  }

  const mime = file.type.trim().toLowerCase();
  if (mime && !ALLOWED_MIME_TYPES.has(mime)) {
    return "Неподдерживаемый формат файла.";
  }

  return null;
}
