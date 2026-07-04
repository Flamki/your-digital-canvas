export const LEADERBOARD_LIMIT = 10;

export const ANIMAL_NAMES = [
  "Swift Fox",
  "Neon Falcon",
  "Code Panda",
  "Pixel Tiger",
  "Cosmic Otter",
  "Glass Lynx",
  "Rapid Gecko",
  "Orbit Wolf",
  "Turbo Koala",
  "Silent Hawk",
  "Bright Raven",
  "Signal Dolphin",
  "Purple Manta",
  "Vector Owl",
  "Lucky Leopard",
  "Cobalt Deer",
  "Rocket Turtle",
  "Chrome Swan",
  "Velvet Jaguar",
  "Quantum Hare",
];

export type LeaderboardEntry = {
  id: string;
  name: string;
  wpm: number;
  accuracy: number;
  errors: number;
  correctChars: number;
  createdAt: string;
};

export type LeaderboardScoreInput = {
  name: string;
  wpm: number;
  accuracy: number;
  errors: number;
  correctChars: number;
};

export function createLeaderboardEntry({
  name,
  wpm,
  accuracy,
  errors,
  correctChars,
}: LeaderboardScoreInput): LeaderboardEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name,
    wpm,
    accuracy,
    errors,
    correctChars,
    createdAt: new Date().toISOString(),
  };
}

export function qualifiesForLeaderboard(entry: LeaderboardEntry, leaderboard: LeaderboardEntry[]) {
  if (entry.wpm <= 0) return false;
  const ranked = rankLeaderboard([...leaderboard, entry]);
  return ranked.some((item) => item.id === entry.id);
}

export function rankLeaderboard(entries: LeaderboardEntry[]) {
  return [...entries]
    .sort((a, b) => {
      if (b.wpm !== a.wpm) return b.wpm - a.wpm;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      if (a.errors !== b.errors) return a.errors - b.errors;
      if (b.correctChars !== a.correctChars) return b.correctChars - a.correctChars;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    })
    .slice(0, LEADERBOARD_LIMIT);
}

export function cleanDisplayName(value: string) {
  const cleaned = value.replace(/\s+/g, " ").trim().slice(0, 24);
  return cleaned || "Anonymous";
}

export function makeRandomAnimalName(leaderboard: LeaderboardEntry[]) {
  const start = Math.floor(Math.random() * ANIMAL_NAMES.length);

  for (let index = 0; index < ANIMAL_NAMES.length; index += 1) {
    const candidate = ANIMAL_NAMES[(start + index) % ANIMAL_NAMES.length];
    const unique = makeUniqueDisplayName(candidate, leaderboard);
    if (unique === candidate) return candidate;
  }

  return makeUniqueDisplayName(
    `${ANIMAL_NAMES[start]} ${Math.floor(100 + Math.random() * 900)}`,
    leaderboard,
  );
}

export function makeUniqueDisplayName(value: string, leaderboard: LeaderboardEntry[]) {
  const base = cleanDisplayName(value);
  const usedNames = new Set(leaderboard.map((entry) => entry.name.toLowerCase()));
  if (!usedNames.has(base.toLowerCase())) return base;

  for (let index = 2; index < 100; index += 1) {
    const suffix = ` ${index}`;
    const trimmedBase = base.slice(0, Math.max(1, 24 - suffix.length)).trimEnd();
    const candidate = `${trimmedBase}${suffix}`;
    if (!usedNames.has(candidate.toLowerCase())) return candidate;
  }

  return `${base.slice(0, 18).trimEnd()} ${Math.floor(1000 + Math.random() * 9000)}`.slice(0, 24);
}

export function uniquifyLeaderboardNames(entries: LeaderboardEntry[]) {
  const normalized: LeaderboardEntry[] = [];

  for (const entry of entries) {
    normalized.push({
      ...entry,
      name: makeUniqueDisplayName(entry.name, normalized),
    });
  }

  return normalized;
}

export function isLeaderboardEntry(value: unknown): value is LeaderboardEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<LeaderboardEntry>;
  return (
    typeof entry.id === "string" &&
    typeof entry.name === "string" &&
    typeof entry.wpm === "number" &&
    typeof entry.accuracy === "number" &&
    typeof entry.errors === "number" &&
    typeof entry.correctChars === "number" &&
    typeof entry.createdAt === "string"
  );
}

export function normalizeScoreInput(value: unknown): LeaderboardScoreInput | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Partial<LeaderboardScoreInput>;
  if (
    typeof input.name !== "string" ||
    typeof input.wpm !== "number" ||
    typeof input.accuracy !== "number" ||
    typeof input.errors !== "number" ||
    typeof input.correctChars !== "number"
  ) {
    return null;
  }

  const wpm = Math.round(clamp(input.wpm, 0, 300));
  const accuracy = Math.round(clamp(input.accuracy, 0, 100));
  const errors = Math.round(clamp(input.errors, 0, 2000));
  const correctChars = Math.round(clamp(input.correctChars, 0, 3000));

  return {
    name: cleanDisplayName(input.name),
    wpm,
    accuracy,
    errors,
    correctChars,
  };
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
