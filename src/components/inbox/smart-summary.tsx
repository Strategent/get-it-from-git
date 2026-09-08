import { ChevronRight } from "lucide-react";
import { buildBriefing, type BriefThread } from "@/lib/thread-briefing";

export function SmartSummary({
  thread,
  onAction,
}: {
  thread: BriefThread;
  onAction?: () => void;
}) {
  const b = buildBriefing(thread);
  const actionable = thread.needsReply;

  return (
    <section aria-label="Smart Summary">
      <h2 className="font-dm-sans mb-2 px-0.5 text-[14px] font-medium text-foreground/90">
        Smart Summary
      </h2>
      <div className="overflow-hidden rounded-[14px] border border-border/70 bg-card shadow-[0_10px_28px_-22px_color-mix(in_oklab,var(--foreground)_38%,transparent),inset_0_1px_0_color-mix(in_oklab,var(--foreground)_5%,transparent)] dark:border-white/[0.08] dark:bg-white/[0.045]">
        <div className="px-4 py-3.5">
          <p className="text-[13.5px] leading-[1.45] text-foreground/90">
            {b.gist}
          </p>
        </div>

        <div className="h-px bg-foreground/[0.07] dark:bg-white/[0.08]" />

        <button
          type="button"
          onClick={onAction}
          disabled={!actionable}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors enabled:hover:bg-foreground/[0.04] disabled:cursor-default"
        >
          <span className="font-dm-sans text-[11px] font-medium text-muted-foreground">Next</span>
          <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
            {b.nextAction}
          </span>
          {actionable && (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" strokeWidth={2} />
          )}
        </button>
      </div>
    </section>
  );
}
