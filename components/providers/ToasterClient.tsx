"use client";

import { Toaster } from "sonner";

/**
 * App-wide toasts (copy feedback, etc.). Renders in root layout, fixed, does not reflow the page.
 */
export function ToasterClient() {
  return (
    <Toaster
      position="bottom-right"
      closeButton
      offset={16}
      theme="light"
      toastOptions={{
        className: "font-sans",
        descriptionClassName: "text-slate-600",
      }}
    />
  );
}
