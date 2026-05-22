"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type DirtyContextValue = {
  markClean: () => void;
  markDirty: () => void;
  /** True after the user changed any field until markClean (e.g. successful save). */
  isDirty: boolean;
};

const DirtyContext = createContext<DirtyContextValue | null>(null);

export function useAdminFormDirty(): DirtyContextValue {
  const ctx = useContext(DirtyContext);
  if (!ctx) {
    return {
      markClean: () => {},
      markDirty: () => {},
      isDirty: false,
    };
  }
  return ctx;
}

type GuardProps = {
  children: React.ReactNode;
  /** Set false to disable (e.g. read-only preview). */
  enabled?: boolean;
};

/**
 * Warns on tab close / reload and confirms in-app navigation when the form was edited.
 * Place around the form (or a subtree containing inputs).
 */
export function AdminUnsavedChangesGuard({
  children,
  enabled = true,
}: GuardProps) {
  const dirtyRef = useRef(false);
  const allowNavigationRef = useRef(false);
  const [isDirty, setIsDirty] = useState(false);

  const markClean = useCallback(() => {
    dirtyRef.current = false;
    setIsDirty(false);
  }, []);

  const markDirty = useCallback(() => {
    if (enabled) {
      dirtyRef.current = true;
      setIsDirty(true);
    }
  }, [enabled]);

  const value = useMemo(
    () => ({ markClean, markDirty, isDirty }),
    [markClean, markDirty, isDirty],
  );

  useEffect(() => {
    if (!enabled) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current || allowNavigationRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const onClickCapture = (e: MouseEvent) => {
      if (!dirtyRef.current || allowNavigationRef.current) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (!href.startsWith("/") || href.startsWith("//")) return;
      if (!window.confirm("Есть несохранённые изменения. Покинуть страницу?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [enabled]);

  return (
    <DirtyContext.Provider value={value}>
      <div
        role="presentation"
        onInputCapture={() => {
          if (enabled) {
            dirtyRef.current = true;
            setIsDirty(true);
          }
        }}
        onChangeCapture={() => {
          if (enabled) {
            dirtyRef.current = true;
            setIsDirty(true);
          }
        }}
        onSubmitCapture={() => {
          allowNavigationRef.current = true;
          window.setTimeout(() => {
            allowNavigationRef.current = false;
          }, 4000);
        }}
      >
        {children}
      </div>
    </DirtyContext.Provider>
  );
}
