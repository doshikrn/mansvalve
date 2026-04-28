"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminSubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      size="sm"
      className={cn(
        "min-w-[148px] border-0 bg-[#1D4ED8] text-white shadow-sm hover:bg-blue-700 disabled:opacity-70",
        className,
      )}
    >
      {pending ? "Сохранение…" : children}
    </Button>
  );
}
