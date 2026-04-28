import {
  Building2,
  Droplets,
  Factory,
  Fuel,
  Landmark,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { resolveHomeWhoWeSupply } from "@/lib/site-content/public";

const ICONS = [Building2, Fuel, Factory, Wrench, Droplets, Landmark] as const satisfies readonly LucideIcon[];

export async function WhoWeSupply() {
  const { sectionEyebrow, sectionTitle, sectionLead, segments } = await resolveHomeWhoWeSupply();

  return (
    <section className="site-section">
      <div className="site-container">
        <div className="mb-10 max-w-3xl">
          <div className="site-eyebrow">{sectionEyebrow}</div>
          <h2 className="site-heading">{sectionTitle}</h2>
          <p className="site-copy mt-3">{sectionLead}</p>
        </div>

        <ul className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 md:gap-5">
          {segments.map(({ title, text }, index) => {
            const Icon = ICONS[index] ?? Building2;
            return (
              <li key={`${title}-${index}`} className="site-card p-5 sm:p-6">
                <div className="flex gap-4">
                  <div className="site-icon">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-site-ink sm:text-[17px]">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-site-muted sm:text-[15px]">{text}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
