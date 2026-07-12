import { createFileRoute } from "@tanstack/react-router";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { PassThrough, Readable } from "node:stream";

const DEFAULT_EDGE_VOICE = "en-US-AndrewMultilingualNeural";
const MAX_TTS_CHARS = 700;
const MAX_CACHE_ENTRIES = 48;
const audioCache = new Map<string, Buffer>();

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const payload = (await request.json().catch(() => null)) as { text?: unknown } | null;
        const text = cleanTtsInput(typeof payload?.text === "string" ? payload.text : "");

        if (!text) {
          return new Response("Text is required", { status: 400 });
        }

        const voice = process.env.EDGE_TTS_VOICE || DEFAULT_EDGE_VOICE;
        const cacheKey = `${voice}\n${text}`;
        const cachedAudio = audioCache.get(cacheKey);
        if (cachedAudio) {
          return audioResponse(cachedAudio, "HIT");
        }

        const tts = new MsEdgeTTS();
        try {
          await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

          const { audioStream } = tts.toStream(escapeXml(text), {
            rate: "-2%",
            pitch: "+0Hz",
            volume: 100,
          });

          return streamingAudioResponse(audioStream, tts, cacheKey);
        } catch (error) {
          tts.close();
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

function audioResponse(audio: Buffer, cacheStatus: "HIT" | "MISS") {
  return new Response(audio, {
    headers: {
      "content-type": "audio/mpeg",
      "cache-control": "private, max-age=3600",
      "x-tts-cache": cacheStatus,
    },
  });
}

function streamingAudioResponse(audioStream: Readable, tts: MsEdgeTTS, cacheKey: string) {
  const output = new PassThrough();
  const chunks: Buffer[] = [];

  output.on("data", (chunk: Buffer | Uint8Array) => {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  });
  output.on("end", () => {
    cacheAudio(cacheKey, Buffer.concat(chunks));
    tts.close();
  });
  output.on("error", () => tts.close());
  audioStream.on("error", (error) => output.destroy(error));
  audioStream.pipe(output);

  return new Response(Readable.toWeb(output) as ReadableStream<Uint8Array>, {
    headers: {
      "content-type": "audio/mpeg",
      "cache-control": "private, max-age=3600",
      "x-tts-cache": "MISS",
      "x-content-type-options": "nosniff",
    },
  });
}

function cacheAudio(key: string, audio: Buffer) {
  if (audioCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = audioCache.keys().next().value;
    if (oldestKey) audioCache.delete(oldestKey);
  }
  audioCache.set(key, audio);
}

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
