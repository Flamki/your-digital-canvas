import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createFireworksProvider, createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { buildAyushSystemPrompt } from "@/lib/ayush-profile";

const DEFAULT_FIREWORKS_MODEL = "accounts/fireworks/models/minimax-m3";
const DEFAULT_LOVABLE_MODEL = "google/gemini-3-flash-preview";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const fireworksKey = process.env.FIREWORKS_API_KEY;
        const lovableKey = process.env.LOVABLE_API_KEY;

        if (!fireworksKey && !lovableKey) {
          return new Response("Missing FIREWORKS_API_KEY or LOVABLE_API_KEY", { status: 500 });
        }

        const model = fireworksKey
          ? createFireworksProvider(fireworksKey)(
              process.env.FIREWORKS_MODEL || DEFAULT_FIREWORKS_MODEL,
            )
          : createLovableAiGatewayProvider(lovableKey!)(DEFAULT_LOVABLE_MODEL);

        const result = streamText({
          model,
          system: buildAyushSystemPrompt(process.env.AYUSH_PERSONALITY_CONTEXT),
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          sendReasoning: false,
        });
      },
    },
  },
});
