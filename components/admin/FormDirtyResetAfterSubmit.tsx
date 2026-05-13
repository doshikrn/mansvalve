"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { useAdminFormDirty } from "@/components/admin/AdminUnsavedChangesGuard";

type Props = {
  hasError: boolean;
};

/**
 * Must render inside a `<form>`. Clears unsaved state after a successful action submission.
 */
export function FormDirtyResetAfterSubmit({ hasError }: Props) {
  const { markClean } = useAdminFormDirty();
  const { pending } = useFormStatus();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !hasError) {
      markClean();
    }
    wasPending.current = pending;
  }, [pending, hasError, markClean]);

  return null;
}
