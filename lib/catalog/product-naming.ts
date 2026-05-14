export type ProductNamingInput = {
  name: string;
  slug?: string;
  category?: string;
  categoryName?: string;
  subcategory?: string | null;
  subcategoryName?: string | null;
  model?: string | null;
  dn?: number | null;
  pn?: number | null;
  material?: string | null;
  connectionType?: string | null;
  specs?: Record<string, string> | Array<{ key: string; value: string }>;
};

type ProductNameParts = {
  productType: string;
  material: string;
  construction: string;
  feature: string;
  model: string;
  dn: string;
  pn: string;
};

const KNOWN_MODELS: Record<string, string> = {
  "30ч6бр": "30ч6бр",
  "30ч39р": "30ч39р",
  "30с41нж": "30с41нж",
  "30с64нж": "30с64нж",
};

export function formatProductDisplayName(product: ProductNamingInput): string {
  const parts = normalizeProductNameParts(product);
  return uniqueTextParts([
    parts.productType,
    parts.material,
    parts.construction,
    parts.feature,
    parts.model,
    parts.dn,
    parts.pn,
  ]).join(" ");
}

export function formatProductSeoName(product: ProductNamingInput): string {
  return formatProductDisplayName(product);
}

export function normalizeProductNameParts(product: ProductNamingInput): ProductNameParts {
  const rawName = product.name ?? "";
  const searchable = normalizeText(
    [
      rawName,
      product.slug,
      product.category,
      product.categoryName,
      product.subcategory,
      product.subcategoryName,
      product.connectionType,
      stringifySpecs(product.specs),
    ].filter(Boolean).join(" "),
  );
  const model = formatModelForDisplay(product.model) || extractModel(searchable);
  const productType = getProductType(product, searchable);

  return {
    productType,
    material: getMaterialDescriptor(product, productType, searchable),
    construction: getConstructionDescriptor(product, productType, model, searchable),
    feature: getConnectionOrFeatureDescriptor(product, productType, model, searchable),
    model,
    dn: product.dn != null ? `DN${product.dn}` : extractNamedNumber(rawName, "dn"),
    pn: product.pn != null ? `PN${product.pn}` : extractNamedNumber(rawName, "pn"),
  };
}

function getProductType(product: ProductNamingInput, searchable: string): string {
  if (product.category === "zadvizhki" || searchable.includes("задвиж")) return "Задвижка";
  if (product.category === "zatvory" || searchable.includes("затвор")) return "Затвор дисковый";
  if (product.category === "krany-sharovye" || searchable.includes("кран")) return "Кран шаровой";
  if (product.category === "klapany" || searchable.includes("клапан")) return "Клапан обратный";
  if (searchable.includes("фланец")) return "Фланец";
  if (searchable.includes("компенсатор")) return "Компенсатор";
  if (product.category === "elektroprivody" || searchable.includes("электропривод")) return "Электропривод";
  return product.categoryName?.replace(/ы$/u, "а") || firstMeaningfulWord(product.name) || "Товар";
}

function getMaterialDescriptor(
  product: ProductNamingInput,
  productType: string,
  searchable: string,
): string {
  const material = normalizeText(product.material);
  const feminine = productType === "Задвижка";

  if (material.includes("нержав") || searchable.includes("нержав")) {
    return feminine ? "нержавеющая" : "нержавеющий";
  }
  if (material.includes("сталь") || material.includes("стал") || searchable.includes("сталь")) {
    return feminine ? "стальная" : "стальной";
  }
  if (material.includes("чугун") || searchable.includes("чугун")) {
    return feminine ? "чугунная" : "чугунный";
  }
  if (material.includes("wcb") || searchable.includes("wcb")) return "WCB";
  return "";
}

function getConstructionDescriptor(
  product: ProductNamingInput,
  productType: string,
  model: string,
  searchable: string,
): string {
  if (productType !== "Задвижка") return "";
  if (searchable.includes("клинов") || model === "30с41нж" || model === "30с64нж") return "клиновая";
  return "";
}

function getConnectionOrFeatureDescriptor(
  product: ProductNamingInput,
  productType: string,
  model: string,
  searchable: string,
): string {
  if (searchable.includes("обрезин") || model === "30ч39р") return "с обрезиненным клином";
  if (searchable.includes("под приварку") || normalizeText(product.connectionType).includes("под приварку")) {
    return "под приварку";
  }

  const connection = normalizeText(product.connectionType);
  const feminine = productType === "Задвижка";
  if (connection.includes("фланцев")) return feminine ? "фланцевая" : "фланцевый";
  if (connection.includes("межфланцев")) return feminine ? "межфланцевая" : "межфланцевый";
  if (connection.includes("муфт") || connection.includes("резьб")) return feminine ? "муфтовая" : "муфтовый";

  if (productType === "Задвижка" && model === "30ч6бр") return "фланцевая";
  return "";
}

function formatModelForDisplay(model: string | null | undefined): string {
  if (!model) return "";
  const normalized = normalizeText(model).replace(/\s+/g, "");
  return KNOWN_MODELS[normalized] ?? model.toLowerCase();
}

function extractModel(value: string): string {
  const compact = value.replace(/\s+/g, "");
  const hit = Object.keys(KNOWN_MODELS).find((model) => compact.includes(model));
  return hit ? KNOWN_MODELS[hit] : "";
}

function extractNamedNumber(value: string, prefix: "dn" | "pn"): string {
  const aliases = prefix === "dn" ? ["dn", "ду"] : ["pn", "ру"];
  const pattern = new RegExp(`(?:^|[^a-zа-я0-9])(?:${aliases.join("|")})\\s*(\\d{1,4})(?=$|[^a-zа-я0-9])`, "iu");
  const match = normalizeText(value).match(pattern);
  return match?.[1] ? `${prefix.toUpperCase()}${match[1]}` : "";
}

function stringifySpecs(specs: ProductNamingInput["specs"]): string {
  if (!specs) return "";
  if (Array.isArray(specs)) return specs.map((spec) => `${spec.key} ${spec.value}`).join(" ");
  return Object.entries(specs).map(([key, value]) => `${key} ${value}`).join(" ");
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[‐‑‒–—-]+/g, " ")
    .replace(/([a-zа-я])(\d)/gi, "$1 $2")
    .replace(/(\d)([a-zа-я])/gi, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function firstMeaningfulWord(value: string): string {
  return value.trim().split(/\s+/u)[0] ?? "";
}

function uniqueTextParts(parts: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    const clean = part.replace(/\s+/g, " ").trim();
    if (!clean) continue;
    const key = normalizeText(clean);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
  }
  return out;
}
