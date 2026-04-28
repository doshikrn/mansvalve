"use client";

import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AdminSubmitButton } from "./AdminSubmitButton";

type Props = {
  /** Открывается в новой вкладке — страница на публичном сайте. */
  previewHref: string;
  saveLabel?: string;
};

export function AdminFormFooter({ previewHref, saveLabel = "Сохранить" }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-[#E2E8F0] pt-4">
      <AdminSubmitButton>{saveLabel}</AdminSubmitButton>
      <Button variant="outline" size="sm" className="border-[#E2E8F0] bg-white text-slate-700 hover:bg-slate-50" asChild>
        <a href={previewHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
          Посмотреть на сайте
          <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
        </a>
      </Button>
    </div>
  );
}
