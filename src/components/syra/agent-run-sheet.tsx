import { SmartAvatar } from "@/components/smart-avatar";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Maximize2, X } from "lucide-react";
import { senderEmailAddress } from "@/lib/avatar";
import { autoFocusUnlessTouch } from "@/lib/mobile-focus";

type Step = { verb: string; object: string };
type Question = {
  label: string;
  prompt: string;
  /** "choice" = numbered option list (default), "contact" = CRM lookup, "when" = date + time */
  kind?: "choice" | "contact" | "when";
  options: string[];
  defaultOption: number;
};
type Script = {
  title: string;
  steps: Step[];
  questions: Question[];
  /** Steps streamed after every question is answered. */
  result: (answers: string[], client: string) => Step[];
  /** Closing summary sentence, Giga-style. */
  summary: (answers: string[], client: string) => string;
  primaryAction: string;
  secondaryAction: string;
  reviewer?: string;
};

const KNOWN_CLIENTS = [
  "Hartley Family Trust",
  "Sterling Holdings",
  "Caldwell Estate",
  "Marlow Capital",
  "Beaumont Group",
  "Castellanos Holdings",
];

/** Stand-in CRM directory used for the attendee type-ahead. */
const CRM_CONTACTS = [
  { name: "Marcus Hartley", org: "Hartley Family Trust", email: "marcus@hartleytrust.com" },
  { name: "Diane Hartley", org: "Hartley Family Trust", email: "diane@hartleytrust.com" },
  { name: "Jenna Park", org: "Marlow Capital", email: "jenna.park@marlowcap.com" },
  { name: "Sarah Lin", org: "Sterling Holdings", email: "sarah@sterlingholdings.com" },
  { name: "Olivia Chen", org: "Beaumont Group", email: "olivia.chen@beaumontgrp.com" },
  { name: "Ray Castellanos", org: "Castellanos Holdings", email: "ray@castellanos.co" },
];

function detectClient(prompt: string): string {
  const p = prompt.toLowerCase();
  const hit = KNOWN_CLIENTS.find((c) => p.includes(c.toLowerCase().split(" ")[0]));
  return hit ?? "Hartley Family Trust";
}

const SCRIPTS: Script[] = [
  {
    title: "Agreement agent",
    reviewer: "Elena Smith",
    primaryAction: "Send for signature",
    secondaryAction: "Edit draft",
    steps: [
      { verb: "Read", object: "Engagement letter template.docx" },
      { verb: "Read", object: "Vault / client record" },
      { verb: "Reviewed", object: "Prior countersigned agreements" },
    ],
    questions: [
      {
        label: "Document",
        prompt: "Which agreement should this draft be?",
        options: ["Advisory engagement letter", "IPS amendment", "NDA for prospect"],
        defaultOption: 0,
      },
      {
        label: "Sign-off",
        prompt: "Who signs off before it goes out?",
        options: ["Elena Smith (compliance)", "Send to client directly", "Hold in my drafts"],
        defaultOption: 0,
      },
    ],
    result: (a, client) => [
      { verb: "Drafted", object: `${a[0]} — ${client}` },
      { verb: "Inserted", object: "Fee schedule and custodian language" },
      { verb: "Emailed", object: `Elena Smith — ${senderEmailAddress("Elena Smith")}` },
    ],
    summary: (a, client) =>
      `Drafted the ${a[0].toLowerCase()} for ${client}. It carries your standard fee schedule and custodian language, and is routed to ${a[1].replace(/\s*\(.*\)/, "")} before it goes out.`,
  },
  {
    title: "Inbox agent",
    primaryAction: "Review drafts",
    secondaryAction: "Change rules",
    steps: [
      { verb: "Read", object: "Inbox / 42 unread" },
      { verb: "Read", object: "Client priority rules" },
      { verb: "Reviewed", object: "Past reply tone" },
    ],
    questions: [
      {
        label: "Handling",
        prompt: "How should replies be handled?",
        options: ["Draft and hold for review", "Send routine replies", "Summarize only"],
        defaultOption: 0,
      },
    ],
    result: (a) => [
      { verb: "Applied", object: a[0].toLowerCase() },
      { verb: "Drafted", object: "6 client replies" },
      { verb: "Archived", object: "11 newsletters and receipts" },
    ],
    summary: (a) =>
      `Triaged 42 unread. Six client replies are ${a[0].toLowerCase()}, and 11 newsletters and receipts were archived.`,
  },
  {
    title: "Scheduling agent",
    primaryAction: "Send invite",
    secondaryAction: "Change time",
    steps: [
      { verb: "Read", object: "Calendar / next 10 business days" },
      { verb: "Read", object: "Advisor availability rules" },
    ],
    questions: [
      {
        label: "Attendee",
        prompt: "Who is the meeting with?",
        kind: "contact",
        options: [],
        defaultOption: 0,
      },
      {
        label: "Purpose",
        prompt: "What is the meeting about?",
        options: ["Quarterly portfolio review", "Onboarding kickoff", "Estate planning follow-up"],
        defaultOption: 0,
      },
      {
        label: "When",
        prompt: "What date and time should be booked?",
        kind: "when",
        options: [],
        defaultOption: 0,
      },
    ],
    result: (a) => [
      { verb: "Booked", object: `${a[1]} · ${a[2]}` },
      { verb: "Drafted", object: `Calendar invite for ${a[0]}` },
    ],
    summary: (a) =>
      `Held ${a[2]} for a ${a[1].toLowerCase()} with ${a[0]}. The invite includes a short agenda and a buffer block either side.`,
  },
];

