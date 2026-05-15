import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description: string;
  url: string;
  className?: string;
};

export function AdminSeoPreview({ title, description, url, className }: Props) {
  const titleLength = title.length;
  const descriptionLength = description.length;

  return (
    <div className={cn("rounded-xl border border-border bg-white p-4", className)}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Google preview</p>
          <p className="text-xs text-muted-foreground">
            Так карточка может выглядеть в поиске Google.
          </p>
        </div>
        <div className="flex gap-2 text-[11px] text-muted-foreground">
          <span>{titleLength}/60 title</span>
          <span>{descriptionLength}/160 description</span>
        </div>
      </div>
      <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
        <p className="truncate text-xs text-[#188038]">{url}</p>
        <p className="mt-1 line-clamp-2 text-[18px] leading-6 text-[#1a0dab]">
          {title}
        </p>
        <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#4d5156]">
          {description}
        </p>
      </div>
    </div>
  );
}
