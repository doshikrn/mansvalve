export interface CategoryVisual {
  imageSrc: string;
  imageAlt: string;
}

const FALLBACK_VISUAL: CategoryVisual = {
  imageSrc: "/images/category-zadvizhki.png",
  imageAlt: "Промышленная трубопроводная арматура",
};

const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  zadvizhki: {
    imageSrc: "/images/category-zadvizhki.png",
    imageAlt: "Задвижки промышленного назначения",
  },
  "krany-sharovye": {
    imageSrc: "/images/category-krany-sharovye.png",
    imageAlt: "Краны шаровые фланцевые",
  },
  zatvory: {
    imageSrc: "/images/category-zatvory.png",
    imageAlt: "Дисковые затворы",
  },
  klapany: {
    imageSrc: "/images/category-klapany.png",
    imageAlt: "Клапаны регулирующие и предохранительные",
  },
  "filtry-i-kompensatory": {
    imageSrc: "/images/category-filtry-i-kompensatory.png",
    imageAlt: "Фильтры и компенсаторы трубопроводов",
  },
  "flansy-i-otvody": {
    imageSrc: "/images/category-flansy-i-otvody.png",
    imageAlt: "Фланцы и отводы из стали",
  },
  "krepezh-i-prokladki": {
    imageSrc: "/images/category-flansy-i-otvody.png",
    imageAlt: "Крепёж и прокладки для фланцевых соединений",
  },
  elektroprivody: {
    imageSrc: "/images/category-zadvizhki.png",
    imageAlt: "Электроприводы для промышленной арматуры",
  },
};

export function getCategoryVisual(categoryId: string): CategoryVisual {
  return CATEGORY_VISUALS[categoryId] ?? FALLBACK_VISUAL;
}
