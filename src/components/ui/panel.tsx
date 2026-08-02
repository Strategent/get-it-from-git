import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { GripVertical } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SectionLabel } from "./section-label";

/**
 * Panel — the core Origin surface card (the doc's `<Card>`; named Panel to avoid
 * colliding with the shadcn `Card`). Renders the calm near-black surface with a
 * hairline border and an optional header carrying a <SectionLabel> on the left
 * and any extra `action` on the right.
 *
 *   <Panel label="INBOX">…</Panel>
 *   <Panel label="Inbox" to="/inbox">…</Panel>   // header label routes
 *
 * Use `padding="none"` for modules that manage their own full-bleed layout
 * (e.g. the inbox ribbon), then place the header inside the body yourself.
 */
export function Panel({
  label,
  to,
  action,
  padding = "md",
  className,
  headerClassName,
  bodyClassName,
  children,
}: {
  label?: string;
  /** When set, the header label becomes a router Link to this route. */
  to?: string;
  /** Extra header control rendered in the header's right group. */
  action?: ReactNode;
  padding?: "md" | "sm" | "none";
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  const pad =
    padding === "none"
      ? ""
      : padding === "sm"
        ? "p-4 sm:p-5"
        : "p-4 sm:p-5 md:p-6";
  const showHeader = Boolean(label || action);
  return (
    <section className={cn("origin-card flex h-full flex-col", pad, className)}>
      {showHeader && (
        <div
          className={cn(
            "flex shrink-0 items-center justify-between gap-2",
            padding === "none" ? "px-4 pt-4 pb-3 sm:px-5" : "mb-4",
            headerClassName,
          )}
        >
          {/* Label + grip. The grip alone carries `.bento-drag-handle`, so the
              header label stays a clean click target (a router Link when `to`
              is set) and the drag-to-reorder affordance never overlaps it.
              Action buttons + sparkle live in the right group. */}
          <div className="flex min-w-0 items-center gap-1.5">
            {label ? (
              to ? (
                <Link
                  to={to}
                  className="inline-flex max-w-full items-center rounded-sm outline-none transition-opacity [&_.section-label]:transition-opacity hover:[&_.section-label]:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <SectionLabel label={label} />
                </Link>
              ) : (
                <SectionLabel label={label} />
              )
            ) : (
              <span aria-hidden />
            )}
            <GripVertical
              aria-hidden
              className="bento-drag-handle bento-drag-grip h-3.5 w-3.5 shrink-0"
            />
          </div>
          <div className="flex items-center gap-1.5">{action}</div>
        </div>
      )}
      <div className={cn("relative flex min-h-0 flex-1 flex-col", bodyClassName)}>{children}</div>
    </section>
  );
}
