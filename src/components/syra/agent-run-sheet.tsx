import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Maximize2, X } from "lucide-react";
import { avatarUrl, senderEmailAddress } from "@/lib/avatar";

type Step = { verb: string; object: string };
type Question = {
  label: string;
  prompt: string;
  /** "choice" = option list (default), "contact" = CRM lookup / new contact, "when" = date + time */
  kind?: "choice" | "contact" | "when";
  options: string[];
  defaultOption: number;
};
type Script = {
  title: string;
  steps: Step[];
  /** Sequential intake questions — all answered before the agent acts. */
  questions: Question[];
  /** Steps streamed after every question is answered. */
  result: (answers: string[], client: string) => Step[];
  /** Teammate who receives the review email (must map to a PNG avatar asset). */
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
  { name: "Marcus Reed", org: "Caldwell Estate", email: "marcus.reed@caldwellestate.com" },
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
    steps: [
      { verb: "Read", object: "Engagement letter template.docx" },
      { verb: "Read", object: "Vault / client record" },
      { verb: "Reviewed", object: "Prior countersigned agreements" },
      { verb: "Checked", object: "Compliance clause library — 2026 revisions" },
    ],
    questions: [
      {
        label: "Document type",
        prompt: "Which agreement should Syra draft?",
        options: ["Advisory engagement letter", "IPS amendment", "NDA for prospect"],
        defaultOption: 0,
      },
      {
        label: "Fee schedule",
        prompt: "Which fee schedule applies?",
        options: ["Standard AUM tiers", "Flat annual retainer", "Match prior agreement"],
        defaultOption: 2,
      },
      {
        label: "Routing",
        prompt: "Who signs off before it goes out?",
        options: ["Elena Smith (compliance)", "Send to client directly", "Hold in my drafts"],
        defaultOption: 0,
      },
    ],
    result: (a, client) => [
      { verb: "Drafted", object: `${a[0]} — ${client}` },
      { verb: "Applied", object: a[1].toLowerCase() },
      { verb: "Inserted", object: "Fee schedule + custodian language" },
      { verb: "Attached", object: "Client record and prior terms" },
      { verb: "Emailed", object: `Elena Smith — ${senderEmailAddress("Elena Smith")} for review` },
      { verb: "Queued", object: "Signature routing via DocuSign after sign-off" },
    ],
  },
  {
    title: "Inbox agent",
    steps: [
      { verb: "Read", object: "Inbox / 42 unread" },
      { verb: "Read", object: "Client priority rules" },
      { verb: "Reviewed", object: "Past reply tone" },
    ],
    questions: [
      {
        label: "Handling",
        prompt: "How should Syra handle replies?",
        options: ["Draft and hold for review", "Send routine replies", "Summarize only"],
        defaultOption: 0,
      },
      {
        label: "Scope",
        prompt: "Which mail should Syra touch?",
        options: ["Clients only", "Everything unread", "Flagged and urgent only"],
        defaultOption: 0,
      },
    ],
    result: (a) => [
      { verb: "Applied", object: `${a[0].toLowerCase()} · ${a[1].toLowerCase()}` },
      { verb: "Drafted", object: "6 replies — held for your review" },
      { verb: "Archived", object: "11 newsletters and receipts" },
    ],
  },
  {
    title: "Scheduling agent",
    steps: [
      { verb: "Read", object: "Calendar / next 10 business days" },
      { verb: "Read", object: "Advisor availability rules" },
      { verb: "Reviewed", object: "Client time-zone and contact preferences" },
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
        label: "Length",
        prompt: "How long should it run?",
        options: ["30 minutes", "45 minutes", "60 minutes"],
        defaultOption: 1,
      },
      {
        label: "Format",
        prompt: "Where should it take place?",
        options: ["Zoom video call", "Phone call", "In office"],
        defaultOption: 0,
      },
      {
        label: "When",
        prompt: "What date and time should Syra book?",
        kind: "when",
        options: [],
        defaultOption: 0,
      },
    ],
    result: (a) => [
      { verb: "Confirmed", object: `${a[0]} · ${a[1]}` },
      { verb: "Set", object: `${a[2]} · ${a[3]}` },
      { verb: "Scheduled", object: a[4] },
      { verb: "Sent", object: `Calendar invite to ${a[0]} with agenda attached` },
      { verb: "Held", object: "Provisional holds + buffer blocks on your calendar" },
    ],
  },
];

function pickScript(prompt: string): Script {
  const p = prompt.toLowerCase();
  if (/(agreement|contract|engagement letter|ips|nda)/.test(p)) return SCRIPTS[0];
  if (/(inbox|email|triage|reply)/.test(p)) return SCRIPTS[1];
  if (/(schedule|meeting|calendar|book)/.test(p)) return SCRIPTS[2];
  return SCRIPTS[0];
}

/** One streamed action line — soft, staggered fade-and-rise instead of a hard pop. */
function StepLine({ step, index }: { step: Step; index: number }) {
  return (
    <div
      className="flex items-start gap-2 text-[13px] leading-[1.35] syra-step-line"
      style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}
    >
      <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
      <span className="min-w-0">
        <span className="font-medium text-foreground">{step.verb}</span>{" "}
        <span className="text-muted-foreground">{step.object}</span>
      </span>
    </div>
  );
}

