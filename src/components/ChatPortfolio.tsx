import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "motion/react";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowUp,
  Briefcase,
  ChevronDown,
  Compass,
  ExternalLink,
  FileText,
  Layers,
  Mic,
  MicOff,
  Smile,
  UserSearch,
  Volume2,
  VolumeX,
} from "lucide-react";
import BorderGlow from "@/components/BorderGlow";
import GlassSurface from "@/components/GlassSurface";
import avatarUrl from "@/assets/ayush-avatar.webp";
import { findGuidedProof, type GuidedProof } from "@/lib/proof-guide";
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
  {
    label: "Guide",
    icon: Compass,
    prompt: "Guide me through your strongest compiler and systems work.",
  },
  { label: "Resume", icon: FileText, action: "resume" },
  { label: "Contact", icon: UserSearch, prompt: "How can I contact you?" },
] as const;

export function ChatPortfolio({ initialPrompt }: { initialPrompt?: string }) {
  const [input, setInput] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [shineKey, setShineKey] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [audioPlaybackSupported, setAudioPlaybackSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioObjectUrlRef = useRef("");
  const audioEndResolverRef = useRef<((played: boolean) => void) | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");
  const liveTranscriptRef = useRef("");
  const shouldSubmitTranscriptRef = useRef(false);
  const speechQueueRef = useRef<SpeechQueueItem[]>([]);
  const speechQueueRunningRef = useRef(false);
  const speechGenerationRef = useRef(0);
  const speechAbortControllersRef = useRef(new Set<AbortController>());
  const speechMessageIdRef = useRef("");
  const speechQueuedLengthRef = useRef(0);
  const seededRef = useRef(false);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const stopVoicePlayback = useCallback(() => {
    speechGenerationRef.current += 1;
    speechQueueRef.current = [];
    speechQueueRunningRef.current = false;
    speechMessageIdRef.current = "";
    speechQueuedLengthRef.current = 0;
    speechAbortControllersRef.current.forEach((controller) => controller.abort());
    speechAbortControllersRef.current.clear();
    audioRef.current?.pause();
    audioEndResolverRef.current?.(false);
    audioEndResolverRef.current = null;
    audioRef.current = null;
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);

    if (audioObjectUrlRef.current) {
      URL.revokeObjectURL(audioObjectUrlRef.current);
      audioObjectUrlRef.current = "";
    }
  }, []);

  const submit = useCallback(
    async (text: string) => {
      const value = text.trim();
      if (!value || isLoading) return;
      stopVoicePlayback();
      setShineKey((key) => key + 1);
      setInput("");
      await sendMessage({ text: value });
    },
    [isLoading, sendMessage, stopVoicePlayback],
  );

  const submitRef = useRef(submit);

  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  const latestAssistantMessage = useMemo(() => {
    return [...messages].reverse().find((message) => message.role === "assistant");
  }, [messages]);

  const latestAssistantText = useMemo(() => {
    return latestAssistantMessage ? getMessageText(latestAssistantMessage) : "";
  }, [latestAssistantMessage]);

  const latestUserText = useMemo(() => {
    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
    return latestUserMessage ? getMessageText(latestUserMessage) : "";
  }, [messages]);

  const guidedProof = useMemo(() => findGuidedProof(latestUserText), [latestUserText]);

  const visibleMessages = useMemo(() => {
    const latestUserIndex = messages.findLastIndex((message) => message.role === "user");
    return latestUserIndex >= 0 ? messages.slice(latestUserIndex) : messages;
  }, [messages]);

  const speakWithBrowserFallback = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.rate = 0.98;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((voice) => /microsoft andrew/i.test(voice.name)) ??
      voices.find((voice) => /microsoft prabhat|google.*india|rishi/i.test(voice.name)) ??
      voices.find((voice) => /microsoft aria|google us english/i.test(voice.name)) ??
      voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));

    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, []);

  const synthesizeSpeech = useCallback(async (text: string, generation: number) => {
    const controller = new AbortController();
    speechAbortControllersRef.current.add(controller);

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`TTS failed with ${response.status}`);
      const objectUrl = await responseToAudioObjectUrl(response, controller.signal);
      if (generation !== speechGenerationRef.current) {
        URL.revokeObjectURL(objectUrl);
        return null;
      }
      return objectUrl;
    } catch {
      return null;
    } finally {
      speechAbortControllersRef.current.delete(controller);
    }
  }, []);

  const playSpeechQueue = useCallback(async () => {
    if (speechQueueRunningRef.current || typeof window === "undefined") return;

    const playbackGeneration = speechGenerationRef.current;
    speechQueueRunningRef.current = true;
    setIsSpeaking(true);

    while (
      playbackGeneration === speechGenerationRef.current &&
      speechQueueRef.current.length > 0
    ) {
      const item = speechQueueRef.current.shift();
      if (!item || item.generation !== speechGenerationRef.current) continue;

      const objectUrl = await item.audioPromise;
      if (item.generation !== speechGenerationRef.current) {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        continue;
      }

      if (!objectUrl) {
        speechQueueRef.current = [];
        speechQueueRunningRef.current = false;
        speakWithBrowserFallback(item.text);
        return;
      }

      audioObjectUrlRef.current = objectUrl;
      const audio = new Audio(objectUrl);
      audio.preload = "auto";
      audio.volume = 1;
      audioRef.current = audio;

      const played = await new Promise<boolean>((resolve) => {
        const finish = (didPlay: boolean) => {
          if (audioEndResolverRef.current !== finish) return;
          audioEndResolverRef.current = null;
          resolve(didPlay);
        };
        audioEndResolverRef.current = finish;
        audio.onended = () => finish(true);
        audio.onerror = () => finish(false);
        void audio.play().catch(() => finish(false));
      });

      if (audioObjectUrlRef.current === objectUrl) audioObjectUrlRef.current = "";
      if (audioRef.current === audio) audioRef.current = null;
      URL.revokeObjectURL(objectUrl);

      if (!played && item.generation === speechGenerationRef.current) {
        speechQueueRef.current = [];
        speechQueueRunningRef.current = false;
        speakWithBrowserFallback(item.text);
        return;
      }
    }

    if (playbackGeneration === speechGenerationRef.current) {
      speechQueueRunningRef.current = false;
      setIsSpeaking(false);
    }
  }, [speakWithBrowserFallback]);

  const enqueueSpeech = useCallback(
    (text: string) => {
      const cleanText = cleanTextForSpeech(text);
      if (!cleanText) return;

      const generation = speechGenerationRef.current;
      speechQueueRef.current.push({
        text: cleanText,
        generation,
        audioPromise: synthesizeSpeech(cleanText, generation),
      });
      void playSpeechQueue();
    },
    [playSpeechQueue, synthesizeSpeech],
  );

  const toggleVoice = () => {
    setVoiceEnabled((enabled) => {
      const next = !enabled;
      if (!next) {
        stopVoicePlayback();
      }
      return next;
    });
  };

  const stopListening = useCallback(() => {
    shouldSubmitTranscriptRef.current = true;
    recognitionRef.current?.stop();
  }, []);

  const startListening = useCallback(() => {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition || isLoading) return;

    stopVoicePlayback();
    recognitionRef.current?.abort();
    finalTranscriptRef.current = "";
    liveTranscriptRef.current = "";
    shouldSubmitTranscriptRef.current = true;

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript ?? "";

        if (result.isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${transcript}`.trim();
        } else {
          interimTranscript += transcript;
        }
      }

      liveTranscriptRef.current = `${finalTranscriptRef.current} ${interimTranscript}`.trim();
      setInput(liveTranscriptRef.current);
    };

    recognition.onerror = () => {
      shouldSubmitTranscriptRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;

      const transcript = (finalTranscriptRef.current || liveTranscriptRef.current).trim();
      if (shouldSubmitTranscriptRef.current && transcript) {
        void submitRef.current(transcript);
      }
    };

    recognitionRef.current = recognition;
    setInput("");
    setIsListening(true);
    recognition.start();
  }, [isLoading, stopVoicePlayback]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      return;
    }
    startListening();
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
    setSpeechSupported(Boolean(getSpeechRecognitionConstructor()));
    setAudioPlaybackSupported("Audio" in window);

    return () => {
      recognitionRef.current?.abort();
      stopVoicePlayback();
    };
  }, [stopVoicePlayback]);

  useEffect(() => {
    if (!voiceEnabled || !audioPlaybackSupported) return;
    if (!latestAssistantMessage || !latestAssistantText.trim()) return;

    if (speechMessageIdRef.current !== latestAssistantMessage.id) {
      stopVoicePlayback();
      speechMessageIdRef.current = latestAssistantMessage.id;
    }

    const cleanText = cleanTextForSpeech(latestAssistantText);
    if (cleanText.length < speechQueuedLengthRef.current) return;

    const pendingText = cleanText.slice(speechQueuedLengthRef.current);
    const { chunks, consumed } = takeSpeakableChunks(
      pendingText,
      !isLoading,
      speechQueuedLengthRef.current === 0,
    );
    if (!chunks.length) return;

    speechQueuedLengthRef.current += consumed;
    chunks.forEach(enqueueSpeech);
  }, [
    audioPlaybackSupported,
    enqueueSpeech,
    isLoading,
    latestAssistantMessage,
    latestAssistantText,
    stopVoicePlayback,
    voiceEnabled,
  ]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    textarea.style.overflowY = textarea.scrollHeight > 200 ? "auto" : "hidden";
  }, [input]);

  const lastIsUser = messages.length > 0 && messages[messages.length - 1].role === "user";
  const showThinking = isLoading && lastIsUser;
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
              {visibleMessages.map((m) => {
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

            <AnimatePresence>
              {guidedProof && latestAssistantMessage && !isLoading && (
                <GuidedProofCard key={guidedProof.id} proof={guidedProof} />
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
            <button
              type="button"
              onClick={toggleVoice}
              disabled={!audioPlaybackSupported}
              className="glass-button shrink-0 text-foreground disabled:pointer-events-none disabled:opacity-35"
              aria-label={voiceEnabled ? "Turn neural voice off" : "Turn neural voice on"}
              title={voiceEnabled ? "Neural voice on" : "Neural voice off"}
            >
              <GlassSurface
                width={38}
                height={38}
                borderRadius={999}
                backgroundOpacity={0.08}
                saturation={1.6}
                distortionScale={-42}
                redOffset={0}
                greenOffset={0}
                blueOffset={0}
                className={
                  isSpeaking
                    ? "chat-voice-surface is-speaking"
                    : voiceEnabled
                      ? "chat-voice-surface is-active"
                      : "chat-voice-surface"
                }
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </GlassSurface>
            </button>
            <button
              type="button"
              onClick={toggleListening}
              disabled={!speechSupported || isLoading}
              className="glass-button shrink-0 text-foreground disabled:pointer-events-none disabled:opacity-35"
              aria-label={isListening ? "Send spoken message" : "Talk to Ayush AI"}
              title={speechSupported ? "Talk" : "Voice input is not supported in this browser"}
            >
              <GlassSurface
                width={38}
                height={38}
                borderRadius={999}
                backgroundOpacity={0.08}
                saturation={1.7}
                distortionScale={-42}
                redOffset={0}
                greenOffset={0}
                blueOffset={0}
                className={isListening ? "chat-voice-surface is-listening" : "chat-voice-surface"}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </GlassSurface>
            </button>
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

type BrowserSpeechRecognitionResult = {
  isFinal: boolean;
  0?: { transcript?: string };
};

type SpeechQueueItem = {
  text: string;
  generation: number;
  audioPromise: Promise<string | null>;
};

type BrowserSpeechRecognitionEvent = Event & {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: BrowserSpeechRecognitionResult;
  };
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type SpeechRecognitionWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  };

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") return null;
  const speechWindow = window as SpeechRecognitionWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function getMessageText(message: { parts: Array<{ type: string; text?: string }> }) {
  return message.parts.map((part) => (part.type === "text" ? (part.text ?? "") : "")).join("");
}

function cleanTextForSpeech(text: string) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/[^\s)]+/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/[`*_#>]/g, "")
    .replace(/\s*[·|]\s*/g, ", ")
    .replace(/[()[\]{}]/g, ",")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/,{2,}/g, ",")
    .trim()
    .slice(0, 2400);
}

