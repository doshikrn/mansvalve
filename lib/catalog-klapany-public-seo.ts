/** SEO Title для подкатегорий «Клапаны обратные» (публичный сайт, фикс по ТЗ). */
const KLAPANY_SUB_SEO_TITLE: Record<string, string> = {
  "povorotnye-flancevye": "Поворотные фланцевые обратные клапаны (19с38нж) купить в РК",
  "povorotnye-svarnye": "Клапаны обратные поворотные под приварку цена в Казахстане",
  "mezhflancevye-dvuhstvorchatye":
    "Клапаны обратные двухстворчатые межфланцевые купить оптом в РК",
  "mezhflancevye-pruzhinnye": "Дисковые пружинные межфланцевые клапаны цена в РК | Опт",
  podemnye: "Подъемные обратные клапаны (фланцевые, муфтовые) купить в РК",
  sharovye: "Шаровые обратные клапаны для канализации и вязких сред в РК",
};

export function getKlapanySubcategorySeoTitle(subcategorySlug: string): string | undefined {
  return KLAPANY_SUB_SEO_TITLE[subcategorySlug];
}
