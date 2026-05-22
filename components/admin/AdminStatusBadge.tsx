import { cn } from "@/lib/utils";

type Tone = "generated" | "readonly" | "manual" | "auto";

const TONE_CLASS: Record<Tone, string> = {
  generated: "border-blue-200 bg-blue-50 text-blue-800",
  readonly: "border-slate-200 bg-slate-50 text-slate-700",
  manual: "border-emerald-200 bg-emerald-50 text-emerald-800",
  auto: "border-amber-200 bg-amber-50 text-amber-800",
};

const TONE_LABEL: Record<Tone, string> = {
  generated: "Заполняется автоматически",
  readonly: "Только просмотр",
  manual: "Изменено вручную",
  auto: "Автоматически",
};

export function AdminStatusBadge({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        TONE_CLASS[tone],
        className,
      )}
    >
      {children ?? TONE_LABEL[tone]}
    </span>
  );
}

export function AdminInlineNotice({
  tone = "auto",
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-lg border px-3 py-2 text-sm leading-relaxed", TONE_CLASS[tone])}>
      {children}
    </div>
  );
}
