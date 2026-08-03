import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Maximize2, X } from "lucide-react";
import { avatarUrl, senderEmailAddress } from "@/lib/avatar";

type Step = { verb: string; object: string };
type Script = {
  title: string;
  steps: Step[];
  question: string;
  options: string[];
  defaultOption: number;
  /** Steps streamed after the user confirms, e.g. drafting + routing for review. */
  result: (choice: string, client: string) => Step[];
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
    question: "Which agreement should Syra draft?",
    options: ["Advisory engagement letter", "IPS amendment", "NDA for prospect"],
    defaultOption: 0,
    result: (choice, client) => [
      { verb: "Drafted", object: `${choice} — ${client}` },
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
    question: "How should Syra handle replies?",
    options: ["Draft and hold for review", "Send routine replies", "Summarize only"],
    defaultOption: 0,
    result: (choice) => [
      { verb: "Applied", object: choice.toLowerCase() },
      { verb: "Drafted", object: "6 replies — held for your review" },
      { verb: "Archived", object: "11 newsletters and receipts" },
    ],
  },
  {
    title: "Scheduling agent",
    steps: [
      { verb: "Read", object: "Calendar / this week" },
      { verb: "Read", object: "Advisor availability rules" },
      { verb: "Reviewed", object: "Client time preferences" },
    ],
    question: "Which windows should Syra offer?",
    options: ["Mornings only", "Afternoons only", "Any open slot"],
    defaultOption: 2,
    result: (choice) => [
      { verb: "Offered", object: `${choice} across the next 5 business days` },
      { verb: "Sent", object: "Booking links to 3 clients" },
      { verb: "Held", object: "Buffer blocks around each slot" },
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
      className="text-[14px] syra-step-line"
      style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}
    >
      <span className="font-medium text-foreground">{step.verb}</span>{" "}
      <span className="text-muted-foreground">{step.object}</span>
    </div>
  );
}

/** Gentle three-dot working indicator. */
function Working() {
  return (
    <div className="flex items-center gap-1.5 py-0.5 text-[14px] text-muted-foreground/70">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current syra-step-dot"
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
  const [selected, setSelected] = useState(script.defaultOption);
  const [done, setDone] = useState<string | null>(null);
  const [resultRevealed, setResultRevealed] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setRevealed(0);
    setShowQuestion(false);
    setDone(null);
    setResultRevealed(0);
    setSelected(script.defaultOption);
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

  const confirm = () => {
    const choice = script.options[selected];
    setDone(choice);
    setResultRevealed(0);
    const steps = script.result(choice, client);
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
            <div className="mt-4 space-y-2">
              {script.steps.slice(0, revealed).map((s, i) => (
                <StepLine key={s.object} step={s} index={i} />
              ))}
              {revealed < script.steps.length && <Working />}
            </div>

            {/* question card */}
            {showQuestion && !done && (
              <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 rounded-xl bg-muted/50 p-4 duration-300">
                <div className="text-[12.5px] text-muted-foreground">Questions</div>
                <div className="mt-1.5 text-[16px] font-medium leading-snug text-foreground">
                  {script.question}
                </div>
                <div className="mt-3 space-y-1">
                  {script.options.map((o, i) => (
                    <button
                      key={o}
                      onClick={() => setSelected(i)}
                      className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors ${
                        selected === i ? "bg-foreground/10" : "hover:bg-foreground/5"
                      }`}
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-foreground/5 text-[11px] text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="text-[14.5px] text-foreground">{o}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={confirm}
                    className="px-3 py-2 text-[14px] text-muted-foreground hover:text-foreground"
                  >
                    Skip
                  </button>
                  <button
                    onClick={confirm}
                    className="rounded-lg bg-foreground px-4 py-2 text-[14px] font-medium text-background"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {done && (
              <div className="mt-4 space-y-2">
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
