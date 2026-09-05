export type BriefThread = {
  from: string;
  company: string;
  subject: string;
  tag: string;
  time: string;
  needsReply: boolean;
};

export type Briefing = {
  gist: string;
  nextAction: string;
  context: string;
  strategy: string;
  risk: string;
  tone: string;
  lastContact: string;
  confidence: number;
  signals: string[];
};

export function buildBriefing(t: BriefThread): Briefing {
  const first = t.from.split(" ")[0];
  switch (t.tag) {
    case "Hot lead":
      return {
        gist: `${first} approved the proposal with two edits — tier 2 pricing and a kickoff the week of June 10.`,
        nextAction: "Send the updated SOW and lock June 10",
        context: `${t.company} has moved from evaluation to commitment. ${first} is the economic buyer and is aligning finance today, so the only thing left is paperwork that matches what was verbally agreed.`,
        strategy:
          "Confirm both edits in writing, attach the revised SOW, and name the date rather than asking for one. Momentum is the asset here — don't reopen scope.",
        risk: "Delay is the only real risk: finance alignment expires if the SOW slips past this week.",
        tone: "Warm, decisive, short",
        lastContact: "2 days ago",
        confidence: 92,
        signals: [
          "Explicit approval language in the latest reply",
          "Buyer volunteered to align finance same-day",
          "Specific kickoff date proposed by the client",
        ],
      };
    case "Sales":
      return {
        gist: `${first} is blocked on three answers before legal can countersign — SOC2 status, data residency, and an implementation owner.`,
        nextAction: "Reply with the SOC2 pack and name the owner",
        context: `${t.company} is in security review. Nothing is being renegotiated; this is a documentation gate held by their reviewer, not their buyer.`,
        strategy:
          "Answer all three in one reply so the thread doesn't ping-pong. Attach rather than describe, and put the owner's name and title in the first line.",
        risk: "Partial answers restart the review cycle and add a week.",
        tone: "Precise, factual",
        lastContact: "4 days ago",
        confidence: 84,
        signals: [
          "Three explicit open items listed by the client",
          "Legal named as the next step, not procurement",
          "No pricing objections raised in the thread",
        ],
      };
    case "Renewal":
      return {
        gist: `Renewal lands in 14 days and procurement is driving — they want a seat-count review before the invoice cuts.`,
        nextAction: "Propose a seat-count review call this week",
        context: `${t.company} is running a standard procurement pass. The conversation is numbers-first; narrative and roadmap talk will be ignored at this stage.`,
        strategy:
          "Bring current seat usage to the table before they ask. Offer two concrete call windows and a one-page pricing summary so the review happens once.",
        risk: "If the invoice cuts before the review, the renewal turns into a credit dispute.",
        tone: "Businesslike, prepared",
        lastContact: "6 days ago",
        confidence: 78,
        signals: [
          "Renewal date inside 14 days",
          "Procurement copied on the thread",
          "Seat-count review requested explicitly",
        ],
      };
    case "Billing":
      return {
        gist: `${t.company} asked to move invoice 4471 to net-45 terms — finance-side only, no commercial decision.`,
        nextAction: "Confirm net-45 against policy and reply",
        context: "This is an administrative request from their AP team; the account relationship is unaffected.",
        strategy: "Confirm or counter in one line, then update the invoice schedule so it doesn't resurface next cycle.",
        risk: "Low. Only risk is silence, which stalls payment.",
        tone: "Brief, procedural",
        lastContact: "1 day ago",
        confidence: 88,
        signals: ["Specific invoice number referenced", "Request came from AP, not the buyer"],
      };
    case "Legal":
      return {
        gist: "Contract and compliance thread — a documented written answer moves this to signature.",
        nextAction: "Send an on-the-record written response",
        context: `${t.company}'s counsel needs answers in writing they can attach to the file. A call will not close this.`,
        strategy: "Answer in the same structure they asked, route through counsel for sign-off, and avoid new commitments in prose.",
        risk: "Informal wording here becomes a contractual term later.",
        tone: "Measured, on the record",
        lastContact: "3 days ago",
        confidence: 81,
        signals: ["Counsel is the sender", "Signature named as the next milestone"],
      };
    case "Intro":
      return {
        gist: `Warm intro — ${first} is on the thread and engaged. A quick reply keeps the momentum.`,
        nextAction: "Reply-all and offer two meeting windows",
        context: "An introduction was made by a mutual contact; social debt is highest in the first 24 hours.",
        strategy: "Thank the introducer, move them to bcc, and give two concrete times instead of asking for availability.",
        risk: "Slow replies waste the introducer's credibility.",
        tone: "Warm, brief",
        lastContact: "Today",
        confidence: 86,
        signals: ["Introducer copied on the thread", "Positive framing in the intro note"],
      };
    default:
      return {
        gist: `Automated notification from ${t.company} — no reply expected.`,
        nextAction: "Archive for the record",
        context: "System message filed for awareness only.",
        strategy: "Archive it; no follow-up is needed unless it repeats.",
        risk: "None.",
        tone: "N/A",
        lastContact: t.time,
        confidence: 99,
        signals: ["No-reply sender", "No question posed in the body"],
      };
  }
}

export function answerAboutThread(t: BriefThread, question: string): string {
  const b = buildBriefing(t);
  const q = question.toLowerCase();
  const first = t.from.split(" ")[0];

  const has = (...words: string[]) => words.some((w) => q.includes(w));

  if (has("next", "action", "do now", "should i do", "todo"))
    return `${b.nextAction}. ${b.strategy}`;
  if (has("context", "background", "who", "history", "client", "relationship"))
    return `${b.context} Last contact: ${b.lastContact.toLowerCase()}.`;
  if (has("strategy", "approach", "angle", "how should", "positioning"))
    return b.strategy;
  if (has("risk", "unclear", "worry", "concern", "watch"))
    return `${b.risk} Confidence in this read: ${b.confidence}%.`;
  if (has("tone", "voice", "style"))
    return `${b.tone}. Match ${first}'s register — they write short, so a long reply reads as hedging.`;
  if (has("summar", "tldr", "gist", "recap", "what is this", "what's this"))
    return `${b.gist} Next: ${b.nextAction.toLowerCase()}.`;
  if (has("draft", "reply", "write", "respond"))
    return `Open the composer and lead with the decision: "${b.nextAction}." Keep it to three sentences — confirm, commit to a date, and name who owns the next step.`;
  if (has("why", "signal", "evidence", "how do you know"))
    return `I'm reading it from: ${b.signals.join("; ")}.`;
  if (has("when", "timing", "deadline", "urgent"))
    return `Last contact was ${b.lastContact.toLowerCase()}. ${b.risk}`;

  return `${b.gist} The move is: ${b.nextAction.toLowerCase()}. ${b.strategy} Ask me about context, strategy, risk or timing for more.`;
}

export const askSyraSuggestions = [
  "What's the client context?",
  "What's the right strategy here?",
  "What's my next step?",
];
