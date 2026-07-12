import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileText,
  Github,
  Keyboard as KeyboardIcon,
  Layers,
  Linkedin,
  Mail,
  Orbit,
  Smile,
  UserSearch,
  X,
} from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import GlassSurface from "@/components/GlassSurface";
import avatarUrl from "@/assets/ayush-avatar.webp";

const LazyChatPortfolio = lazy(() =>
  import("@/components/ChatPortfolio").then((module) => ({ default: module.ChatPortfolio })),
);
const LazySplashCursor = lazy(() => import("@/components/SplashCursor"));

const SITE_URL = "https://flamki.com";
const SITE_TITLE = "Ayush Singh - Full-Stack Developer & Systems Engineer";
const SITE_DESCRIPTION =
  "Portfolio of Ayush Singh, a full-stack developer and systems engineer shipping production products, open-source systems work, and blockchain security research.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: SITE_TITLE },
      {
        name: "description",
        content: SITE_DESCRIPTION,
      },
      {
        name: "keywords",
        content:
          "Ayush Singh, Flamki, full-stack developer, systems engineer, open source, security researcher, React, TypeScript, Rust, portfolio",
      },
      { name: "author", content: "Ayush Singh" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:title", content: SITE_TITLE },
      {
        property: "og:description",
        content: SITE_DESCRIPTION,
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:site_name", content: "Flamki" },
      { property: "og:image", content: `${SITE_URL}/og-image.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Ayush Singh - Full-Stack Developer" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
      { name: "twitter:image:alt", content: "Ayush Singh - Full-Stack Developer" },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Person",
              "@id": `${SITE_URL}/#person`,
              name: "Ayush Singh",
              url: SITE_URL,
              image: `${SITE_URL}/og-image.png`,
              jobTitle: "Full-Stack Developer and Systems Engineer",
              description: SITE_DESCRIPTION,
              knowsAbout: [
                "Full Stack Development",
                "Systems Engineering",
                "React",
                "TypeScript",
                "Rust",
                "Open Source",
                "Blockchain Security",
              ],
            },
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: SITE_URL,
              name: "Flamki",
              description: SITE_DESCRIPTION,
              publisher: { "@id": `${SITE_URL}/#person` },
              inLanguage: "en-US",
            },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

const QUICK_ACTIONS = [
  { label: "Me", icon: Smile, prompt: "Tell me about yourself." },
  { label: "Projects", icon: Briefcase, prompt: "Show me your projects." },
  { label: "Skills", icon: Layers, prompt: "What are your top skills?" },
  { label: "Proof", icon: Orbit, action: "proof" },
  { label: "Resume", icon: FileText, action: "resume" },
  { label: "Contact", icon: UserSearch, prompt: "How can I contact or hire you?" },
] as const;

const ROTATING_ROLES = [
  "Full-Stack Developer",
  "Full-Stack AI Engineer",
  "Systems Engineer",
  "Open Source Contributor",
  "Security Researcher",
] as const;

const SCRAMBLE_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}[]";

