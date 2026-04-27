import { COMPANY } from "@/lib/company";
import { applyPlaceholders } from "@/lib/site-content/models";
import { resolveTrustStrip } from "@/lib/site-content/public";

export async function TrustStrip() {
  const { paragraph } = await resolveTrustStrip();
  const text = applyPlaceholders(paragraph, COMPANY.name);
  const idx = text.indexOf(COMPANY.name);

  return (
    <section
      aria-label="О компании"
      className="border-b border-site-border bg-site-bg py-6 sm:py-7"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-site-muted sm:text-base">
          {idx >= 0 ? (
            <>
              {text.slice(0, idx)}
              <span className="font-semibold uppercase text-site-ink">
                {COMPANY.name}
              </span>
              {text.slice(idx + COMPANY.name.length)}
            </>
          ) : (
            text
          )}
        </p>
      </div>
    </section>
  );
}
