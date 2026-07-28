import { memo, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { GridStack, GridStackOptions } from "gridstack";
// gridstack base CSS is imported in styles.css (before our Origin overrides).
import { cn } from "@/lib/utils";

/** Below this width the grid collapses to one column (touch layout). */
const STATIC_QUERY = "(max-width: 1023px)";
/** How long the pointer must be held on a card to enter Apple-style edit mode. */
const LONG_PRESS_MS = 550;
/** Slightly longer hold on touch devices — matches iOS "hold to rearrange". */
const LONG_PRESS_TOUCH_MS = 650;


export type BentoItem = {
  id: string;
  /** Width in columns. */
  w: number;
  /** Height in rows (rows are `cellHeight` px tall). */
  h: number;
  x?: number;
  y?: number;
  minW?: number;
  minH?: number;
  /** Optional caps to protect card content from breaking layouts. */
  maxW?: number;
  maxH?: number;
  node: ReactNode;
};

/**
 * BentoGridStack — a gridstack.js-powered region that mirrors Apple's macOS
 * widget behavior:
 *
 *  • Cards snap to a fixed grid on rearrange (gridstack native).
 *  • Every move/resize is followed by a `compact` pass so cards never leave
 *    a hole above them — the stack reflows Apple-style to stay aligned.
 *  • Press-and-hold any card for ~550ms to enter "edit mode": the whole
 *    surface starts a gentle jiggle, resize handles appear, and the entire
 *    card becomes a drag target (not just the header grip).
 *  • Tap outside, press Escape, or click the floating "Done" pill to exit.
 *  • min/max width & height on each item stop cards from stretching or
 *    shrinking into a broken shape.
 *
 * Layout persists to localStorage under `storageKey`. Below 1024px the grid
 * goes fully static (no drag/resize, no jiggle) and collapses to one column
 * so it never fights touch scrolling.
 */
function BentoGridStackImpl({
  items,
  column,
  cellHeight = 76,
  storageKey,
  float = false,
  resizeHandles = "e, se, s, sw, w",
  className,
}: {
  items: BentoItem[];
  column: number;
  cellHeight?: number;
  storageKey: string;
  float?: boolean;
  resizeHandles?: string;
  className?: string;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<GridStack | null>(null);
  const [ready, setReady] = useState(false);
  const [editMode, setEditMode] = useState(false);
  // Expose the latest editMode value to gridstack's async callbacks without
  // re-initializing the grid on every state change.
  const editModeRef = useRef(false);
  editModeRef.current = editMode;

  useEffect(() => {
    if (!elRef.current) return;

    const opts: GridStackOptions = {
      column,
      cellHeight,
      margin: 10,
      float,
      // In edit mode the entire card is draggable; otherwise only the
      // header grip (`.bento-drag-handle`) starts a drag.
      handle: ".bento-drag-handle",
      // Allow cards to be dragged out of this grid and dropped into any
      // other BentoGridStack on the page (rail <-> main), Apple-style.
      acceptWidgets: true,
      draggable: { cancel: ".cancel-drag", appendTo: "body", scroll: true },
      resizable: { handles: resizeHandles },
      animate: true,
      // Collapse a multi-column region to one column on small screens.
      columnOpts:
        column > 1 ? { breakpointForWindow: true, breakpoints: [{ w: 1024, c: 1 }] } : undefined,
    };


    // Seed each rendered item's gridstack attributes from its layout before
    // init (set imperatively to keep the JSX free of untyped gs-* props).
    const layout = new Map(items.map((it) => [it.id, it]));
    elRef.current.querySelectorAll<HTMLElement>(".grid-stack-item").forEach((el) => {
      const it = layout.get(el.dataset.gsId ?? "");
      if (!it) return;
      el.setAttribute("gs-id", it.id);
      const set = (k: string, v: number | undefined) => {
        if (v != null) el.setAttribute(k, String(v));
      };
      set("gs-w", it.w);
      set("gs-h", it.h);
      set("gs-x", it.x);
      set("gs-y", it.y);
      set("gs-min-w", it.minW);
      set("gs-min-h", it.minH);
      set("gs-max-w", it.maxW);
      set("gs-max-h", it.maxH);
    });

    let disposed = false;
    let cleanupGrid = () => {};

    void import("gridstack").then(({ GridStack }) => {
      if (disposed || !elRef.current) return;

      const grid = GridStack.init(opts, elRef.current);
      gridRef.current = grid;

      // Snapshot the seeded default layout so "Reset layout" can restore it.
      const defaultLayout = grid.save(false);

      // Restore a previously saved layout (positions only; match by id).
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) grid.load(JSON.parse(raw), false);
      } catch {
        /* ignore malformed/absent layout */
      }

      // Apple-like default: always start cleanly stacked — no incongruent
      // gaps inherited from a previous layout or an out-of-date seed.
      try {
        grid.float(false);
        grid.compact("compact", false);
      } catch {
        /* ignore */
      }

      const persist = () => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(grid.save(false)));
        } catch {
          /* storage may be unavailable */
        }
      };
      // Compact after every change so reordering/resizing never leaves
      // empty rows above an item — cards always shift up to maintain
      // alignment (Apple-like reflow). Skip while a drag/resize is in
      // flight to avoid fighting the user's gesture.
      let interacting = false;
      const compactAndPersist = () => {
        if (interacting) {
          persist();
          return;
        }
        try {
          grid.compact("compact", false);
        } catch {
          /* older gridstack signatures — fall through */
        }
        persist();
      };
      grid.on("change added removed", compactAndPersist);
      grid.on("dragstart resizestart", () => {
        interacting = true;
      });
      // Live reflow during resize so neighboring cards immediately shift
      // up to fill any gap the resize would otherwise open.
      grid.on("resize", () => {
        try {
          grid.compact("compact", false);
        } catch {
          /* ignore */
        }
      });
      grid.on("dragstop resizestop", () => {
        interacting = false;
        try {
          grid.compact("compact", false);
        } catch {
          /* ignore */
        }
        persist();
      });

      // Reveal once gridstack has positioned the items — prevents the
      // pre-init "stacked pile" flash on initial load/reload.
      requestAnimationFrame(() => {
        if (!disposed) setReady(true);
      });

    // On touch/small viewports keep the grid static by default so page
    // scrolling is never hijacked — a long-press flips it into edit mode
    // (see the editMode effect below) and re-enables rearranging.
      const mq = window.matchMedia(STATIC_QUERY);
      const applyStatic = () => {
        grid.setStatic(mq.matches && !editModeRef.current);
      };
      applyStatic();
      mq.addEventListener("change", applyStatic);
      // Expose so the editMode effect can retoggle without re-init.
      (grid as unknown as { _applyStatic?: () => void })._applyStatic = applyStatic;


    // Reset to the default layout (and clear storage) on demand — no reload.
      const onReset = () => {
        try {
          localStorage.removeItem(storageKey);
        } catch {
          /* ignore */
        }
        grid.load(defaultLayout as Parameters<typeof grid.load>[0], false);
      };
      window.addEventListener("bento:reset", onReset);

      cleanupGrid = () => {
        grid.off("change added removed dragstart resizestart resize dragstop resizestop");
        mq.removeEventListener("change", applyStatic);
        window.removeEventListener("bento:reset", onReset);
        // Keep the DOM so React can unmount its own nodes cleanly.
        grid.destroy(false);
        gridRef.current = null;
      };
    });

    return () => {
      disposed = true;
      cleanupGrid();
    };
    // Init once — `items` must be stable (see component doc).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync edit mode across every BentoGridStack instance on the page — so
  // long-pressing any card puts the whole dashboard (main + rail) into
  // jiggle mode together, matching Apple's global "wiggle" state.
  useEffect(() => {
    const onEnter = () => setEditMode(true);
    const onExit = () => setEditMode(false);
    window.addEventListener("bento:edit-enter", onEnter);
    window.addEventListener("bento:edit-exit", onExit);
    return () => {
      window.removeEventListener("bento:edit-enter", onEnter);
      window.removeEventListener("bento:edit-exit", onExit);
    };
  }, []);

  // When edit mode toggles, re-apply the static/interactive state so touch
  // viewports become draggable only after the long-press activates jiggle.
  useEffect(() => {
    const grid = gridRef.current as unknown as { _applyStatic?: () => void } | null;
    grid?._applyStatic?.();
  }, [editMode]);


  // Long-press to enter edit mode — Apple's "tap and hold to rearrange".
  useEffect(() => {
    const root = elRef.current;
    if (!root) return;

    let timer: number | null = null;
    let startX = 0;
    let startY = 0;
    let armed = false;

    const cancel = () => {
      if (timer != null) {
        window.clearTimeout(timer);
        timer = null;
      }
      armed = false;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (editModeRef.current) return; // already in edit mode
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // Don't arm on interactive elements — buttons/inputs/links stay clickable.
      if (target.closest("button, a, input, textarea, select, [role='button'], .cancel-drag")) {
        return;
      }
      if (!target.closest(".grid-stack-item")) return;
      armed = true;
      startX = e.clientX;
      startY = e.clientY;
      // Touch requires a slightly longer hold — matches iOS "hold to jiggle"
      // and gives the user room to start a scroll gesture without arming
      // rearrange mode by accident.
      const holdMs = e.pointerType === "touch" ? LONG_PRESS_TOUCH_MS : LONG_PRESS_MS;
      timer = window.setTimeout(() => {
        if (!armed) return;
        window.dispatchEvent(new Event("bento:edit-enter"));
        if ("vibrate" in navigator) {
          try {
            navigator.vibrate?.(12);
          } catch {
            /* ignore */
          }
        }
      }, holdMs);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!armed) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      // Larger threshold on touch — any scroll intent should cancel the
      // long-press instantly so the page scrolls fluidly.
      const threshold = e.pointerType === "touch" ? 64 : 36;
      if (dx * dx + dy * dy > threshold) cancel();
    };


    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", cancel);
    root.addEventListener("pointercancel", cancel);
    root.addEventListener("pointerleave", cancel);
    return () => {
      cancel();
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", cancel);
      root.removeEventListener("pointercancel", cancel);
      root.removeEventListener("pointerleave", cancel);
    };
  }, []);

  // In edit mode: any click (anywhere — inside or outside the grid) that
  // isn't a drag/resize gesture exits. Apple-style tap-to-finish.
  useEffect(() => {
    if (!editMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") window.dispatchEvent(new Event("bento:edit-exit"));
    };
    let downX = 0;
    let downY = 0;
    const onDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      // Ignore if the pointer moved (a drag/resize completed).
      const dx = e.clientX - downX;
      const dy = e.clientY - downY;
      if (dx * dx + dy * dy > 25) return;
      const target = e.target as HTMLElement | null;
      // The floating Done button handles its own exit.
      if (target?.closest("[data-bento-done]")) return;
      // Ignore interactive controls inside cards.
      if (target?.closest("button, a, input, textarea, select")) return;
      window.dispatchEvent(new Event("bento:edit-exit"));
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("pointerup", onUp, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
    };
  }, [editMode]);


  // While in edit mode, tag every card's content wrapper with the drag
  // handle class so the entire surface acts as a drag origin — matching
  // iOS/macOS "jiggle to rearrange".
  useEffect(() => {
    const root = elRef.current;
    if (!root) return;
    const contents = root.querySelectorAll<HTMLElement>(".grid-stack-item > .grid-stack-item-content");
    contents.forEach((el) => {
      if (editMode) el.classList.add("bento-drag-handle");
      else el.classList.remove("bento-drag-handle");
    });
  }, [editMode]);

  return (
    <div className="relative">
      <div
        ref={elRef}
        className={cn(
          "grid-stack transition-opacity duration-150",
          ready ? "opacity-100" : "opacity-0",
          editMode && "bento-edit-mode",
          className,
        )}
      >
        {items.map((it) => (
          <div
            key={it.id}
            className={cn("grid-stack-item", editMode && "bento-edit-handle")}
            data-gs-id={it.id}
          >
            <div className="grid-stack-item-content">
              <div className="h-full w-full">{it.node}</div>
            </div>
          </div>
        ))}
      </div>
      {editMode && (
        <button
          type="button"
          data-bento-done
          onClick={() => window.dispatchEvent(new Event("bento:edit-exit"))}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-foreground px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-background shadow-lg backdrop-blur transition hover:opacity-90"
          aria-label="Finish arranging widgets"
        >
          Done
        </button>
      )}

    </div>
  );
}

export const BentoGridStack = memo(BentoGridStackImpl);
