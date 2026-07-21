import { useEffect, useMemo, useRef, useState } from "react";
import { Reply, ReplyAll, Forward, Star, Paperclip, Archive, Check, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

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
      {/* Focused / Other tabs */}
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
              <span className="absolute -bottom-[8px] left-2.5 right-2.5 h-[2px] rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Mobile: full-width thread list (shown when no email is opened) */}
      {!mobileOpen && (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-1 md:hidden">
          {visibleEmails.map((m, i) => {
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
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className={`min-h-0 flex-1 grid-cols-12 md:grid ${mobileOpen ? "grid" : "hidden md:grid"}`}>
        {/* Thread list — desktop only */}
        <div className="hidden min-h-0 flex-col overflow-hidden py-1 md:col-span-4 md:flex md:border-r md:border-border/50">
          {visibleEmails.map((m, i) => {
            const unread = m.chips.includes("Draft ready");
            const active = i === selectedIdx;
            return (
              <button
                key={m.originalIndex}
                onClick={() => setSelected(i)}
                className={`relative flex items-start gap-2.5 px-3 py-1.5 text-left transition-colors ${
                  active ? "bg-primary/[0.08]" : "hover:bg-foreground/[0.035]"
                }`}
              >
                {active && (
                  <span className="absolute bottom-1.5 left-0 top-1.5 w-[2.5px] rounded-r-full bg-primary" />
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
                      className={`truncate text-[12.5px] ${
                        unread ? "font-semibold text-foreground" : "font-semibold text-foreground/90"
                      }`}
                    >
                      {m.sender}
                    </div>
                    <div className="shrink-0 text-[10.5px] tabular-nums text-muted-foreground">
                      {m.time}
                    </div>
                  </div>
                  <div
                    className={`mt-px truncate text-[11.5px] ${
                      unread ? "font-medium text-foreground/85" : "font-medium text-foreground/70"
                    }`}
                  >
                    {m.subject}
                  </div>
                  <div className="truncate text-[10.5px] font-normal text-muted-foreground/80">
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
              {/* Prev/next on mobile only */}
              <button
                type="button"
                onClick={() => setSelected(Math.max(0, selectedIdx - 1))}
                disabled={selectedIdx === 0}
                aria-label="Previous email"
                className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground disabled:pointer-events-none disabled:opacity-30 md:hidden"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => setSelected(Math.min(visibleEmails.length - 1, selectedIdx + 1))}
                disabled={selectedIdx >= visibleEmails.length - 1}
                aria-label="Next email"
                className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground disabled:pointer-events-none disabled:opacity-30 md:hidden"
              >
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
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
