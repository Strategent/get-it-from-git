import { useState } from "react";
import { ChevronDown, Info, Target, Check } from "lucide-react";
import { SyraMark } from "@/components/syra-mark";

/**
 * ThreadBrief — the agent briefing that sits above an email thread.
 *
 * Architectural business-summary layout: one clean card with a strong header,
 * a 3-column metadata band, tone/strategy chips, an expandable signals list,
 * a caution note, and a tinted Syra recommendation panel.
 * All colors come from semantic tokens so light and dark both hold up.
 */

export type ThreadBriefData = {
  headline: string;
  lastContact: string;
  lastContactStale: boolean;
  reason: string;
  goal: string;
  confidence: number;
  tone: string;
  strategy: string;
  signals: string[];
  caution: string;
  recommendation: string;
  actions: string[];
};

export function threadBrief(t: {
  tag: string;
  company: string;
  from: string;
  subject: string;
}): ThreadBriefData {
  const first = t.from.split(" ")[0];
  switch (t.tag) {
    case "Hot lead":
      return {
        headline: "Proposal approved with edits",
        lastContact: "2d ago",
        lastContactStale: false,
        reason: "Awaiting revised SOW",
        goal: "Lock the kickoff date",
        confidence: 94,
        tone: "Direct, confident",
        strategy: "Confirm pricing → send revised SOW → hold June 10 kickoff",
        signals: [
          "Proposal opened 6 times in 48 hours",
          "Two named edits, no objections on scope",
          "Kickoff week volunteered by the client",
          "Legal already looped into the thread",
        ],
        caution: `If ${first} doesn't confirm within 48 hours, send the calendar hold anyway to keep the June 10 date.`,
        recommendation: "Move fast — send the revised SOW today while the kickoff week is still open.",
        actions: [
          "Revise SOW with tier 2 pricing",
          "Send calendar hold for kickoff week",
          "Schedule 30-min walkthrough",
          "Notify delivery lead",
        ],
      };
    case "Sales":
      return {
        headline: "Blocked before countersignature",
        lastContact: "1d ago",
        lastContactStale: false,
        reason: "Three open diligence items",
        goal: "Unblock legal review",
        confidence: 88,
        tone: "Precise, reassuring",
        strategy: "Answer all three items in one reply → name an owner → set a signature date",
        signals: [
          "Security questionnaire returned complete",
          "Legal is copied on the thread",
          "No pricing objections raised",
          "Timeline pressure from their side",
        ],
        caution: "Answer all three items in a single reply — a partial answer restarts their review cycle.",
        recommendation: "Send the SOC2 pack with a named implementation owner in the same message.",
        actions: [
          "Attach SOC2 report",
          "Confirm data residency answer",
          "Assign implementation owner",
          "Propose signature date",
        ],
      };
    case "Renewal":
      return {
        headline: "Renewal in 14 days",
        lastContact: "5d ago",
        lastContactStale: true,
        reason: "Procurement driving timeline",
        goal: "Protect renewal value",
        confidence: 76,
        tone: "Commercial, factual",
        strategy: "Lead with usage data → propose seat review → present pricing before invoicing",
        signals: [
          "Seat usage up 18% year over year",
          "Procurement, not the sponsor, is replying",
          "No support escalations this quarter",
          "Invoice cuts in 14 days",
        ],
        caution: "Procurement responds to numbers, not narrative — open with the seat-count data.",
        recommendation: "Book the seat-count review this week, before the invoice is generated.",
        actions: [
          "Pull current seat usage",
          "Draft renewal pricing",
          "Book procurement call",
          "Flag exposure to the account lead",
        ],
      };
    case "Billing":
      return {
        headline: "Payment terms request",
        lastContact: "3d ago",
        lastContactStale: false,
        reason: "Net-45 request on invoice 4471",
        goal: "Confirm terms and close",
        confidence: 91,
        tone: "Brief, administrative",
        strategy: "Verify against policy → confirm in writing → update the schedule",
        signals: [
          "Invoice 4471 already queued for payment",
          "No dispute on the amount",
          "Finance contact, not the sponsor",
          "Clean payment history",
        ],
        caution: "Check net-45 against standard policy before confirming in writing.",
        recommendation: "A two-line confirmation closes this — no call needed.",
        actions: ["Verify net-45 against policy", "Update invoice schedule", "Confirm in writing"],
      };
    case "Legal":
      return {
        headline: "Contract and compliance review",
        lastContact: "4d ago",
        lastContactStale: false,
        reason: "Awaiting written position",
        goal: "Move to signature",
        confidence: 82,
        tone: "Measured, on the record",
        strategy: "Documented written reply → counsel sign-off → return for signature",
        signals: [
          "Counsel is the primary correspondent",
          "Request is for a written position",
          "No commercial terms in dispute",
          "Signature blocked only on this item",
        ],
        caution: "Keep this in writing — a call leaves no record and counsel will ask again.",
        recommendation: "Draft the on-record response and route it to counsel before replying.",
        actions: ["Draft on-record response", "Route to counsel for sign-off", "Return for signature"],
      };
    case "Intro":
      return {
        headline: "Warm introduction",
        lastContact: "Today",
        lastContactStale: false,
        reason: "Introduction just made",
        goal: "Keep momentum",
        confidence: 86,
        tone: "Warm, brief",
        strategy: "Reply-all to thank the connector → offer two concrete times",
        signals: [
          "Introduction made by a mutual contact",
          "Both parties active on the thread",
          "No agenda set yet",
          "Fast replies so far",
        ],
        caution: "Reply within the day — warm intros go cold quickly once the connector drops off.",
        recommendation: "Acknowledge the intro and propose two specific meeting windows.",
        actions: ["Reply-all to loop everyone in", "Offer two meeting windows", "Add to CRM"],
      };
    default:
      return {
        headline: "Automated notification",
        lastContact: "Today",
        lastContactStale: false,
        reason: "System message",
        goal: "No reply expected",
        confidence: 99,
        tone: "None required",
        strategy: `File under ${t.company} for awareness`,
        signals: ["Sent by an automated system", "No recipient action requested"],
        caution: "Nothing here needs a response — archive to keep the inbox clean.",
        recommendation: "Archive this thread; it is informational only.",
        actions: ["Archive thread"],
      };
  }
}

