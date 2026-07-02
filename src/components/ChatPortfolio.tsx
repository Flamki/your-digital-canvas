import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

const SUGGESTIONS = [
  "What do you build?",
  "Show me your best project",
  "Are you open to work?",
  "How do I reach you?",
];

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

  // Auto-send seeded prompt once on mount
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
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-1 py-6 [scrollbar-width:thin]"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-md pt-6 text-center"
            >
              <p className="text-sm text-muted-foreground">
                Ask me anything about my work, projects, or how to collab.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="glass rounded-full px-3 py-1.5 text-xs text-foreground/80 transition-all hover:scale-[1.03]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            const isUser = m.role === "user";
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`mb-3 flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser
                      ? "bg-foreground/90 text-background backdrop-blur-md"
                      : "glass text-foreground"
                  }`}
                >
                  {text || (
                    <span className="inline-flex gap-1">
                      <Dot delay={0} />
                      <Dot delay={0.15} />
                      <Dot delay={0.3} />
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="sticky bottom-0 pt-2"
      >
        <div className="glass-strong flex items-end gap-2 rounded-2xl p-2 transition-colors focus-within:ring-2 focus-within:ring-foreground/20">
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
            placeholder="Ask about my projects, skills, or say hi…"
            className="max-h-40 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
            aria-label="Send"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground"
      animate={{ opacity: [0.2, 1, 0.2] }}
      transition={{ duration: 1.1, repeat: Infinity, delay }}
    />
  );
}