/** Gentle three-dot working indicator. */
function Working() {
  return (
    <div className="flex items-center gap-1.5 pl-3 text-[13px] text-muted-foreground/70">
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
  isDark,
  onClose,
}: {
  prompt: string;
  isDark: boolean;
  onClose: () => void;
}) {
  const script = useMemo(() => pickScript(prompt), [prompt]);
  const client = useMemo(() => detectClient(prompt), [prompt]);
  const runKey = 0;
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
      timers.current.push(setTimeout(() => setRevealed(i + 1), 600 + i * 760));
    });
    timers.current.push(
      setTimeout(() => setShowQuestion(true), 700 + script.steps.length * 760),
    );
    return () => timers.current.forEach(clearTimeout);
  }, [script, runKey]);

  const resultSteps = done ? script.result(done, client) : [];
  const currentQuestion = script.questions[qIndex];
  const kind = currentQuestion?.kind ?? "choice";

  const suggestions =
    kind === "contact" && !newContact && contactQuery.trim().length > 0
      ? CRM_CONTACTS.filter((c) =>
          `${c.name} ${c.org} ${c.email}`.toLowerCase().includes(contactQuery.trim().toLowerCase()),
        ).slice(0, 4)
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

  const confirm = () => {
    if (!canConfirm) return;
    const choice =
      kind === "contact"
        ? contactEmail
          ? `${contactQuery.trim()} (${contactEmail.trim()})`
          : contactQuery.trim()
        : kind === "when"
          ? formatWhen()
          : currentQuestion.options[selected];
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
      timers.current.push(setTimeout(() => setResultRevealed(i + 1), 450 + i * 700));
    });
  };


  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center px-6 sm:px-8">
      {/* click-away layer — fully transparent, no dim/spotlight (avoids gradient banding) */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-[22rem] sm:max-w-md">
        <div className="overflow-hidden rounded-2xl border border-border bg-card/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          {/* header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="text-[15px] font-medium text-foreground">{script.title}</div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <button aria-label="Expand" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted hover:text-foreground">
                <Maximize2 className="h-4 w-4" />
              </button>
              <button aria-label="Close" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[62dvh] overflow-y-auto px-4 py-4">
            {/* user prompt */}
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl bg-muted px-4 py-2.5 text-[14px] leading-snug text-foreground">
                {prompt}
              </div>
            </div>

            {/* steps */}
            <div className="mt-4 space-y-1.5">
              {script.steps.slice(0, revealed).map((s, i) => (
                <StepLine key={s.object} step={s} index={i} />
              ))}
              {revealed < script.steps.length && <Working />}
            </div>

            {/* answered intake so far */}
            {answers.length > 0 && (
              <div className="mt-3 space-y-1">
                {answers.map((a, i) => (
                  <div
                    key={script.questions[i].label}
                    className="flex items-start gap-2 text-[12.5px] leading-[1.35] syra-step-line"
                  >
                    <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                    <span className="min-w-0">
                      <span className="text-muted-foreground">{script.questions[i].label}:</span>{" "}
                      <span className="text-foreground">{a}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* question card */}
            {showQuestion && !done && currentQuestion && (
              <div
                key={currentQuestion.label}
                className="mt-4 animate-in fade-in slide-in-from-bottom-2 rounded-xl bg-muted/50 p-3.5 duration-300"
              >
                <div className="text-[11.5px] uppercase tracking-wide text-muted-foreground">
                  Question {qIndex + 1} of {script.questions.length}
                </div>
                <div className="mt-1.5 text-[15px] font-medium leading-snug text-foreground">
                  {currentQuestion.prompt}
                </div>
                <div className="mt-2.5 space-y-1">
                  {currentQuestion.options.map((o, i) => (
                    <button
                      key={o}
                      onClick={() => setSelected(i)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors ${
                        selected === i ? "bg-foreground/10" : "hover:bg-foreground/5"
                      }`}
                    >
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-foreground/5 text-[10.5px] text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="text-[13.5px] text-foreground">{o}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={confirm}
                    className="rounded-lg bg-foreground px-3.5 py-1.5 text-[13.5px] font-medium text-background"
                  >
                    {qIndex + 1 < script.questions.length ? "Next" : "Confirm & run"}
                  </button>
                </div>
              </div>
            )}

            {done && (
              <div className="mt-3 space-y-1.5">
                {resultSteps.slice(0, resultRevealed).map((s, i) => (
                  <StepLine key={s.object} step={s} index={i} />
                ))}
                {resultRevealed < resultSteps.length && <Working />}

                {resultRevealed >= resultSteps.length && script.reviewer && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3 syra-step-line">
                    <img
                      src={avatarUrl(script.reviewer, 96)}
                      alt={script.reviewer}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-[13.5px] font-medium text-foreground">
                        Sent to {script.reviewer} for review
                      </div>
                      <div className="truncate text-[12px] text-muted-foreground">
                        {senderEmailAddress(script.reviewer)} · awaiting sign-off
                      </div>
                    </div>
                  </div>
                )}

                {resultRevealed >= resultSteps.length && (
                  <div className="mt-3 flex items-center gap-2 text-[13px] text-muted-foreground syra-step-line" style={{ animationDelay: "120ms" }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 syra-step-dot" />
                    Task complete · {resultSteps.length} actions executed
                  </div>
                )}
              </div>
            )}

          </div>

          {/* follow-up */}
          <div className="px-4 pb-4">
            <div className="relative rounded-xl bg-muted/60">
              <input
                placeholder="Ask a follow-up…"
                className="w-full bg-transparent py-4 pl-4 pr-14 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
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
