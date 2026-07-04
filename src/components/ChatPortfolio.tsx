import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "motion/react";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUp,
  Briefcase,
  ChevronDown,
  ExternalLink,
  FileText,
  Layers,
  PartyPopper,
  Smile,
  UserSearch,
} from "lucide-react";
import BorderGlow from "@/components/BorderGlow";
import GlassSurface from "@/components/GlassSurface";
import avatarUrl from "@/assets/ayush-avatar.png";
import { RESUME_URL } from "@/lib/resume";

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
  { label: "Resume", icon: FileText, action: "resume" },
  { label: "Contact", icon: UserSearch, prompt: "How can I contact you?" },
] as const;

export function ChatPortfolio({ initialPrompt }: { initialPrompt?: string }) {
  const [input, setInput] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
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
  const hasAssistantResponse = messages.some((message) => message.role === "assistant");
  const showSuggestions = messages.length === 0 && !input.trim() && !inputFocused && !isLoading;

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
                  if (hasAssistantResponse) return null;

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
        <AnimatePresence initial={false} mode="popLayout">
          {showSuggestions && (
            <motion.div
              layout
              initial={{ height: 0, opacity: 0, y: 10, filter: "blur(8px)" }}
              animate={{ height: "auto", opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ height: 0, opacity: 0, y: 8, filter: "blur(8px)" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mb-3 flex max-w-2xl flex-wrap items-center justify-center gap-2 overflow-hidden"
            >
              {CHAT_SUGGESTIONS.map(({ label, icon: Icon, ...suggestion }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    if ("action" in suggestion && suggestion.action === "resume") {
                      setInputFocused(true);
                      window.location.assign("/resume");
                      return;
                    }
                    submit(suggestion.prompt);
                  }}
                  className="glass-button text-sm font-medium text-foreground/90"
                  aria-label={
                    "action" in suggestion && suggestion.action === "resume"
                      ? "Preview and download resume"
                      : suggestion.prompt
                  }
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
          className="chat-input-glow mx-auto max-w-2xl rounded-full transition-[max-width,transform] duration-300 ease-out"
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
            className="chat-input-glass relative flex min-h-[56px] w-full items-end gap-2 rounded-[28px] py-1.5 pl-6 pr-1.5 transition-[min-height,box-shadow,background] duration-300 ease-out"
            onPointerDown={() => setShineKey((key) => key + 1)}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => {
                setInputFocused(true);
                setShineKey((key) => key + 1);
              }}
              onBlur={() => setInputFocused(false)}
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
  const pattern = /(\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\([^)]+\)|`[^`]+`|https?:\/\/[^\s)]+)/g;
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith("**")) {
      nodes.push(
        <strong key={nodes.length} className="font-semibold text-foreground">
          {renderInline(token.slice(2, -2))}
        </strong>,
      );
    } else if (token.startsWith("*")) {
      nodes.push(
        <em key={nodes.length} className="italic text-foreground/90">
          {renderInline(token.slice(1, -1))}
        </em>,
      );
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const href = getCanonicalProjectHref(linkMatch[1], linkMatch[2]);
        nodes.push(
          isResumeLink(linkMatch[1], href) ? (
            <GlassLink key={nodes.length} href="/resume" label={linkMatch[1]} />
          ) : (
            <GlassLink key={nodes.length} href={href} label={linkMatch[1]} />
          ),
        );
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={nodes.length}
          className="rounded-md bg-foreground/[0.07] px-1.5 py-0.5 text-[0.92em] text-foreground"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const { href, trailing } = normalizeUrlToken(token);
      const canonicalHref = getCanonicalProjectHref("", href);
      nodes.push(
        isResumeLink("", canonicalHref) ? (
          <GlassLink key={nodes.length} href="/resume" label="Preview resume" />
        ) : (
          <GlassLink key={nodes.length} href={canonicalHref} label={getLinkLabel(canonicalHref)} />
        ),
      );
      if (trailing) nodes.push(trailing);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.map((node, index) => <Fragment key={index}>{node}</Fragment>);
}

function GlassLink({ href, label }: { href?: string; label: string }) {
  if (href?.startsWith("/")) {
    return (
      <a href={href} className="glass-link-action">
        <span className="min-w-0 truncate">{label}</span>
        <FileText className="h-3.5 w-3.5 shrink-0 text-foreground/65" />
      </a>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className="glass-link-action">
      <span className="min-w-0 truncate">{label}</span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-foreground/65" />
    </a>
  );
}

function normalizeUrlToken(token: string) {
  const match = token.match(/^(https?:\/\/.*?)([.,!?;:]*)$/);
  return {
    href: match?.[1] ?? token,
    trailing: match?.[2] ?? "",
  };
}

function getLinkLabel(href: string) {
  try {
    const url = new URL(href);
    const host = url.hostname.replace(/^www\./, "");
    const firstPath = url.pathname.split("/").filter(Boolean)[0];
    return firstPath ? `${host}/${firstPath}` : host;
  } catch {
    return href;
  }
}

function getCanonicalProjectHref(label: string, href: string) {
  const key = `${label} ${href}`.toLowerCase();

  if (key.includes("resume") || key.includes("cv") || key.includes("ayush_singh_resume")) {
    return RESUME_URL;
  }

  if (key.includes("chadwallet") || key.includes("chad-solana-swap-v2")) {
    return "https://chad-solana-swap-v2.vercel.app/";
  }

  if (key.includes("social sherpa") || key.includes("social-sherpa")) {
    return href.includes("linkedin.com")
      ? "https://www.linkedin.com/posts/ayush-s-singh_buildinpublic-aiagents-linkedinautomation-ugcPost-7473330643242881025-CiYm/"
      : "https://github.com/Flamki/social-sherpa";
  }

  if (key.includes("getsolodesk")) {
    return "https://getsolodesk.com/";
  }

  if (key.includes("brandpilot")) {
    return href.includes("github.com")
      ? "https://github.com/Flamki/brandpilot"
      : "http://brandpilot-web-878182908092-us-east-1.s3-website-us-east-1.amazonaws.com/";
  }

  if (key.includes("vignaharta")) {
    return href.includes("github.com")
      ? "https://github.com/Flamki/vignaharta"
      : "https://vignaharta.vercel.app/";
  }

  return href;
}

function isResumeLink(label: string, href: string) {
  const key = `${label} ${href}`.toLowerCase();
  return key.includes("resume") || key.includes("cv") || key.includes("ayush_singh_resume");
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
