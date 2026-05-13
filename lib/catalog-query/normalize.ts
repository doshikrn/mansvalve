import type { PublicCatalogProduct } from "@/lib/public-catalog/types";

const CYR_TO_LAT: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

const LAT_TO_CYR_PATTERNS: Array<[RegExp, string]> = [
  [/sch/g, "щ"],
  [/sh/g, "ш"],
  [/ch/g, "ч"],
  [/zh/g, "ж"],
  [/yu/g, "ю"],
  [/ya/g, "я"],
  [/yo/g, "е"],
  [/kh/g, "х"],
  [/ts/g, "ц"],
  [/nzh/g, "нж"],
  [/br/g, "бр"],
  [/([0-9])s([0-9])/g, "$1с$2"],
  [/([0-9])c([0-9])/g, "$1с$2"],
];

const TERM_SYNONYMS: Array<[RegExp, string]> = [
  [/(^|[^a-z\u0430-\u044f0-9])ду\s*(\d+)/gi, "$1 dn$2 "],
  [/(^|[^a-z\u0430-\u044f0-9])ру\s*(\d+)/gi, "$1 pn$2 "],
  [/\bdu\s*(\d+)/gi, " dn$1 "],
  [/\bду\s*(\d+)/gi, " dn$1 "],
  [/\bdy\s*(\d+)/gi, " dn$1 "],
  [/\bdn\s*(\d+)/gi, " dn$1 "],
  [/\bru\s*(\d+)/gi, " pn$1 "],
  [/\bру\s*(\d+)/gi, " pn$1 "],
  [/\bpn\s*(\d+)/gi, " pn$1 "],
  [/под\s+сварку/gi, " под приварку "],
  [/приварн\w*/gi, " под приварку "],
  [/weld(?:ed|ing)?/gi, " под приварку "],
  [/flange\w*/gi, " фланцевое фланцевая "],
  [/фланц\w*/gi, " фланцевое фланцевая "],
  [/резин\w*\s+клин/gi, " обрезиненный клин "],
  [/обрезин\w*/gi, " обрезиненный клин "],
  [/cast\s*iron/gi, " чугун "],
  [/steel/gi, " сталь "],
  [/stainless/gi, " нержавеющая сталь "],
];

export type NormalizedCatalogQuery = {
  raw: string;
  text: string;
  compact: string;
  latin: string;
  tokens: string[];
  compactTokens: string[];
  model?: string;
  dn?: number;
  pn?: number;
};

export function normalizeCatalogQuery(value: string | undefined | null): NormalizedCatalogQuery {
  const raw = value?.trim() ?? "";
  const canonical = normalizeText(raw);
  const tokens = tokenize(canonical);
  const compact = compactCode(canonical);
  return {
    raw,
    text: canonical,
    compact,
    latin: transliterateToLatin(canonical),
    tokens,
    compactTokens: tokens.map(compactCode).filter(Boolean),
    model: normalizeModelCode(raw),
    dn: parseDn(raw),
    pn: parsePn(raw),
  };
}

export function normalizeText(value: string | undefined | null): string {
  let out = (value ?? "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[‐‑‒–—]/g, "-");

  for (const [pattern, replacement] of LAT_TO_CYR_PATTERNS) {
    out = out.replace(pattern, replacement);
  }
  for (const [pattern, replacement] of TERM_SYNONYMS) {
    out = out.replace(pattern, replacement);
  }

  return out
    .replace(/([a-zа-я])(\d)/gi, "$1 $2")
    .replace(/(\d)([a-zа-я])/gi, "$1 $2")
    .replace(/[^a-zа-я0-9]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(value: string): string[] {
  return normalizeText(value).split(" ").filter(Boolean);
}

export function compactCode(value: string | undefined | null): string {
  return normalizeText(value).replace(/[^a-zа-я0-9]+/gi, "");
}

export function normalizeModelCode(value: string | undefined | null): string | undefined {
  const text = normalizeText(value);
  const compact = compactCode(text);
  const known = ["30ч6бр", "30ч39р", "30с41нж", "30с64нж"];
  const hit = known.find((model) => compact.includes(model));
  if (hit) return hit;

  const candidate = compact.match(/\d{2}[чс][0-9]{1,3}[а-я]{1,3}/u)?.[0];
  return candidate || undefined;
}

export function parseDn(value: string | undefined | null): number | undefined {
  return parseNamedNumber(value, ["dn", "du", "dy", "ду"], 4);
}

export function parsePn(value: string | undefined | null): number | undefined {
  return parseNamedNumber(value, ["pn", "ru", "ру"], 3);
}

export function normalizeConnectionType(value: string | undefined | null): string {
  const n = normalizeText(value);
  if (!n) return "";
  if (n.includes("под приварку")) return "под приварку";
  if (n.includes("межфланцев")) return "межфланцевое";
  if (n.includes("фланцев")) return "фланцевое";
  if (n.includes("муфт") || n.includes("резьб")) return "муфтовое";
  return n;
}

export function normalizeMaterial(value: string | undefined | null): string {
  const n = normalizeText(value);
  if (!n) return "";
  if (n.includes("нержав")) return "нержавеющая сталь";
  if (n.includes("wcb")) return "wcb";
  if (n.includes("сталь") || n.includes("стал")) return "сталь";
  if (n.includes("чугун")) return "чугун";
  return n;
}

export function buildProductQueryText(product: PublicCatalogProduct): string {
  return [
    product.name,
    product.slug,
    product.model,
    product.categoryName,
    product.subcategoryName,
    product.material,
    product.connectionType,
    product.controlType,
    product.shortDescription,
    product.thread,
    product.dn != null ? `dn${product.dn} ду${product.dn}` : "",
    product.pn != null ? `pn${product.pn} ру${product.pn}` : "",
    Object.entries(product.specs ?? {})
      .map(([key, val]) => `${key} ${val}`)
      .join(" "),
  ].join(" ");
}

export function transliterateToLatin(value: string): string {
  return value.replace(/[а-яё]/g, (char) => CYR_TO_LAT[char] ?? char);
}

function parseNamedNumber(
  value: string | undefined | null,
  aliases: string[],
  maxDigits: number,
): number | undefined {
  const aliasPattern = aliases.map(escapeRegExp).join("|");
  const separatedPattern = new RegExp(
    `(?:^|[^a-z0-9\\u0430-\\u044f])(?:${aliasPattern})[\\s-]*(\\d{1,${maxDigits}})(?=$|[^a-z0-9\\u0430-\\u044f])`,
    "iu",
  );

  const direct = (value ?? "").toLowerCase().match(separatedPattern)?.[1];
  if (direct) return Number.parseInt(direct, 10);

  const normalized = normalizeText(value);
  const normalizedHit = normalized.match(separatedPattern)?.[1];
  if (normalizedHit) return Number.parseInt(normalizedHit, 10);

  const compact = compactCode(value);
  const compactPattern = new RegExp(`(?:${aliasPattern})(\\d{1,${maxDigits}})`, "iu");
  const compactHit = compact.match(compactPattern)?.[1];
  return compactHit ? Number.parseInt(compactHit, 10) : undefined;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
