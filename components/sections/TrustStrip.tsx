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
      <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-slate-300 sm:text-base">
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

      <ul
        aria-label="Что мы гарантируем"
        className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-1.5 sm:mt-6 sm:gap-2"
      >
        {TRUST_PILLS.map(({ label, Icon }) => (
          <li
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium text-slate-200 shadow-sm transition-colors hover:border-white/22 hover:bg-white/[0.08] sm:text-xs"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-[#8bb4ff]" strokeWidth={2} aria-hidden />
            <span className="whitespace-nowrap">{label}</span>
          </li>
        ))}
      </ul>
    </TrustStripClient>
  );
}
