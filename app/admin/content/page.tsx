import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { SITE_CONTENT_KEYS } from "@/lib/site-content/keys";
import {
  defaultAboutMeta,
  defaultContactsMeta,
  defaultHomeMeta,
  mergeAboutCopy,
  mergeAboutMeta,
  mergeContactsCopy,
  mergeContactsMeta,
  mergeHomeFaq,
  mergeHomeHero,
  mergeHomeMeta,
  mergeRequestCta,
  mergeTrustStrip,
} from "@/lib/site-content/models";
import { getContentBlock } from "@/lib/services/content-blocks";
import { COMPANY } from "@/lib/company";

import {
  saveAboutCopyAction,
  saveAboutMetaAction,
  saveContactsCopyAction,
  saveContactsMetaAction,
  saveHomeFaqAction,
  saveHomeHeroAction,
  saveHomeMetaAction,
  saveRequestCtaAction,
  saveTrustStripAction,
} from "./actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdmin("/admin/content");
  const sp = await searchParams;

  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        База данных не настроена. Контентные блоки сохраняются в Postgres (
        <code>content_blocks</code>).
      </p>
    );
  }

  const [
    heroRow,
    trustRow,
    rctaRow,
    faqRow,
    metaRow,
    aboutMetaRow,
    aboutRow,
    contactsMetaRow,
    contactsRow,
  ] = await Promise.all([
    getContentBlock(SITE_CONTENT_KEYS.homeHero),
    getContentBlock(SITE_CONTENT_KEYS.homeTrustStrip),
    getContentBlock(SITE_CONTENT_KEYS.homeRequestCta),
    getContentBlock(SITE_CONTENT_KEYS.homeFaq),
    getContentBlock(SITE_CONTENT_KEYS.homeMeta),
    getContentBlock(SITE_CONTENT_KEYS.aboutMeta),
    getContentBlock(SITE_CONTENT_KEYS.aboutCopy),
    getContentBlock(SITE_CONTENT_KEYS.contactsMeta),
    getContentBlock(SITE_CONTENT_KEYS.contactsCopy),
  ]);

  const hero = mergeHomeHero(heroRow?.data, 0);
  const trust = mergeTrustStrip(trustRow?.data);
  const rcta = mergeRequestCta(rctaRow?.data);
  const faq = mergeHomeFaq(faqRow?.data);
  const meta = mergeHomeMeta(metaRow?.data, COMPANY.name);
  const aboutMeta = mergeAboutMeta(aboutMetaRow?.data, COMPANY.name);
  const about = mergeAboutCopy(aboutRow?.data);
  const contactsMeta = mergeContactsMeta(contactsMetaRow?.data, {
    companyName: COMPANY.name,
    phoneDisplay: COMPANY.phoneDisplay,
    email: COMPANY.email,
    city: COMPANY.address.city,
  });
  const contacts = mergeContactsCopy(contactsRow?.data);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Контент сайта</h1>
        <p className="text-sm text-muted-foreground">
          Тексты в <code>content_blocks</code>. Публичные страницы читают БД при
          наличии <code>DATABASE_URL</code>, иначе остаются прежние статические
          значения в коде.
        </p>
      </header>

      {sp.error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {sp.error}
        </p>
      ) : null}
      {sp.saved ? (
        <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          Сохранено: {sp.saved}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Главная — герой</CardTitle>
          <CardDescription>
            Вторая цифра в статистике («{hero.stat2Label}») всегда подставляется
            из актуального числа позиций в каталоге.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveHomeHeroAction} className="grid max-w-3xl gap-3">
            <Field label="Eyebrow" name="eyebrow" defaultValue={hero.eyebrow} />
            <Field label="H1 (до акцента)" name="h1Line1" defaultValue={hero.h1Line1} />
            <Field label="H1 акцент (цвет)" name="h1Highlight" defaultValue={hero.h1Highlight} />
            <div className="space-y-1">
              <Label htmlFor="subhead">Подзаголовок</Label>
              <Textarea id="subhead" name="subhead" rows={3} defaultValue={hero.subhead} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Кнопка 1" name="primaryCta" defaultValue={hero.primaryCta} />
              <Field label="Кнопка 2 (текст)" name="secondaryCta" defaultValue={hero.secondaryCta} />
            </div>
            <p className="text-xs text-muted-foreground">Плашки доверия (4 строки)</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <Field
                  key={i}
                  label={`Пункт ${i + 1}`}
                  name={`trust_${i}`}
                  defaultValue={hero.trustPoints[i] ?? ""}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Статистика (3 колонки)</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Кол.1 значение" name="stat1Val" defaultValue={hero.stat1Val} />
              <Field label="Кол.1 подпись" name="stat1Label" defaultValue={hero.stat1Label} />
              <Field label="Кол.2 подпись" name="stat2Label" defaultValue={hero.stat2Label} />
              <Field label="Кол.3 значение" name="stat3Val" defaultValue={hero.stat3Val} />
              <Field label="Кол.3 подпись" name="stat3Label" defaultValue={hero.stat3Label} />
            </div>
            <Field label="Блок «Популярные» — eyebrow" name="featuredEyebrow" defaultValue={hero.featuredEyebrow} />
            <Field label="Блок «Популярные» — заголовок" name="featuredTitle" defaultValue={hero.featuredTitle} />
            <Field
              label="Ссылка «Все N…» (шаблон)"
              name="featuredLinkTemplate"
              defaultValue={hero.featuredLinkTemplate}
            />
            <p className="text-xs text-muted-foreground">
              В шаблоне используйте <code className="rounded bg-muted px-1">{"{{COUNT}}"}</code> для числа
              позиций.
            </p>
            <Button type="submit" size="sm">
              Сохранить герой
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Главная — полоса доверия</CardTitle>
          <CardDescription>
            Плейсхолдер <code>{"{{COMPANY}}"}</code> будет заменён на название компании.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveTrustStripAction} className="max-w-3xl space-y-3">
            <div className="space-y-1">
              <Label htmlFor="trust_p">Абзац</Label>
              <Textarea
                id="trust_p"
                name="paragraph"
                rows={4}
                defaultValue={trust.paragraph}
                className="text-sm"
              />
            </div>
            <Button type="submit" size="sm">
              Сохранить
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Главная — блок заявки (CTA)</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveRequestCtaAction} className="max-w-3xl space-y-3">
            <Field label="Заголовок" name="title" defaultValue={rcta.title} />
            <div className="space-y-1">
              <Label htmlFor="rcta_sub">Подзаголовок</Label>
              <Textarea id="rcta_sub" name="subtitle" rows={3} defaultValue={rcta.subtitle} />
            </div>
            <Field label="Строка под формой" name="footerHint" defaultValue={rcta.footerHint} />
            <Button type="submit" size="sm">
              Сохранить
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Главная — FAQ</CardTitle>
          <CardDescription>До 8 пар вопрос–ответ; пустые строки пропускаются.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveHomeFaqAction} className="max-w-3xl space-y-4">
            <Field label="Eyebrow секции" name="sectionEyebrow" defaultValue={faq.sectionEyebrow} />
            <Field label="Заголовок секции" name="sectionTitle" defaultValue={faq.sectionTitle} />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Вопрос {i + 1}</Label>
                  <input
                    name={`faq_q_${i}`}
                    defaultValue={faq.items[i]?.q ?? ""}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Ответ {i + 1}</Label>
                  <Textarea name={`faq_a_${i}`} rows={3} defaultValue={faq.items[i]?.a ?? ""} className="text-sm" />
                </div>
              </div>
            ))}
            <Button type="submit" size="sm">
              Сохранить FAQ
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meta — главная (Open Graph)</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveHomeMetaAction} className="max-w-3xl space-y-3">
            <Field label="OG title" name="ogTitle" defaultValue={meta.ogTitle} />
            <div className="space-y-1">
              <Label htmlFor="ogd">OG description</Label>
              <Textarea id="ogd" name="ogDescription" rows={3} defaultValue={meta.ogDescription} />
            </div>
            <p className="text-xs text-muted-foreground">
              По умолчанию (без БД):{" "}
              <code className="rounded bg-muted px-1">{defaultHomeMeta(COMPANY.name).ogTitle}</code>
            </p>
            <Button type="submit" size="sm">
              Сохранить meta
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meta — О компании</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveAboutMetaAction} className="max-w-3xl space-y-3">
            <Field label="Title" name="title" defaultValue={aboutMeta.title} />
            <div className="space-y-1">
              <Label htmlFor="about_meta_desc">Description</Label>
              <Textarea
                id="about_meta_desc"
                name="description"
                rows={3}
                defaultValue={aboutMeta.description}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              По умолчанию (без БД):{" "}
              <code className="rounded bg-muted px-1">{defaultAboutMeta(COMPANY.name).title}</code>
            </p>
            <Button type="submit" size="sm">
              Сохранить meta «О компании»
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>О компании</CardTitle>
          <CardDescription>
            <code>{"{{COMPANY}}"}</code> в текстах; в строке под «Что мы поставляем» —{" "}
            <code>{"{{CAT}}"}</code> и <code>{"{{PROD}}"}</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveAboutCopyAction} className="max-w-3xl space-y-3">
            <div className="space-y-1">
              <Label htmlFor="about_lead">Лид под заголовком</Label>
              <Textarea id="about_lead" name="headerLead" rows={2} defaultValue={about.headerLead} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="about_ov">«Кто мы» — абзацы через пустую строку</Label>
              <Textarea
                id="about_ov"
                name="overview"
                rows={10}
                defaultValue={about.overviewParagraphs.join("\n\n")}
                className="font-mono text-xs sm:text-sm"
              />
            </div>
            <Field
              label="Строка под «Что мы поставляем»"
              name="productGroupsLine"
              defaultValue={about.productGroupsLine}
            />
            <Field label="CTA — заголовок" name="ctaTitle" defaultValue={about.ctaTitle} />
            <div className="space-y-1">
              <Label htmlFor="about_cta_sub">CTA — текст</Label>
              <Textarea id="about_cta_sub" name="ctaSubtitle" rows={3} defaultValue={about.ctaSubtitle} />
            </div>
            <Button type="submit" size="sm">
              Сохранить «О компании»
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meta — Контакты</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveContactsMetaAction} className="max-w-3xl space-y-3">
            <Field label="Title" name="title" defaultValue={contactsMeta.title} />
            <div className="space-y-1">
              <Label htmlFor="contacts_meta_desc">Description</Label>
              <Textarea
                id="contacts_meta_desc"
                name="description"
                rows={3}
                defaultValue={contactsMeta.description}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              По умолчанию (без БД):{" "}
              <code className="rounded bg-muted px-1">
                {defaultContactsMeta({
                  companyName: COMPANY.name,
                  phoneDisplay: COMPANY.phoneDisplay,
                  email: COMPANY.email,
                  city: COMPANY.address.city,
                }).title}
              </code>
            </p>
            <Button type="submit" size="sm">
              Сохранить meta «Контакты»
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Контакты — вспомогательные тексты</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveContactsCopyAction} className="max-w-3xl space-y-3">
            <div className="space-y-1">
              <Label htmlFor="c_lead">Под заголовком страницы</Label>
              <Textarea id="c_lead" name="pageLead" rows={2} defaultValue={contacts.pageLead} />
            </div>
            <Field label="Заголовок над формой" name="formTitle" defaultValue={contacts.formTitle} />
            <div className="space-y-1">
              <Label htmlFor="c_help">Текст под заголовком формы</Label>
              <Textarea id="c_help" name="formHelper" rows={2} defaultValue={contacts.formHelper} />
            </div>
            <Button type="submit" size="sm">
              Сохранить контакты
            </Button>
          </form>
        </CardContent>
      </Card>

      <details className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
        <summary className="cursor-pointer font-medium text-foreground">Сброс к значениям по умолчанию</summary>
        <p className="mt-2">
          Удалите соответствующую строку в таблице <code>content_blocks</code> (или очистите{" "}
          <code>data</code>) и сохраните форму заново — при следующем рендере подтянутся дефолты из{" "}
          <code>lib/site-content/models.ts</code>.
        </p>
      </details>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
      />
    </div>
  );
}
