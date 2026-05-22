const ALMATY_TIME_ZONE = "Asia/Almaty";

const almatyDateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeZone: ALMATY_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatAlmatyDateTime(value: Date | string | number | null | undefined): string {
  if (value == null) return "—";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return almatyDateTimeFormatter.format(date);
}
