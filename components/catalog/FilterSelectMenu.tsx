"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  type CSSProperties,
  type WheelEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  size,
  useDismiss,
  useClick,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const DROPDOWN_MAX_HEIGHT_PX = 240;
const MOBILE_BREAKPOINT_PX = 1024; // matches `lg` in the layout
const DROPDOWN_Z = 300;
/** Open: subtle, trigger-relative (placement-aware Y, no horizontal fly) */
const POP_MS = 150;
const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

function transformOriginForPlacement(placement: string | undefined): string {
  if (!placement) return "top left";
  if (placement.startsWith("top")) {
    if (placement.endsWith("end")) return "bottom right";
    if (placement === "top") return "bottom center";
    return "bottom left";
  }
  if (placement.startsWith("bottom")) {
    if (placement.endsWith("end")) return "top right";
    if (placement === "bottom") return "top center";
    return "top left";
  }
  if (placement.startsWith("left")) return "right center";
  if (placement.startsWith("right")) return "left center";
  return "top left";
}


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

const MOBILE_SHEET_CLASS =
  "fixed bottom-0 left-0 right-0 z-[310] max-h-[min(80vh,520px)] flex flex-col rounded-t-2xl border border-slate-200/80 bg-white shadow-2xl animate-in fade-in [animation-duration:150ms] [animation-fill-mode:both] [animation-timing-function:cubic-bezier(0.16,1,0.3,1)]";

const MOBILE_BACKDROP_CLASS =
  "fixed inset-0 z-[305] bg-slate-900/40 animate-in fade-in-0 duration-200";

function useIsFilterMobile() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);
    const s = () => setNarrow(m.matches);
    s();
    m.addEventListener("change", s);
    return () => m.removeEventListener("change", s);
  }, []);
  return narrow;
}

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

type OptionsListProps = {
  listId: string;
  ariaLabel: string;
  allOptions: { value: string; label: string }[];
  value: string;
  onPick: (v: string) => void;
  scrollClassName?: string;
  /** Parent handles overflow (e.g. floating popover) */
  scrollable?: boolean;
};

