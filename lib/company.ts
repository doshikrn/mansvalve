export const COMPANY = {
  name: "Mansvalve Group",
  legalName: 'ТОО "MANSVALVE GROUP"',
  phoneDisplay: "+7 707 272 6369",
  phoneE164: "+77072726369",
  whatsappNumber: "77072726369",
  email: "kmanser.mk@gmail.com",
  address: {
    city: "Алматы",
    street: "ул. Рыскулова 61в",
    full: "г. Алматы, ул. Рыскулова 61в, Алматы, Казахстан",
    /** 2GIS — офис/склад; единый URL для кнопок «Открыть в 2GIS» и ссылок «на карте». */
    mapUrl:
      "https://2gis.kz/almaty/geo/9430047374996383/76.917283%2C43.288387?m=76.917325%2C43.288169%2F17.03",
  },
  bankDetails: {
    bin: "251140003794",
    bankName: "АО «Банк ЦентрКредит»",
    iik: "KZ428562203150268903",
    bik: "KCJBKZKX",
  },
} as const;

export const COMPANY_PHONE_HREF = `tel:${COMPANY.phoneE164}`;
export const COMPANY_EMAIL_HREF = `mailto:${COMPANY.email}`;

/** Digits only, E.164 without + — required by `https://wa.me/<number>`. */
const WHATSAPP_WA_ME_NUMBER = COMPANY.whatsappNumber.replace(/\D/g, "");

export const COMPANY_WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_WA_ME_NUMBER}`;

/**
 * Builds a `wa.me` URL for the company number. Optional message is
 * `encodeURIComponent` in the `text` query (WhatsApp / wa.me expect UTF-8, percent-encoded).
 */
export function buildCompanyWhatsAppUrl(message?: string): string {
  if (!message?.trim()) {
    return COMPANY_WHATSAPP_BASE_URL;
  }

  return `${COMPANY_WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
}

const PRODUCT_INQUIRY_MESSAGE = (name: string, dn?: number | null, pn?: number | null) => {
  const n = name.trim() || "позиция";
  const dnPart = dn != null ? `, DN${dn}` : "";
  const pnPart = pn != null ? ` PN${pn}` : "";
  return `Здравствуйте! Интересует: ${n}${dnPart}${pnPart}. Прошу уточнить наличие и стоимость.`;
};

/** Каталог: карточка товара и страница товара. */
export function buildCompanyProductInquiryWhatsAppUrl(
  name: string,
  options?: { dn?: number | null; pn?: number | null },
): string {
  return buildCompanyWhatsAppUrl(PRODUCT_INQUIRY_MESSAGE(name, options?.dn, options?.pn));
}

const CONTACTS_QUICK_MESSAGE =
  "Здравствуйте! Хочу уточнить детали по поставке промышленной арматуры.";

/** Страница «Контакты» — блок «Написать в WhatsApp». */
export function buildCompanyContactsQuickCardWhatsAppUrl(): string {
  return buildCompanyWhatsAppUrl(CONTACTS_QUICK_MESSAGE);
}