async function responseToAudioObjectUrl(response: Response, signal: AbortSignal) {
  const canStreamMp3 =
    response.body &&
    typeof MediaSource !== "undefined" &&
    MediaSource.isTypeSupported("audio/mpeg");

  if (!canStreamMp3) {
    return URL.createObjectURL(await response.blob());
  }

  const mediaSource = new MediaSource();
  const objectUrl = URL.createObjectURL(mediaSource);
  void pipeAudioToMediaSource(mediaSource, response.body!, signal);
  return objectUrl;
}

async function pipeAudioToMediaSource(
  mediaSource: MediaSource,
  stream: ReadableStream<Uint8Array>,
  signal: AbortSignal,
) {
  try {
    await waitForMediaSourceOpen(mediaSource, signal);
    const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
    const reader = stream.getReader();

    while (!signal.aborted) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value?.byteLength) continue;
      await appendAudioChunk(sourceBuffer, value, signal);
    }

    if (!signal.aborted && mediaSource.readyState === "open") {
      mediaSource.endOfStream();
    }
  } catch {
    if (mediaSource.readyState === "open") {
      try {
        mediaSource.endOfStream("network");
      } catch {
        // The audio element fallback handles a media-source shutdown race.
      }
    }
  }
}

function waitForMediaSourceOpen(mediaSource: MediaSource, signal: AbortSignal) {
  if (mediaSource.readyState === "open") return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      mediaSource.removeEventListener("sourceopen", handleOpen);
      signal.removeEventListener("abort", handleAbort);
    };
    const handleOpen = () => {
      cleanup();
      resolve();
    };
    const handleAbort = () => {
      cleanup();
      reject(new DOMException("Speech cancelled", "AbortError"));
    };

    mediaSource.addEventListener("sourceopen", handleOpen, { once: true });
    signal.addEventListener("abort", handleAbort, { once: true });
  });
}

