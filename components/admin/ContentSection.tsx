type Props = {
  title: string;
  description?: React.ReactNode;
  id?: string;
  children: React.ReactNode;
};

/** Визуальная группировка блоков контента для страницы «Контент сайта». */
export function ContentSection({ title, description, id, children }: Props) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 sm:px-5">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">{title}</h2>
        {description ? <div className="mt-1.5 text-sm leading-relaxed text-slate-600">{description}</div> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
