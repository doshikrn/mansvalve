import { Boxes, Building2, Clock3, Users } from "lucide-react";
import type { AboutPageContent } from "@/lib/site-content/models";

const STAT_ICONS = [Clock3, Users, Boxes, Building2] as const;

type AboutStatsProps = {
  slots: AboutPageContent["statSlots"];
  values: string[];
};

export function AboutStats({ slots, values }: AboutStatsProps) {
  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {slots.map((slot, index) => {
            const Icon = STAT_ICONS[index] ?? Clock3;
            return (
              <div
                key={`${slot.label}-${index}`}
                className="rounded-xl border border-site-border bg-slate-50 p-5"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-site-primary/10 text-site-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-3xl font-bold tracking-tight text-site-primary">
                  {values[index]}
                </p>
                <p className="mt-1.5 text-sm text-site-muted">{slot.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
