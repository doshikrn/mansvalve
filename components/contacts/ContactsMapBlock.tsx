import { ExternalLink, MapPin } from "lucide-react";

import { COMPANY } from "@/lib/company";

const MAP_URL = COMPANY.address.mapUrl;

/**
 * Static “map” panel (no iframe): grid, route accent, pin, coordinates, 2GIS CTA.
 */
export function ContactsMapBlock() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div
        className="relative min-h-[17rem] overflow-hidden sm:min-h-[20rem] lg:min-h-[22rem]"
        aria-label={`Как нас найти — ${COMPANY.address.city}, ${COMPANY.address.street}`}
      >
        {/* Base wash */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50/80 to-slate-200/60"
        />
        {/* Fine grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(148 163 184 / 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgb(148 163 184 / 0.5) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Coarse grid (depth) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(71 85 105) 1px, transparent 1px), linear-gradient(to bottom, rgb(71 85 105) 1px, transparent 1px)",
            backgroundSize: "96px 96px",
          }}
        />

        {/* Decorative route + markers (SVG) */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full text-blue-600/25"
          aria-hidden="true"
          viewBox="0 0 800 400"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M 40 120 C 180 40, 320 80, 420 180 S 580 300, 720 200"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="4 10"
            className="text-slate-400/50"
          />
          <circle cx="120" cy="95" r="5" className="fill-blue-500/30" />
          <circle cx="280" cy="70" r="4" className="fill-slate-500/25" />
          <circle cx="520" cy="220" r="4" className="fill-blue-600/25" />
          <circle cx="680" cy="160" r="3.5" className="fill-slate-500/20" />
        </svg>

        {/* Corner coordinate accent */}
        <p
          className="pointer-events-none absolute left-3 top-3 z-[1] font-mono text-[10px] leading-tight tracking-tight text-slate-500/80 sm:left-4 sm:top-4 sm:text-xs"
          aria-hidden="true"
        >
          43.2882°&nbsp;N
          <br />
          76.9173°&nbsp;E
        </p>
        <p
          className="pointer-events-none absolute bottom-3 right-3 z-[1] max-w-[10rem] text-right font-mono text-[9px] text-slate-400/90 sm:bottom-4 sm:right-4 sm:text-[10px]"
          aria-hidden="true"
        >
          · · · — маршрут
          <br />
          к офису
        </p>

        {/* Center: pin + address + CTA */}
        <div className="relative z-10 flex min-h-[17rem] flex-col items-center justify-center px-4 py-10 sm:min-h-[20rem] lg:min-h-[22rem]">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg ring-4 ring-white/80 sm:h-14 sm:w-14">
            <MapPin className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
            Офис и склад
          </p>
          <p className="mt-1 text-center text-lg font-bold text-slate-900 sm:text-xl">
            г. {COMPANY.address.city}
          </p>
          <p className="mt-1 max-w-sm text-center text-sm text-slate-600">
            {COMPANY.address.street}
          </p>
          <a
            href={MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/95 px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-md backdrop-blur-sm transition hover:border-blue-600 hover:text-blue-700"
          >
            <span>Открыть в 2GIS</span>
            <ExternalLink className="h-4 w-4 opacity-80" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-100 bg-white/80 px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8 sm:px-6">
        <p className="flex items-start gap-2 text-sm text-slate-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
          {COMPANY.address.full}
        </p>
        <p className="text-sm text-slate-500">
          Карта:{" "}
          <a
            href={MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-700 hover:underline"
          >
            2GIS, Алматы
          </a>
        </p>
      </div>
    </div>
  );
}
