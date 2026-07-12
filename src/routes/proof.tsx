import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Cpu,
  FlaskConical,
  GitPullRequest,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ProofSearch = {
  focus?: string;
  guided?: boolean;
};

export const Route = createFileRoute("/proof")({
  validateSearch: (search: Record<string, unknown>): ProofSearch => ({
    focus: typeof search.focus === "string" ? search.focus : undefined,
    guided:
      search.guided === true ||
      search.guided === 1 ||
      search.guided === "1" ||
      search.guided === "true",
  }),
  head: () => ({
    meta: [
      { title: "Proof Library - Ayush Singh" },
      {
        name: "description",
        content:
          "A focused library of products, open-source contributions, systems work, and confirmed security research by Ayush Singh.",
      },
    ],
  }),
  component: ProofLibraryPage,
});

type Category = "products" | "open-source" | "security" | "systems" | "experiments";

type Proof = {
  id: string;
  number: string;
  title: string;
  category: Category;
  eyebrow: string;
  summary: string;
  impact: string;
  evidence: string;
  tech: string[];
  links?: Array<{ label: string; href: string }>;
};

const CATEGORY_META: Record<
  Category,
  { label: string; description: string; icon: typeof Boxes; accent: string }
> = {
  products: {
    label: "Products",
    description: "Useful things shipped end to end",
    icon: Boxes,
    accent: "#7c3aed",
  },
  "open-source": {
    label: "Open Source",
    description: "Changes accepted upstream",
    icon: GitPullRequest,
    accent: "#0284c7",
  },
  security: {
    label: "Security",
    description: "Findings confirmed by judges",
    icon: ShieldAlert,
    accent: "#ea580c",
  },
  systems: {
    label: "Systems",
    description: "Work below the application layer",
    icon: Cpu,
    accent: "#059669",
  },
  experiments: {
    label: "Earlier Experiments",
    description: "Older ideas and creative prototypes",
    icon: FlaskConical,
    accent: "#64748b",
  },
};

