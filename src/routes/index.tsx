import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Briefcase, Layers, PartyPopper, Smile, UserSearch, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ChatPortfolio } from "@/components/ChatPortfolio";
import GlassSurface from "@/components/GlassSurface";
import SplashCursor from "@/components/SplashCursor";
import avatarUrl from "@/assets/ayush-avatar.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ayush S. Singh — Full Stack Developer" },
      {
        name: "description",
        content:
          "Ayush's portfolio: AI agents, Solana experiments, and shipping small SaaS in public. Ask anything.",
      },
      { property: "og:title", content: "Ayush S. Singh — Full Stack Developer" },
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
    <div className="relative h-dvh overflow-hidden">
      <PaintBackdrop />
      <SplashCursor
        DENSITY_DISSIPATION={1}
        VELOCITY_DISSIPATION={0.5}
        PRESSURE={0.6}
        COLOR_UPDATE_SPEED={27}
        SHADING={false}
      />

      <main className="relative z-10 mx-auto flex h-dvh max-w-3xl flex-col items-center px-6 pb-5 pt-[9vh] md:pt-[10vh]">
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
          className="font-display mt-2 text-center text-5xl font-bold leading-[1] tracking-tight text-foreground md:text-8xl"
        >
          Full Stack Developer
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, type: "spring", bounce: 0.35 }}
          className="mt-8 md:mt-10"
        >
          <img
            src={avatarUrl}
            alt="Ayush avatar"
            width={512}
            height={512}
            className="h-36 w-56 select-none object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] md:h-44 md:w-72"
            draggable={false}
          />
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          onClick={() => openChat()}
          className="glass-button group mt-auto w-full max-w-xl text-left text-muted-foreground"
        >
          <GlassSurface
            width="100%"
            height={68}
            borderRadius={999}
            backgroundOpacity={0.08}
            saturation={1.85}
            distortionScale={-135}
            redOffset={4}
            greenOffset={12}
            blueOffset={22}
            contentClassName="justify-between px-6"
          >
            <span className="text-base">Ask me anything…</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background transition-transform group-hover:scale-105">
              <ArrowRight className="h-4 w-4" />
            </span>
          </GlassSurface>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mb-1 mt-5 flex w-full max-w-2xl flex-wrap items-center justify-center gap-3"
        >
          {QUICK_ACTIONS.map(({ label, icon: Icon, prompt }) => (
            <button
              key={label}
              onClick={() => openChat(prompt)}
              className="glass-button min-w-[92px] text-sm font-medium text-foreground/90"
            >
              <GlassSurface
                width="100%"
                height={68}
                borderRadius={18}
                backgroundOpacity={0.075}
                saturation={1.75}
                distortionScale={-120}
                redOffset={3}
                greenOffset={10}
                blueOffset={18}
                contentClassName="flex-col gap-1.5 px-5 py-3"
              >
                <Icon className="h-4 w-4 text-foreground/70" />
                {label}
              </GlassSurface>
            </button>
          ))}
        </motion.div>
      </main>

      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} initialPrompt={seed} />
    </div>
  );
}

function PaintBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="aurora absolute inset-0 opacity-70" />
      <div className="paper-grain absolute inset-0 opacity-20" />
    </div>
  );
}

function ChatDrawer({
  open,
  onClose,
  initialPrompt,
}: {
  open: boolean;
  onClose: () => void;
  initialPrompt: string | null;
}) {
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
            className="glass-strong fixed inset-0 z-50 flex h-dvh w-screen flex-col px-2 pb-2 pt-3"
          >
            <div className="flex items-center justify-end px-3 pb-2">
              <button
                onClick={onClose}
                className="glass-button text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close chat"
              >
                <GlassSurface
                  width={36}
                  height={36}
                  borderRadius={999}
                  backgroundOpacity={0.06}
                  saturation={1.6}
                  distortionScale={-110}
                >
                  <X className="h-4 w-4" />
                </GlassSurface>
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
