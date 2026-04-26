import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  defaults: {
    topSeo: string;
    trustLines: string;
    bottomSeo: string;
    ctaHeading: string;
    ctaDescription: string;
  };
};

export function CategorySeoFields({ defaults }: Props) {
  return (
    <div className="space-y-4 border-t border-border pt-4">
      <p className="text-sm font-medium">SEO-блоки на странице категории</p>
      <p className="text-xs text-muted-foreground">
        Если оставить пустым, на сайте останется статический текст из{" "}
        <code className="rounded bg-muted px-1">lib/category-content.ts</code>{" "}
        (безопасный fallback).
      </p>
      <div className="space-y-2">
        <Label htmlFor="topSeo">Верхний SEO-текст (абзацы через пустую строку)</Label>
        <Textarea
          id="topSeo"
          name="topSeo"
          rows={8}
          defaultValue={defaults.topSeo}
          className="font-mono text-xs sm:text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="trustLines">Блок доверия (каждая строка — отдельный пункт)</Label>
        <Textarea
          id="trustLines"
          name="trustLines"
          rows={6}
          defaultValue={defaults.trustLines}
          className="font-mono text-xs sm:text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bottomSeo">Нижний SEO-текст (абзацы через пустую строку)</Label>
        <Textarea
          id="bottomSeo"
          name="bottomSeo"
          rows={6}
          defaultValue={defaults.bottomSeo}
          className="font-mono text-xs sm:text-sm"
        />
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ctaHeading">Заголовок CTA</Label>
          <input
            id="ctaHeading"
            name="ctaHeading"
            defaultValue={defaults.ctaHeading}
            className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ctaDescription">Текст CTA</Label>
          <Textarea
            id="ctaDescription"
            name="ctaDescription"
            rows={3}
            defaultValue={defaults.ctaDescription}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
