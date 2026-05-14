type AboutIntroProps = {
  title: string;
  paragraphs: string[];
  cards: {
    title: string;
    text: string;
  }[];
};

export function AboutIntro({ title, paragraphs, cards }: AboutIntroProps) {
  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold text-site-ink sm:text-3xl">{title}</h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-site-muted">
            {paragraphs.map((paragraph, index) => (
              <p key={`intro-${index}`}>{paragraph}</p>
            ))}
          </div>
        </div>
        {cards.length ? (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {cards.map((card) => (
              <div key={card.title} className="rounded-xl border border-site-border bg-slate-50 p-5">
                <h3 className="text-sm font-semibold text-site-ink">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-site-muted">{card.text}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
