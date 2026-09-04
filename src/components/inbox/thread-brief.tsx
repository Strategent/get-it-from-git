import { useState } from "react";
import { ChevronDown, BarChart3, Info, Target, Check } from "lucide-react";
import { SyraMark } from "@/components/syra-mark";

/**
 * ThreadBrief — the agent briefing that sits above an email thread.
 *
 * Left: client context grid + confidence / tone / strategy band + caution note.
 * Right: Syra recommendation panel + suggested actions checklist.
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
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5">
      <div className="relative h-[54px] w-[54px]">
        <svg viewBox="0 0 54 54" className="h-full w-full -rotate-90">
          <circle cx="27" cy="27" r={r} fill="none" strokeWidth="5" className="stroke-foreground/10" />
          <circle
            cx="27"
            cy="27"
            r={r}
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            stroke="var(--trend-up)"
            strokeDasharray={`${(c * value) / 100} ${c}`}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-[12.5px] font-semibold tabular-nums text-foreground">
          {value}%
        </span>
      </div>
      <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Confidence
      </span>
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
      className={`overflow-hidden rounded-xl border border-border/60 bg-card ${
        compact ? "" : "lg:grid lg:grid-cols-[1.4fr_1fr]"
      }`}
    >
      {/* ---- Left: context + reasoning ---- */}
      <div>
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-foreground">
            Client context
          </span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-foreground/25" />
          <span className="truncate text-[12px] text-muted-foreground">{data.headline}</span>
        </div>

        <div className="grid grid-cols-3 divide-x divide-border/60 border-b border-border/60">
          {[
            { label: "Last contact", value: data.lastContact, stale: data.lastContactStale },
            { label: "Reason", value: data.reason },
            { label: "Goal of this email", value: data.goal, goal: true },
          ].map((cell) => (
            <div key={cell.label} className="px-4 py-2.5">
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {cell.label}
              </div>
              <div
                className="mt-1 flex items-start gap-1 text-[12.5px] leading-snug text-foreground"
                style={
                  cell.stale || cell.goal ? { color: "var(--trend-down)" } : undefined
                }
              >
                {cell.goal && <Target className="mt-[3px] h-3 w-3 shrink-0" />}
                <span>{cell.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-4 bg-foreground/[0.02] px-4 py-3">
          <ConfidenceDial value={data.confidence} />
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="grid gap-2.5 sm:grid-cols-2">
              <div>
                <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Tone
                </div>
                <div className="mt-0.5 text-[12.5px] text-foreground">{data.tone}</div>
              </div>
              <div>
                <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Strategy
                </div>
                <div className="mt-0.5 text-[12.5px] leading-snug text-foreground">
                  {data.strategy}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowSignals((v) => !v)}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Show {data.signals.length} signals used
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${showSignals ? "rotate-180" : ""}`}
              />
            </button>
            {showSignals && (
              <ul className="animate-fade-in space-y-1 border-l border-border/70 pl-3">
                {data.signals.map((s) => (
                  <li key={s} className="text-[12px] leading-snug text-muted-foreground">
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 border-t border-border/60 px-4 py-2.5">
          <Info className="mt-[1px] h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-[12px] leading-snug text-muted-foreground">{data.caution}</p>
        </div>
      </div>

      {/* ---- Right: recommendation + suggested actions ---- */}
      <div
        className={`flex flex-col ${
          compact ? "border-t border-border/60" : "lg:border-l lg:border-border/60"
        }`}
      >
        <div
          className="px-4 py-3"
          style={{
            background:
              "linear-gradient(135deg, var(--sparkle-soft) 0%, transparent 70%)",
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: "var(--sparkle)" }}>
              <SyraMark className="h-4 w-4" />
            </span>
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Syra recommendation
            </span>
          </div>
          <p className="mt-2 text-[13.5px] font-medium leading-snug text-foreground">
            {data.recommendation}
          </p>
        </div>

        <div className="flex-1 border-t border-border/60 px-4 py-3">
          <div className="text-[12px] font-semibold text-foreground">Suggested actions</div>
          <ul className="mt-2 space-y-1.5">
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
                      className={`mt-[2px] grid h-[15px] w-[15px] shrink-0 place-items-center rounded-[4px] border transition-colors ${
                        checked
                          ? "border-transparent bg-foreground text-background"
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
  );
}
