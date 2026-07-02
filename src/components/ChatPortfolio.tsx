import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import avatarUrl from "@/assets/ayush-avatar.png";

export function ChatPortfolio({ initialPrompt }: { initialPrompt?: string }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const seededRef = useRef(false);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const submit = async (text: string) => {
    const value = text.trim();
    if (!value || isLoading) return;
    setInput("");
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
            className="mb-6 h-14 w-14 select-none"
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
                      <div className="rounded-full bg-chat-user px-6 py-3 text-sm font-medium text-chat-user-foreground shadow-[0_8px_24px_-8px_color-mix(in_oklch,var(--chat-user)_60%,transparent)]">
                        {text}
                      </div>
                    </motion.div>
                  );
                }
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90"
                  >
                    {text || <ThinkingDots />}
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
        <div className="glass-strong mx-auto flex max-w-xl items-center gap-2 rounded-full py-1.5 pl-6 pr-1.5 transition-colors focus-within:ring-2 focus-within:ring-chat-user/40">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            rows={1}
            placeholder="Ask me anything…"
            className="max-h-32 min-h-[36px] flex-1 resize-none bg-transparent py-2 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-chat-user text-chat-user-foreground shadow-[0_6px_20px_-6px_color-mix(in_oklch,var(--chat-user)_70%,transparent)] transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            aria-label="Send"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </form>
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
