"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const DROPDOWN_MAX_HEIGHT_PX = 240;
const DROPDOWN_OFFSET_PX = 4;

export type FilterSelectOption = { value: string; label: string };

type FilterSelectMenuProps = {
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  /** Shown when nothing is selected. */
  emptyLabel?: string;
  "aria-label": string;
  className?: string;
};

/** Ancestors that can scroll; used to re-anchor the fixed popover to the trigger (not to close on scroll). */
function getScrollableAncestors(node: HTMLElement | null): (HTMLElement | Window)[] {
  const out: (HTMLElement | Window)[] = [window];
  let el: HTMLElement | null = node?.parentElement ?? null;
  while (el) {
    const o = getComputedStyle(el);
    if (
      /(auto|scroll|overlay)/.test(o.overflowY) ||
      /(auto|scroll|overlay)/.test(o.overflow)
    ) {
      out.push(el);
    }
    el = el.parentElement;
  }
  return out;
}

export function FilterSelectMenu({
  value,
  onChange,
  options,
  emptyLabel = "Все",
  "aria-label": ariaLabel,
  className,
}: FilterSelectMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const rafReposition = useRef<number | null>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);
  const display = value && selected ? selected.label : value ? value : emptyLabel;
  const isSet = Boolean(value);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom - 12;
    const maxHeight = Math.min(
      DROPDOWN_MAX_HEIGHT_PX,
      Math.max(96, spaceBelow - DROPDOWN_OFFSET_PX),
    );
    setPos({
      top: r.bottom + DROPDOWN_OFFSET_PX,
      left: r.left,
      width: r.width,
      maxHeight,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onWin = () => updatePosition();
    window.addEventListener("resize", onWin);
    return () => window.removeEventListener("resize", onWin);
  }, [open, updatePosition]);

  const scheduleReposition = useCallback(() => {
    if (rafReposition.current != null) {
      cancelAnimationFrame(rafReposition.current);
    }
    rafReposition.current = requestAnimationFrame(() => {
      rafReposition.current = null;
      updatePosition();
    });
  }, [updatePosition]);

  useEffect(
    () => () => {
      if (rafReposition.current != null) cancelAnimationFrame(rafReposition.current);
    },
    [],
  );

  /** Re-anchor the popover to the trigger when the page or a scrollable ancestor moves (sidebar, window). */
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const watch = getScrollableAncestors(triggerRef.current);
    for (const node of watch) {
      node.addEventListener("scroll", scheduleReposition, { passive: true, capture: true });
    }
    return () => {
      for (const node of watch) {
        node.removeEventListener("scroll", scheduleReposition, { capture: true });
      }
    };
  }, [open, scheduleReposition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const allOptions: FilterSelectOption[] = [{ value: "", label: emptyLabel }, ...options];

  const list = open && pos && (
    <div
      ref={menuRef}
      className="fixed z-[200] min-w-0 origin-top animate-in fade-in-0 slide-in-from-top-1 duration-100"
      style={{
        top: pos.top,
        left: pos.left,
        width: pos.width,
        maxHeight: pos.maxHeight,
      }}
      data-catalog-filter-menu
      onWheel={(e) => e.stopPropagation()}
    >
      <ul
        id={listId}
        role="listbox"
        className="max-h-[inherit] overflow-y-auto overscroll-y-contain rounded-lg border border-slate-200/80 bg-white py-1.5 text-sm shadow-lg shadow-slate-200/40 [scrollbar-color:rgba(15,23,42,0.2)_transparent] [scrollbar-width:thin]"
        aria-label={ariaLabel}
      >
        {allOptions.map((opt) => {
          const selectedItem = (opt.value === "" && !value) || (opt.value !== "" && value === opt.value);
          return (
            <li key={opt.value === "" ? "__all__" : opt.value} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={selectedItem}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2.5 text-left text-slate-800 transition-colors",
                  "hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none",
                  selectedItem && "bg-slate-50/90 font-medium text-slate-900",
                )}
              >
                {selectedItem ? (
                  <Check
                    className="h-4 w-4 shrink-0 text-blue-600"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                ) : (
                  <span className="inline-block h-4 w-4 shrink-0" aria-hidden />
                )}
                <span className="min-w-0 flex-1 truncate leading-snug">{opt.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className={cn("relative w-full", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!open) {
            setOpen(true);
            return;
          }
          setOpen(false);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-slate-200/80 bg-white px-3 text-left text-sm",
          "shadow-sm transition-[box-shadow,colors,background-color] hover:border-slate-300/90 hover:bg-slate-50/50",
          "focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:outline-none",
          open && "border-blue-500/50 ring-2 ring-blue-500/15",
          isSet && "text-slate-900",
        )}
      >
        <span className="min-w-0 flex-1 truncate text-slate-800">{display}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {typeof document !== "undefined" && list ? createPortal(list, document.body) : null}
    </div>
  );
}
