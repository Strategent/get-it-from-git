import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createLovableAiGatewayRunIdFetch } from "./ai-gateway.server";
import { retrieve, classifyIntent, briefingDocs, type KnowledgeDoc } from "./syra-knowledge";

const SYSTEM_PROMPT = `You are Syra, the AI chief of staff inside the Harwick & Sterne workspace.

Voice: calm, senior, concise. No emoji, no bullet-point dumps, no filler like "Certainly!".
Answer in 1-3 short sentences unless the user asks for detail.

Grounding rules:
- Use ONLY the workspace context provided below for facts about people, emails, meetings, tasks and clients.
- If the context does not cover the question, say what you don't have access to and offer the agent you could run instead.
- Never invent names, amounts, dates or email addresses.
- If the user greets you or makes small talk, reply warmly in one line, then name one concrete item from the context (a waiting email, a task, or the next meeting) as a suggested next step.
- Never say you lack workspace context when context is provided below; use it.
- If the user is asking you to DO something (draft, send, schedule, triage), say you'll run the agent for it rather than pretending it is done.`;

function contextBlock(docs: KnowledgeDoc[]) {
  if (docs.length === 0) return "Workspace context: (nothing relevant retrieved)";
  return [
    "Workspace context:",
    ...docs.map((doc) => `- [${doc.source}] ${doc.title}: ${doc.text}`),
  ].join("\n");
}

export type SyraChatTurn = { role: "user" | "assistant"; content: string };

export async function runSyraChat({
  message,
  history,
  lovableApiKey,
  runId,
}: {
  message: string;
  history: SyraChatTurn[];
  lovableApiKey: string;
  runId?: string;
}) {
  const intent = classifyIntent(message);
  const retrieved =
    intent === "greeting" || intent === "smalltalk" ? [] : retrieve(message, 4);
  // Greetings, small talk and anything the index misses still get today's briefing.
  const docs = retrieved.length > 0 ? retrieved : briefingDocs();

  const runIdFetch = createLovableAiGatewayRunIdFetch(runId);
  const lovable = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: lovableApiKey,
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    fetch: runIdFetch.fetch as typeof fetch,
  });

  const result = streamText({
    model: lovable.responses("openai/gpt-5.6-sol"),
    system: `${SYSTEM_PROMPT}\n\n${contextBlock(docs)}`,
    messages: [...history.slice(-8), { role: "user" as const, content: message }],
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  const text = (await result.text).trim();

  return {
    intent,
    text:
      text ||
      "I couldn't put that together just now — want me to run an agent on it instead?",
    sources: docs.map((doc) => ({ source: doc.source, title: doc.title })),
  };
}
