import { AdminInlineNotice, AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  h1Override?: string | null;
  seoTitle?: string | null;
  seoMetaDescription?: string | null;
  entityLabel: "категории" | "подкатегории";
};

export function CatalogEntitySeoFields({
  h1Override,
  seoTitle,
  seoMetaDescription,
  entityLabel,
}: Props) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
      <div>
        <h2 className="text-sm font-semibold">SEO и публичный заголовок</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Поля независимы от URL. Ссылка изменится только при ручном изменении поля slug выше.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="h1Override">
          H1 вручную, необязательно <AdminStatusBadge tone="manual" />
        </Label>
        <input
          id="h1Override"
          name="h1Override"
          type="text"
          defaultValue={h1Override ?? ""}
          placeholder="Пусто — используется название или текущий автоматический H1"
          className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Отображается как главный заголовок страницы {entityLabel}.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="seoTitle">
          SEO Title вручную, необязательно <AdminStatusBadge tone="manual" />
        </Label>
        <input
          id="seoTitle"
          name="seoTitle"
          type="text"
          defaultValue={seoTitle ?? ""}
          placeholder="Пусто — Title формируется автоматически"
          className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Используется во вкладке браузера и поисковой выдаче. Бренд добавляется общим шаблоном сайта.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="seoMetaDescription">
          SEO Description <AdminStatusBadge tone="manual" />
        </Label>
        <Textarea
          id="seoMetaDescription"
          name="seoMetaDescription"
          rows={3}
          defaultValue={seoMetaDescription ?? ""}
          placeholder="Пусто — используется текущее описание или автоматический текст"
          className="text-sm"
        />
      </div>

      <AdminInlineNotice tone="auto">
        Изменение H1, SEO Title или SEO Description не меняет slug и публичный URL.
      </AdminInlineNotice>
    </section>
  );
}
