"use client";

import type { ReactNode } from "react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

import { AdminFieldHint } from "@/components/admin/AdminFieldHint";
import {
  AdminProductPreview,
  type AdminProductPreviewData,
} from "@/components/admin/AdminProductPreview";
import { AdminInlineNotice, AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminSeoPreview } from "@/components/admin/AdminSeoPreview";
import { AdminSectionCard } from "@/components/admin/AdminSectionCard";
import { AdminStickyActions } from "@/components/admin/AdminStickyActions";
import { AdminUnsavedChangesGuard, useAdminFormDirty } from "@/components/admin/AdminUnsavedChangesGuard";
import { FormDirtyResetAfterSubmit } from "@/components/admin/FormDirtyResetAfterSubmit";
import {
  MediaUpload,
  type MediaLibraryItem,
  type SelectedMediaItem,
} from "@/components/admin/MediaUpload";
import { ProductDocumentsUpload } from "@/components/admin/ProductDocumentsUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProductFormState } from "@/app/admin/products/actions";
import {
  joinProductDetailBlockLines,
  normalizeProductDetailBlocks,
  PRODUCT_DETAIL_BLOCK_FIELDS,
  type ProductDetailBlocks,
} from "@/lib/product-detail-blocks";
import { formatProductDisplayName } from "@/lib/catalog/product-naming";
import { buildProductPreviewFromDraft } from "@/lib/catalog/product-preview-draft";
import { buildProductSlugFromTitle } from "@/lib/products-import/slug-builder";
import type { CategoryWithSubcategories } from "@/lib/services/categories";
import type { ProductDetail } from "@/lib/services/products";
import { slugify } from "@/lib/services/slug";

type Action = (
  state: ProductFormState,
  formData: FormData,
) => Promise<ProductFormState>;

type Spec = { id: string; key: string; value: string };

type Props = {
  action: Action;
  categories: CategoryWithSubcategories[];
  mediaLibrary: MediaLibraryItem[];
  documentLibrary: MediaLibraryItem[];
  product?: ProductDetail | null;
  initialDetailBlocks?: ProductDetailBlocks | null;
  publicPreview?: AdminProductPreviewData | null;
  backHref: string;
  backLabel?: string;
  listReturnTo?: string | null;
  /** Server `updated_at` for «last saved» baseline; ISO string updated after successful save. */
  serverUpdatedAt?: string | Date | null;
};

const INITIAL: ProductFormState = {};

const SECTION_LINKS = [
  { id: "preview", label: "Предпросмотр" },
  { id: "main", label: "Основное" },
  { id: "images", label: "Изображения" },
  { id: "seo", label: "SEO и адрес" },
  { id: "parameters", label: "Параметры" },
  { id: "description", label: "Описание на сайте" },
  { id: "documents", label: "Документы" },
] as const;

