import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Order used for edge-to-edge horizontal page swipes on mobile.
 * Mirrors the bottom-nav order (primary first, then the "More" pages).
 */
export const SWIPE_ORDER = [
  "/",
  "/inbox",
  "/crm",
  "/syra",
  "/team",
  "/calls",
  "/tasks",
  "/documents",
  "/calendar",
  "/connectors",
  "/channels",
  "/billing",
  "/support",
  "/settings",
];

function isHorizontallyScrollable(start: EventTarget | null) {
  let el = start as HTMLElement | null;
  while (el && el !== document.body) {
    if (el.dataset?.noSwipe !== undefined) return true;
    const style = window.getComputedStyle(el);
    const ox = style.overflowX;
    if ((ox === "auto" || ox === "scroll") && el.scrollWidth > el.clientWidth + 4) return true;
    el = el.parentElement;
  }
  return false;
}

export function MobileSwipeNav() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!isMobile) return;

    let startX = 0;
    let startY = 0;
    let startT = 0;
    let armed = false;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        armed = false;
        return;
      }
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      startT = Date.now();
      armed = !isHorizontallyScrollable(e.target);
    };

    const onEnd = (e: TouchEvent) => {
      if (!armed) return;
      armed = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const dt = Date.now() - startT;
      if (dt > 700) return;
      if (Math.abs(dx) < 72 || Math.abs(dx) < Math.abs(dy) * 2) return;

      const idx = SWIPE_ORDER.indexOf(pathname);
      if (idx === -1) return;
      const next = dx < 0 ? idx + 1 : idx - 1;
      if (next < 0 || next >= SWIPE_ORDER.length) return;
      navigate({ to: SWIPE_ORDER[next] });
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isMobile, pathname, navigate]);

  return null;
}