function pickScript(prompt: string): Script {
  const p = prompt.toLowerCase();
  if (/(agreement|contract|engagement letter|ips|nda)/.test(p)) return SCRIPTS[0];
  if (/(inbox|email|triage|reply)/.test(p)) return SCRIPTS[1];
  if (/(schedule|meeting|calendar|book)/.test(p)) return SCRIPTS[2];
  return SCRIPTS[0];
}

/** Giga-style action line: bold verb, muted object. */
function ActionLine({ step, delay }: { step: Step; delay: number }) {
  return (
    <div
      className="syra-step-line text-[15px] leading-[1.8] tracking-[-0.005em]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="font-semibold text-foreground">{step.verb}</span>{" "}
      <span className="text-muted-foreground/85">{step.object}</span>
    </div>
  );
}

/** Gentle three-dot working indicator. */
function Working() {
  return (
    <div className="flex items-center gap-1.5 py-1.5 text-muted-foreground/70">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1 w-1 rounded-full bg-current syra-step-dot"
          style={{ animationDelay: `${i * 180}ms` }}
        />
      ))}
    </div>
  );
}

export function SyraAgentRunSheet({
  prompt,
  onClose,
}: {
  prompt: string;
  isDark?: boolean;
  onClose: () => void;
}) {
  const script = useMemo(() => pickScript(prompt), [prompt]);
  const client = useMemo(() => detectClient(prompt), [prompt]);
  const [revealed, setRevealed] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState(script.questions[0].defaultOption);
  const [contactQuery, setContactQuery] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [newContact, setNewContact] = useState(false);
  const [meetDate, setMeetDate] = useState("");
  const [meetTime, setMeetTime] = useState("");
  const [done, setDone] = useState<string[] | null>(null);
  const [resultRevealed, setResultRevealed] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setRevealed(0);
    setShowQuestion(false);
    setDone(null);
    setResultRevealed(0);
    setQIndex(0);
    setAnswers([]);
    setSelected(script.questions[0].defaultOption);
    setContactQuery("");
    setContactEmail("");
    setNewContact(false);
    setMeetDate("");
    setMeetTime("");
    timers.current.forEach(clearTimeout);
    timers.current = [];
    script.steps.forEach((_, i) => {
      timers.current.push(setTimeout(() => setRevealed(i + 1), 500 + i * 620));
    });
    timers.current.push(setTimeout(() => setShowQuestion(true), 620 + script.steps.length * 620));
    return () => timers.current.forEach(clearTimeout);
  }, [script]);

  const resultSteps = done ? script.result(done, client) : [];
  const currentQuestion = script.questions[qIndex];
  const kind = currentQuestion?.kind ?? "choice";

  const suggestions =
    kind === "contact" && !newContact && contactQuery.trim().length > 0
      ? CRM_CONTACTS.filter((c) =>
          `${c.name} ${c.org} ${c.email}`.toLowerCase().includes(contactQuery.trim().toLowerCase()),
        ).slice(0, 3)
      : [];

  const canConfirm =
    kind === "choice"
      ? true
      : kind === "contact"
        ? contactQuery.trim().length > 1 && (!newContact || /.+@.+\..+/.test(contactEmail))
        : Boolean(meetDate && meetTime);

  const formatWhen = () => {
    const d = new Date(`${meetDate}T${meetTime}`);
    if (Number.isNaN(d.getTime())) return `${meetDate} ${meetTime}`;
    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const advance = (choice: string) => {
    const next = [...answers, choice];
    setAnswers(next);

    if (qIndex + 1 < script.questions.length) {
      const ni = qIndex + 1;
      setQIndex(ni);
      setSelected(script.questions[ni].defaultOption);
      setContactQuery("");
      setContactEmail("");
      setNewContact(false);
      return;
    }

    setDone(next);
    setResultRevealed(0);
    const steps = script.result(next, client);
    steps.forEach((_, i) => {
      timers.current.push(setTimeout(() => setResultRevealed(i + 1), 400 + i * 620));
    });
  };

  const confirm = () => {
    if (!canConfirm) return;
    advance(
      kind === "contact"
        ? contactQuery.trim()
        : kind === "when"
          ? formatWhen()
          : currentQuestion.options[selected],
    );
  };

  const skip = () => {
    advance(
      kind === "choice"
        ? currentQuestion.options[currentQuestion.defaultOption]
        : kind === "contact"
          ? CRM_CONTACTS[0].name
          : "Next open slot",
    );
  };

  const allSteps = [...script.steps.slice(0, revealed), ...resultSteps.slice(0, resultRevealed)];
  const finished = Boolean(done) && resultRevealed >= resultSteps.length;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center px-6 sm:px-8">
      {/* click-away layer — fully transparent, no dim/spotlight (avoids gradient banding) */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-[24rem] sm:max-w-[30rem]">
        <div className="overflow-hidden rounded-[20px] border border-white/[0.06] bg-card shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_50px_120px_-30px_rgba(0,0,0,0.7)]">
          {/* header */}
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
            <div className="text-[16px] font-semibold tracking-[-0.015em] text-foreground">
              {script.title}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <button
                aria-label="Expand"
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted hover:text-foreground"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                aria-label="Close"
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[62dvh] overflow-y-auto px-5 py-4">
            {/* user prompt */}
            <div className="flex justify-end">
              <div className="max-w-[88%] rounded-[14px] bg-muted px-4 py-2.5 text-[15px] leading-snug text-foreground">
                {prompt}
              </div>
            </div>

            {/* action recap — plain lines, no icons */}
            <div className="mt-4">
              {allSteps.map((s, i) => (
                <ActionLine key={`${s.verb}-${s.object}`} step={s} delay={Math.min(i, 6) * 60} />
              ))}
              {(revealed < script.steps.length ||
                (done !== null && resultRevealed < resultSteps.length)) && <Working />}
            </div>

            {/* question card */}
            {showQuestion && !done && currentQuestion && (
              <div
                key={currentQuestion.label}
                className="mt-4 animate-in fade-in slide-in-from-bottom-2 rounded-[16px] border border-white/[0.06] bg-muted/35 p-4 shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset] duration-300"
              >
                <div className="text-[12.5px] text-muted-foreground/80">Questions</div>
                <div className="mt-1.5 text-[16px] font-semibold leading-snug tracking-[-0.015em] text-foreground">
                  {currentQuestion.prompt}
                </div>

                {kind === "choice" && (
                  <div className="mt-3 space-y-0.5">
                    {currentQuestion.options.map((o, i) => (
                      <button
                        key={o}
                        onClick={() => setSelected(i)}
                        className={`flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2 text-left transition-colors ${
                          selected === i ? "bg-foreground/10" : "hover:bg-foreground/5"
                        }`}
                      >
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[6px] bg-foreground/5 text-[11px] text-muted-foreground">
                          {i + 1}
                        </span>
                        <span className="text-[15px] text-foreground">{o}</span>
                      </button>
                    ))}
                  </div>
                )}

                {kind === "contact" && (
                  <div className="mt-3 space-y-2">
                    <input
                      autoFocus={autoFocusUnlessTouch()}
                      value={contactQuery}
                      onChange={(e) => setContactQuery(e.target.value)}
                      placeholder={newContact ? "Full name" : "Start typing a name…"}
                      className="w-full rounded-[10px] border border-border bg-background px-3 py-2 text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:border-foreground/30 focus:outline-none"
                    />
                    {newContact ? (
                      <input
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="Email address"
                        type="email"
                        className="w-full rounded-[10px] border border-border bg-background px-3 py-2 text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:border-foreground/30 focus:outline-none"
                      />
                    ) : (
                      suggestions.length > 0 && (
                        <div className="space-y-0.5">
                          {suggestions.map((c) => (
                            <button
                              key={c.email}
                              onClick={() => {
                                setContactQuery(c.name);
                                setContactEmail(c.email);
                              }}
                              className={`flex w-full items-center justify-between gap-2 rounded-[10px] px-2.5 py-2 text-left transition-colors ${
                                contactEmail === c.email ? "bg-foreground/10" : "hover:bg-foreground/5"
                              }`}
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-[15px] text-foreground">
                                  {c.name}
                                </span>
                                <span className="block truncate text-[12.5px] text-muted-foreground">
                                  {c.org}
                                </span>
                              </span>
                            </button>
                          ))}
                        </div>
                      )
                    )}
                    <button
                      onClick={() => {
                        setNewContact((v) => !v);
                        setContactEmail("");
                      }}
                      className="text-[13px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    >
                      {newContact ? "Search CRM instead" : "+ New contact"}
                    </button>
                  </div>
                )}

                {kind === "when" && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={meetDate}
                      onChange={(e) => setMeetDate(e.target.value)}
                      className="w-full rounded-[10px] border border-border bg-background px-3 py-2 text-[15px] text-foreground focus:border-foreground/30 focus:outline-none"
                    />
                    <input
                      type="time"
                      value={meetTime}
                      onChange={(e) => setMeetTime(e.target.value)}
                      className="w-full rounded-[10px] border border-border bg-background px-3 py-2 text-[15px] text-foreground focus:border-foreground/30 focus:outline-none"
                    />
                  </div>
                )}

                <div className="mt-4 flex items-center justify-end gap-3">
                  <button
                    onClick={skip}
                    className="px-2 py-1.5 text-[15px] text-muted-foreground hover:text-foreground"
                  >
                    Skip
                  </button>
                  <button
                    onClick={confirm}
                    disabled={!canConfirm}
                    className="rounded-[10px] bg-foreground px-4 py-2 text-[15px] font-medium text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* closing summary + actions */}
            {finished && done && (
              <div className="mt-4 syra-step-line">
                <p className="text-[15px] leading-[1.55] text-foreground">
                  {script.summary(done, client)}
                </p>

                {script.reviewer && (
                  <div className="mt-3 flex items-center gap-3">
                    <SmartAvatar name={script.reviewer} size={96} className="h-8 w-8 rounded-full object-cover" alt={script.reviewer} />
                    <div className="min-w-0 text-[13px] text-muted-foreground">
                      Awaiting sign-off from {script.reviewer}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <button className="rounded-[10px] bg-foreground px-4 py-2 text-[15px] font-medium tracking-[-0.01em] text-background transition-opacity hover:opacity-90">
                    {script.primaryAction}
                  </button>
                  <button className="rounded-[10px] border border-white/[0.08] px-4 py-2 text-[15px] font-medium tracking-[-0.01em] text-foreground transition-colors hover:bg-muted">
                    {script.secondaryAction}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* follow-up */}
          <div className="px-5 pb-5">
            <div className="relative rounded-[14px] border border-white/[0.05] bg-muted/50">
              <input
                placeholder="Ask a follow-up…"
                className="w-full bg-transparent py-3.5 pl-4 pr-14 text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              />
              <button
                aria-label="Send"
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-foreground text-background"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
