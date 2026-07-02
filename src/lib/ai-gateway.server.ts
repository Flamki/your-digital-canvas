import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createFireworksProvider(fireworksApiKey: string) {
  return createOpenAICompatible({
    name: "fireworks",
    baseURL: "https://api.fireworks.ai/inference/v1",
    apiKey: fireworksApiKey,
    includeUsage: true,
  });
}

export function createLovableAiGatewayProvider(lovableApiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}
