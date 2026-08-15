/**
 * Mobile keyboard policy: on touch devices the on-screen keyboard must only
 * appear when the user actually taps a field. Radix overlays (Dialog, Sheet,
 * Drawer, AlertDialog, Popover) focus their first focusable child on open —
 * when that child is an input, iOS pops the keyboard immediately. These
 * helpers suppress that behaviour on coarse pointers only; mouse/keyboard
 * users keep the standard focus-trap entry point.
 */

export function isCoarsePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/** Use as `onOpenAutoFocus` — keeps focus on the container instead of a field. */
export function preventMobileAutoFocus(event: Event) {
  if (!isCoarsePointer()) return;
  event.preventDefault();
  const el = event.currentTarget as HTMLElement | null;
  el?.focus?.({ preventScroll: true });
}

/** `autoFocus` value for inputs: true on desktop, false on touch devices. */
export function autoFocusUnlessTouch() {
  return !isCoarsePointer();
}