const PROOFS: Proof[] = [
  {
    id: "getsolodesk",
    number: "01",
    title: "GetSoloDesk",
    category: "products",
    eyebrow: "Solo-built · Live product",
    summary:
      "An AI-powered operating system for freelancers, built from the first product decision through to paying users.",
    impact:
      "Combines proposals, client pipeline, revenue analytics, follow-up reminders, and subscriptions in one focused workflow.",
    evidence:
      "Built the frontend, backend, AI layer, Razorpay billing, and webhook-driven plan activation independently.",
    tech: ["Next.js", "Node.js", "PostgreSQL", "AI", "Razorpay"],
    links: [{ label: "Open live product", href: "https://getsolodesk.com/" }],
  },
  {
    id: "brandpilot",
    number: "02",
    title: "BrandPilot",
    category: "products",
    eyebrow: "Four-agent AI platform",
    summary:
      "A serverless marketing-intelligence platform powered by four autonomous Amazon Nova Act agents.",
    impact:
      "Competitor, review, mention, and opportunity signals are collected overnight and delivered as a weekly report.",
    evidence:
      "Runs on AWS Lambda, S3, SNS, EventBridge, and Bedrock, with Nova 2 Lite synthesizing agent output.",
    tech: ["AWS Bedrock", "Lambda", "FastAPI", "React", "TypeScript"],
    links: [
      {
        label: "Open live demo",
        href: "http://brandpilot-web-878182908092-us-east-1.s3-website-us-east-1.amazonaws.com/",
      },
      { label: "GitHub repository", href: "https://github.com/Flamki/brandpilot" },
    ],
  },
  {
    id: "social-sherpa",
    number: "03",
    title: "Social Sherpa",
    category: "products",
    eyebrow: "Approval-safe AI agent",
    summary:
      "A LinkedIn network manager that drafts outreach, triages requests, and answers questions about professional connections.",
    impact:
      "Every external action remains staged for human approval instead of letting the agent send blindly.",
    evidence:
      "The working demo connects autonomous reasoning to a real professional-network workflow with an explicit safety boundary.",
    tech: ["React", "Node.js", "AI Agents", "Automation"],
    links: [
      {
        label: "Watch demo",
        href: "https://www.linkedin.com/posts/ayush-s-singh_buildinpublic-aiagents-linkedinautomation-ugcPost-7473330643242881025-CiYm/",
      },
      { label: "GitHub repository", href: "https://github.com/Flamki/social-sherpa" },
    ],
  },
  {
    id: "vignaharta",
    number: "04",
    title: "Vignaharta",
    category: "products",
    eyebrow: "Production client platform",
    summary:
      "A deployed real-estate platform with a custom CMS for non-technical listing management.",
    impact: "Staff can operate the listing catalogue directly without requiring code changes.",
    evidence:
      "Includes PostgreSQL persistence, JWT authentication, route-level API protection, and a complete admin workflow.",
    tech: ["Next.js", "Node.js", "PostgreSQL", "JWT"],
    links: [{ label: "Open live site", href: "https://vignaharta.vercel.app/" }],
  },
  {
    id: "swift",
    number: "05",
    title: "Swift Compiler",
    category: "open-source",
    eyebrow: "Merged PR #87403",
    summary:
      "Diagnosed and fixed a long-standing property-wrapper diagnostic bug in the Swift compiler.",
    impact:
      "The change passed multi-round core review and became the base for follow-up work by a Swift core member.",
    evidence:
      "Implemented the new diagnostic in TypeCheckPropertyWrapper.cpp and added a complete regression suite for bug #54422.",
    tech: ["C++17", "Compiler Internals", "Diagnostics", "Testing"],
    links: [{ label: "View merged PR", href: "https://github.com/swiftlang/swift/pull/87403" }],
  },
  {
    id: "boa",
    number: "06",
    title: "Boa JavaScript Engine",
    category: "open-source",
    eyebrow: "Rust runtime hardening",
    summary:
      "Eliminated native stack-overflow crashes in the Boa VM by enforcing a host call-depth limit.",
    impact: "Removed a crash class with zero measured performance regression in A/B benchmarks.",
    evidence:
      "The broader work also extended boa_gc parity and hardened CI with warnings-as-errors and nightly Miri checks.",
    tech: ["Rust", "VM Runtime", "Miri", "Benchmarking"],
    links: [{ label: "View merged PR", href: "https://github.com/boa-dev/boa/pull/4699" }],
  },
  {
    id: "jenkins",
    number: "07",
    title: "Jenkins Core & AI Plugin",
    category: "open-source",
    eyebrow: "Core, plugin, security docs",
    summary:
      "Fixed Jenkins Core UTF-8 redirects and patched logging, persistence, storage, and prompt failures across its AI plugin.",
    impact:
      "Security documentation was approved by three maintainers and led directly to a confirmed production vulnerability report.",
    evidence:
      "The work includes core PR #26331 plus six plugin changes covering payload redaction and reliable session recovery.",
    tech: ["Java", "Jenkins", "Security", "Persistence"],
    links: [{ label: "View core PR", href: "https://github.com/jenkinsci/jenkins/pull/26331" }],
  },
  {
    id: "screenpipe",
    number: "08",
    title: "Screenpipe",
    category: "open-source",
    eyebrow: "Seven merged PRs",
    summary:
      "Shipped sleep/wake detection and fixed usage, diagnostics, dependency, and CI failures across Windows and Linux.",
    impact:
      "Improved reliability in an 18k-star Rust and Tauri project across multiple platform boundaries.",
    evidence:
      "Merged work covers platform behavior, false usage-limit errors, inflated counts, and noisy capture warnings.",
    tech: ["Rust", "Tauri", "Windows", "Linux", "CI"],
    links: [
      {
        label: "View sleep/wake PR",
        href: "https://github.com/mediar-ai/screenpipe/pull/2768",
      },
    ],
  },
  {
    id: "nao",
    number: "09",
    title: "Nao Labs CLI",
    category: "open-source",
    eyebrow: "Top-five contributor · YC S24",
    summary:
      "Built multi-provider AI annotations for Jinja templates, a Trino connector, and release metadata infrastructure.",
    impact:
      "Expanded a production developer tool across AI workflows, data connectivity, and release reliability.",
    evidence:
      "Contributions include prompt(), ai_summary, provider coverage, integration tests, and Docker build metadata.",
    tech: ["Python", "Jinja", "LLMs", "Trino", "Docker"],
    links: [{ label: "View Nao", href: "https://github.com/getnao/nao" }],
  },
  {
    id: "memory-dos",
    number: "10",
    title: "TON Memory DoS",
    category: "security",
    eyebrow: "Confirmed · March 26, 2026",
    summary:
      "A forged future-round message could pin candidate lifetime through duplicate replay and drive unbounded memory growth.",
    impact: "Contest judges officially confirmed the consensus-layer denial-of-service finding.",
    evidence:
      "The vulnerable validator-session round-change path lacked a deduplication guard for the replayed message.",
    tech: ["TON", "Consensus", "Validator Session", "DoS"],
  },
  {
    id: "amplification-dos",
    number: "11",
    title: "TON Amplification DoS",
    category: "security",
    eyebrow: "Confirmed · March 27, 2026",
    summary:
      "A Byzantine validator could exploit downloadCandidate RPC to force redundant downloads each round.",
    impact: "Contest judges officially confirmed the response-amplification finding.",
    evidence:
      "The RPC path lacked sufficient per-peer throttling or deduplication, enabling O(n) redundant work.",
    tech: ["TON", "Byzantine Faults", "RPC", "DoS"],
  },
  {
    id: "compiler-systems",
    number: "12",
    title: "Compiler & Runtime Systems",
    category: "systems",
    eyebrow: "Below the application layer",
    summary:
      "Work across type checking, diagnostics, VM limits, garbage collection, and undefined-behavior detection.",
    impact:
      "Connects user-facing correctness to the internal invariants that keep language implementations reliable.",
    evidence:
      "Demonstrated through merged Swift and Boa work rather than isolated tutorial projects.",
    tech: ["C++17", "Rust", "Type Systems", "VMs", "Miri"],
  },
  {
    id: "distributed-systems",
    number: "13",
    title: "Distributed Systems",
    category: "systems",
    eyebrow: "Consistency and recovery",
    summary:
      "Systems grounding in Raft consensus, Write-Ahead Logs, TLV protocols, and failure-oriented design.",
    impact:
      "Provides the mental model behind production incident ownership and validator-consensus security research.",
    evidence:
      "Applied across ERP reliability work, validator research, and systems-oriented open source.",
    tech: ["Raft", "WAL", "TLV", "Recovery", "Consensus"],
  },
  {
    id: "pokequest",
    number: "14",
    title: "PokéQuest",
    category: "experiments",
    eyebrow: "Earlier experiment · Public",
    summary:
      "A digital Pokédex and battle arena for exploring Pokémon TCG cards, trainers, and the Regional Cup.",
    impact:
      "Explored how discovery, collection browsing, and game-like interaction can live in one playful interface.",
    evidence:
      "The public deployment includes Pokémon card discovery, trainer content, and an interactive battle-oriented experience.",
    tech: ["Interactive UI", "Discovery", "Game Experience"],
    links: [{ label: "Open PokéQuest", href: "https://pokequest-beige.vercel.app/" }],
  },
  {
    id: "sonic-weaver",
    number: "15",
    title: "Sonic Weaver",
    category: "experiments",
    eyebrow: "Earlier experiment · Public",
    summary:
      "An audio-processing playground for applying immersive 4D, 8D, and 11D spatial effects.",
    impact:
      "Turned spatial-audio concepts into a browser experience where visitors can directly experiment with sound movement.",
    evidence:
      "The public application exposes an interactive audio workflow focused on immersive spatial processing.",
    tech: ["Web Audio", "Spatial Audio", "Audio Processing"],
    links: [{ label: "Open Sonic Weaver", href: "https://sonic-weaver.vercel.app/app" }],
  },
  {
    id: "mood2anime",
    number: "16",
    title: "Mood2Anime",
    category: "experiments",
    eyebrow: "Earlier experiment · Public",
    summary:
      "A creative AI prototype that turns a visitor's mood into an anime-oriented visual experience.",
    impact:
      "Explored a lightweight emotion-to-visual interaction instead of a conventional form-driven AI interface.",
    evidence:
      "The public deployment presents mood-led anime and manga discovery through an interactive visual experience.",
    tech: ["Creative AI", "Mood Input", "Visual Prototype"],
    links: [
      {
        label: "Open Mood2Anime",
        href: "https://mood2anime-iota.vercel.app/",
      },
    ],
  },
];

