import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickRequestForm } from "@/components/contacts/QuickRequestForm";

type AboutCTAProps = {
  title: string;
  subtitle: string;
  catalogLabel: string;
  contactsLabel: string;
};

export function AboutCTA({ title, subtitle, catalogLabel, contactsLabel }: AboutCTAProps) {
  return (
    <section className="bg-[#071B3E] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/15 bg-white/5 p-8 text-white">
            <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-200">{subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-lg bg-site-cta font-semibold text-white hover:bg-orange-700"
                asChild
              >
                <Link href="/catalog">
                  {catalogLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-lg border-white/35 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/contacts">{contactsLabel}</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-[#0B2453] p-6">
            <QuickRequestForm variant="dark" source="about-page-cta" />
          </div>
        </div>
      </div>
    </section>
  );
}
