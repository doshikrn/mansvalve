import Link from "next/link";

import { AdminFormFooter } from "@/components/admin/AdminFormFooter";
import { MediaUrlField, type MediaUrlOption } from "@/components/admin/MediaUrlField";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  saveHomeCertificatesPreviewAction,
  saveHomeClientLogosAction,
  saveHomeTestimonialsAction,
  saveHomeThankYouLettersAction,
  saveHomeTrustCasesAction,
} from "@/app/admin/content/actions";
import { TRUST_PROOF_MAX_ITEMS } from "@/lib/site-content/trust-proof";
import type {
  HomeCertificatesPreviewContent,
  HomeClientLogosContent,
  HomeTestimonialsContent,
  HomeThankYouLettersContent,
  HomeTrustCasesContent,
} from "@/lib/site-content/trust-proof";

type Props = {
  clientLogos: HomeClientLogosContent;
  trustCases: HomeTrustCasesContent;
  testimonials: HomeTestimonialsContent;
  thankYouLetters: HomeThankYouLettersContent;
  certificatesPreview: HomeCertificatesPreviewContent;
  mediaLibrary: MediaUrlOption[];
};

function Field({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
    </div>
  );
}

function TrustActiveField({ name, defaultChecked }: { name: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <input
        type="checkbox"
        name={name}
        value="on"
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-border"
      />
      Показывать на сайте
    </label>
  );
}