function Index() {
  const [chatOpen, setChatOpen] = useState(false);
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const [seed, setSeed] = useState<string | null>(null);
  const [roleIndex, setRoleIndex] = useState(0);
  const [showDesktopCursor, setShowDesktopCursor] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = window.setInterval(() => {
      setRoleIndex((index) => (index + 1) % ROTATING_ROLES.length);
    }, 7000);

    return () => window.clearInterval(interval);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(min-width: 768px) and (pointer: fine)").matches) return;

    const timeout = window.setTimeout(() => setShowDesktopCursor(true), 700);
    return () => window.clearTimeout(timeout);
  }, [prefersReducedMotion]);

  const openChat = (prompt?: string) => {
    setSeed(prompt ?? null);
    setChatOpen(true);
    setSideNavOpen(false);
  };

  return (
    <div className="relative h-dvh overflow-hidden">
      <PaintBackdrop />
      {showDesktopCursor && (
        <Suspense fallback={null}>
          <LazySplashCursor
            DENSITY_DISSIPATION={1}
            VELOCITY_DISSIPATION={0.5}
            PRESSURE={0.6}
            COLOR_UPDATE_SPEED={27}
            SHADING={false}
          />
        </Suspense>
      )}

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
          className="font-display mt-2 flex h-[1.15em] w-full items-center justify-center text-center text-5xl font-bold leading-none tracking-tight text-foreground md:text-8xl"
        >
          <span className="sr-only">{ROTATING_ROLES.join(", ")}</span>
          <span aria-hidden className="flex h-[1.2em] w-full items-center justify-center px-2">
            <ScrambleRole
              text={ROTATING_ROLES[roleIndex]}
              reducedMotion={Boolean(prefersReducedMotion)}
            />
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, type: "spring", bounce: 0.35 }}
          className="flex flex-1 items-center justify-center py-4 md:py-5"
        >
          <img
            src={avatarUrl}
            alt="Ayush avatar"
            width={512}
            height={512}
            fetchPriority="high"
            decoding="async"
            className="h-40 w-64 select-none object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] md:h-52 md:w-80"
            draggable={false}
          />
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          onClick={() => openChat()}
          className="glass-button group w-full max-w-xl text-left text-muted-foreground"
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
          {QUICK_ACTIONS.map(({ label, icon: Icon, ...action }) => (
            <QuickActionButton
              key={label}
              label={label}
              icon={Icon}
              prompt={"prompt" in action ? action.prompt : undefined}
              to={
                "action" in action ? (action.action === "resume" ? "/resume" : "/proof") : undefined
              }
              onPrompt={openChat}
            />
          ))}
        </motion.div>
      </main>

      <PageRail open={sideNavOpen} onOpenChange={setSideNavOpen} />
      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} initialPrompt={seed} />
    </div>
  );
}

function ScrambleRole({ text, reducedMotion }: { text: string; reducedMotion: boolean }) {
  const [displayText, setDisplayText] = useState(text);
  const previousTextRef = useRef(text);

  useEffect(() => {
    if (reducedMotion) {
      previousTextRef.current = text;
      setDisplayText(text);
      return;
    }

    const previousText = previousTextRef.current;
    if (previousText === text) {
      setDisplayText(text);
      return;
    }

    const characterCount = Math.max(previousText.length, text.length);
    const totalFrames = 27;
    let frame = 0;

    const interval = window.setInterval(() => {
      frame += 1;
      const progress = frame / totalFrames;
      const center = Math.max((characterCount - 1) / 2, 1);

      const nextText = Array.from({ length: characterCount }, (_, index) => {
        const targetCharacter = text[index] ?? " ";
        const distanceFromCenter = Math.abs(index - center) / center;
        const settleAt = 0.18 + distanceFromCenter * 0.62;

        if (progress >= settleAt) return targetCharacter;
        if (targetCharacter === " " && progress > 0.45) return " ";

        return SCRAMBLE_GLYPHS[(frame * 11 + index * 17) % SCRAMBLE_GLYPHS.length];
      })
        .join("")
        .replace(/ /g, "\u00A0");

      setDisplayText(nextText);

      if (frame >= totalFrames) {
        window.clearInterval(interval);
        previousTextRef.current = text;
        setDisplayText(text);
      }
    }, 34);

    return () => window.clearInterval(interval);
  }, [reducedMotion, text]);

  return (
    <span className="block w-full max-w-full whitespace-nowrap px-1 text-center text-[clamp(1.5rem,6.7vw,3.55rem)] text-foreground drop-shadow-[0_10px_22px_rgba(20,20,20,0.1)] [font-variant-ligatures:none]">
      {displayText}
    </span>
  );
}

function QuickActionButton({
  label,
  icon: Icon,
  prompt,
  to,
  onPrompt,
}: {
  label: string;
  icon: typeof Smile;
  prompt?: string;
  to?: "/resume" | "/proof";
  onPrompt: (prompt?: string) => void;
}) {
  const content = (
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
  );

  if (to) {
    return (
      <Link
        to={to}
        className="glass-button min-w-[92px] text-sm font-medium text-foreground/90"
        aria-label={to === "/resume" ? "Preview and download resume" : "Explore proof of work"}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onPrompt(prompt)}
      className="glass-button min-w-[92px] text-sm font-medium text-foreground/90"
      aria-label={prompt}
    >
      {content}
    </button>
  );
}

