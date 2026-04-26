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
      className="border-b border-slate-200 bg-white py-6 sm:py-7"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-slate-600 sm:text-base">
          {idx >= 0 ? (
            <>
              {text.slice(0, idx)}
              <span className="font-semibold text-slate-900">{COMPANY.name}</span>
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
