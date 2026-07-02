import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "motion/react";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUp,
  Briefcase,
  ChevronDown,
  Layers,
  PartyPopper,
  Smile,
  UserSearch,
} from "lucide-react";
import BorderGlow from "@/components/BorderGlow";
import GlassSurface from "@/components/GlassSurface";
import avatarUrl from "@/assets/ayush-avatar.png";

const CHAT_SUGGESTIONS = [
  { label: "Me", icon: Smile, prompt: "Who are you? I want to know more about you." },
  {
    label: "Projects",
    icon: Briefcase,
    prompt: "What are your projects? What are you working on right now?",
  },
  {
    label: "Skills",
    icon: Layers,
    prompt: "What are your skills? Give me a list of your soft and hard skills.",
  },
  { label: "Fun", icon: PartyPopper, prompt: "Tell me something fun about you." },
  { label: "Contact", icon: UserSearch, prompt: "How can I contact you?" },
];

export function ChatPortfolio({ initialPrompt }: { initialPrompt?: string }) {
  const [input, setInput] = useState("");
  const [shineKey, setShineKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const seededRef = useRef(false);

  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const submit = async (text: string) => {
    const value = text.trim();
    if (!value || isLoading) return;
    setShineKey((key) => key + 1);
    setInput("");
    setMessages([]);
    await sendMessage({ text: value });
  };

  useEffect(() => {
    if (initialPrompt && !seededRef.current) {
      seededRef.current = true;
      void submit(initialPrompt);
    }
    textareaRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    textarea.style.overflowY = textarea.scrollHeight > 200 ? "auto" : "hidden";
  }, [input]);

  const lastIsUser = messages.length > 0 && messages[messages.length - 1].role === "user";
  const showThinking = isLoading && lastIsUser;

  return (
    <div className="relative flex h-full flex-col">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pb-40 pt-4 [scrollbar-width:thin]"
      >
        <div className="mx-auto flex max-w-2xl flex-col items-center">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            src={avatarUrl}
            alt=""
            className="mb-6 h-14 w-14 select-none rounded-full object-cover"
            draggable={false}
          />

          <div className="flex w-full flex-col gap-6">
            <AnimatePresence initial={false}>
              {messages.map((m) => {
                const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
                const isUser = m.role === "user";
                if (isUser) {
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 340, damping: 26 }}
                      className="flex justify-center"
                    >
                      <UserMessage text={text} />
                    </motion.div>
                  );
                }
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full"
                  >
                    {text ? <AssistantMessage text={text} /> : <ThinkingDots />}
                  </motion.div>
                );
              })}

              {showThinking && (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full"
                >
                  <ThinkingDots />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="absolute inset-x-0 bottom-4 px-4"
      >
        <AnimatePresence>
          {!input.trim() && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="mx-auto mb-3 flex max-w-2xl flex-wrap items-center justify-center gap-2"
            >
              {CHAT_SUGGESTIONS.map(({ label, icon: Icon, prompt }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => submit(prompt)}
                  className="glass-button text-sm font-medium text-foreground/90"
                  aria-label={prompt}
                >
                  <GlassSurface
                    width="100%"
                    height={44}
                    borderRadius={999}
                    backgroundOpacity={0.07}
                    saturation={1.65}
                    distortionScale={-100}
                    redOffset={3}
                    greenOffset={8}
                    blueOffset={14}
                    contentClassName="gap-2 px-4"
                  >
                    <Icon className="h-4 w-4 text-foreground/70" />
                    <span>{label}</span>
                  </GlassSurface>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <BorderGlow
          className="chat-input-glow mx-auto max-w-xl rounded-full"
          borderRadius={999}
          edgeSensitivity={0}
          glowColor="284 88 74"
          glowRadius={28}
          glowIntensity={0.72}
          coneSpread={22}
          shineKey={shineKey}
          colors={["#c084fc", "#f472b6", "#38bdf8"]}
          fillOpacity={0}
        >
          <div
            className="chat-input-glass relative flex w-full items-end gap-2 rounded-[28px] py-1.5 pl-6 pr-1.5"
            onPointerDown={() => setShineKey((key) => key + 1)}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setShineKey((key) => key + 1)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              rows={1}
              placeholder="Ask me anything..."
              className="max-h-[200px] min-h-[36px] min-w-0 flex-1 resize-none bg-transparent py-2 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <span className="chat-send-strands shrink-0 rounded-full">
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="glass-button relative z-10 text-foreground disabled:opacity-100"
                aria-label="Send"
                onPointerDown={() => setShineKey((key) => key + 1)}
              >
                <GlassSurface
                  width={40}
                  height={40}
                  borderRadius={999}
                  backgroundOpacity={0.18}
                  saturation={1.08}
                  distortionScale={-24}
                  redOffset={0}
                  greenOffset={0}
                  blueOffset={0}
                  className="chat-send-surface"
                >
                  <ArrowUp className="h-4 w-4" />
                </GlassSurface>
              </button>
            </span>
          </div>
        </BorderGlow>
      </form>
    </div>
  );
}

function AssistantMessage({ text }: { text: string }) {
  const blocks = toMarkdownBlocks(text);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 text-[15px] leading-relaxed text-foreground/90">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h2
              key={index}
              className="pt-1 text-2xl font-bold leading-tight text-foreground md:text-3xl"
            >
              {renderInline(block.text)}
            </h2>
          );
        }

        if (block.type === "subheading") {
          return (
            <h3 key={index} className="pt-2 text-lg font-semibold leading-snug text-foreground">
              {renderInline(block.text)}
            </h3>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={index} className="space-y-2">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-chat-user" />
                  <span className="min-w-0">{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="text-pretty">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}

type MarkdownBlock =
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

function toMarkdownBlocks(text: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = text.split(/\r?\n/);
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };

  const flushList = () => {
    if (!list.length) return;
    blocks.push({ type: "list", items: list });
    list = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "subheading", text: line.slice(4).trim() });
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: line.slice(3).trim() });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^\d+\.\s+/, ""));
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g;
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith("**")) {
      nodes.push(
        <strong key={nodes.length} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        nodes.push(
          <a
            key={nodes.length}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-chat-user underline decoration-chat-user/35 underline-offset-4 transition-colors hover:text-chat-user/80"
          >
            {linkMatch[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(
        <code
          key={nodes.length}
          className="rounded-md bg-foreground/[0.07] px-1.5 py-0.5 text-[0.92em] text-foreground"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.map((node, index) => <Fragment key={index}>{node}</Fragment>);
}

function UserMessage({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 320;

  return (
    <div className="w-fit max-w-[min(34rem,calc(100vw-2rem))] rounded-[24px] bg-chat-user px-4 py-3 text-sm font-medium leading-relaxed text-chat-user-foreground shadow-[0_8px_24px_-8px_color-mix(in_oklch,var(--chat-user)_60%,transparent)]">
      <div
        className={`relative whitespace-pre-wrap [overflow-wrap:anywhere] ${
          isLong && !expanded ? "max-h-56 overflow-hidden" : ""
        }`}
      >
        {text}
        {isLong && !expanded && (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-chat-user" />
        )}
      </div>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-chat-user-foreground/80 transition-colors hover:text-chat-user-foreground"
        >
          {expanded ? "View less" : "View more"}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label="Thinking">
      {[0, 0.15, 0.3].map((d) => (
        <motion.span
          key={d}
          className="inline-block h-1.5 w-1.5 rounded-full bg-foreground/50"
          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: d }}
        />
      ))}
    </span>
  );
}
