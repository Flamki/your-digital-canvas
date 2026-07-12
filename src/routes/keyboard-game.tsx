import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Crown, RotateCcw, Save, Trophy } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard as VisualKeyboard } from "@/components/ui/keyboard";
import GlassSurface from "@/components/GlassSurface";
import {
  createLeaderboardEntry,
  isLeaderboardEntry,
  makeRandomAnimalName,
  qualifiesForLeaderboard,
  rankLeaderboard,
  type LeaderboardEntry,
} from "@/lib/keyboard-leaderboard";

const CHALLENGE_SECONDS = 60;

const WORD_BANK = [
  "agent",
  "signal",
  "wallet",
  "pipeline",
  "secure",
  "system",
  "velocity",
  "debug",
  "launch",
  "flow",
  "craft",
  "verify",
  "compose",
  "network",
  "market",
  "builder",
  "intent",
  "memory",
  "index",
  "route",
  "trade",
  "review",
  "client",
  "solver",
  "design",
  "schema",
  "token",
  "screen",
  "deploy",
  "logic",
  "smooth",
  "focus",
  "result",
  "prompt",
  "native",
  "engine",
  "vector",
  "canvas",
  "approve",
  "trust",
  "latency",
  "packet",
  "branch",
  "proof",
  "query",
  "ledger",
  "sharp",
  "metric",
  "studio",
  "growth",
  "stable",
  "human",
  "product",
  "motion",
  "source",
  "graph",
  "action",
  "release",
  "backend",
  "frontend",
  "database",
  "runtime",
  "terminal",
  "session",
  "profile",
  "insight",
  "contract",
  "quality",
  "shipping",
  "creative",
];

type ChallengeResult = {
  entry: LeaderboardEntry;
  qualifies: boolean;
  saved: boolean;
};

export const Route = createFileRoute("/keyboard-game")({
  head: () => ({
    meta: [
      { title: "1 Minute Typing - Flamki" },
      {
        name: "description",
        content:
          "A one minute glass keyboard typing challenge by Ayush Singh with endless generated text, WPM, accuracy, and live key sound.",
      },
    ],
  }),
  component: KeyboardGame,
});

