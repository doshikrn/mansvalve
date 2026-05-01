type AboutIntroProps = {
  title: string;
  paragraphs: string[];
};

export function AboutIntro({ title, paragraphs }: AboutIntroProps) {
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
      </div>
    </section>
  );
}
