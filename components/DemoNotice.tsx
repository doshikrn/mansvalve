import { AlertTriangle } from "lucide-react";
import { COMPANY } from "@/lib/company";

/**
 * Shown only in development mode — never visible in production.
 * Add to layout.tsx so it appears across all pages.
 */
export function DemoNotice() {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-2 border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-900">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
      <span>
        <strong>Демо-версия</strong> сайта {COMPANY.name}.&nbsp; Реальные
        фотографии товаров и финальные тексты будут загружены перед запуском.
      </span>
    </div>
  );
}
