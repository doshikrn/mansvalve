import { resolveCatalogTaxonomySeo } from "@/lib/catalog-taxonomy-seo";
import { buildPagedMeta } from "@/lib/seo/metadata";

type Check = { name: string; pass: boolean; detail?: string };

const checks: Check[] = [];
const check = (name: string, pass: boolean, detail?: string) => {
  checks.push({ name, pass, detail });
};

const slug = "zadvizhki";
const fallback = resolveCatalogTaxonomySeo({
  name: "Задвижки",
  autoH1: "Задвижки",
  autoTitle: "Задвижки — каталог арматуры",
  autoDescription: "Автоматическое описание категории.",
});

check("category fallbacks", fallback.h1 === "Задвижки");
check("auto SEO title fallback", fallback.title === "Задвижки — каталог арматуры");
check(
  "auto SEO description fallback",
  fallback.description === "Автоматическое описание категории.",
);

const manual = resolveCatalogTaxonomySeo({
  name: "Задвижки",
  h1Override: "Промышленные задвижки",
  seoTitle: "Задвижки для трубопроводов",
  seoMetaDescription: "Ручное SEO-описание.",
  autoTitle: "Автоматический Title",
  autoDescription: "Автоматическое описание.",
});

check("manual H1 override", manual.h1 === "Промышленные задвижки");
check("manual SEO Title override", manual.title === "Задвижки для трубопроводов");
check("manual SEO Description override", manual.description === "Ручное SEO-описание.");
check("SEO fields do not mutate slug", slug === "zadvizhki");

const pageTwo = buildPagedMeta({
  title: manual.title,
  description: manual.description,
  canonicalPath: `/catalog/${slug}`,
  searchParams: { page: "2" },
});

check("page=2 title suffix", pageTwo.fullTitle.endsWith(" - Страница 2"));
check("page=2 description suffix", pageTwo.description.endsWith(" - Страница 2"));
check("page=2 self canonical", pageTwo.canonicalPath === "/catalog/zadvizhki?page=2");

const failed = checks.filter((item) => !item.pass);
for (const item of checks) {
  console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name}${item.detail ? `: ${item.detail}` : ""}`);
}

if (failed.length > 0) {
  process.exitCode = 1;
}
