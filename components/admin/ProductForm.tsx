"use client";

import type { ReactNode } from "react";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

import { AdminFieldHint } from "@/components/admin/AdminFieldHint";
import {
  AdminProductPreview,
  type AdminProductPreviewData,
} from "@/components/admin/AdminProductPreview";
import { AdminSectionCard } from "@/components/admin/AdminSectionCard";
import { AdminStickyActions } from "@/components/admin/AdminStickyActions";
import { AdminUnsavedChangesGuard } from "@/components/admin/AdminUnsavedChangesGuard";
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
import type { CategoryWithSubcategories } from "@/lib/services/categories";
import type { ProductDetail } from "@/lib/services/products";

type Action = (
  state: ProductFormState,
  formData: FormData,
) => Promise<ProductFormState>;

type Spec = { key: string; value: string };

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
};

const INITIAL: ProductFormState = {};

const SECTION_LINKS = [
  { id: "preview", label: "Preview" },
  { id: "main", label: "Основное" },
  { id: "images", label: "Изображения" },
  { id: "seo", label: "SEO" },
  { id: "parameters", label: "Параметры" },
  { id: "description", label: "Описание" },
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
}: Props) {
  const [state, runAction] = useActionState(action, INITIAL);
  const [categoryId, setCategoryId] = useState<number | "">(
    product?.categoryId ?? "",
  );
  const [specs, setSpecs] = useState<Spec[]>(
    product?.specs.map((s) => ({ key: s.key, value: s.value })) ?? [],
  );

  const selectedCategory = categories.find((c) => c.id === categoryId);
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

  const livePublicPreview = useMemo(() => {
    if (!publicPreview) return null;
    const primaryImage =
      liveImages.find((image) => image.isPrimary) ?? liveImages[0] ?? null;
    if (!primaryImage) return publicPreview;
    return {
      ...publicPreview,
      primaryImageUrl: primaryImage.url,
      primaryImageAlt: primaryImage.alt || publicPreview.primaryImageAlt,
      imageCount: liveImages.length,
    };
  }, [liveImages, publicPreview]);

  return (
    <AdminUnsavedChangesGuard>
      <form id="admin-product-form" action={runAction} className="space-y-5">
        {listReturnTo ? (
          <input type="hidden" name="returnTo" value={listReturnTo} />
        ) : null}
        <FormDirtyResetAfterSubmit hasError={hasFormError} />

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
            description="Этот блок строится только через buildPublicProductView и должен совпадать с карточкой, страницей товара, SEO и JSON-LD."
            badge="публичный слой"
          >
            <AdminProductPreview preview={livePublicPreview} />
          </AdminSectionCard>
        ) : null}

        <AdminSectionCard
          id="main"
          title="Основное"
          description="Внутренние поля товара, публикация, категория и короткие параметры для менеджера."
        >
          <Field
            label="Внутреннее название"
            required
            name="name"
            error={state.fieldErrors?.name}
          >
            <Input name="name" defaultValue={product?.name ?? ""} required />
            <AdminFieldHint>
              Публичное название формируется автоматически из типа, материала,
              соединения, модели, DN и PN. Это поле можно оставлять коротким
              для работы внутри админки.
            </AdminFieldHint>
          </Field>

          <Field label="Slug" name="slug" error={state.fieldErrors?.slug}>
            <Input name="slug" defaultValue={product?.slug ?? ""} />
            <AdminFieldHint>
              URL товара. После индексации лучше не менять, чтобы не ломать SEO
              и старые ссылки.
            </AdminFieldHint>
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
                onChange={(e) =>
                  setCategoryId(e.target.value ? Number(e.target.value) : "")
                }
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
                defaultValue={product?.subcategoryId ?? ""}
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
          description="Основное изображение и порядок галереи. Preview выше показывает финальную картинку, которую увидит клиент."
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
          title="SEO"
          description="SEO title, description, H1 и canonical сейчас формируются публичным builder'ом. Итоговый вид показан в preview."
          badge="generated"
        >
          {livePublicPreview ? (
            <div className="space-y-4">
              <AdminProductPreview preview={livePublicPreview} />
              <AdminFieldHint>
                Ручные SEO override-поля намеренно не добавлены без DB-миграции.
                Если они понадобятся, их нужно добавить отдельными nullable
                колонками и подключить в buildPublicProductView.
              </AdminFieldHint>
            </div>
          ) : (
            <AdminFieldHint>
              SEO preview появится после создания товара.
            </AdminFieldHint>
          )}
        </AdminSectionCard>

        <AdminSectionCard
          id="parameters"
          title="Характеристики"
          description="DN, PN, материал, модель и соединение участвуют в фильтрах, поиске, публичном названии и SEO."
        >
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="DN" name="dn">
              <Input name="dn" type="number" defaultValue={product?.dn ?? ""} />
            </Field>
            <Field label="PN" name="pn">
              <Input name="pn" type="number" defaultValue={product?.pn ?? ""} />
            </Field>
            <Field label="Резьба" name="thread">
              <Input name="thread" defaultValue={product?.thread ?? ""} />
            </Field>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Материал" name="material">
              <Input name="material" defaultValue={product?.material ?? ""} />
            </Field>
            <Field label="Марка / модель" name="model">
              <Input name="model" defaultValue={product?.model ?? ""} />
            </Field>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Тип соединения" name="connectionType">
              <Input
                name="connectionType"
                defaultValue={product?.connectionType ?? ""}
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
                onClick={() => setSpecs((s) => [...s, { key: "", value: "" }])}
              >
                + Добавить строку
              </Button>
            </div>
            <div className="space-y-2">
              {specs.map((spec, i) => (
                <div key={i} className="grid gap-2 md:grid-cols-[240px_1fr_auto]">
                  <Input
                    name="specKey[]"
                    value={spec.key}
                    onChange={(e) =>
                      setSpecs((curr) =>
                        curr.map((s, idx) =>
                          idx === i ? { ...s, key: e.target.value } : s,
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
                        curr.map((s, idx) =>
                          idx === i ? { ...s, value: e.target.value } : s,
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
                      setSpecs((curr) => curr.filter((_, idx) => idx !== i))
                    }
                  >
                    Убрать
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          id="description"
          title="Описание и SEO-блоки страницы товара"
          description="Описание и списки ниже отображаются на публичной странице товара. Если поле пустое, сайт может использовать SEO fallback."
        >
          <Field label="Короткое описание" name="shortDescription">
            <Textarea
              name="shortDescription"
              rows={2}
              defaultValue={product?.shortDescription ?? ""}
            />
            <AdminFieldHint>
              Используется в карточках, быстрых превью и fallback-описании.
            </AdminFieldHint>
          </Field>

          <Field label="Полное описание" name="longDescription">
            <Textarea
              name="longDescription"
              rows={6}
              defaultValue={product?.longDescription ?? ""}
            />
            <AdminFieldHint>
              При заполнении имеет приоритет над сгенерированным SEO-описанием.
            </AdminFieldHint>
          </Field>

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
          <SubmitButton isEdit={Boolean(product)} />
          {livePublicPreview ? (
            <Button asChild type="button" variant="outline" size="sm">
              <Link href={livePublicPreview.canonicalPath} target="_blank">
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
      ? "Нет изображения товара: публичная карточка будет использовать fallback категории."
      : null,
    !product?.shortDescription?.trim() && !product?.longDescription?.trim()
      ? "Нет описания: страница будет использовать сгенерированный SEO fallback."
      : null,
    product && product.dn == null
      ? "DN не указан: фильтры и поиск по диаметру будут работать хуже."
      : null,
    product && product.pn == null
      ? "PN не указан: фильтры и поиск по давлению будут работать хуже."
      : null,
    preview && !preview.seoTitle.trim()
      ? "SEO title пустой: проверьте название, модель, DN и PN."
      : null,
    preview && !preview.seoDescription.trim()
      ? "SEO description пустой: заполните описание или характеристики."
      : null,
    preview && preview.seoTitle.length > 70
      ? "SEO title длиннее 70 символов: в Google он может обрезаться."
      : null,
    preview && preview.seoDescription.length > 170
      ? "SEO description длиннее 170 символов: в Google он может обрезаться."
      : null,
  ].filter(Boolean);

  if (!warnings.length) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        Карточка выглядит готовой для публикации: есть базовые параметры, SEO
        preview и публичный view.
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
  label: string;
  children: ReactNode;
  name: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
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
    <Button type="submit" disabled={pending} size="sm">
      {pending
        ? "Сохранение..."
        : isEdit
          ? "Сохранить и продолжить"
          : "Создать товар"}
    </Button>
  );
}