export function TrustProofAdminForms({
  clientLogos,
  trustCases,
  testimonials,
  thankYouLetters,
  certificatesPreview,
  mediaLibrary,
}: Props) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Логотипы клиентов</CardTitle>
          <CardDescription>
            До {TRUST_PROOF_MAX_ITEMS} логотипов. Пустые строки не сохраняются. Блок на главной появится
            только после добавления активных элементов.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveHomeClientLogosAction} className="max-w-3xl space-y-4">
            <Field label="Заголовок секции" name="title" defaultValue={clientLogos.title} />
            {Array.from({ length: TRUST_PROOF_MAX_ITEMS }).map((_, i) => {
              const item = clientLogos.items[i];
              return (
                <div key={i} className="space-y-3 rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">Логотип {i + 1}</p>
                  <Field
                    label="Название компании"
                    name={`logo_company_${i}`}
                    defaultValue={item?.companyName ?? ""}
                  />
                  <MediaUrlField
                    label="Логотип"
                    name={`logo_url_${i}`}
                    defaultValue={item?.logoUrl ?? ""}
                    initialLibrary={mediaLibrary}
                    uploadFolder="trust/client-logos"
                  />
                  <Field
                    label="Сайт компании (необязательно)"
                    name={`logo_website_${i}`}
                    defaultValue={item?.websiteUrl ?? ""}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Порядок (sortOrder)"
                      name={`logo_sort_${i}`}
                      type="number"
                      defaultValue={String(item?.sortOrder ?? i * 10)}
                    />
                    <TrustActiveField
                      name={`logo_active_${i}`}
                      defaultChecked={item?.isActive ?? false}
                    />
                  </div>
                </div>
              );
            })}
            <AdminFormFooter previewHref="/" saveLabel="Сохранить логотипы" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Кейсы с фото</CardTitle>
          <CardDescription>
            Реальные кейсы с изображением объекта или поставки. Отдельно от текстового блока «Кейсы и
            примеры поставок».
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveHomeTrustCasesAction} className="max-w-3xl space-y-4">
            <Field label="Заголовок" name="title" defaultValue={trustCases.title} />
            <Field label="Подзаголовок" name="subtitle" defaultValue={trustCases.subtitle ?? ""} />
            {Array.from({ length: TRUST_PROOF_MAX_ITEMS }).map((_, i) => {
              const item = trustCases.items[i];
              return (
                <div key={i} className="space-y-3 rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">Кейс {i + 1}</p>
                  <Field label="Заголовок" name={`case_title_${i}`} defaultValue={item?.title ?? ""} />
                  <Field label="Отрасль" name={`case_industry_${i}`} defaultValue={item?.industry ?? ""} />
                  <Field
                    label="Поставленная продукция"
                    name={`case_products_${i}`}
                    defaultValue={item?.suppliedProducts ?? ""}
                  />
                  <div className="space-y-1">
                    <Label>Описание</Label>
                    <Textarea
                      name={`case_description_${i}`}
                      rows={3}
                      defaultValue={item?.description ?? ""}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Результат (необязательно)</Label>
                    <Textarea name={`case_result_${i}`} rows={2} defaultValue={item?.result ?? ""} />
                  </div>
                  <MediaUrlField
                    label="Фото кейса"
                    name={`case_image_${i}`}
                    defaultValue={item?.imageUrl ?? ""}
                    initialLibrary={mediaLibrary}
                    uploadFolder="trust/cases"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Порядок (sortOrder)"
                      name={`case_sort_${i}`}
                      type="number"
                      defaultValue={String(item?.sortOrder ?? i * 10)}
                    />
                    <TrustActiveField
                      name={`case_active_${i}`}
                      defaultChecked={item?.isActive ?? false}
                    />
                  </div>
                </div>
              );
            })}
            <AdminFormFooter previewHref="/" saveLabel="Сохранить кейсы" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Сертификаты на главной</CardTitle>
          <CardDescription>
            Заголовок и количество карточек. Сами сертификаты редактируются в{" "}
            <Link href="/admin/certificates" className="text-primary underline">
              разделе «Сертификаты»
            </Link>
            . На главной показываются активные записи по sortOrder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveHomeCertificatesPreviewAction} className="max-w-3xl space-y-4">
            <Field label="Заголовок секции" name="title" defaultValue={certificatesPreview.title} />
            <Field label="Подзаголовок" name="subtitle" defaultValue={certificatesPreview.subtitle ?? ""} />
            <Field
              label="Количество на главной (3–5)"
              name="limit"
              type="number"
              defaultValue={String(certificatesPreview.limit)}
            />
            <AdminFormFooter previewHref="/" saveLabel="Сохранить настройки" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Отзывы</CardTitle>
          <CardDescription>Только реальные отзывы, добавленные менеджером. Без автогенерации.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveHomeTestimonialsAction} className="max-w-3xl space-y-4">
            <Field label="Заголовок" name="title" defaultValue={testimonials.title} />
            {Array.from({ length: TRUST_PROOF_MAX_ITEMS }).map((_, i) => {
              const item = testimonials.items[i];
              return (
                <div key={i} className="space-y-3 rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">Отзыв {i + 1}</p>
                  <div className="space-y-1">
                    <Label>Текст отзыва</Label>
                    <Textarea
                      name={`testimonial_quote_${i}`}
                      rows={3}
                      defaultValue={item?.quote ?? ""}
                    />
                  </div>
                  <Field
                    label="Компания"
                    name={`testimonial_company_${i}`}
                    defaultValue={item?.companyName ?? ""}
                  />
                  <Field
                    label="Имя автора (необязательно)"
                    name={`testimonial_author_${i}`}
                    defaultValue={item?.authorName ?? ""}
                  />
                  <Field
                    label="Должность (необязательно)"
                    name={`testimonial_position_${i}`}
                    defaultValue={item?.authorPosition ?? ""}
                  />
                  <MediaUrlField
                    label="Логотип компании (необязательно)"
                    name={`testimonial_logo_${i}`}
                    defaultValue={item?.companyLogoUrl ?? ""}
                    initialLibrary={mediaLibrary}
                    uploadFolder="trust/testimonials"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Порядок (sortOrder)"
                      name={`testimonial_sort_${i}`}
                      type="number"
                      defaultValue={String(item?.sortOrder ?? i * 10)}
                    />
                    <TrustActiveField
                      name={`testimonial_active_${i}`}
                      defaultChecked={item?.isActive ?? false}
                    />
                  </div>
                </div>
              );
            })}
            <AdminFormFooter previewHref="/" saveLabel="Сохранить отзывы" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Благодарственные письма</CardTitle>
          <CardDescription>
            Превью — изображение, документ — URL файла из медиатеки (PDF/скан).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveHomeThankYouLettersAction} className="max-w-3xl space-y-4">
            <Field label="Заголовок" name="title" defaultValue={thankYouLetters.title} />
            {Array.from({ length: TRUST_PROOF_MAX_ITEMS }).map((_, i) => {
              const item = thankYouLetters.items[i];
              return (
                <div key={i} className="space-y-3 rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">Письмо {i + 1}</p>
                  <Field label="Название" name={`letter_title_${i}`} defaultValue={item?.title ?? ""} />
                  <Field
                    label="Компания"
                    name={`letter_company_${i}`}
                    defaultValue={item?.companyName ?? ""}
                  />
                  <MediaUrlField
                    label="Превью (изображение)"
                    name={`letter_preview_${i}`}
                    defaultValue={item?.previewImageUrl ?? ""}
                    initialLibrary={mediaLibrary}
                    uploadFolder="trust/thank-you"
                  />
                  <Field
                    label="Ссылка на документ (URL из /admin/media)"
                    name={`letter_document_${i}`}
                    defaultValue={item?.documentUrl ?? ""}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Порядок (sortOrder)"
                      name={`letter_sort_${i}`}
                      type="number"
                      defaultValue={String(item?.sortOrder ?? i * 10)}
                    />
                    <TrustActiveField
                      name={`letter_active_${i}`}
                      defaultChecked={item?.isActive ?? false}
                    />
                  </div>
                </div>
              );
            })}
            <AdminFormFooter previewHref="/" saveLabel="Сохранить письма" />
          </form>
        </CardContent>
      </Card>
    </>
  );
}
