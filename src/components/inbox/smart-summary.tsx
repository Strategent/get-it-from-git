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
    <section
      aria-label="Smart summary"
      className="overflow-hidden rounded-[14px] bg-foreground/[0.035] dark:bg-white/[0.045]"
    >
      <div className="px-4 pt-3 pb-3">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
          Summary
        </div>
        <p className="mt-1 text-[13.5px] leading-[1.45] tracking-[-0.005em] text-foreground/90">
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
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
          Next
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
          {b.nextAction}
        </span>
        {actionable && (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" strokeWidth={2} />
        )}
      </button>
    </section>
  );
}