export function ProductForm({
  action,
  categories,
  mediaLibrary,
  documentLibrary,
  product,
  initialDetailBlocks,
  publicPreview,
  backHref,
  backLabel = "К списку",
  listReturnTo,
  serverUpdatedAt,
}: Props) {
  const [state, runAction] = useActionState(action, INITIAL);
  const initialSavedIso = useMemo(() => {
    if (!serverUpdatedAt) return null;
    if (serverUpdatedAt instanceof Date) return serverUpdatedAt.toISOString();
    const d = new Date(serverUpdatedAt);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }, [serverUpdatedAt]);
  const lastSavedIso = state.savedAt ?? initialSavedIso;
  const [categoryId, setCategoryId] = useState<number | "">(
    product?.categoryId ?? "",
  );
  const [subcategoryId, setSubcategoryId] = useState<number | "">(
    product?.subcategoryId ?? "",
  );
  const specIdRef = useRef(0);
  const [specs, setSpecs] = useState<Spec[]>(
    product?.specs.map((s, index) => ({
      id: `persisted-${product.id}-${index}-${s.key}`,
      key: s.key,
      value: s.value,
    })) ?? [],
  );

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const subcategorySelectValue =
    subcategoryId &&
    selectedCategory?.subcategories.some((item) => item.id === subcategoryId)
      ? subcategoryId
      : "";
  const selectedSubcategory = selectedCategory?.subcategories.find(
    (item) => item.id === subcategorySelectValue,
  );
  const selectedImages: SelectedMediaItem[] = (product?.images ?? []).map((img) => ({
    mediaId: img.mediaId,
    url: img.url,
    alt: img.alt ?? "",
    isPrimary: img.isPrimary,
    sortOrder: img.sortOrder,
    mimeType: img.mimeType,
    sizeBytes: img.sizeBytes,
  }));
  const [liveImages, setLiveImages] = useState<SelectedMediaItem[]>(
    selectedImages,
  );
  // Auto-slug — только для нового товара. Существующий slug фиксируется
  // после публикации и переписывается только вручную.
  const isExisting = Boolean(product);
  const [manualSlug, setManualSlug] = useState<string | null>(
    isExisting ? (product?.slug ?? "") : null,
  );
  const [nameDraft, setNameDraft] = useState<string>(product?.name ?? "");
  const [publicTitleDraft, setPublicTitleDraft] = useState<string>(
    product?.publicTitle ?? "",
  );
  const [h1OverrideDraft, setH1OverrideDraft] = useState<string>(
    product?.h1Override ?? "",
  );
  const [seoTitleOverrideDraft, setSeoTitleOverrideDraft] = useState<string>(
    product?.seoTitleOverride ?? "",
  );
  const [seoDescriptionOverrideDraft, setSeoDescriptionOverrideDraft] =
    useState<string>(product?.seoDescriptionOverride ?? "");
  const [modelDraft, setModelDraft] = useState<string>(product?.model ?? "");
  const [dnDraft, setDnDraft] = useState<string>(
    product?.dn != null ? String(product.dn) : "",
  );
  const [pnDraft, setPnDraft] = useState<string>(
    product?.pn != null ? String(product.pn) : "",
  );
  const [materialDraft, setMaterialDraft] = useState<string>(
    product?.material ?? "",
  );
  const [connectionTypeDraft, setConnectionTypeDraft] = useState<string>(
    product?.connectionType ?? "",
  );

  const namingInput = useMemo(
    () => ({
      name: nameDraft,
      publicTitle: publicTitleDraft,
      category: selectedCategory?.slug,
      categoryName: selectedCategory?.name,
      model: modelDraft,
      dn: dnDraft ? Number(dnDraft) : null,
      pn: pnDraft ? Number(pnDraft) : null,
      material: materialDraft,
      connectionType: connectionTypeDraft,
    }),
    [
      nameDraft,
      publicTitleDraft,
      selectedCategory,
      modelDraft,
      dnDraft,
      pnDraft,
      materialDraft,
      connectionTypeDraft,
    ],
  );

  const generatedDisplayName = useMemo(
    () => formatProductDisplayName(namingInput),
    [namingInput],
  );

  const autoSlug = useMemo(
    () =>
      buildProductSlugFromTitle({
        publicTitle: publicTitleDraft,
        generatedDisplayName,
        name: nameDraft,
      }),
    [publicTitleDraft, generatedDisplayName, nameDraft],
  );
  const normalizedManualSlug = manualSlug == null ? null : slugify(manualSlug);
  const slugDraft =
    state.savedSlug && normalizedManualSlug === state.savedSlug
      ? state.savedSlug
      : manualSlug ?? autoSlug;
  const autoSlugActive = manualSlug == null;

  const regenerateSlugFromCurrentFields = () => {
    const generated = buildProductSlugFromTitle({
      publicTitle: publicTitleDraft,
      generatedDisplayName,
      name: nameDraft,
    });
    if (generated) setManualSlug(generated);
  };

  const resetH1ToAuto = () => {
    setH1OverrideDraft("");
  };

  const resetSeoTitleToAuto = () => setSeoTitleOverrideDraft("");
  const resetSeoDescriptionToAuto = () => setSeoDescriptionOverrideDraft("");

  const selectedDocuments = {
    specification: product?.documents.specification ?? null,
    questionnaire: product?.documents.questionnaire ?? null,
    documentation: product?.documents.documentation ?? null,
  };
  const detailBlocks = normalizeProductDetailBlocks(
    product?.detailBlocks ?? initialDetailBlocks,
  );

  const hasFormError = useMemo(
    () =>
      Boolean(
        state.error ||
          (state.fieldErrors && Object.keys(state.fieldErrors).length > 0),
      ),
    [state.error, state.fieldErrors],
  );

  useEffect(() => {
    if (!state.fieldErrors || Object.keys(state.fieldErrors).length === 0) return;
    const keys = Object.keys(state.fieldErrors).sort();
    const first = keys[0];
    if (!first) return;
    const root = first.includes(".") ? first.slice(0, first.indexOf(".")) : first;
    const el =
      document.getElementById(`admin-field-${root}`) ??
      document.getElementById(`admin-field-${first}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state.fieldErrors]);

  const livePublicPreview = useMemo(() => {
    const primaryImage =
      liveImages.find((image) => image.isPrimary) ?? liveImages[0] ?? null;
    const draftPreview = buildProductPreviewFromDraft({
      name: nameDraft,
      publicTitle: publicTitleDraft,
      h1Override: h1OverrideDraft,
      seoTitleOverride: seoTitleOverrideDraft,
      seoDescriptionOverride: seoDescriptionOverrideDraft,
      slug: slugDraft,
      categorySlug: selectedCategory?.slug ?? product?.categorySlug ?? "",
      categoryName: selectedCategory?.name ?? product?.categoryName ?? "",
      subcategorySlug: selectedSubcategory?.slug ?? undefined,
      subcategoryName: selectedSubcategory?.name ?? undefined,
      model: modelDraft,
      dn: dnDraft ? Number(dnDraft) : null,
      pn: pnDraft ? Number(pnDraft) : null,
      material: materialDraft,
      connectionType: connectionTypeDraft,
      shortDescription: product?.shortDescription ?? "",
      primaryImageUrl: primaryImage?.url ?? publicPreview?.primaryImageUrl,
      primaryImageAlt: primaryImage?.alt ?? publicPreview?.primaryImageAlt,
      imageCount: liveImages.length,
    });

    if (!publicPreview && !nameDraft.trim()) return null;

    return {
      generatedDisplayName: draftPreview.generatedDisplayName,
      displayName: draftPreview.displayName,
      h1: draftPreview.h1,
      h1IsManual: draftPreview.h1IsManual,
      shortDescription: draftPreview.shortDescription || publicPreview?.shortDescription || "",
      seoTitle: draftPreview.seoTitle,
      seoTitleFull: draftPreview.seoTitleFull,
      seoTitleIsManual: draftPreview.seoTitleIsManual,
      seoDescription: draftPreview.seoDescription || publicPreview?.seoDescription || "",
      seoDescriptionIsManual: draftPreview.seoDescriptionIsManual,
      canonicalPath: draftPreview.canonicalPath,
      canonicalUrl: draftPreview.canonicalUrl,
      primaryImageUrl: draftPreview.primaryImageUrl,
      primaryImageAlt: draftPreview.primaryImageAlt,
      imageCount: draftPreview.imageCount,
    };
  }, [
    liveImages,
    publicPreview,
    nameDraft,
    publicTitleDraft,
    h1OverrideDraft,
    seoTitleOverrideDraft,
    seoDescriptionOverrideDraft,
    slugDraft,
    selectedCategory,
    selectedSubcategory,
    product,
    modelDraft,
    dnDraft,
    pnDraft,
    materialDraft,
    connectionTypeDraft,
  ]);

  return (
    <AdminUnsavedChangesGuard>
      <form id="admin-product-form" action={runAction} className="space-y-5">
        {listReturnTo ? (
          <input type="hidden" name="returnTo" value={listReturnTo} />
        ) : null}
        <FormDirtyResetAfterSubmit hasError={hasFormError} />

        {state.success ? (
          <AdminInlineNotice tone="manual">{state.success}</AdminInlineNotice>
        ) : null}

        <ProductSectionNav />
        <ProductValidationWarnings
          product={product}
          preview={livePublicPreview}
          imageCount={liveImages.length}
        />

        {livePublicPreview ? (
          <AdminSectionCard
            id="preview"
            title="Как товар отображается на сайте"
            description="Так же увидит клиент карточку в каталоге и на странице товара (название, картинка, краткий текст)."
          >
            <AdminProductPreview preview={livePublicPreview} />
          </AdminSectionCard>
        ) : null}

        <AdminSectionCard
          id="main"
          title="Основное"
          description="Внутреннее и публичное названия, раздел каталога и видимость товара. URL и поисковые поля находятся в отдельном SEO-разделе."
        >
          <Field
            label="Внутреннее название"
            required
            name="name"
            error={state.fieldErrors?.name}
          >
            <Input
              name="name"
              defaultValue={product?.name ?? ""}
              required
              onChange={(event) => setNameDraft(event.target.value)}
            />
            <AdminFieldHint>
              Публичное название формируется автоматически из типа, материала,
              соединения, модели, DN и PN. Это поле можно оставлять коротким
              для работы внутри админки.
            </AdminFieldHint>
          </Field>

          <Field
            label="Название на сайте"
            name="publicTitle"
            error={state.fieldErrors?.publicTitle}
          >
            <Input
              name="publicTitle"
              value={publicTitleDraft}
              onChange={(event) => setPublicTitleDraft(event.target.value)}
            />
            <AdminFieldHint>
              Показывается в карточках, поиске и в шаблоне SEO title. Если пусто —
              подставляется автоматическое имя из параметров (см. ниже).
            </AdminFieldHint>
            {livePublicPreview ? (
              <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                <AdminStatusBadge tone="generated" className="mr-2 align-middle" />
                Автоматическое имя, если «Название на сайте» пустое:{" "}
                <span className="font-medium text-foreground">
                  {livePublicPreview.generatedDisplayName}
                </span>
              </p>
            ) : null}
          </Field>

          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="Категория"
              name="categoryId"
              required
              error={state.fieldErrors?.categoryId}
            >
              <select
                name="categoryId"
                required
                value={categoryId}
                onChange={(e) => {
                  const nextCategoryId = e.target.value ? Number(e.target.value) : "";
                  setCategoryId(nextCategoryId);
                  setSubcategoryId("");
                }}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Выберите категорию</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Подкатегория"
              name="subcategoryId"
              error={state.fieldErrors?.subcategoryId}
            >
              <select
                name="subcategoryId"
                value={subcategorySelectValue}
                onChange={(e) =>
                  setSubcategoryId(e.target.value ? Number(e.target.value) : "")
                }
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                disabled={!selectedCategory}
              >
                <option value="">Не выбрана</option>
                {selectedCategory?.subcategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex flex-wrap gap-4 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
            <CheckboxField
              name="isActive"
              label="Показывать на сайте"
              defaultChecked={product?.isActive ?? true}
            />
            <CheckboxField
              name="isFeatured"
              label="Рекомендуемый товар"
              defaultChecked={product?.isFeatured ?? false}
            />
            <CheckboxField
              name="priceByRequest"
              label="Цена по запросу"
              defaultChecked={product?.priceByRequest ?? true}
            />
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          id="images"
          title="Изображения"
          description="Главное фото и галерея на карточке товара. В блоке «Предпросмотр» выше видно, какой снимок пойдёт на сайт."
        >
          <MediaUpload
            title="Изображения товара"
            initialLibrary={mediaLibrary}
            initialSelected={selectedImages}
            onSelectedChange={setLiveImages}
            hiddenInputName="imagesPayload"
            uploadFolder="products"
            allowAttach
            attachOnUpload
          />
        </AdminSectionCard>

        <AdminSectionCard
          id="seo"
          title="SEO и адрес страницы"
          description="H1, метаданные для поиска и постоянный адрес товара. Пустые ручные поля оставляют действующую автоматическую генерацию."
          badge="авто или вручную"
        >
          <Field
            label="Заголовок H1 вручную, необязательно"
            name="h1Override"
            error={state.fieldErrors?.h1Override}
          >
            <Input
              name="h1Override"
              value={h1OverrideDraft}
              onChange={(event) => setH1OverrideDraft(event.target.value)}
              placeholder={livePublicPreview?.h1 || "Подставится автоматически"}
            />
            <div className="flex flex-wrap items-center gap-2">
              <AdminStatusBadge tone={h1OverrideDraft.trim() ? "manual" : "auto"} />
              {h1OverrideDraft.trim() ? (
                <Button type="button" variant="outline" size="sm" onClick={resetH1ToAuto}>
                  Вернуть H1 в авто
                </Button>
              ) : null}
            </div>
            <AdminFieldHint>
              Если пусто — H1 берётся из «Названия на сайте», затем из автоматически
              сформированного названия. Автоматический текст в БД не сохраняется.
            </AdminFieldHint>
          </Field>

          <Field
            label="SEO Title вручную, необязательно"
            name="seoTitleOverride"
            error={state.fieldErrors?.seoTitleOverride}
          >
            <Input
              name="seoTitleOverride"
              value={seoTitleOverrideDraft}
              onChange={(event) => setSeoTitleOverrideDraft(event.target.value)}
              placeholder={livePublicPreview?.seoTitle || "Сформируется автоматически"}
            />
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <AdminStatusBadge tone={seoTitleOverrideDraft.trim() ? "manual" : "auto"} />
              <span>
                Длина фактического Title: {livePublicPreview?.seoTitleFull.length ?? 0} символов
              </span>
              {seoTitleOverrideDraft.trim() ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetSeoTitleToAuto}
                >
                  Вернуть Title в авто
                </Button>
              ) : null}
            </div>
            <AdminFieldHint>
              Рекомендуемая длина полного Title — до 90 символов. Бренд MANSVALVE GROUP
              добавляется сайтом автоматически; ручной текст сохраняется без переписывания.
            </AdminFieldHint>
            {livePublicPreview && livePublicPreview.seoTitleFull.length > 90 ? (
              <p className="text-xs font-medium text-amber-800">
                Title длиннее рекомендуемого диапазона и может обрезаться поисковой системой.
              </p>
            ) : null}
            {/mansvalve\s+group/iu.test(seoTitleOverrideDraft) ? (
              <p className="text-xs font-medium text-amber-800">
                Уберите бренд из ручного Title: он уже добавляется автоматически.
              </p>
            ) : null}
          </Field>

          <Field
            label="SEO Description вручную, необязательно"
            name="seoDescriptionOverride"
            error={state.fieldErrors?.seoDescriptionOverride}
          >
            <Textarea
              name="seoDescriptionOverride"
              value={seoDescriptionOverrideDraft}
              onChange={(event) => setSeoDescriptionOverrideDraft(event.target.value)}
              rows={4}
              placeholder={livePublicPreview?.seoDescription || "Сформируется автоматически"}
            />
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <AdminStatusBadge
                tone={seoDescriptionOverrideDraft.trim() ? "manual" : "auto"}
              />
              <span>
                Длина фактического Description:{" "}
                {livePublicPreview?.seoDescription.length ?? 0} символов
              </span>
              {seoDescriptionOverrideDraft.trim() ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetSeoDescriptionToAuto}
                >
                  Вернуть Description в авто
                </Button>
              ) : null}
            </div>
            <AdminFieldHint>
              Рекомендуемая длина — до 160 символов. Пустое поле использует нейтральное
              автоматическое описание; ручной текст сохраняется без очистки и сокращения.
            </AdminFieldHint>
            {livePublicPreview && livePublicPreview.seoDescription.length > 160 ? (
              <p className="text-xs font-medium text-amber-800">
                Description длиннее рекомендуемого диапазона и может обрезаться поисковой системой.
              </p>
            ) : null}
          </Field>

          <Field
            label={
              <>
                URL товара{" "}
                {product ? (
                  <AdminStatusBadge tone="readonly">адрес сохранён</AdminStatusBadge>
                ) : (
                  <AdminStatusBadge tone="auto" />
                )}
              </>
            }
            name="slug"
            error={state.fieldErrors?.slug}
          >
            <Input
              name="slug"
              value={slugDraft}
              onChange={(event) => setManualSlug(event.target.value)}
              placeholder={product ? undefined : "Заполнится из названия, модели и DN/PN"}
            />
            {!isExisting && !autoSlugActive ? (
              <button
                type="button"
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                onClick={() => setManualSlug(null)}
              >
                Снова собрать URL из названия на сайте
              </button>
            ) : null}
            {isExisting ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={regenerateSlugFromCurrentFields}
              >
                Сгенерировать URL из текущего названия
              </Button>
            ) : null}
            <AdminFieldHint>
              Изменение H1, Title или Description не меняет URL. У существующего товара URL
              обновляется только вручную или этой кнопкой; после сохранения старый адрес
              останется рабочим через постоянный редирект.
            </AdminFieldHint>
            {product && slugDraft.trim() && slugDraft.trim() !== product.slug ? (
              <AdminInlineNotice tone="auto">
                После сохранения адрес изменится. Старый slug{" "}
                <code className="rounded bg-amber-100 px-1">/{product.slug}</code>{" "}
                будет сохранён в aliases и перенаправит посетителя на новый URL.
              </AdminInlineNotice>
            ) : null}
          </Field>

          {livePublicPreview ? (
            <div className="space-y-4 border-t border-border pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">Фактический результат</p>
                <span className="text-xs text-muted-foreground">
                  Обновляется сразу при изменении полей
                </span>
              </div>
              <AdminSeoPreview
                title={livePublicPreview.seoTitleFull}
                description={livePublicPreview.seoDescription}
                url={livePublicPreview.canonicalUrl}
              />
              <dl className="grid gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm sm:grid-cols-2">
                <PreviewValue
                  label="H1"
                  value={livePublicPreview.h1}
                  badge={
                    livePublicPreview.h1IsManual ? (
                      <AdminStatusBadge tone="manual">изменено вручную</AdminStatusBadge>
                    ) : (
                      <AdminStatusBadge tone="auto">автоматически</AdminStatusBadge>
                    )
                  }
                />
                <PreviewValue
                  label="SEO Title"
                  value={livePublicPreview.seoTitleFull}
                  badge={
                    <AdminStatusBadge
                      tone={livePublicPreview.seoTitleIsManual ? "manual" : "auto"}
                    />
                  }
                />
                <PreviewValue
                  label="SEO Description"
                  value={livePublicPreview.seoDescription}
                  badge={
                    <AdminStatusBadge
                      tone={livePublicPreview.seoDescriptionIsManual ? "manual" : "auto"}
                    />
                  }
                />
                <PreviewValue label="Основная ссылка" value={livePublicPreview.canonicalPath} />
              </dl>
            </div>
          ) : (
            <AdminFieldHint>
              Предпросмотр появится после заполнения названия товара.
            </AdminFieldHint>
          )}
        </AdminSectionCard>

        <AdminSectionCard
          id="parameters"
          title="Параметры и цена"
          description="DN, PN, материал, модель и соединение — в фильтрах каталога и в автоматическом названии. Цена и вес — в карточке и в заявках."
        >
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="DN" name="dn">
              <Input
                name="dn"
                type="number"
                defaultValue={product?.dn ?? ""}
                onChange={(event) => setDnDraft(event.target.value)}
              />
            </Field>
            <Field label="PN" name="pn">
              <Input
                name="pn"
                type="number"
                defaultValue={product?.pn ?? ""}
                onChange={(event) => setPnDraft(event.target.value)}
              />
            </Field>
            <Field label="Резьба" name="thread">
              <Input name="thread" defaultValue={product?.thread ?? ""} />
            </Field>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Материал" name="material">
              <Input
                name="material"
                defaultValue={product?.material ?? ""}
                onChange={(event) => setMaterialDraft(event.target.value)}
              />
            </Field>
            <Field label="Марка / модель" name="model">
              <Input
                name="model"
                defaultValue={product?.model ?? ""}
                onChange={(event) => setModelDraft(event.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Тип соединения" name="connectionType">
              <Input
                name="connectionType"
                defaultValue={product?.connectionType ?? ""}
                onChange={(event) => setConnectionTypeDraft(event.target.value)}
              />
            </Field>
            <Field label="Тип управления" name="controlType">
              <Input
                name="controlType"
                defaultValue={product?.controlType ?? ""}
              />
            </Field>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Цена, ₸" name="price">
              <Input
                name="price"
                type="number"
                step="0.01"
                defaultValue={product?.price ?? ""}
              />
            </Field>
            <Field label="Вес, кг" name="weight">
              <Input
                name="weight"
                type="number"
                step="0.001"
                defaultValue={product?.weight ?? ""}
              />
            </Field>
            <Field label="Порядок сортировки" name="sortOrder">
              <Input
                name="sortOrder"
                type="number"
                defaultValue={product?.sortOrder ?? 0}
              />
            </Field>
          </div>

        </AdminSectionCard>

        <AdminSectionCard
          id="description"
          title="Тексты на странице товара"
          description="Краткое и полное описание, таблица «Маркировка / DN / …» и блоки списков — всё уходит на публичную страницу. Для линеек задвижек пустые списки могут подставиться из общего образца."
        >
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm leading-relaxed text-blue-950">
            <AdminStatusBadge tone="auto" className="mr-2 align-middle" />
            Заполненные поля идут на сайт как есть. Для задвижек пустые списки иногда
            дополняются из общего образца линейки — подробнее в{" "}
            <code className="rounded bg-white/60 px-1">docs/product-content-contract.md</code>.
          </div>

          <Field label="Краткое описание" name="shortDescription">
            <Textarea
              name="shortDescription"
              rows={2}
              defaultValue={product?.shortDescription ?? ""}
            />
            <AdminFieldHint>
              Карточки каталога, превью в админке и краткий текст на странице (если нет
              отдельного полного описания).
            </AdminFieldHint>
          </Field>

          <Field label="Полное описание" name="longDescription">
            <Textarea
              name="longDescription"
              rows={6}
              defaultValue={product?.longDescription ?? ""}
            />
            <AdminFieldHint>
              Основной текст блока «Описание» на публичной странице. Если пусто — берётся
              шаблон серии (для задвижек) или краткое описание.
            </AdminFieldHint>
          </Field>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Таблица характеристик</h3>
                <AdminFieldHint>
                  Эти строки показываются на публичной странице товара.
                </AdminFieldHint>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setSpecs((s) => [
                    ...s,
                    { id: `new-${++specIdRef.current}`, key: "", value: "" },
                  ])
                }
              >
                + Добавить строку
              </Button>
            </div>
            <div className="space-y-2">
              {specs.map((spec) => (
                <div key={spec.id} className="grid gap-2 md:grid-cols-[240px_1fr_auto]">
                  <Input
                    name="specKey[]"
                    value={spec.key}
                    onChange={(e) =>
                      setSpecs((curr) =>
                        curr.map((s) =>
                          s.id === spec.id ? { ...s, key: e.target.value } : s,
                        ),
                      )
                    }
                    placeholder="Например: ГОСТ"
                  />
                  <Input
                    name="specValue[]"
                    value={spec.value}
                    onChange={(e) =>
                      setSpecs((curr) =>
                        curr.map((s) =>
                          s.id === spec.id ? { ...s, value: e.target.value } : s,
                        ),
                      )
                    }
                    placeholder="Значение"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSpecs((curr) => curr.filter((item) => item.id !== spec.id))
                    }
                  >
                    Убрать
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {PRODUCT_DETAIL_BLOCK_FIELDS.map((field) => (
              <Field key={field.key} label={field.title} name={field.name}>
                <Textarea
                  name={field.name}
                  rows={5}
                  defaultValue={joinProductDetailBlockLines(detailBlocks[field.key])}
                />
                <AdminFieldHint>{field.description}</AdminFieldHint>
              </Field>
            ))}
            <AdminFieldHint>
              <AdminStatusBadge tone="auto" className="mr-2 align-middle" />
              Если блок пустой, для задвижек текст может подставиться из общего образца
              линейки (см.{" "}
              <code className="rounded bg-muted px-1">docs/product-content-contract.md</code>
              ).
            </AdminFieldHint>
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          id="documents"
          title="Документы"
          description="Паспорта, спецификации, опросные листы и PDF-файлы, связанные с товаром."
        >
          <ProductDocumentsUpload
            library={documentLibrary}
            initial={selectedDocuments}
            hiddenInputName="documentsPayload"
            uploadFolder="products/documents"
          />
        </AdminSectionCard>

        {state.error ? (
          <p
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {state.error}
          </p>
        ) : null}

        <AdminStickyActions backHref={backHref} backLabel={backLabel}>
          <ProductFormSaveStatus
            lastSavedIso={lastSavedIso}
            isNewProduct={!product}
          />
          <SubmitButton isEdit={Boolean(product)} />
          {livePublicPreview ? (
            <Button asChild type="button" variant="outline" size="sm">
              <Link href={livePublicPreview.canonicalUrl} target="_blank" rel="noopener noreferrer">
                Открыть на сайте
              </Link>
            </Button>
          ) : null}
        </AdminStickyActions>
      </form>
    </AdminUnsavedChangesGuard>
  );
}

function ProductValidationWarnings({
  product,
  preview,
  imageCount,
}: {
  product?: ProductDetail | null;
  preview?: AdminProductPreviewData | null;
  imageCount: number;
}) {
  const warnings = [
    product && !product.isActive
      ? "Товар скрыт: изменения сохранятся, но клиент не увидит товар в публичном каталоге."
      : null,
    imageCount === 0
      ? "Нет своего фото: на сайте подставится картинка из раздела каталога."
      : null,
    product && !product.publicTitle?.trim() && !preview?.generatedDisplayName?.trim()
      ? "Нет названия для сайта и не из чего собрать автоматически: карточка будет пустой."
      : null,
    !product?.shortDescription?.trim()
      ? "Краткое описание пустое: в списке товаров может подставиться начало полного текста или образца."
      : null,
    product && !product.slug?.trim()
      ? "Ссылка товара пустая: страница на сайте не откроется."
      : null,
    preview && !preview.canonicalPath.trim()
      ? "Не удалось собрать основную ссылку: проверьте «Ссылку товара» и категорию."
      : null,
    product && !product.categoryId
      ? "Категория не выбрана: товар не попадёт в нужный публичный раздел."
      : null,
    product && !product.subcategoryId
      ? "Подкатегория не выбрана: фильтры и подбор могут работать хуже."
      : null,
    product && product.dn == null
      ? "DN не указан: фильтры и поиск по диаметру будут работать хуже."
      : null,
    product && product.pn == null
      ? "PN не указан: фильтры и поиск по давлению будут работать хуже."
      : null,
    preview && !(preview.seoTitleFull ?? preview.seoTitle).trim()
      ? "Заголовок для поиска пустой: проверьте название, модель, DN и PN."
      : null,
    preview && !preview.seoDescription.trim()
      ? "Описание для поиска пустое: добавьте текст в описание или характеристики."
      : null,
    preview && (preview.seoTitleFull ?? preview.seoTitle).length > 70
      ? "Заголовок для поиска длиннее 70 знаков — в выдаче может обрезаться."
      : null,
    preview && preview.seoDescription.length > 170
      ? "Описание для поиска длиннее 170 знаков — в выдаче может обрезаться."
      : null,
  ].filter(Boolean);

  if (!warnings.length) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        Карточка выглядит готовой к публикации: есть параметры, тексты и предпросмотр
        для клиента.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-semibold">Проверьте перед публикацией</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </div>
  );
}

function ProductSectionNav() {
  return (
    <nav className="sticky top-0 z-10 -mx-1 overflow-x-auto border-b border-border bg-muted/80 px-1 py-2 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
      <div className="flex min-w-max gap-1">
        {SECTION_LINKS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {section.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function Field({
  label,
  children,
  name,
  required,
  error,
}: {
  label: ReactNode;
  children: ReactNode;
  name: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div id={`admin-field-${name}`} className="scroll-mt-28 space-y-1.5">
      <Label htmlFor={name} className="inline-flex flex-wrap items-center gap-x-1">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function PreviewValue({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
        {badge}
      </dt>
      <dd className="mt-0.5 break-words font-medium text-foreground">{value}</dd>
    </div>
  );
}

function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 rounded border-border accent-foreground"
      />
      <span>{label}</span>
    </label>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="sm" aria-busy={pending}>
      {pending ? "Сохранение…" : isEdit ? "Сохранить и продолжить" : "Создать товар"}
    </Button>
  );
}

function ProductFormSaveStatus({
  lastSavedIso,
  isNewProduct,
}: {
  lastSavedIso: string | null;
  isNewProduct: boolean;
}) {
  const { isDirty } = useAdminFormDirty();
  const { pending } = useFormStatus();
  const savedLabel = useMemo(() => {
    if (!lastSavedIso) return null;
    const d = new Date(lastSavedIso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [lastSavedIso]);

  let statusLine: ReactNode;
  if (pending) {
    statusLine = <span className="font-medium text-foreground">Сохранение на сервере…</span>;
  } else if (isDirty) {
    statusLine = <span className="font-medium text-amber-900">Есть несохранённые изменения</span>;
  } else if (isNewProduct && !lastSavedIso) {
    statusLine = (
      <span className="font-medium text-muted-foreground">Новый товар — сохраните, чтобы зафиксировать</span>
    );
  } else {
    statusLine = <span className="font-medium text-emerald-900">Нет несохранённых изменений</span>;
  }

  return (
    <div className="flex min-w-[10rem] max-w-[18rem] flex-col gap-0.5 text-xs leading-snug text-muted-foreground">
      {statusLine}
      {savedLabel ? <span>Последнее сохранение: {savedLabel}</span> : null}
    </div>
  );
}
