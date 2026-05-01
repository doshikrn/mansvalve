import { CheckCircle2 } from "lucide-react";

type AboutWhyUsProps = {
  title: string;
  items: string[];
};

export function AboutWhyUs({ title, items }: AboutWhyUsProps) {
  return (
    <section className="bg-slate-50 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-site-ink sm:text-3xl">{title}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="rounded-xl border border-site-border bg-white px-5 py-4"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-site-primary" />
                <div>
                  <p className="text-sm font-semibold text-site-ink">{item}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
