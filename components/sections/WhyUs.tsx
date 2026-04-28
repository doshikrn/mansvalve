import {
  Building2,
  Clock,
  FileCheck2,
  MapPin,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { resolveHomeWhyUs } from "@/lib/site-content/public";

const ICONS = [Clock, ShieldCheck, Wallet, FileCheck2, MapPin, Building2] as const satisfies readonly LucideIcon[];

export async function WhyUs() {
  const { sectionEyebrow, sectionTitle, items } = await resolveHomeWhyUs();

  return (
    <section className="site-section">
      <div className="site-container">
        <div className="mb-10 max-w-3xl">
          <div className="site-eyebrow">{sectionEyebrow}</div>
          <h2 className="site-heading">{sectionTitle}</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ metric, title, desc }, index) => {
            const Icon = ICONS[index] ?? Clock;
            return (
              <div key={`${title}-${index}`} className="site-card group p-6">
                <div className="site-icon mb-4 h-12 w-12">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-site-primary">{metric}</p>
                <h3 className="mb-1 text-base font-bold text-site-ink sm:text-[17px]">{title}</h3>
                <p className="text-sm leading-snug text-site-muted">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