function ProofLibraryPage() {
  const routeSearch = Route.useSearch();
  const focusedProof = PROOFS.find((proof) => proof.id === routeSearch.focus);
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [selectedId, setSelectedId] = useState(focusedProof?.id ?? PROOFS[0].id);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!focusedProof) return;

    setSelectedId(focusedProof.id);
    setActiveCategory("all");
    setSearch("");

    const frame = window.requestAnimationFrame(() => {
      document
        .querySelector(`[data-proof-id="${focusedProof.id}"]`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [focusedProof]);

  const visibleProofs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return PROOFS.filter((proof) => {
      const categoryMatches = activeCategory === "all" || proof.category === activeCategory;
      const searchMatches =
        !normalizedSearch ||
        [proof.title, proof.eyebrow, proof.summary, ...proof.tech]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return categoryMatches && searchMatches;
    });
  }, [activeCategory, search]);

  const selected = PROOFS.find((proof) => proof.id === selectedId) ?? visibleProofs[0] ?? PROOFS[0];

  const chooseCategory = (category: Category | "all") => {
    setActiveCategory(category);
    setSearch("");

    const firstProof =
      category === "all" ? PROOFS[0] : PROOFS.find((proof) => proof.category === category);
    if (firstProof) setSelectedId(firstProof.id);
  };

  return (
    <div className="relative h-dvh overflow-y-auto bg-background text-foreground">
      <ProofBackdrop />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-5 md:px-7 md:py-7">
        <header className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-sm font-bold text-foreground/65 transition hover:text-foreground"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-white/40 transition group-hover:-translate-x-0.5">
              <ArrowLeft className="h-4 w-4" />
            </span>
            Portfolio
          </Link>

          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            16 proof entries
          </div>
        </header>

        <AnimatePresence initial={false}>
          {routeSearch.guided && focusedProof && (
            <motion.div
              initial={{ opacity: 0, y: -8, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="glass-subtle mt-6 flex items-center gap-3 rounded-full py-2 pl-2 pr-3 shadow-[0_18px_55px_-40px_rgb(76_29_149/0.8)]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <p className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground/70">
                <span className="font-black text-foreground">Guided selection:</span> your question
                matched {focusedProof.title}
              </p>
              <a
                href="/proof"
                className="shrink-0 rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground transition hover:bg-white/40 hover:text-foreground"
              >
                Explore all
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        <section
          className={`glass-subtle overflow-hidden rounded-[24px] px-4 py-4 shadow-[0_18px_60px_-42px_rgb(15_23_42/0.45)] md:px-6 ${
            routeSearch.guided && focusedProof ? "mt-4" : "mt-8 md:mt-10"
          }`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <div className="shrink-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                Milestone
              </p>
              <p className="font-display mt-0.5 text-3xl font-bold leading-none">
                3× Hackathon Winner
              </p>
            </div>

            <div className="hidden h-10 w-px bg-foreground/10 md:block" />

            <ol className="grid flex-1 gap-2 text-xs font-bold text-foreground/68 sm:grid-cols-3 sm:gap-3">
              {[
                "Mini chess engine under 1 MB",
                "Telegram bug bounty",
                "Agentic hackathon by a YC company",
              ].map((win, index) => (
                <li key={win} className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/30 font-mono text-[9px] text-foreground/50 shadow-[0_1px_0_rgb(255_255_255/0.8)_inset]">
                    {index + 1}
                  </span>
                  <span className="leading-4">{win}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="pt-4">
          <CategoryTabs active={activeCategory} onSelect={chooseCategory} />
        </div>

        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[330px_minmax(0,1fr)]">
          <section className="glass-subtle overflow-hidden rounded-[26px] p-2 shadow-[0_18px_60px_-42px_rgb(15_23_42/0.45)]">
            <div className="relative m-1.5">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search Rust, agents, security..."
                className="h-11 w-full rounded-[16px] border border-white/55 bg-white/26 pl-10 pr-4 text-sm font-medium shadow-[0_1px_0_rgb(255_255_255/0.7)_inset] outline-none backdrop-blur-xl transition placeholder:text-muted-foreground focus:border-white/80 focus:bg-white/45"
              />
            </div>

            <div className="max-h-[56dvh] space-y-1 overflow-y-auto p-1 [scrollbar-width:thin] lg:max-h-[calc(100dvh-300px)]">
              {visibleProofs.map((proof) => (
                <ProofRow
                  key={proof.id}
                  proof={proof}
                  active={proof.id === selected.id}
                  onClick={() => setSelectedId(proof.id)}
                />
              ))}

              {visibleProofs.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <p className="font-display text-2xl font-bold">No matching proof.</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try a technology, product, or contribution name.
                  </p>
                </div>
              )}
            </div>
          </section>

          <div className="lg:sticky lg:top-6">
            <EvidenceCard
              proof={selected}
              guided={Boolean(routeSearch.guided && focusedProof?.id === selected.id)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function CategoryTabs({
  active,
  onSelect,
}: {
  active: Category | "all";
  onSelect: (category: Category | "all") => void;
}) {
  return (
    <nav className="glass-subtle flex w-fit max-w-full gap-1 overflow-x-auto rounded-full p-1.5 shadow-[0_14px_50px_-38px_rgb(15_23_42/0.5)] [scrollbar-width:none]">
      <CategoryButton
        label="All work"
        count={PROOFS.length}
        active={active === "all"}
        onClick={() => onSelect("all")}
      />
      {(Object.keys(CATEGORY_META) as Category[]).map((category) => (
        <CategoryButton
          key={category}
          label={CATEGORY_META[category].label}
          count={PROOFS.filter((proof) => proof.category === category).length}
          active={active === category}
          onClick={() => onSelect(category)}
        />
      ))}
    </nav>
  );
}

function CategoryButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition duration-300 ${
        active
          ? "bg-foreground text-background shadow-[0_8px_24px_-12px_rgb(15_23_42/0.8)]"
          : "text-foreground/55 hover:bg-white/45 hover:text-foreground"
      }`}
    >
      {label}
      <span className={`text-[10px] ${active ? "text-background/55" : "text-muted-foreground"}`}>
        {String(count).padStart(2, "0")}
      </span>
    </button>
  );
}

function ProofRow({
  proof,
  active,
  onClick,
}: {
  proof: Proof;
  active: boolean;
  onClick: () => void;
}) {
  const meta = CATEGORY_META[proof.category];

  return (
    <button
      type="button"
      data-proof-id={proof.id}
      onClick={onClick}
      className={`group grid w-full grid-cols-[34px_minmax(0,1fr)_24px] items-start gap-3 rounded-[20px] px-3 py-4 text-left transition ${
        active
          ? "bg-foreground text-background shadow-[0_14px_32px_-22px_rgb(15_23_42/0.85)]"
          : "hover:bg-white/38"
      }`}
    >
      <span
        className={`font-mono text-[10px] font-bold ${active ? "text-background/45" : "text-muted-foreground"}`}
      >
        {proof.number}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: meta.accent }} />
          <span className="truncate text-[10px] font-black uppercase tracking-[0.14em] opacity-60">
            {meta.label}
          </span>
        </span>
        <span className="font-display mt-1 block text-2xl font-bold leading-none">
          {proof.title}
        </span>
        <span
          className={`mt-2 line-clamp-2 block text-xs leading-5 ${active ? "text-background/62" : "text-muted-foreground"}`}
        >
          {proof.summary}
        </span>
      </span>
      <ArrowUpRight
        className={`mt-1 h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${active ? "text-background/70" : "text-foreground/35"}`}
      />
    </button>
  );
}

function EvidenceCard({ proof, guided = false }: { proof: Proof; guided?: boolean }) {
  const meta = CATEGORY_META[proof.category];
  const Icon = meta.icon;
  const isExperiment = proof.category === "experiments";

  return (
    <div
      className={`glass-strong relative min-h-[520px] overflow-hidden rounded-[30px] transition-shadow duration-500 ${
        guided ? "ring-2 ring-violet-400/25 shadow-[0_28px_90px_-44px_rgb(124_58_237/0.75)]" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full opacity-[0.13] blur-3xl"
        style={{ background: meta.accent }}
      />
      <AnimatePresence mode="wait">
        <motion.article
          key={proof.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className="relative p-6 md:p-8 xl:p-10"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em]"
              style={{ color: meta.accent }}
            >
              <Icon className="h-4 w-4" />
              {meta.label} · {proof.eyebrow}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] ${
                isExperiment
                  ? "border-foreground/10 bg-foreground/[0.04] text-foreground/55"
                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {isExperiment ? "Earlier experiment" : "Evidence-backed"}
            </span>
          </div>

          <h2 className="font-display mt-7 max-w-4xl text-4xl font-bold leading-[0.95] tracking-[-0.03em] md:text-6xl">
            {proof.title}
          </h2>
          <p className="mt-5 max-w-3xl text-base font-medium leading-7 text-foreground/72 md:text-lg md:leading-8">
            {proof.summary}
          </p>

          <div className="my-7 h-px bg-gradient-to-r from-foreground/15 via-foreground/5 to-transparent" />

          <div className="grid gap-7 md:grid-cols-2">
            <EvidenceSection label="Why it matters" text={proof.impact} />
            <EvidenceSection label="What proves it" text={proof.evidence} />
          </div>

          <div className="mt-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
              Technical surface
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {proof.tech.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/55 bg-white/25 px-3 py-1.5 text-xs font-bold text-foreground/68 shadow-[0_1px_0_rgb(255_255_255/0.75)_inset] backdrop-blur-xl"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {proof.links && proof.links.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {proof.links.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition hover:-translate-y-0.5 ${
                    index === 0
                      ? "bg-foreground text-background"
                      : "border border-foreground/10 bg-white/35 text-foreground"
                  }`}
                >
                  {link.label}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          )}
        </motion.article>
      </AnimatePresence>
    </div>
  );
}

function EvidenceSection({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-foreground/76 md:text-[15px] md:leading-7">
        {text}
      </p>
    </div>
  );
}

function ProofBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="aurora absolute inset-0 opacity-[0.28]" />
      <div className="paper-grain absolute inset-0 opacity-[0.08]" />
      <div className="absolute -left-24 top-[26%] h-72 w-72 rounded-full bg-violet-300/20 blur-[90px]" />
      <div className="absolute -right-20 bottom-[12%] h-80 w-80 rounded-full bg-cyan-300/20 blur-[100px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
    </div>
  );
}
