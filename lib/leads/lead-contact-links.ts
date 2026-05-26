/**
 * Client-safe helpers for manager contact actions (tel / WhatsApp).
 */

function normalizeWaMeDigits(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;

  let normalized = digits;
  if (normalized.startsWith("8") && normalized.length === 11) {
    normalized = `7${normalized.slice(1)}`;
  } else if (normalized.length === 10) {
    normalized = `7${normalized}`;
  }

  if (!normalized.startsWith("7") || normalized.length < 11) {
    return null;
  }

  return normalized;
}

export function buildLeadTelHref(phone: string): string | null {
  const waDigits = normalizeWaMeDigits(phone);
  if (!waDigits) return null;
  return `tel:+${waDigits}`;
}

export function buildLeadWhatsAppHref(
  phone: string,
  options?: { leadName?: string; leadId?: number },
): string | null {
  const waDigits = normalizeWaMeDigits(phone);
  if (!waDigits) return null;

  const name = options?.leadName?.trim();
  const idPart =
    options?.leadId != null ? ` по вашей заявке №${options.leadId} на сайте` : " по вашей заявке на сайте";
  const message = name
    ? `Здравствуйте, ${name}! MANSVALVE GROUP${idPart}.`
    : `Здравствуйте! MANSVALVE GROUP${idPart}.`;

  return `https://wa.me/${waDigits}?text=${encodeURIComponent(message)}`;
}
