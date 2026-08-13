/**
 * Tiny in-app knowledge base for Syra's retrieval-augmented answers.
 * Mirrors the demo workspace data (inbox, calendar, tasks, CRM, docs) so the
 * assistant can ground replies in something concrete instead of hallucinating.
 */
export type KnowledgeDoc = {
  id: string;
  source: "Inbox" | "Calendar" | "Tasks" | "CRM" | "Documents" | "Workspace";
  title: string;
  text: string;
};

export const knowledgeBase: KnowledgeDoc[] = [
  {
    id: "kb-workspace",
    source: "Workspace",
    title: "Harwick & Sterne workspace",
    text: "John Harwick is Managing Partner at Harwick & Sterne (john.harwick@harwicksterne.com). Syra is his AI chief of staff, covering inbox triage, drafting, scheduling, CRM follow-up, and document review.",
  },
  {
    id: "kb-inbox-hartley",
    source: "Inbox",
    title: "Emma Reeves — Hartley Trust engagement letter",
    text: "Emma Reeves (emma.reeves@hartleytrust.com) is waiting on a countersigned engagement letter for the Hartley Trust. Flagged as needs-reply for two days; legal has cleared the terms.",
  },
  {
    id: "kb-inbox-stripe",
    source: "Inbox",
    title: "Stripe billing reconciliation",
    text: "Stripe sent the monthly reconciliation CSV (Stripe_reconciliation.csv). Two invoices are unmatched and finance wants sign-off before the quarter closes.",
  },
  {
    id: "kb-inbox-marlow",
    source: "Inbox",
    title: "Daniel Brooks — Marlow Capital diligence",
    text: "Daniel Brooks at Marlow Capital (daniel@marlowcap.com) asked for the updated diligence pack and a security questionnaire before the next committee meeting.",
  },
  {
    id: "kb-calendar",
    source: "Calendar",
    title: "This week's calendar",
    text: "Key holds: Marlow Capital review at 2:00 PM, a Hartley Trust close call Thursday morning, and an internal partner sync Friday at 9:00 AM. Mornings before 11 AM are generally protected focus time.",
  },
  {
    id: "kb-tasks",
    source: "Tasks",
    title: "Open tasks",
    text: "Open items: countersign the Hartley engagement letter, reconcile the two open Stripe invoices, send Marlow the diligence pack, and review the Caldwell estate summary.",
  },
  {
    id: "kb-crm",
    source: "CRM",
    title: "Pipeline snapshot",
    text: "Active relationships: Hartley Trust (closing), Marlow Capital (diligence), Sterling Holdings (renewal), Beaumont Group (dormant, no contact in 6 weeks), Castellanos Holdings (intro stage).",
  },
  {
    id: "kb-docs",
    source: "Documents",
    title: "Document library",
    text: "Recent documents: Completed_MSA.pdf, Security_questionnaire.pdf, Stripe_reconciliation.csv, and the Caldwell estate summary draft.",
  },
  {
    id: "kb-capabilities",
    source: "Workspace",
    title: "What Syra can run",
    text: "Syra can run agents that draft agreements and emails, triage the inbox, schedule meetings with attendee lookup from CRM, and prepare briefings. Agent runs show each tool call and pause for approval before anything is sent.",
  },
];

/** Default grounding for greetings and small talk: who the user is plus today's load. */
export function briefingDocs(): KnowledgeDoc[] {
  const ids = ["kb-workspace", "kb-tasks", "kb-calendar", "kb-inbox-hartley"];
  return ids
    .map((id) => knowledgeBase.find((doc) => doc.id === id))
    .filter((doc): doc is KnowledgeDoc => Boolean(doc));
}

const STOP_WORDS = new Set([
  "the","a","an","and","or","of","to","for","in","on","is","are","was","were","be","my","me","i",
  "you","it","that","this","with","what","whats","how","can","do","does","please","hey","hi","there","yeah",
]);

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

/** Keyword-overlap retrieval — small corpus, no embeddings needed. */
export function retrieve(query: string, limit = 4): KnowledgeDoc[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const scored = knowledgeBase.map((doc) => {
    const haystack = `${doc.title} ${doc.text} ${doc.source}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (haystack.includes(term)) score += 1;
      if (doc.title.toLowerCase().includes(term)) score += 0.5;
    }
    return { doc, score };
  });

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.doc);
}

export type SyraIntent = "greeting" | "smalltalk" | "question" | "agent";

const GREETING_RE =
  /^(hi|hey|hello|yo|good (morning|afternoon|evening)|howdy|sup)\b[\s!.,]*(there|syra|again)?[\s!.,]*$/i;
const SMALLTALK_RE = /^(thanks|thank you|ok|okay|cool|nice|got it|great|bye|goodbye)\b[\s!.,]*$/i;
const AGENT_RE =
  /\b(draft|write|compose|send|reply|respond|schedule|book|set up|triage|clean up|file|archive|follow up|prepare|generate|create|build|run|remind|invite|negotiate|review and)\b/i;

/** Routes a message: chat answer vs. a full agent run. */
export function classifyIntent(message: string): SyraIntent {
  const text = message.trim();
  if (!text) return "smalltalk";
  if (GREETING_RE.test(text)) return "greeting";
  if (SMALLTALK_RE.test(text)) return "smalltalk";
  if (AGENT_RE.test(text)) return "agent";
  return "question";
}