function ConfidenceDial({ value }: { value: number }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" strokeWidth="3" className="stroke-foreground/10" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          className="stroke-[var(--sparkle)]"
          strokeDasharray={`${(c * value) / 100} ${c}`}
        />
      </svg>
      <span className="absolute text-[10px] font-bold tabular-nums text-foreground">{value}%</span>
    </div>
  );
}

export function ThreadBrief({
  data,
  compact = false,
  onAction,
}: {
  data: ThreadBriefData;
  compact?: boolean;
  onAction?: () => void;
}) {
  const [showSignals, setShowSignals] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>(() =>
    data.actions.length > 1 ? { [data.actions[0]]: true } : {},
  );

  return (
    <div
      className={`overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm ${
        compact ? "" : ""
      }`}
    >
      {/* ---- Header: Context label + headline + confidence dial ---- */}
      <div className="flex items-start justify-between gap-4 border-b border-border/50 p-4">
        <div className="min-w-0 flex-1 space-y-1">
          <span className="block text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Context
          </span>
          <h3 className="text-[17px] font-semibold leading-tight tracking-tight text-foreground">
            {data.headline}
          </h3>
        </div>
        <ConfidenceDial value={data.confidence} />
      </div>

      {/* ---- Metadata band ---- */}
      <div className="grid grid-cols-3 divide-x divide-border/50 border-b border-border/50">
        {[
          { label: "Last contact", value: data.lastContact, stale: data.lastContactStale },
          { label: "Reason", value: data.reason },
          { label: "Goal of this email", value: data.goal, goal: true },
        ].map((cell) => (
          <div key={cell.label} className="p-3 text-center">
            <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {cell.label}
            </div>
            <div
              className="mt-1 text-[12.5px] font-medium leading-snug"
              style={cell.stale || cell.goal ? { color: "var(--trend-down)" } : undefined}
            >
              {cell.value}
            </div>
          </div>
        ))}
      </div>

      {/* ---- Tone & Strategy chips ---- */}
      <div className="flex flex-wrap gap-2 border-b border-border/50 px-4 py-3">
        <div className="inline-flex items-center gap-1.5 rounded bg-muted px-2 py-1 text-[10.5px] font-medium text-muted-foreground">
          <span className="h-1 w-1 rounded-full bg-muted-foreground" />
          TONE: {data.tone.toUpperCase()}
        </div>
        <div
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-[10.5px] font-medium"
          style={{ backgroundColor: "var(--sparkle-soft)", color: "var(--sparkle)" }}
        >
          <span className="h-1 w-1 rounded-full bg-current" />
          STRATEGY: {data.strategy.toUpperCase()}
        </div>
      </div>

      {/* ---- Signals ---- */}
      <div className="border-b border-border/50 bg-muted/30 px-4 py-3">
        <button
          onClick={() => setShowSignals((v) => !v)}
          className="group flex w-full items-center justify-between text-left"
        >
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Show {data.signals.length} signals used
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:text-foreground ${
              showSignals ? "rotate-180" : ""
            }`}
          />
        </button>
        {showSignals && (
          <ul className="mt-2.5 space-y-1.5 animate-fade-in">
            {data.signals.map((s) => (
              <li key={s} className="flex items-start gap-2 text-[12px] leading-snug text-muted-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---- Caution ---- */}
      <div
        className="m-3 flex items-start gap-2.5 rounded-lg border p-3"
        style={{
          backgroundColor: "var(--trend-down-soft)",
          borderColor: "var(--trend-down-soft)",
          color: "var(--trend-down)",
        }}
      >
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-[12px] leading-snug">{data.caution}</p>
      </div>

      {/* ---- Syra recommendation + actions ---- */}
      <div className="px-4 pb-4">
        <div
          className="rounded-xl border p-4"
          style={{
            backgroundColor: "var(--sparkle-soft)",
            borderColor: "var(--sparkle-border)",
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: "var(--sparkle)" }}>
              <SyraMark className="h-4 w-4" />
            </span>
            <span
              className="text-[9.5px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--sparkle)" }}
            >
              Syra recommendation
            </span>
          </div>
          <p className="mt-2 text-[13px] font-medium leading-snug text-foreground">
            {data.recommendation}
          </p>

          <div className="mt-3 space-y-1.5 border-t border-border/40 pt-3">
            <div className="text-[12px] font-semibold text-foreground">Suggested actions</div>
            <ul className="mt-1.5 space-y-1.5">
              {data.actions.map((a) => {
                const checked = !!done[a];
                return (
                  <li key={a}>
                    <button
                      onClick={() => {
                        setDone((d) => ({ ...d, [a]: !d[a] }));
                        onAction?.();
                      }}
                      className="flex w-full items-start gap-2 text-left"
                    >
                      <span
                        aria-hidden
                        className={`mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors ${
                          checked
                            ? "border-transparent bg-[var(--sparkle)] text-white"
                            : "border-border bg-transparent"
                        }`}
                      >
                        {checked && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
                      </span>
                      <span
                        className={`text-[12.5px] leading-snug ${
                          checked ? "text-muted-foreground line-through" : "text-foreground"
                        }`}
                      >
                        {a}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