function PageRail({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="glass-button fixed right-0 top-1/2 z-30 -translate-y-1/2 text-foreground/75"
        aria-label={open ? "Close page menu" : "Open page menu"}
        aria-expanded={open}
      >
        <GlassSurface
          width={38}
          height={66}
          borderRadius={999}
          backgroundOpacity={0.08}
          saturation={2.15}
          distortionScale={-58}
          redOffset={1}
          greenOffset={4}
          blueOffset={8}
          contentClassName="pl-1"
        >
          {open ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </GlassSurface>
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, x: 24, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 24, scale: 0.96, filter: "blur(8px)" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-4 top-1/2 z-30 w-[min(15rem,calc(100vw-2rem))] -translate-y-1/2"
            aria-label="Page menu"
          >
            <div className="rounded-[28px] border border-white/75 bg-white/18 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.88),inset_0_-1px_0_rgba(20,20,20,0.04),0_18px_54px_rgba(20,20,20,0.08)] backdrop-blur-[30px]">
              <RailLink
                label="Keyboard Game"
                icon={KeyboardIcon}
                to="/keyboard-game"
                onClick={() => onOpenChange(false)}
              />
              <RailLink
                label="Proof Library"
                icon={Orbit}
                to="/proof"
                onClick={() => onOpenChange(false)}
              />
              <RailLink
                label="Resume"
                icon={FileText}
                to="/resume"
                onClick={() => onOpenChange(false)}
              />
              <RailExternalLink
                label="GitHub"
                icon={Github}
                href="https://github.com/Flamki"
                onClick={() => onOpenChange(false)}
              />
              <RailExternalLink
                label="LinkedIn"
                icon={Linkedin}
                href="https://www.linkedin.com/in/ayush-s-singh"
                onClick={() => onOpenChange(false)}
              />
              <RailExternalLink
                label="Gmail"
                icon={Mail}
                href="https://mail.google.com/mail/?view=cm&fs=1&to=9833Ayush%40gmail.com"
                onClick={() => onOpenChange(false)}
              />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

function RailLink({
  label,
  icon: Icon,
  to,
  onClick,
}: {
  label: string;
  icon: typeof Smile;
  to: "/keyboard-game" | "/proof" | "/resume";
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="glass-button group block w-full text-left text-sm font-medium text-foreground/85"
    >
      <GlassSurface
        width="100%"
        height={46}
        borderRadius={18}
        backgroundOpacity={0.035}
        saturation={2.2}
        distortionScale={-44}
        redOffset={1}
        greenOffset={4}
        blueOffset={7}
        contentClassName="justify-start gap-3 px-4"
      >
        <Icon className="h-4 w-4 text-foreground/65 transition-colors group-hover:text-foreground" />
        <span>{label}</span>
      </GlassSurface>
    </Link>
  );
}

function RailExternalLink({
  label,
  icon: Icon,
  href,
  onClick,
}: {
  label: string;
  icon: typeof Smile;
  href: string;
  onClick: () => void;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      className="glass-button group block w-full text-left text-sm font-medium text-foreground/85"
    >
      <GlassSurface
        width="100%"
        height={46}
        borderRadius={18}
        backgroundOpacity={0.035}
        saturation={2.2}
        distortionScale={-44}
        redOffset={1}
        greenOffset={4}
        blueOffset={7}
        contentClassName="justify-start gap-3 px-4"
      >
        <Icon className="h-4 w-4 text-foreground/65 transition-colors group-hover:text-foreground" />
        <span>{label}</span>
      </GlassSurface>
    </a>
  );
}

function PaintBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="aurora absolute inset-0 opacity-70" />
      <div className="paper-grain absolute inset-0 opacity-8" />
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
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center text-sm font-medium text-muted-foreground">
                    Opening conversation…
                  </div>
                }
              >
                <LazyChatPortfolio key={key} initialPrompt={initialPrompt ?? undefined} />
              </Suspense>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
