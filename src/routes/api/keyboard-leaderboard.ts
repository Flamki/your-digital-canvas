import { createFileRoute } from "@tanstack/react-router";
import {
  createLeaderboardEntry,
  isLeaderboardEntry,
  makeUniqueDisplayName,
  normalizeScoreInput,
  qualifiesForLeaderboard,
  rankLeaderboard,
  type LeaderboardEntry,
} from "@/lib/keyboard-leaderboard";

const STORAGE_KEY = "flamki:keyboard-game:leaderboard:v1";

type MemoryStore = typeof globalThis & {
  __flamkiKeyboardLeaderboard?: LeaderboardEntry[];
};

export const Route = createFileRoute("/api/keyboard-leaderboard")({
  server: {
    handlers: {
      GET: async () => {
        const leaderboard = await readLeaderboard();
        return json({ leaderboard, global: hasRedisStorage() });
      },
      POST: async ({ request }) => {
        const input = normalizeScoreInput(await request.json().catch(() => null));
        if (!input) {
          return json({ error: "Invalid score payload" }, 400);
        }

        const leaderboard = await readLeaderboard();
        const entry = createLeaderboardEntry({
          ...input,
          name: makeUniqueDisplayName(input.name, leaderboard),
        });

        if (!qualifiesForLeaderboard(entry, leaderboard)) {
          return json({
            qualifies: false,
            saved: false,
            leaderboard,
            global: hasRedisStorage(),
          });
        }

        const nextLeaderboard = rankLeaderboard([...leaderboard, entry]);
        await writeLeaderboard(nextLeaderboard);

        return json({
          qualifies: true,
          saved: true,
          entry,
          leaderboard: nextLeaderboard,
          rank: nextLeaderboard.findIndex((item) => item.id === entry.id) + 1,
          global: hasRedisStorage(),
        });
      },
    },
  },
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

async function readLeaderboard() {
  const stored = hasRedisStorage()
    ? await readRedisLeaderboard()
    : ((globalThis as MemoryStore).__flamkiKeyboardLeaderboard ?? []);

  return rankLeaderboard(stored.filter(isLeaderboardEntry));
}

async function writeLeaderboard(entries: LeaderboardEntry[]) {
  const leaderboard = rankLeaderboard(entries);

  if (hasRedisStorage()) {
    await redisCommand(["SET", STORAGE_KEY, JSON.stringify(leaderboard)]);
    return;
  }

  (globalThis as MemoryStore).__flamkiKeyboardLeaderboard = leaderboard;
}

async function readRedisLeaderboard() {
  const result = await redisCommand(["GET", STORAGE_KEY]);
  if (typeof result !== "string") return [];

  try {
    const parsed = JSON.parse(result);
    return Array.isArray(parsed) ? parsed.filter(isLeaderboardEntry) : [];
  } catch {
    return [];
  }
}

async function redisCommand(command: unknown[]) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error("Missing KV_REST_API_URL/KV_REST_API_TOKEN for global leaderboard");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    throw new Error(`Leaderboard storage failed with ${response.status}`);
  }

  const payload = (await response.json()) as { result?: unknown; error?: string };
  if (payload.error) {
    throw new Error(payload.error);
  }
  return payload.result;
}

function hasRedisStorage() {
  return Boolean(
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
  );
}
