import { resolveHomeHowItWorks } from "@/lib/site-content/public";

export async function HowItWorks() {
  const { sectionEyebrow, sectionTitle, steps } = await resolveHomeHowItWorks();

  return (
    <section id="how-it-works" className="site-section">
      <div className="site-container">
        <div className="mb-10 max-w-3xl">
          <div className="site-eyebrow">{sectionEyebrow}</div>
          <h2 className="site-heading">{sectionTitle}</h2>
        </div>

        <div className="relative">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-site-border lg:block" />

          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step) => (
              <li key={step.num} className="site-card relative flex flex-col p-5 lg:min-h-[190px]">
                <div className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-lg border border-site-primary/30 bg-site-card text-lg font-bold text-site-primary shadow-sm">
                  {step.num}
                </div>
                <h3 className="mb-2 text-sm font-bold uppercase text-site-ink sm:text-base">{step.title}</h3>
                <p className="text-sm leading-relaxed text-site-muted">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