function appendAudioChunk(sourceBuffer: SourceBuffer, chunk: Uint8Array, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      sourceBuffer.removeEventListener("updateend", handleUpdateEnd);
      sourceBuffer.removeEventListener("error", handleError);
      signal.removeEventListener("abort", handleAbort);
    };
    const handleUpdateEnd = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error("Could not buffer speech audio"));
    };
    const handleAbort = () => {
      cleanup();
      reject(new DOMException("Speech cancelled", "AbortError"));
    };

    sourceBuffer.addEventListener("updateend", handleUpdateEnd, { once: true });
    sourceBuffer.addEventListener("error", handleError, { once: true });
    signal.addEventListener("abort", handleAbort, { once: true });
    sourceBuffer.appendBuffer(new Uint8Array(chunk).buffer);
  });
}

function takeSpeakableChunks(text: string, flush: boolean, fastStart: boolean) {
  const maxChunkLength = 620;
  const chunks: string[] = [];
  let consumed = 0;

  while (consumed < text.length) {
    const remainingWithSpace = text.slice(consumed);
    const leadingSpace = remainingWithSpace.length - remainingWithSpace.trimStart().length;
    consumed += leadingSpace;

    const remaining = text.slice(consumed);
    if (!remaining) break;

    const sentenceEnds = [...remaining.matchAll(/[.!?](?:["')\]]{0,2})(?:\s+|$)/g)].map(
      (match) => (match.index ?? 0) + match[0].length,
    );

    if (flush && remaining.length <= maxChunkLength) {
      const chunk = remaining.trim();
      if (chunk) chunks.push(chunk);
      consumed = text.length;
      break;
    }

    if (!flush && remaining.length <= maxChunkLength) {
      const sentencesNeeded = fastStart && chunks.length === 0 ? 1 : 2;
      const sentenceBoundary = sentenceEnds[sentencesNeeded - 1];
      const liveLengthLimit = sentencesNeeded === 1 ? 72 : 420;

      if (sentenceBoundary) {
        const chunk = remaining.slice(0, sentenceBoundary).trim();
        if (chunk) chunks.push(chunk);
        consumed += sentenceBoundary;
        continue;
      }

      if (remaining.length < liveLengthLimit) break;

      const searchStart = sentencesNeeded === 1 ? 42 : 160;
      const searchWindow = remaining.slice(searchStart, liveLengthLimit);
      const softBoundary = Math.max(
        searchWindow.lastIndexOf(","),
        searchWindow.lastIndexOf(";"),
        searchWindow.lastIndexOf(" "),
      );
      const end = searchStart + Math.max(softBoundary, 1);
      const chunk = remaining.slice(0, end).trim();
      if (chunk) chunks.push(chunk);
      consumed += end;
      continue;
    }

    const sentenceBoundary = sentenceEnds
      .filter((boundary) => boundary >= 220 && boundary <= maxChunkLength)
      .at(-1);
    const searchWindow = remaining.slice(260, maxChunkLength);
    const softBoundary = Math.max(
      searchWindow.lastIndexOf(","),
      searchWindow.lastIndexOf(";"),
      searchWindow.lastIndexOf(" "),
    );
    const end = sentenceBoundary ?? 260 + Math.max(softBoundary, 1);

    if (end > 0) {
      const chunk = remaining.slice(0, end).trim();
      if (chunk) chunks.push(chunk);
      consumed += end;
      continue;
    }
    break;
  }

  return { chunks, consumed };
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

function GuidedProofCard({ proof }: { proof: GuidedProof }) {
  const href = `/quick-portfolio?focus=${encodeURIComponent(proof.id)}&guided=1`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="group relative mx-auto mt-1 block w-full max-w-2xl overflow-hidden rounded-[24px] border border-white/60 bg-white/25 p-1 shadow-[0_20px_60px_-38px_rgb(76_29_149/0.65)] backdrop-blur-2xl"
      aria-label={`Open guided proof for ${proof.title}`}
    >
      <span className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full bg-violet-400/20 blur-3xl transition duration-500 group-hover:bg-violet-400/30" />
      <span className="flex items-center gap-4 rounded-[20px] border border-white/50 bg-white/20 px-4 py-3.5 shadow-[0_1px_0_rgb(255_255_255/0.75)_inset] transition duration-300 group-hover:bg-white/36">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-[0_10px_28px_-14px_rgb(15_23_42/0.8)] transition duration-300 group-hover:scale-105">
          <Compass className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-violet-700/70">
            Guided proof · {proof.category}
          </span>
          <span className="mt-0.5 block text-base font-bold leading-tight text-foreground">
            {proof.title}
          </span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            {proof.summary}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] text-foreground/55">
          Open
          <ExternalLink className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </span>
    </motion.a>
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