function OptionsList({
  listId,
  ariaLabel,
  allOptions,
  value,
  onPick,
  scrollClassName,
  scrollable = true,
}: OptionsListProps) {
  return (
    <ul
      id={listId}
      role="listbox"
      className={cn(
        "py-1.5 [scrollbar-color:rgba(15,23,42,0.2)_transparent] [scrollbar-width:thin]",
        scrollable && "max-h-full overflow-y-auto overscroll-y-contain",
        scrollClassName,
      )}
      aria-label={ariaLabel}
    >
      {allOptions.map((opt) => {
        const selectedItem =
          (opt.value === "" && !value) || (opt.value !== "" && value === opt.value);
        return (
          <li key={opt.value === "" ? "__all__" : opt.value} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={selectedItem}
              onClick={() => onPick(opt.value)}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-800 transition-colors",
                "active:bg-slate-100/90 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none",
                selectedItem && "bg-slate-50/90 font-medium text-slate-900",
              )}
            >
              {selectedItem ? (
                <Check className="h-4 w-4 shrink-0 text-blue-600" strokeWidth={2.5} aria-hidden />
              ) : (
                <span className="inline-block h-4 w-4 shrink-0" aria-hidden />
              )}
              <span className="min-w-0 flex-1 truncate leading-snug">{opt.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function FilterSelectMenu({
  value,
  onChange,
  options,
  emptyLabel = "Все",
  "aria-label": ariaLabel,
  className,
}: FilterSelectMenuProps) {
  const isMobile = useIsFilterMobile();
  const [open, setOpen] = useState(false);
  const listId = useId();
  const selected = options.find((o) => o.value === value);
  const display = value && selected ? selected.label : value ? value : emptyLabel;
  const isSet = Boolean(value);
  const allOptions: { value: string; label: string }[] = [
    { value: "", label: emptyLabel },
    ...options,
  ];

  const isDesktopOpen = !isMobile && open;
  const isMobileOpen = isMobile && open;
  useBodyScrollLock(isMobileOpen);

  useEffect(() => {
    if (!isMobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMobileOpen]);

  const [enterReady, setEnterReady] = useState(false);

  const { refs, context, floatingStyles, placement, isPositioned } = useFloating({
    open: isDesktopOpen,
    onOpenChange: (next) => {
      if (!isMobile) setOpen(next);
    },
    whileElementsMounted: autoUpdate,
    strategy: "fixed",
    placement: "bottom-start",
    middleware: [
      offset(4),
      flip({
        padding: 8,
        crossAxis: false,
        fallbackPlacements: ["top-start", "top-end", "bottom-end"],
      }),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableHeight, availableWidth, elements, rects }) {
          const maxH = Math.min(
            DROPDOWN_MAX_HEIGHT_PX,
            availableHeight,
            window.innerHeight - 16,
          );
          const w = Math.max(rects.reference.width, 160);
          const width = Math.min(availableWidth, w);
          Object.assign(elements.floating.style, {
            maxHeight: `${maxH}px`,
            minWidth: `${w}px`,
            width: `${width}px`,
            zIndex: String(DROPDOWN_Z),
          });
        },
      }),
    ],
  });

  const dismiss = useDismiss(context, {
    enabled: isDesktopOpen,
    ancestorScroll: false,
  });
  const click = useClick(context, { enabled: !isMobile });

  const { getReferenceProps, getFloatingProps } = useInteractions(
    isMobile ? [] : [dismiss, click],
  );

  const onPick = useCallback(
    (v: string) => {
      onChange(v);
      setOpen(false);
    },
    [onChange],
  );

  useLayoutEffect(() => {
    if (!isDesktopOpen) {
      setEnterReady(false);
      return;
    }
    if (!isPositioned) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEnterReady(true));
    });
    return () => cancelAnimationFrame(id);
  }, [isDesktopOpen, isPositioned]);

  const popoverInnerMotion: CSSProperties = useMemo(() => {
    const p = placement ?? "bottom-start";
    const side = p.split("-")[0] ?? "bottom";
    let from: string;
    if (side === "top") from = "translate3d(0, 0.25rem, 0) scale(0.98)";
    else if (side === "bottom") from = "translate3d(0, -0.25rem, 0) scale(0.98)";
    else if (side === "left") from = "translate3d(0.25rem, 0, 0) scale(0.98)";
    else if (side === "right") from = "translate3d(-0.25rem, 0, 0) scale(0.98)";
    else from = "translate3d(0, -0.25rem, 0) scale(0.98)";
    return {
      transformOrigin: transformOriginForPlacement(placement),
      opacity: isPositioned && enterReady ? 1 : 0,
      transform: isPositioned && enterReady ? "translate3d(0,0,0) scale(1)" : from,
      transition: `opacity ${POP_MS}ms ${EASE_OUT}, transform ${POP_MS}ms ${EASE_OUT}`,
    };
  }, [placement, isPositioned, enterReady]);

  return (
    <div className={cn("relative w-full", className)}>
      <button
        type="button"
        ref={refs.setReference}
        {...(isMobile
          ? { onClick: () => setOpen((o) => !o) }
          : getReferenceProps())}
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
          className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {isMobileOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <button
              type="button"
              className={MOBILE_BACKDROP_CLASS}
              aria-label="Закрыть"
              onClick={() => setOpen(false)}
            />
            <div
              className={cn(
                MOBILE_SHEET_CLASS,
                "w-full [touch-action:pan-y]",
              )}
              data-catalog-filter-mobile-menu
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 border-b border-slate-100 px-4 pb-2 pt-1">
                <p className="text-center text-[0.7rem] font-medium uppercase tracking-wide text-slate-500">
                  {ariaLabel}
                </p>
                <div
                  className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-200"
                  aria-hidden
                />
              </div>
              <div className="min-h-0 flex-1 overflow-hidden px-1">
                <OptionsList
                  listId={listId}
                  ariaLabel={ariaLabel}
                  allOptions={allOptions}
                  value={value}
                  onPick={onPick}
                  scrollClassName="max-h-[min(50vh,320px)]"
                />
              </div>
            </div>
          </>,
          document.body,
        )}

      {isDesktopOpen && (
        <FloatingPortal id="catalog-filter-floating-root">
          <div
            // Callback ref from Floating UI; not a ref.current read
            // eslint-disable-next-line react-hooks/refs
            ref={refs.setFloating}
            className="box-border flex min-h-0 w-full min-w-0 max-w-full flex-col overflow-visible outline-none"
            style={floatingStyles}
            {...getFloatingProps({
              onWheel: (e: WheelEvent) => e.stopPropagation(),
            })}
            data-catalog-filter-floating
            data-floating-side={placement?.split("-")[0] ?? "bottom"}
          >
            <div
              className="flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col overflow-hidden rounded-lg border border-slate-200/80 bg-white text-sm shadow-xl shadow-slate-200/50"
              style={popoverInnerMotion}
            >
              <div
                className="min-h-0 w-full min-w-0 flex-1 overflow-y-auto overscroll-y-contain [scrollbar-color:rgba(15,23,42,0.2)_transparent] [scrollbar-width:thin]"
                data-floating-content
              >
                <OptionsList
                  listId={listId}
                  ariaLabel={ariaLabel}
                  allOptions={allOptions}
                  value={value}
                  onPick={onPick}
                  scrollable={false}
                />
              </div>
            </div>
          </div>
        </FloatingPortal>
      )}
    </div>
  );
}
