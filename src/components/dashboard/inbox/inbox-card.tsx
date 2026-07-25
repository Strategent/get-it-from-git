import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Reply,
  ReplyAll,
  Forward,
  Star,
  Paperclip,
  Archive,
  Check,
  ArrowLeft,
  Sparkles,
  ArrowRight,
  MoreHorizontal,
} from "lucide-react";

import { toast } from "sonner";
import { Panel } from "@/components/ui/panel";
import { PillButton } from "@/components/ui/pill-button";
import { emails } from "@/components/dashboard/data";
import { avatarUrl, senderEmailAddress } from "@/lib/avatar";

/**
 * InboxCard — Gmail-style mini inbox: focused/other tabs, thread list, and a
 * reading pane with subject row, From/To meta, body, and an inline reply
 * composer. The composer keeps the brand-purple Send button (Syra-drafted is
 * implied by that CTA, so the explicit Syra label/icon is removed).
 */
export function InboxCard() {
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState<"focused" | "other">("focused");
  const [sentIds, setSentIds] = useState<Set<number>>(new Set());
  const [archivedIds, setArchivedIds] = useState<Set<number>>(new Set());
  const [flaggedIds, setFlaggedIds] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<"reply" | "replyAll" | "forward">("reply");
  const [sending, setSending] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const visibleEmails = useMemo(
    () =>
      emails
        .map((m, i) => ({ ...m, originalIndex: i }))
        .filter((m) => !sentIds.has(m.originalIndex) && !archivedIds.has(m.originalIndex)),
    [sentIds, archivedIds]
  );

  const selectedIdx = Math.min(selected, Math.max(visibleEmails.length - 1, 0));
  const e = visibleEmails[selectedIdx] ?? visibleEmails[0] ?? emails[0];
  const isSent = sentIds.has(e.originalIndex);
  const isFlagged = flaggedIds.has(e.originalIndex);

  const defaultDraft = useMemo(
    () =>
      `Hi ${e.sender.split(" ")[0]} — confirming the revised allocation. Updated IPS attached for sign-off; happy to take 15 min Thursday 2:00 PM ET.`,
    [e.sender],
  );
  const [draft, setDraft] = useState(defaultDraft);

  useEffect(() => {
    setSelected(selectedIdx);
  }, [visibleEmails.length, selectedIdx]);

  useEffect(() => {
    setJustSent(false);
    setSending(false);
    setMode("reply");
    setDraft(defaultDraft);
  }, [e.originalIndex, defaultDraft]);

  const handleSend = () => {
    if (sending || isSent || draft.trim().length === 0) return;
    setSending(true);
    window.setTimeout(() => {
      setSentIds((prev) => {
        const next = new Set(prev);
        next.add(e.originalIndex);
        return next;
      });
      setSending(false);
      setJustSent(true);
    }, 650);
  };

  // Header actions — drive the reading-pane composer / list state.
  const focusComposer = () =>
    requestAnimationFrame(() => {
      const el = composerRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(0, 0);
    });

  const startReply = (next: "reply" | "replyAll") => {
    if (isSent) return;
    setMode(next);
    setDraft(defaultDraft);
    focusComposer();
  };

  const startForward = () => {
    if (isSent) return;
    setMode("forward");
    setDraft(
      `\n\n---------- Forwarded message ----------\nFrom: ${e.sender}\nSubject: ${e.subject}\n\n${e.preview}`,
    );
    focusComposer();
  };

  const handleArchive = () => {
    const name = e.sender.split(" ")[0];
    setArchivedIds((prev) => {
      const nextSet = new Set(prev);
      nextSet.add(e.originalIndex);
      return nextSet;
    });
    toast.success(`Archived ${e.subject}`, { description: `Conversation with ${name} moved to Archive.` });
  };

  const toggleFlag = () => {
    let nowFlagged = false;
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(e.originalIndex)) {
        next.delete(e.originalIndex);
      } else {
        next.add(e.originalIndex);
        nowFlagged = true;
      }
      return next;
    });
    toast.success(nowFlagged ? "Message flagged" : "Flag removed");
  };
  const initials = (n: string) =>
    n
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("");

  return (
    <>
    <Panel
      label="Inbox"
      to="/inbox"
      padding="none"
      action={
        <div className="flex items-center gap-1">
          <IconBtn icon={Reply} label="Reply" onClick={() => startReply("reply")} disabled={isSent} />
          <IconBtn icon={ReplyAll} label="Reply all" onClick={() => startReply("replyAll")} disabled={isSent} />
          <IconBtn icon={Forward} label="Forward" onClick={startForward} disabled={isSent} />
          <span className="mx-1 h-4 w-px bg-border" />
          <IconBtn icon={Archive} label="Archive" onClick={handleArchive} />
          <IconBtn icon={Star} label="Flag" onClick={toggleFlag} active={isFlagged} />
        </div>
      }
      bodyClassName="overflow-hidden"
    >
      {/* Focused / Other tabs — Linear-style monochrome underline */}
      <div className="flex shrink-0 items-center gap-0 border-b border-border/50 px-5 pb-2">
        {(["focused", "other"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative h-6 px-2.5 text-[12px] font-medium capitalize transition-colors ${
              tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "other" ? "\n" : t}
            {tab === t && (
              <span className="absolute -bottom-[8px] left-2.5 right-2.5 h-[1.5px] rounded-full bg-foreground" />
            )}
          </button>
        ))}
      </div>

      {/* Mobile: full-width thread list (shown when no email is opened) */}
      {!mobileOpen && (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-1 md:hidden">
          {visibleEmails.slice(0, 4).map((m, i) => {
            const unread = m.chips.includes("Draft ready");
            return (
              <button
                key={m.originalIndex}
                onClick={() => {
                  setSelected(i);
                  setMobileOpen(true);
                }}
                className="flex items-start gap-3 border-b border-border/40 px-4 py-3 text-left transition-colors active:bg-foreground/[0.05]"
              >
                <img
                  src={avatarUrl(m.sender, 72)}
                  alt={m.sender}
                  loading="lazy"
                  className="h-9 w-9 shrink-0 rounded-full border border-border object-cover"
                />
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`truncate text-[13.5px] ${unread ? "font-semibold text-foreground" : "font-semibold text-foreground/90"}`}>
                      {m.sender}
                    </div>
                    <div className="shrink-0 text-[10.5px] tabular-nums text-muted-foreground">
                      {m.time}
                    </div>
                  </div>
                  <div className={`mt-0.5 truncate text-[12px] ${unread ? "font-medium text-foreground/85" : "font-medium text-foreground/70"}`}>
                    {m.subject}
                  </div>
                  <div className="mt-0.5 line-clamp-2 text-[11.5px] font-normal text-muted-foreground/85">
                    {m.preview}
                  </div>
                </div>
                {unread && (
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="hidden min-h-0 flex-1 grid-cols-12 md:grid">
        {/* MobileOpen renders a full-screen thread overlay via portal (below) */}
        {/* Thread list — Linear-style: hairline dividers, neutral active state */}
        <div className="hidden min-h-0 flex-col overflow-y-auto py-0 md:col-span-4 md:flex md:border-r md:border-border/50">
          {visibleEmails.map((m, i) => {
            const unread = m.chips.includes("Draft ready");
            const active = i === selectedIdx;
            return (
              <button
                key={m.originalIndex}
                onClick={() => setSelected(i)}
                className={`group relative flex items-start gap-2.5 border-b border-border/30 px-3 py-2 text-left transition-colors ${
                  active
                    ? "bg-foreground/[0.045]"
                    : "hover:bg-foreground/[0.025]"
                }`}
              >
                {active && (
                  <span className="absolute inset-y-0 left-0 w-[1.5px] bg-foreground/70" />
                )}
                {unread && !active && (
                  <span className="absolute left-1 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-foreground/70" />
                )}
                <img
                  src={avatarUrl(m.sender, 64)}
                  alt={m.sender}
                  loading="lazy"
                  className="h-7 w-7 shrink-0 rounded-full border border-border object-cover"
                />
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`truncate text-[12.5px] tracking-tight ${
                        unread ? "font-semibold text-foreground" : "font-medium text-foreground/85"
                      }`}
                    >
                      {m.sender}
                    </div>
                    <div className="shrink-0 text-[10px] tabular-nums text-muted-foreground/80">
                      {m.time}
                    </div>
                  </div>
                  <div
                    className={`mt-0.5 truncate text-[11.5px] tracking-tight ${
                      unread ? "text-foreground/80" : "text-foreground/60"
                    }`}
                  >
                    {m.subject}
                  </div>
                  <div className="truncate text-[10.5px] font-normal text-muted-foreground/70">
                    {m.preview}
                  </div>
                </div>
              </button>
            );
          })}
        </div>


        {/* Reading pane — Gmail-style */}
        <div className="col-span-12 flex min-w-0 flex-col overflow-hidden md:col-span-8">
          {/* Subject row */}
          <div className="flex items-center justify-between gap-3 border-b border-border/40 px-4 py-2.5">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Back to inbox"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground md:hidden"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <h2 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
                {e.subject}
              </h2>
            </div>

            <div className="flex shrink-0 items-center gap-0.5">
              <button

                type="button"
                onClick={toggleFlag}
                aria-label="Flag"
                aria-pressed={isFlagged}
                className={`grid h-6 w-6 place-items-center rounded-md transition-colors hover:bg-foreground/[0.06] ${
                  isFlagged ? "text-amber-400" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Star className={`h-3.5 w-3.5 ${isFlagged ? "fill-amber-400" : ""}`} strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {/* From / To meta */}
          <div className="flex items-start gap-2.5 px-4 pt-3">
            <img
              src={avatarUrl(e.sender, 96)}
              alt={e.sender}
              loading="lazy"
              className="h-8 w-8 shrink-0 rounded-full border border-border object-cover"
            />
            <div className="min-w-0 flex-1 leading-tight">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 truncate text-[12.5px] text-foreground/95">
                  <span className="font-semibold">{e.sender}</span>
                  <span className="font-normal text-muted-foreground"> &lt;{senderEmailAddress(e.sender)}&gt;</span>
                </div>
                <div className="shrink-0 text-[10.5px] tabular-nums text-muted-foreground">
                  {e.time}
                </div>
              </div>
              <div className="mt-0.5 text-[10.5px] text-muted-foreground">
                to <span className="text-foreground/80">me</span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
            <p className="line-clamp-3 text-[12.5px] leading-relaxed text-foreground/85">
              {e.preview}
            </p>
          </div>

          {/* Reply composer */}
          {isSent ? (
            <div className="m-3 mt-2 flex shrink-0 items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] px-3 py-2.5">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">
                <Check className="h-3 w-3" strokeWidth={2.5} />
              </span>
              <span className="text-[11.5px] text-foreground/85">
                Sent to <span className="font-medium text-foreground">{e.sender.split(" ")[0]}</span>
                {justSent && (
                  <span className="ml-1 text-muted-foreground">· just now</span>
                )}
              </span>
            </div>
          ) : (
            <div className="m-3 mt-2 shrink-0 rounded-lg border border-border/60 bg-foreground/[0.02]">
              <div className="flex items-center justify-between gap-2 border-b border-border/40 px-3 py-1.5 text-[10.5px] text-muted-foreground">
                <span>
                  {mode === "forward" ? (
                    "Forward message"
                  ) : (
                    <>
                      {mode === "replyAll" ? "Reply all to " : "Reply to "}
                      <span className="text-foreground/80">{e.sender.split(" ")[0]}</span>
                    </>
                  )}
                </span>
                <button className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
                  <Paperclip className="h-3 w-3" /> IPS_v3.pdf
                </button>
              </div>
              <textarea
                ref={composerRef}
                value={draft}
                onChange={(ev) => setDraft(ev.target.value)}
                rows={3}
                placeholder="Write a reply…"
                className="block w-full resize-none bg-transparent px-3 py-2 text-[11.5px] leading-snug text-foreground/90 placeholder:text-muted-foreground/60 outline-none focus:outline-none"
              />
              <div className="flex items-center gap-1.5 px-3 pb-2.5">
                <PillButton
                  variant="brand"
                  size="xs"
                  onClick={handleSend}
                  disabled={sending}
                >
                  {sending ? "Sending…" : "Send"}
                </PillButton>
                <PillButton variant="secondary" size="xs">
                  Edit
                </PillButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </Panel>
    {mobileOpen && (
      <MobileThreadPortal
        email={e}
        isFlagged={isFlagged}
        isSent={isSent}
        justSent={justSent}
        sending={sending}
        draft={draft}
        onDraftChange={setDraft}
        onSend={handleSend}
        onClose={() => setMobileOpen(false)}
        onToggleFlag={toggleFlag}
        onArchive={() => {
          handleArchive();
          setMobileOpen(false);
        }}
      />
    )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mobile full-screen thread                                                 */
/* -------------------------------------------------------------------------- */

type EmailShape = (typeof emails)[number] & { originalIndex: number };

/**
 * Builds a small realistic 3-message thread from a single seed email:
 *   1. Sender's original outreach (context)
 *   2. John's short reply (from "me")
 *   3. Sender's latest note (the preview shown in the list)
 *
 * Each incoming message from the sender gets a Syra-generated
 * "Smart summary" + "Suggested next action" banner directly above it.
 */
function buildThread(e: EmailShape) {
  const first = e.sender.split(" ")[0];
  return [
    {
      from: "them" as const,
      time: "Yesterday · 4:12 PM",
      body: `Hi John — circling back on ${e.subject.toLowerCase()}. Wanted to give you a heads-up before this comes across your desk this week.`,
      summary: `${first} is flagging ${e.subject.toLowerCase()} ahead of the week.`,
      action: "Acknowledge and confirm timing",
    },
    {
      from: "me" as const,
      time: "Yesterday · 6:48 PM",
      body: `Thanks ${first} — I'll take a look first thing tomorrow and get back to you with any changes before end of day.`,
    },
    {
      from: "them" as const,
      time: e.time,
      body: e.preview,
      summary: buildSummary(e),
      action: buildNextAction(e),
    },
  ];
}

function buildSummary(e: EmailShape): string {
  const s = e.subject.toLowerCase();
  if (s.includes("ips")) return "Revised IPS is ready; needs a 15-min call before Friday's committee.";
  if (s.includes("q4")) return "Q4 trust statements attached; wants your read on the muni ladder.";
  if (s.includes("rebalance") && s.includes("confirm"))
    return "Approved to proceed; needs the final trade ticket today.";
  if (s.includes("engagement")) return "Engagement letter is countersigned; awaiting KYC / onboarding next steps.";
  if (s.includes("agenda")) return "Agenda for tomorrow's rebalance call — alts sleeve + 2026 tax focus.";
  if (s.includes("private credit")) return "Following up on private credit proposal; open to revised terms.";
  if (s.includes("slat")) return "Wants 30 min to align on SLAT timeline ahead of the 2026 sunset.";
  if (s.includes("payout")) return "Stripe payout of $12,840 scheduled for May 30. No action required.";
  return `${e.sender.split(" ")[0]} is asking for a response on ${e.subject.toLowerCase()}.`;
}

function buildNextAction(e: EmailShape): string {
  const s = e.subject.toLowerCase();
  if (s.includes("ips")) return "Book 15 min Thursday 2:00 PM ET";
  if (s.includes("q4")) return "Send muni ladder view before Tue review";
  if (s.includes("rebalance") && s.includes("confirm")) return "Send signed trade ticket today";
  if (s.includes("engagement")) return "Trigger KYC + onboarding checklist";
  if (s.includes("agenda")) return "Confirm agenda and share prep doc";
  if (s.includes("private credit")) return "Route to committee for revised terms";
  if (s.includes("slat")) return "Propose 3 times this week";
  if (s.includes("payout")) return "No action — archive";
  return "Reply with proposed next step";
}

function MobileThreadPortal(props: {
  email: EmailShape;
  isFlagged: boolean;
  isSent: boolean;
  justSent: boolean;
  sending: boolean;
  draft: string;
  onDraftChange: (v: string) => void;
  onSend: () => void;
  onClose: () => void;
  onToggleFlag: () => void;
  onArchive: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // Lock body scroll while the thread overlay is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  const { email: e, isFlagged, isSent, justSent, sending, draft } = props;
  const thread = buildThread(e);
  const senderEmail = senderEmailAddress(e.sender);

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-background md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`Conversation with ${e.sender}`}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-1 border-b border-border/50 px-2 py-2">
        <button
          type="button"
          onClick={props.onClose}
          aria-label="Back to inbox"
          className="grid h-9 w-9 place-items-center rounded-full text-foreground/85 transition-colors active:bg-foreground/[0.08]"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <div className="min-w-0 flex-1 px-1">
          <div className="truncate text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Inbox
          </div>
        </div>
        <button
          type="button"
          onClick={props.onArchive}
          aria-label="Archive"
          className="grid h-9 w-9 place-items-center rounded-full text-foreground/70 transition-colors active:bg-foreground/[0.08]"
        >
          <Archive className="h-4.5 w-4.5 h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={props.onToggleFlag}
          aria-label="Flag"
          aria-pressed={isFlagged}
          className={`grid h-9 w-9 place-items-center rounded-full transition-colors active:bg-foreground/[0.08] ${
            isFlagged ? "text-amber-400" : "text-foreground/70"
          }`}
        >
          <Star
            className="h-[18px] w-[18px]"
            strokeWidth={1.75}
            {...(isFlagged ? { fill: "currentColor" } : {})}
          />
        </button>
        <button
          type="button"
          aria-label="More"
          className="grid h-9 w-9 place-items-center rounded-full text-foreground/70 transition-colors active:bg-foreground/[0.08]"
        >
          <MoreHorizontal className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
      </div>

      {/* Scrollable thread */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Subject header */}
        <div className="border-b border-border/40 px-4 pb-3 pt-4">
          <h1 className="text-[19px] font-semibold leading-snug tracking-tight text-foreground">
            {e.subject}
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <span>{thread.length} messages</span>
            <span className="text-foreground/30">·</span>
            <span>{e.time}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex flex-col divide-y divide-border/40">
          {thread.map((m, i) => (
            <MobileThreadMessage
              key={i}
              email={e}
              message={m}
              senderEmail={senderEmail}
            />
          ))}

          {isSent && (
            <div className="flex items-center gap-2 px-4 py-4">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/15 text-emerald-500">
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              <span className="text-[12.5px] text-foreground/85">
                Reply sent to <span className="font-medium text-foreground">{e.sender.split(" ")[0]}</span>
                {justSent && <span className="ml-1 text-muted-foreground">· just now</span>}
              </span>
            </div>
          )}
        </div>

        <div className="h-24" />
      </div>

      {/* Bottom composer bar — iOS Mail feel */}
      {!isSent && (
        <div
          className="shrink-0 border-t border-border/50 bg-background/95 px-3 pb-3 pt-2 backdrop-blur"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
        >
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(ev) => props.onDraftChange(ev.target.value)}
              rows={1}
              placeholder={`Reply to ${e.sender.split(" ")[0]}…`}
              className="max-h-32 min-h-[40px] w-full resize-none rounded-2xl border border-border/70 bg-foreground/[0.03] px-3.5 py-2.5 text-[13.5px] leading-snug text-foreground placeholder:text-muted-foreground focus:border-foreground/30 focus:outline-none"
            />
            <button
              type="button"
              onClick={props.onSend}
              disabled={sending || draft.trim().length === 0}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-40"
              aria-label="Send reply"
            >
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}

function MobileThreadMessage({
  email: e,
  message: m,
  senderEmail,
}: {
  email: EmailShape;
  message: ReturnType<typeof buildThread>[number];
  senderEmail: string;
}) {
  const isMe = m.from === "me";
  return (
    <div className="px-4 py-4">
      {/* Syra smart summary + next action — only above incoming messages */}
      {!isMe && m.summary && (
        <div className="mb-3 overflow-hidden rounded-xl border border-border/60 bg-foreground/[0.025]">
          <div className="flex items-center gap-1.5 border-b border-border/50 px-3 py-1.5">
            <Sparkles className="h-3 w-3 text-foreground/60" strokeWidth={1.75} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Syra · smart summary
            </span>
          </div>
          <p className="px-3 pb-2 pt-1.5 text-[12.5px] leading-snug text-foreground/85">
            {m.summary}
          </p>
          {m.action && (
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 border-t border-border/50 bg-foreground/[0.02] px-3 py-2 text-left transition-colors active:bg-foreground/[0.05]"
            >
              <span className="min-w-0">
                <span className="block text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Next action
                </span>
                <span className="mt-0.5 block truncate text-[12.5px] font-medium text-foreground">
                  {m.action}
                </span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-foreground/60" strokeWidth={2} />
            </button>
          )}
        </div>
      )}

      {/* Sender row */}
      <div className="flex items-start gap-2.5">
        <img
          src={avatarUrl(isMe ? "John Harwick" : e.sender, 96)}
          alt={isMe ? "You" : e.sender}
          loading="lazy"
          className="h-9 w-9 shrink-0 rounded-full border border-border object-cover"
        />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex items-baseline justify-between gap-2">
            <div className="min-w-0 truncate text-[13.5px] font-semibold text-foreground">
              {isMe ? "You" : e.sender}
            </div>
            <div className="shrink-0 text-[10.5px] tabular-nums text-muted-foreground">
              {m.time}
            </div>
          </div>
          <div className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
            {isMe ? `to ${e.sender.split(" ")[0]}` : (
              <>to me <span className="text-foreground/30">·</span> {senderEmail}</>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <p className="mt-3 whitespace-pre-line text-[13.5px] leading-relaxed text-foreground/90">
        {m.body}
      </p>
    </div>
  );
}


function IconBtn({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
}: {
  icon: typeof Reply;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`grid h-7 w-7 place-items-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-40 ${
        active
          ? "text-amber-400 hover:bg-foreground/[0.06]"
          : "text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${active ? "fill-amber-400" : ""}`} strokeWidth={1.75} />
    </button>
  );
}
