import { slugify } from "@/lib/services/slug";

/**
 * Slug стратегия для импорта/формы:
 *   - если есть `model` + `dn` + `pn` → `{slugify(model)}-dn{dn}-pn{pn}`;
 *   - иначе если есть `model` + `dn` → `{slugify(model)}-dn{dn}`;
 *   - иначе если есть `model` (КСО.К-100-16, 19с38нж и т.п.) — slugify(model);
 *   - иначе fallback на `slugify(name)`.
 *
 * Возвращает пустую строку, если нет ни model, ни name.
 */
export interface SlugBuildInput {
  name?: string | null;
  model?: string | null;
  dn?: number | null | string;
  pn?: number | null | string;
}

export interface SlugFromTitleInput {
  publicTitle?: string | null;
  generatedDisplayName?: string | null;
  name?: string | null;
}

/**
 * Slug из публичного названия для админки / новых товаров:
 * publicTitle → generated display name → внутреннее name.
 */
export function buildProductSlugFromTitle(input: SlugFromTitleInput): string {
  const source =
    (input.publicTitle ?? "").trim() ||
    (input.generatedDisplayName ?? "").trim() ||
    (input.name ?? "").trim();
  return slugify(source);
}

/** Безопасный суффикс при коллизии: `base`, `base-2`, `base-3`, … */
export function appendSlugCollisionSuffix(baseSlug: string, attempt: number): string {
  const base = baseSlug.replace(/-+$/, "");
  if (attempt <= 1) return base;
  return `${base}-${attempt}`;
}

function toIntOrNull(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? Math.trunc(value) : null;
  const parsed = Number.parseInt(String(value).trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildProductSlug(input: SlugBuildInput): string {
  const modelRaw = (input.model ?? "").trim();
  const dn = toIntOrNull(input.dn ?? null);
  const pn = toIntOrNull(input.pn ?? null);

  if (modelRaw) {
    const base = slugify(modelRaw);
    if (base) {
      const parts: string[] = [base];
      if (dn != null) parts.push(`dn${dn}`);
      if (pn != null) parts.push(`pn${pn}`);
      const cleaned = parts.join("-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      if (cleaned) return cleaned;
    }
  }

  const fromName = slugify(input.name ?? "");
  if (fromName) {
    const suffix: string[] = [];
    if (dn != null && !fromName.includes(`dn${dn}`)) suffix.push(`dn${dn}`);
    if (pn != null && !fromName.includes(`pn${pn}`)) suffix.push(`pn${pn}`);
    if (suffix.length) {
      return `${fromName}-${suffix.join("-")}`.replace(/-+/g, "-");
    }
    return fromName;
  }

  return "";
}
