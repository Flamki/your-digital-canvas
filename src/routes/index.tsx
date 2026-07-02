import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Briefcase, Layers, PartyPopper, Smile, UserSearch } from "lucide-react";
import { ChatPortfolio } from "@/components/ChatPortfolio";
import { PaintCursor } from "@/components/PaintCursor";
import avatarUrl from "@/assets/ayush-avatar.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ayush S. Singh — AI Engineer & Builder" },
      {
        name: "description",
        content:
          "Ayush's portfolio: AI agents, Solana experiments, and shipping small SaaS in public. Ask anything.",
      },
      { property: "og:title", content: "Ayush S. Singh — AI Engineer" },
      {
        property: "og:description",
        content: "AI agents, Solana, and building in public. Ask me anything.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const QUICK_ACTIONS = [
  { label: "Me", icon: Smile, prompt: "Tell me about yourself." },
  { label: "Projects", icon: Briefcase, prompt: "Show me your projects." },
  { label: "Skills", icon: Layers, prompt: "What are your top skills?" },
  { label: "Fun", icon: PartyPopper, prompt: "Tell me something fun about you." },
  { label: "Contact", icon: UserSearch, prompt: "How can I contact or hire you?" },
];

function Index() {
  const [chatOpen, setChatOpen] = useState(false);
  const [seed, setSeed] = useState<string | null>(null);

  const openChat = (prompt?: string) => {
    setSeed(prompt ?? null);
    setChatOpen(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Paint background — always on */}
      <PaintBackdrop />
      {/* Foreground paint trail that follows cursor */}
      <PaintCursor />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center px-6 pt-16 pb-8 md:pt-24">
        {/* Greeting */}
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-base font-medium text-foreground/80"
        >
          Hey, I'm Ayush <span className="inline-block">👋</span>
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-display mt-2 text-center text-6xl font-bold leading-[1] tracking-tight text-foreground md:text-8xl"
        >
          AI Engineer
        </motion.h1>

        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, type: "spring", bounce: 0.35 }}
          className="mt-8"
        >
          <img
            src={avatarUrl}
            alt="Ayush avatar"
            className="h-44 w-44 select-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] md:h-56 md:w-56"
            draggable={false}
          />
        </motion.div>

        {/* Ask input (opens chat drawer) */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          onClick={() => openChat()}
          className="group mt-8 flex w-full max-w-xl items-center justify-between rounded-full border border-border bg-card/70 px-6 py-4 text-left text-muted-foreground backdrop-blur-md transition-all hover:border-foreground/30 hover:bg-card"
        >
          <span className="text-base">Ask me anything…</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background transition-transform group-hover:scale-105">
            <ArrowRight className="h-4 w-4" />
          </span>
        </motion.button>

        {/* Quick action pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-6 flex w-full max-w-2xl flex-wrap items-center justify-center gap-3"
        >
          {QUICK_ACTIONS.map(({ label, icon: Icon, prompt }) => (
            <button
              key={label}
              onClick={() => openChat(prompt)}
              className="flex min-w-[92px] flex-col items-center gap-1.5 rounded-2xl border border-border bg-card/70 px-5 py-3 text-sm font-medium text-foreground/90 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-card"
            >
              <Icon className="h-4 w-4 text-foreground/70" />
              {label}
            </button>
          ))}
        </motion.div>

        {/* Footer signature */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-auto pt-16 text-xs text-muted-foreground"
        >
          Built by Ayush · powered by Lovable AI
        </motion.p>
      </main>

      {/* Chat drawer */}
      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} initialPrompt={seed} />
    </div>
  );
}

/**
 * Static paint-smear background — soft colored blobs behind the hero.
 * The moving PaintCursor sits on top and adds live strokes.
 */
function PaintBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute -left-40 top-20 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,hsla(300,90%,75%,0.55),transparent_60%)] blur-3xl" />
      <div className="absolute -right-40 top-40 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,hsla(180,85%,70%,0.55),transparent_60%)] blur-3xl" />
      <div className="absolute left-1/4 top-[55%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,hsla(120,80%,70%,0.5),transparent_60%)] blur-3xl" />
      <div className="absolute right-1/4 bottom-0 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle_at_center,hsla(35,95%,75%,0.55),transparent_60%)] blur-3xl" />
      <div className="absolute inset-0 paper-grain opacity-40" />
    </div>
  );
}

import { ArrowRight, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

function ChatDrawer({
  open,
  onClose,
  initialPrompt,
}: {
  open: boolean;
  onClose: () => void;
  initialPrompt: string | null;
}) {
  // Force remount when a new seed prompt arrives so ChatPortfolio can send it.
  const [key, setKey] = useState(0);
  useEffect(() => {
    if (open) setKey((k) => k + 1);
  }, [open, initialPrompt]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
          />
          <motion.div
            key="panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[85vh] max-w-2xl flex-col rounded-t-3xl border border-border bg-background/95 px-5 pb-4 pt-3 shadow-2xl backdrop-blur-xl md:h-[80vh]"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="mx-auto h-1 w-10 rounded-full bg-border md:hidden" />
              <div className="flex items-center gap-2">
                <img src={avatarUrl} alt="" className="h-8 w-8" />
                <div className="text-sm">
                  <div className="font-medium text-foreground">Chat with Ayush</div>
                  <div className="text-xs text-muted-foreground">Powered by Lovable AI</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <ChatPortfolio key={key} initialPrompt={initialPrompt ?? undefined} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