function KeyboardGame() {
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(() => buildPracticeText(randomSeed(), 520));
  const [typed, setTyped] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const pageRef = useRef<HTMLDivElement>(null);

  const elapsedSeconds = startedAt
    ? Math.min(CHALLENGE_SECONDS, Math.max((now - startedAt) / 1000, 0.1))
    : 0;
  const timeLeft = startedAt
    ? Math.max(0, CHALLENGE_SECONDS - Math.floor((now - startedAt) / 1000))
    : CHALLENGE_SECONDS;
  const isFinished = startedAt !== null && timeLeft === 0;
  const correctChars = typed.split("").filter((char, index) => char === target[index]).length;
  const accuracy = typed.length ? Math.round((correctChars / typed.length) * 100) : 100;
  const wpm = startedAt ? Math.round(correctChars / 5 / (elapsedSeconds / 60)) : 0;
  const focusWindow = useMemo(() => getFocusWindow(target, typed.length), [target, typed.length]);

  useEffect(() => {
    pageRef.current?.focus();
  }, [round]);

  useEffect(() => {
    void refreshLeaderboard();
  }, []);

  useEffect(() => {
    if (!startedAt || isFinished) return;
    const timer = window.setInterval(() => setNow(Date.now()), 120);
    return () => window.clearInterval(timer);
  }, [isFinished, startedAt]);

  useEffect(() => {
    if (target.length - typed.length > 900) return;
    setTarget((value) => `${value} ${buildPracticeText(randomSeed(), 320)}`);
  }, [target.length, typed.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const targetElement = event.target as HTMLElement | null;
      if (targetElement?.closest("[data-leaderboard-modal]") || result || leaderboardOpen) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === "Tab") {
        event.preventDefault();
        return;
      }

      if (isFinished) {
        if (event.key === "Enter") {
          event.preventDefault();
          resetChallenge();
        }
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        setTyped((value) => value.slice(0, -1));
        return;
      }

      if (event.key.length !== 1) return;

      event.preventDefault();
      setStartedAt((value) => value ?? Date.now());
      setNow(Date.now());
      setTyped((value) => {
        const nextChar = event.key;
        if (nextChar !== target[value.length]) {
          setMistakes((count) => count + 1);
        }
        return value + nextChar;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFinished, leaderboardOpen, result, target]);

  useEffect(() => {
    if (!isFinished || result) return;

    let cancelled = false;

    void (async () => {
      const currentLeaderboard = await fetchGlobalLeaderboard();
      if (cancelled) return;

      setLeaderboard(currentLeaderboard);

      const suggestedName = makeRandomAnimalName(currentLeaderboard);
      const entry = createLeaderboardEntry({
        name: suggestedName,
        wpm,
        accuracy,
        errors: mistakes,
        correctChars,
      });

      setResult({
        entry,
        qualifies: qualifiesForLeaderboard(entry, currentLeaderboard),
        saved: false,
      });
      setDisplayName(suggestedName);
    })();

    return () => {
      cancelled = true;
    };
  }, [accuracy, correctChars, isFinished, mistakes, result, wpm]);

  const resetChallenge = () => {
    setTarget(buildPracticeText(randomSeed(), 520));
    setTyped("");
    setMistakes(0);
    setStartedAt(null);
    setNow(Date.now());
    setResult(null);
    setDisplayName("");
    setRound((value) => value + 1);
  };

  const refreshLeaderboard = async () => {
    setLeaderboard(await fetchGlobalLeaderboard());
  };

  const openLeaderboard = async () => {
    await refreshLeaderboard();
    setLeaderboardOpen(true);
  };

  const saveScore = async () => {
    if (!result?.qualifies || result.saved) return;

    const response = await saveGlobalScore({
      name: displayName,
      wpm: result.entry.wpm,
      accuracy: result.entry.accuracy,
      errors: result.entry.errors,
      correctChars: result.entry.correctChars,
    });

    setLeaderboard(response.leaderboard);

    if (!response.qualifies || !response.entry) {
      setResult({ ...result, qualifies: false, saved: false });
      return;
    }

    setResult({ entry: response.entry, qualifies: true, saved: true });
    setDisplayName(response.entry.name);
  };

  return (
    <div
      ref={pageRef}
      tabIndex={-1}
      className="relative h-dvh overflow-hidden bg-background text-foreground outline-none"
    >
      <PaintBackdrop />
      <div className="relative z-10 flex h-dvh items-center justify-center px-6 text-center lg:hidden">
        <div className="max-w-sm rounded-[30px] border border-white/75 bg-white/22 px-6 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_24px_80px_rgba(20,20,20,0.1)] backdrop-blur-[30px]">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-500">
            keyboard game
          </p>
          <h1 className="mt-2 text-2xl font-black text-foreground">Large screen only</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">
            This 60 second typing challenge needs a physical keyboard and a wide screen.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-white/70 bg-white/30 px-5 text-sm font-black text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_14px_34px_rgba(20,20,20,0.08)] backdrop-blur-2xl"
          >
            Home
          </Link>
        </div>
      </div>

      <main className="relative z-10 mx-auto hidden h-dvh max-w-[1760px] flex-col px-4 py-4 md:px-8 lg:flex">
        <header className="flex shrink-0 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="glass-button text-sm font-medium text-foreground/80">
              <GlassSurface
                width="auto"
                height={42}
                borderRadius={999}
                backgroundOpacity={0.08}
                saturation={1.7}
                distortionScale={-90}
                contentClassName="gap-2 px-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Home
              </GlassSurface>
            </Link>
            <button
              type="button"
              onClick={openLeaderboard}
              className="glass-button text-sm font-semibold text-foreground/85"
            >
              <GlassSurface
                width="auto"
                height={42}
                borderRadius={999}
                backgroundOpacity={0.08}
                saturation={1.7}
                distortionScale={-90}
                contentClassName="gap-2 px-4"
              >
                <Trophy className="h-4 w-4" />
                Leaderboard
              </GlassSurface>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 rounded-full border border-white/45 bg-white/35 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_18px_60px_rgba(20,20,20,0.08)] backdrop-blur-2xl">
            <Stat label="time" value={`${timeLeft}s`} strong={timeLeft <= 10} />
            <Stat label="wpm" value={wpm} />
            <Stat label="accuracy" value={`${accuracy}%`} />
            <Stat label="errors" value={mistakes} />
          </div>
        </header>

        <section className="grid min-h-0 flex-1 grid-rows-[minmax(230px,0.78fr)_minmax(390px,1.22fr)] gap-4 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="glass-strong flex min-h-0 flex-col justify-center overflow-hidden rounded-[34px] px-5 py-5 md:px-10"
          >
            <div className="relative flex min-h-0 flex-1 items-center overflow-hidden py-3 md:py-5">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background/80 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background/80 to-transparent" />
              <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-7 whitespace-pre font-mono text-[clamp(42px,5vw,82px)] font-black leading-[1.08] tracking-normal">
                <div className="min-w-0 overflow-hidden text-right text-muted-foreground/26">
                  <CharacterRun
                    start={focusWindow.leftStart}
                    text={focusWindow.left}
                    typed={typed}
                    isFinished={isFinished}
                  />
                </div>
                <div className="rounded-[30px] bg-white/34 px-7 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_24px_80px_rgba(139,92,246,0.18)] ring-1 ring-violet-500/12 backdrop-blur-xl">
                  <CharacterRun
                    start={focusWindow.focusStart}
                    text={focusWindow.focus}
                    typed={typed}
                    isFinished={isFinished}
                    focus
                  />
                </div>
                <div className="min-w-0 overflow-hidden text-left text-muted-foreground/34">
                  <CharacterRun
                    start={focusWindow.rightStart}
                    text={focusWindow.right}
                    typed={typed}
                    isFinished={isFinished}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm font-medium text-muted-foreground">
              <span>
                {startedAt
                  ? isFinished
                    ? "Time. Press Enter or reset for another 60 seconds."
                    : "Keep going. The text will keep feeding."
                  : "Start typing anywhere. Default challenge is exactly 60 seconds."}
              </span>
              <button
                type="button"
                onClick={resetChallenge}
                className="glass-button text-sm font-semibold text-foreground/85"
              >
                <GlassSurface
                  width="auto"
                  height={42}
                  borderRadius={999}
                  backgroundOpacity={0.08}
                  saturation={1.65}
                  distortionScale={-80}
                  contentClassName="gap-2 px-4"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </GlassSurface>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
            className="shrink-0 overflow-hidden rounded-[34px] border border-white/45 bg-white/25 px-2 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_24px_80px_rgba(20,20,20,0.1)] backdrop-blur-2xl"
          >
            <div className="flex h-full min-h-0 items-start justify-center overflow-hidden pt-2">
              <VisualKeyboard
                enableSound
                showPreview
                className="-translate-y-8 [zoom:0.84] sm:[zoom:1.02] md:-translate-y-10 md:[zoom:1.25] lg:[zoom:1.45] xl:[zoom:1.62] 2xl:[zoom:1.76]"
              />
            </div>
          </motion.div>
        </section>
      </main>

      {result && (
        <div className="hidden lg:block">
          <LeaderboardModal
            result={result}
            leaderboard={leaderboard}
            displayName={displayName}
            onDisplayNameChange={setDisplayName}
            onSave={saveScore}
            onRetry={resetChallenge}
          />
        </div>
      )}

      {leaderboardOpen && (
        <div className="hidden lg:block">
          <LeaderboardOnlyModal
            leaderboard={leaderboard}
            onClose={() => {
              setLeaderboardOpen(false);
              window.requestAnimationFrame(() => pageRef.current?.focus());
            }}
          />
        </div>
      )}
    </div>
  );
}

