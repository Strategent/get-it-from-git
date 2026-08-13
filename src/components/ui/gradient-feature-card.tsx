import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { SectionLabel } from "./section-label";

/**
 * GradientFeatureCard — Origin's spotlight / onboarding card: a brand-gradient
 * surface with a serif headline, body copy, an optional progress bar, and a CTA.
 * Recolored from Origin's green to Strategent's blue (var(--spotlight-feature)).
 */
export function GradientFeatureCard({
  label,
  title,
  description,
  progress,
  progressLabel,
  cta,
  onDismiss,
  className,
}: {
  label?: string;
  title: ReactNode;
  description?: ReactNode;
  /** 0–100; omit to hide the progress bar. */
  progress?: number;
  progressLabel?: string;
  cta?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[var(--radius)] p-5",
        // Light: an airy lavender wash with ink text (Apple/Linear-style),
        // instead of a near-black block punched into a light page.
        "border border-[oklch(0.55_0.14_268_/_12%)] bg-[linear-gradient(150deg,oklch(0.965_0.02_275)_0%,oklch(0.94_0.035_272)_55%,oklch(0.915_0.045_268)_100%)] shadow-[0_1px_0_0_oklch(1_0_0_/_70%)_inset,0_18px_40px_-34px_oklch(0.4_0.06_268_/_45%)]",
        // Dark: keep the deep midnight spotlight.
        "dark:border-white/[0.06] dark:bg-[linear-gradient(150deg,#1a1d33_0%,#1f2340_55%,#262a4a_100%)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_20px_50px_-36px_rgba(15,18,40,0.7)]",
        className,
      )}
    >
      {/* Soft directional wash for depth without banding */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 80% at 100% 100%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 60%)",
        }}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          {label && (
            <SectionLabel
              label={label}
              className="bento-drag-handle text-foreground/50 dark:text-white/55 [&>.chev]:text-foreground/35 dark:[&>.chev]:text-white/40"
            />
          )}
          {onDismiss && (
            <button
              type="button"
              aria-label="Dismiss"
              onClick={onDismiss}
              className="-mr-1 -mt-1 grid h-6 w-6 place-items-center rounded-full text-foreground/45 transition-colors hover:bg-foreground/5 hover:text-foreground dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white/90"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <h3 className="font-serif-display mt-2 text-[22px] leading-tight text-foreground dark:text-white">{title}</h3>
        {description && (
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground dark:text-white/70">{description}</p>
        )}
        {typeof progress === "number" && (
          <div className="mt-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10 dark:bg-white/15">
              <div
                className="h-full rounded-full bg-primary dark:bg-white/85"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
            <div className="mt-1.5 text-[11px] font-medium text-muted-foreground dark:text-white/70">
              {progressLabel ?? `${Math.round(progress)}% complete`}
            </div>
          </div>
        )}
        {cta && <div className="mt-4 flex flex-wrap items-center gap-2">{cta}</div>}
      </div>
    </section>
  );
}
