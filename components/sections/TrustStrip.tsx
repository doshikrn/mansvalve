import { Award, FileCheck2, Receipt, ShieldCheck, Timer, Truck } from "lucide-react";

import { COMPANY } from "@/lib/company";
import { applyPlaceholders } from "@/lib/site-content/models";
import { resolveTrustStrip } from "@/lib/site-content/public";
import { TrustStripClient } from "@/components/sections/TrustStripClient";

const TRUST_PILLS = [
  { label: "Сертификаты ГОСТ / DIN / ISO", Icon: ShieldCheck },
  { label: "Поставка по всей РК", Icon: Truck },
  { label: "КП за 15 минут", Icon: Timer },
  { label: "Документы и НДС", Icon: Receipt },
  { label: "Гарантия от производителя", Icon: Award },
  { label: "Паспорта и инструкции", Icon: FileCheck2 },
] as const;

export async function TrustStrip() {
  const { paragraph } = await resolveTrustStrip();
  const text = applyPlaceholders(paragraph, COMPANY.name);
  const idx = text.indexOf(COMPANY.name);

  return (
    <TrustStripClient>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.92fr)] lg:items-center">
        <div className="flex min-w-0 gap-3 sm:gap-4">
          <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#2F6BFF]/25 bg-[#2F6BFF]/12 text-[#8bb4ff]">
            <Award className="h-5 w-5" strokeWidth={2} aria-hidden />
          </span>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
            {idx >= 0 ? (
              <>
                {text.slice(0, idx)}
                <span className="font-semibold uppercase text-white">{COMPANY.name}</span>
                {text.slice(idx + COMPANY.name.length)}
              </>
            ) : (
              text
            )}
          </p>
        </div>

        <ul
          aria-label="Что мы гарантируем"
          className="flex flex-wrap items-center gap-1.5 sm:gap-2 lg:justify-end"
        >
          {TRUST_PILLS.map(({ label, Icon }) => (
            <li
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.055] px-3 py-1.5 text-[11px] font-medium text-slate-200 shadow-sm transition-colors hover:border-[#2F6BFF]/32 hover:bg-white/[0.085] sm:text-xs"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-[#8bb4ff]" strokeWidth={2} aria-hidden />
              <span className="whitespace-nowrap">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </TrustStripClient>
  );
}