function LeaderboardModal({
  result,
  leaderboard,
  displayName,
  onDisplayNameChange,
  onSave,
  onRetry,
}: {
  result: ChallengeResult;
  leaderboard: LeaderboardEntry[];
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  onSave: () => void;
  onRetry: () => void;
}) {
  const previewLeaderboard = result.qualifies
    ? rankLeaderboard([...(result.saved ? [] : [result.entry]), ...leaderboard])
    : leaderboard;
  const rank = result.qualifies
    ? previewLeaderboard.findIndex((entry) => entry.id === result.entry.id) + 1
    : -1;

  return (
    <div
      data-leaderboard-modal
      className="absolute inset-0 z-50 flex items-center justify-center bg-background/32 px-4 backdrop-blur-xl"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="w-full max-w-3xl overflow-hidden rounded-[34px] border border-white/55 bg-white/48 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_40px_140px_rgba(20,20,20,0.18)] backdrop-blur-2xl"
      >
        <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] bg-background/42 p-5 shadow-inner">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/12 text-violet-600">
              {result.qualifies ? <Crown className="h-6 w-6" /> : <Trophy className="h-6 w-6" />}
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.22em] text-violet-500">
              60 second result
            </p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-foreground">
              {result.qualifies
                ? result.saved
                  ? `Saved at #${rank}`
                  : `Top 10 score.`
                : "Better luck next time."}
            </h2>
            <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
              {result.qualifies
                ? result.saved
                  ? "Your score is now on the global leaderboard."
                  : "Drop a display name to lock this run into the global leaderboard."
                : "This run did not enter the top 10, so no name needed."}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2">
              <MiniResult label="wpm" value={result.entry.wpm} />
              <MiniResult label="accuracy" value={`${result.entry.accuracy}%`} />
              <MiniResult label="errors" value={result.entry.errors} />
            </div>

            {result.qualifies && !result.saved && (
              <form
                className="mt-6 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  onSave();
                }}
              >
                <input
                  autoFocus
                  value={displayName}
                  onChange={(event) => onDisplayNameChange(event.target.value)}
                  onFocus={(event) => event.currentTarget.select()}
                  maxLength={24}
                  placeholder="Display name"
                  className="h-12 w-full rounded-2xl border border-white/60 bg-white/55 px-4 text-base font-bold text-foreground outline-none shadow-inner backdrop-blur-xl placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-violet-500/30"
                />
                <p className="text-xs font-semibold text-muted-foreground">
                  Use the random name or replace it with yours.
                </p>
                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 text-sm font-black text-white shadow-[0_18px_45px_rgba(124,58,237,0.32)] transition hover:bg-violet-500"
                >
                  <Save className="h-4 w-4" />
                  Save score
                </button>
              </form>
            )}

            {(!result.qualifies || result.saved) && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-4 text-sm font-black text-background shadow-[0_18px_45px_rgba(20,20,20,0.18)] transition hover:bg-foreground/85"
              >
                <RotateCcw className="h-4 w-4" />
                Try again
              </button>
            )}
          </div>

          <div className="rounded-[28px] bg-white/36 p-5 shadow-inner">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  leaderboard
                </p>
                <h3 className="text-2xl font-black">Top 10</h3>
              </div>
              <Trophy className="h-6 w-6 text-violet-500" />
            </div>

            <LeaderboardList leaderboard={previewLeaderboard} highlightId={result.entry.id} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MiniResult({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/45 px-3 py-3 text-center shadow-inner">
      <div className="text-xl font-black text-foreground">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function LeaderboardOnlyModal({
  leaderboard,
  onClose,
}: {
  leaderboard: LeaderboardEntry[];
  onClose: () => void;
}) {
  return (
    <div
      data-leaderboard-modal
      className="absolute inset-0 z-50 flex items-center justify-center bg-background/32 px-4 backdrop-blur-xl"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="w-full max-w-xl overflow-hidden rounded-[34px] border border-white/55 bg-white/48 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_40px_140px_rgba(20,20,20,0.18)] backdrop-blur-2xl"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-violet-500">
              leaderboard
            </p>
            <h2 className="text-3xl font-black leading-tight text-foreground">Top 10</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background/50 text-xl font-black text-foreground shadow-inner transition hover:bg-background/70"
            aria-label="Close leaderboard"
          >
            x
          </button>
        </div>

        <LeaderboardList leaderboard={leaderboard} />
      </motion.div>
    </div>
  );
}

function LeaderboardList({
  leaderboard,
  highlightId,
}: {
  leaderboard: LeaderboardEntry[];
  highlightId?: string;
}) {
  return (
    <div className="space-y-2">
      {leaderboard.length ? (
        leaderboard.map((entry, index) => (
          <div
            key={entry.id}
            className={
              entry.id === highlightId
                ? "grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/10 px-3 py-2"
                : "grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-2xl bg-background/35 px-3 py-2"
            }
          >
            <div className="text-center text-sm font-black text-muted-foreground">#{index + 1}</div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black text-foreground">
                {entry.name || "Pending name"}
              </div>
              <div className="text-xs font-semibold text-muted-foreground">
                {entry.accuracy}% accuracy - {entry.errors} errors
              </div>
            </div>
            <div className="text-right text-xl font-black text-foreground">{entry.wpm}</div>
          </div>
        ))
      ) : (
        <div className="rounded-2xl bg-background/35 px-4 py-8 text-center text-sm font-semibold text-muted-foreground">
          No scores yet. First real top-10 run starts the board.
        </div>
      )}
    </div>
  );
}

function CharacterRun({
  start,
  text,
  typed,
  isFinished,
  focus = false,
}: {
  start: number;
  text: string;
  typed: string;
  isFinished: boolean;
  focus?: boolean;
}) {
  return (
    <>
      {text.split("").map((char, offset) => {
        const index = start + offset;
        const typedChar = typed[index];
        const state = typedChar == null ? "pending" : typedChar === char ? "correct" : "wrong";
        const active = index === typed.length && !isFinished;

        return (
          <span
            key={`${start}-${offset}`}
            className={
              state === "correct"
                ? focus
                  ? "text-emerald-600 drop-shadow-[0_0_18px_rgba(16,185,129,0.28)]"
                  : "text-emerald-600/72"
                : state === "wrong"
                  ? focus
                    ? "rounded-lg bg-rose-500/12 text-rose-600 underline decoration-rose-500/35 decoration-[5px] underline-offset-[0.14em]"
                    : "text-rose-500/70"
                  : active
                    ? "rounded-lg bg-violet-500/18 text-foreground shadow-[0_0_0_2px_rgba(139,92,246,0.2)]"
                    : focus
                      ? "text-foreground/72"
                      : "text-muted-foreground/40"
            }
          >
            {char}
          </span>
        );
      })}
    </>
  );
}

function Stat({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string | number;
  strong?: boolean;
}) {
  return (
    <div className="min-w-[72px] rounded-full bg-background/35 px-4 py-2 text-center shadow-inner">
      <div className={strong ? "text-xl font-black text-rose-600" : "text-xl font-black"}>
        {value}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function PaintBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="aurora absolute inset-0 opacity-60" />
      <div className="paper-grain absolute inset-0 opacity-8" />
    </div>
  );
}

function buildPracticeText(seed: number, wordCount: number) {
  const words: string[] = [];

  for (let index = 0; index < wordCount; index += 1) {
    const wordIndex = (seed + index * 7 + Math.floor(index / 5) * 3) % WORD_BANK.length;
    let word = WORD_BANK[wordIndex];

    if (index % 17 === 0 && index > 0) {
      word = `${word}.`;
    } else if (index % 29 === 0 && index > 0) {
      word = `${word},`;
    }

    words.push(word);
  }

  return words.join(" ");
}

function getFocusWindow(target: string, cursor: number) {
  const focusIndex = nextWordIndex(target, cursor);
  const focusStart = wordStart(target, focusIndex);
  const focusEnd = wordEnd(target, focusStart);
  const leftStart = previousWordsStart(target, focusStart, 2);
  const rightEnd = nextWordsEnd(target, focusEnd, 3);

  return {
    leftStart,
    left: target.slice(leftStart, focusStart).trimEnd(),
    focusStart,
    focus: target.slice(focusStart, focusEnd),
    rightStart: focusEnd,
    right: target.slice(focusEnd, rightEnd),
  };
}

function nextWordIndex(target: string, cursor: number) {
  let index = Math.min(cursor, Math.max(target.length - 1, 0));
  while (index < target.length - 1 && target[index] === " ") {
    index += 1;
  }
  return index;
}

function wordStart(target: string, index: number) {
  return target.lastIndexOf(" ", Math.max(0, index - 1)) + 1;
}

function wordEnd(target: string, index: number) {
  const nextSpace = target.indexOf(" ", index);
  return nextSpace === -1 ? target.length : nextSpace;
}

function previousWordsStart(target: string, index: number, count: number) {
  let start = index;

  for (let step = 0; step < count; step += 1) {
    const previousSpace = target.lastIndexOf(" ", Math.max(0, start - 2));
    if (previousSpace === -1) return 0;
    start = previousSpace + 1;
  }

  return start;
}

function nextWordsEnd(target: string, index: number, count: number) {
  let end = index;

  for (let step = 0; step < count; step += 1) {
    const nextSpace = target.indexOf(" ", end + 1);
    if (nextSpace === -1) return target.length;
    end = nextSpace;
  }

  return end;
}

type ScorePayload = {
  name: string;
  wpm: number;
  accuracy: number;
  errors: number;
  correctChars: number;
};

type SaveScoreResponse = {
  qualifies?: boolean;
  saved?: boolean;
  entry?: LeaderboardEntry;
  leaderboard?: LeaderboardEntry[];
};

async function fetchGlobalLeaderboard() {
  try {
    const response = await fetch("/api/keyboard-leaderboard", { cache: "no-store" });
    if (!response.ok) return [];
    const payload = (await response.json()) as { leaderboard?: unknown };
    if (!Array.isArray(payload.leaderboard)) return [];
    return rankLeaderboard(payload.leaderboard.filter(isLeaderboardEntry));
  } catch {
    return [];
  }
}

async function saveGlobalScore(score: ScorePayload) {
  try {
    const response = await fetch("/api/keyboard-leaderboard", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(score),
    });

    if (!response.ok) {
      return { qualifies: false, saved: false, leaderboard: await fetchGlobalLeaderboard() };
    }

    const payload = (await response.json()) as SaveScoreResponse;
    const leaderboard = Array.isArray(payload.leaderboard)
      ? rankLeaderboard(payload.leaderboard.filter(isLeaderboardEntry))
      : [];

    return {
      qualifies: Boolean(payload.qualifies),
      saved: Boolean(payload.saved),
      entry: payload.entry && isLeaderboardEntry(payload.entry) ? payload.entry : undefined,
      leaderboard,
    };
  } catch {
    return { qualifies: false, saved: false, leaderboard: await fetchGlobalLeaderboard() };
  }
}

function randomSeed() {
  return Math.floor(Math.random() * WORD_BANK.length * 1000);
}
