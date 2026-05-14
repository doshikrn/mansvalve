import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CATALOG_PATH = path.join(process.cwd(), "data", "catalog-products.json");
const CATEGORY_ID = "zadvizhki";
const WELDED_SUBCATEGORY = {
  id: "zadvizhki-pod-privarku",
  name: "Задвижки под приварку",
  slug: "zadvizhki-pod-privarku",
  parentCategory: CATEGORY_ID,
};
const MODEL = "30С41НЖ";
const MODEL_SLUG = "30s41nzh";
const FLANGED_CONNECTION = "Фланцевое";
const WELDED_CONNECTION = "Под приварку";

function cloneProduct(product) {
  return JSON.parse(JSON.stringify(product));
}

function ensureWeldedSubcategory(categories) {
  const gateValves = categories.find((category) => category.id === CATEGORY_ID);
  if (!gateValves) {
    throw new Error(`Category ${CATEGORY_ID} was not found.`);
  }

  const existing = gateValves.subcategories.find(
    (subcategory) => subcategory.id === WELDED_SUBCATEGORY.id,
  );
  if (existing) {
    existing.name = WELDED_SUBCATEGORY.name;
    existing.slug = WELDED_SUBCATEGORY.slug;
    existing.parentCategory = WELDED_SUBCATEGORY.parentCategory;
    return;
  }

  const steelIndex = gateValves.subcategories.findIndex(
    (subcategory) => subcategory.id === "zadvizhki-stalnyye",
  );
  gateValves.subcategories.splice(
    steelIndex >= 0 ? steelIndex + 1 : gateValves.subcategories.length,
    0,
    WELDED_SUBCATEGORY,
  );
}

function normalizeExistingFlangedProduct(product) {
  product.subcategory = product.subcategory || "zadvizhki-stalnyye";
  product.subcategoryName = product.subcategoryName || "Стальные задвижки";
  product.connectionType = FLANGED_CONNECTION;
  product.shortDescription = `${product.name}. Категория: Задвижки. материал сталь. присоединение фланцевое.`;
  product.specs = {
    ...(product.specs ?? {}),
    Присоединение: FLANGED_CONNECTION,
  };
}

function buildWeldedProduct(baseProduct) {
  const dn = Number(baseProduct.dn);
  const pn = Number(baseProduct.pn);
  const slug = `zadvizhka-${MODEL_SLUG}-dn${dn}-pn${pn}-welding`;
  const name = `Задвижка ${MODEL} DN${dn} PN${pn} под приварку`;
  const product = cloneProduct(baseProduct);

  product.id = `welding-${MODEL_SLUG}-dn${dn}-pn${pn}`;
  product.name = name;
  product.slug = slug;
  product.category = CATEGORY_ID;
  product.categoryName = "Задвижки";
  product.subcategory = WELDED_SUBCATEGORY.id;
  product.subcategoryName = WELDED_SUBCATEGORY.name;
  product.connectionType = WELDED_CONNECTION;
  product.controlType = product.controlType || "Ручное";
  product.model = MODEL;
  product.material = product.material || "Сталь";
  product.specs = {
    ...(product.specs ?? {}),
    DN: String(dn),
    PN: String(pn),
    Материал: "Сталь",
    Присоединение: WELDED_CONNECTION,
    "Тип присоединения": WELDED_CONNECTION,
    Модель: MODEL,
  };
  product.shortDescription =
    `${name}. Стальная клиновая задвижка 30С41НЖ под приварку для ` +
    "теплоснабжения, промышленных трубопроводов и нефтегазовой отрасли. " +
    "Присоединение под приварку обеспечивает герметичное сварное соединение.";

  return product;
}

function compareProducts(a, b) {
  return (
    String(a.category).localeCompare(String(b.category), "ru") ||
    String(a.subcategory).localeCompare(String(b.subcategory), "ru") ||
    (a.dn ?? 99999) - (b.dn ?? 99999) ||
    (a.pn ?? 999) - (b.pn ?? 999) ||
    String(a.slug).localeCompare(String(b.slug), "ru", { numeric: true })
  );
}

const raw = await readFile(CATALOG_PATH, "utf8");
const catalog = JSON.parse(raw);

ensureWeldedSubcategory(catalog.categories);

const existingBySlug = new Map(catalog.products.map((product) => [product.slug, product]));
const baseProducts = catalog.products
  .filter((product) => product.model === MODEL && !String(product.slug).endsWith("-welding"))
  .filter((product) => product.dn != null && product.pn != null);

for (const product of baseProducts) {
  normalizeExistingFlangedProduct(product);
}

let created = 0;
let updated = 0;
for (const baseProduct of baseProducts) {
  const weldedProduct = buildWeldedProduct(baseProduct);
  const existing = existingBySlug.get(weldedProduct.slug);
  if (existing) {
    Object.assign(existing, weldedProduct);
    updated += 1;
  } else {
    catalog.products.push(weldedProduct);
    existingBySlug.set(weldedProduct.slug, weldedProduct);
    created += 1;
  }
}

catalog.products.sort(compareProducts);

await writeFile(CATALOG_PATH, JSON.stringify(catalog, null, 2) + "\n", "utf8");
console.log(
  `[catalog] ${WELDED_SUBCATEGORY.name}: created=${created}, updated=${updated}, base=${baseProducts.length}`,
);
