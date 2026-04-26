"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProductDetail } from "@/lib/services/products";
import type { CategoryWithSubcategories } from "@/lib/services/categories";
import {
  MediaUpload,
  type MediaLibraryItem,
  type SelectedMediaItem,
} from "@/components/admin/MediaUpload";

import type { ProductFormState } from "@/app/admin/products/actions";

type Action = (
  state: ProductFormState,
  formData: FormData,
) => Promise<ProductFormState>;

type Spec = { key: string; value: string };

type Props = {
  action: Action;
  categories: CategoryWithSubcategories[];
  mediaLibrary: MediaLibraryItem[];
  product?: ProductDetail | null;
};

const INITIAL: ProductFormState = {};

export function ProductForm({ action, categories, mediaLibrary, product }: Props) {
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
  }));

  return (
    <form action={runAction} className="space-y-6">
      <Section title="Основное">
        <Field label="Название" required name="name" error={state.fieldErrors?.name}>
          <Input name="name" defaultValue={product?.name ?? ""} required />
        </Field>

        <Field
          label="Slug (опционально — сгенерируется из названия)"
          name="slug"
          error={state.fieldErrors?.slug}
        >
          <Input name="slug" defaultValue={product?.slug ?? ""} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
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
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none"
            >
              <option value="">— выберите —</option>
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
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none"
              disabled={!selectedCategory}
            >
              <option value="">— не выбрана —</option>
              {selectedCategory?.subcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Короткое описание" name="shortDescription">
          <Textarea
            name="shortDescription"
            rows={2}
            defaultValue={product?.shortDescription ?? ""}
          />
        </Field>

        <Field label="Полное описание" name="longDescription">
          <Textarea
            name="longDescription"
            rows={6}
            defaultValue={product?.longDescription ?? ""}
          />
        </Field>
      </Section>

      <Section title="Параметры">
        <div className="grid grid-cols-3 gap-3">
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

        <div className="grid grid-cols-2 gap-3">
          <Field label="Материал" name="material">
            <Input name="material" defaultValue={product?.material ?? ""} />
          </Field>
          <Field label="Модель" name="model">
            <Input name="model" defaultValue={product?.model ?? ""} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
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

        <div className="grid grid-cols-3 gap-3">
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
          <Field label="Порядок" name="sortOrder">
            <Input
              name="sortOrder"
              type="number"
              defaultValue={product?.sortOrder ?? 0}
            />
          </Field>
        </div>

        <div className="flex gap-4 pt-1 text-sm">
          <CheckboxField
            name="priceByRequest"
            label="Цена по запросу"
            defaultChecked={product?.priceByRequest ?? true}
          />
          <CheckboxField
            name="isActive"
            label="Активен"
            defaultChecked={product?.isActive ?? true}
          />
          <CheckboxField
            name="isFeatured"
            label="Рекомендуем"
            defaultChecked={product?.isFeatured ?? false}
          />
        </div>
      </Section>

      <Section title="Характеристики">
        <div className="space-y-2">
          {specs.map((spec, i) => (
            <div key={i} className="flex items-center gap-2">
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
                placeholder="Ключ (например, DN)"
                className="max-w-xs"
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
                Удалить
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSpecs((s) => [...s, { key: "", value: "" }])}
          >
            + Добавить параметр
          </Button>
        </div>
      </Section>

      <MediaUpload
        title="Изображения товара"
        initialLibrary={mediaLibrary}
        initialSelected={selectedImages}
        hiddenInputName="imagesPayload"
        uploadFolder="products"
        allowAttach
        attachOnUpload
      />

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <SubmitButton isEdit={Boolean(product)} />
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-border bg-background p-4">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
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
  children: React.ReactNode;
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
    <Button type="submit" disabled={pending}>
      {pending ? "Сохраняем…" : isEdit ? "Сохранить изменения" : "Создать товар"}
    </Button>
  );
}
