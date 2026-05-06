"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

type Props = {
  paramName?: string;
  allowedIds: readonly string[];
};

export function AdminSectionScroller({ paramName = "section", allowedIds }: Props) {
  const searchParams = useSearchParams();
  const sectionId = searchParams.get(paramName);

  useEffect(() => {
    if (!sectionId || !allowedIds.includes(sectionId)) return;
    const target = document.getElementById(sectionId);
    target?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [allowedIds, sectionId]);

  return null;
}
