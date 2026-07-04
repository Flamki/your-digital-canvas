import { createFileRoute } from "@tanstack/react-router";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import type { Readable } from "node:stream";

const DEFAULT_EDGE_VOICE = "en-IN-PrabhatNeural";
const MAX_TTS_CHARS = 1400;

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const payload = (await request.json().catch(() => null)) as { text?: unknown } | null;
        const text = cleanTtsInput(typeof payload?.text === "string" ? payload.text : "");

        if (!text) {
          return new Response("Text is required", { status: 400 });
        }

        try {
          const tts = new MsEdgeTTS();
          await tts.setMetadata(
            process.env.EDGE_TTS_VOICE || DEFAULT_EDGE_VOICE,
            OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
          );

          const { audioStream } = tts.toStream(escapeXml(text), {
            rate: "+20%",
            pitch: "+1Hz",
            volume: 100,
          });

          const audio = await readableToBuffer(audioStream);
          tts.close();

          return new Response(audio, {
            headers: {
              "content-type": "audio/mpeg",
              "cache-control": "no-store",
            },
          });
        } catch (error) {
          console.error("Edge TTS failed", error);
          return new Response("TTS failed", { status: 502 });
        }
      },
    },
  },
});

function cleanTtsInput(text: string) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/[^\s)]+/g, "link")
    .replace(/[`*_#>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TTS_CHARS);
}

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function readableToBuffer(readable: Readable) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];

    readable.on("data", (chunk: Buffer | Uint8Array) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    readable.on("error", reject);
    readable.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
