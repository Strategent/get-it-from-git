import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runSyraChat } from "./syra-chat.server";

const ChatInput = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      }),
    )
    .max(20)
    .default([]),
});

export const syraChat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }) => {
    const lovableApiKey = process.env["LOVABLE_API_KEY"];
    if (!lovableApiKey) throw new Error("Missing LOVABLE_API_KEY");

    return runSyraChat({
      message: data.message,
      history: data.history,
      lovableApiKey,
    });
  });
