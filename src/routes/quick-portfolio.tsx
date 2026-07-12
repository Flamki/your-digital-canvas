import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  Boxes,
  Briefcase,
  CheckCircle2,
  Cpu,
  FileText,
  FlaskConical,
  Github,
  GitPullRequest,
  Linkedin,
  Mail,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import avatarUrl from "@/assets/ayush-avatar.webp";

type ProofSearch = {
  focus?: string;
  guided?: boolean;
};

export const Route = createFileRoute("/quick-portfolio")({
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
      { title: "Quick Portfolio - Ayush Singh" },
      {
        name: "description",
        content:
          "A fast, evidence-backed look at the projects, upstream contributions, systems work, and security research of Ayush Singh.",
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

type Experience = {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  bullets: string[];
  tech: string[];
};

const CATEGORY_META: Record<
  Category,
  { label: string; description: string; icon: typeof Boxes; accent: string }
> = {
  products: {
    label: "Projects",
    description: "Projects and client platforms shipped end to end",
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

const EXPERIENCES: Experience[] = [
  {
    id: "idms-infotech",
    role: "Full-Stack Developer & Product Engineer",
    company: "IDMS Infotech Pvt. Ltd.",
    period: "Aug 2025 - Jun 2026",
    location: "Thane, India · On-site",
    bullets: [
      "Architected and shipped a production Employee, Admin, and Client multi-portal ERP as the sole engineer, owning the database schema, REST API layer, and responsive UI.",
      "Owned the complete product lifecycle: requirements translation, technical architecture, API contracts, deployments, and production incidents.",
    ],
    tech: ["React", "Node.js", "Express.js", "MongoDB", "REST APIs"],
  },
  {
    id: "freelance",
    role: "Freelance Full-Stack Developer",
    company: "Independent · 10+ clients",
    period: "Oct 2024 - Jul 2025",
    location: "Remote",
    bullets: [
      "Delivered full-stack applications for 10+ clients across e-commerce, portfolio, and small-business CRM use cases.",
      "Worked as the sole developer on each engagement, owning requirements, architecture, deployment, and post-launch support.",
    ],
    tech: ["React", "Next.js", "Node.js", "PostgreSQL"],
  },
];

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
      "Generates personalized proposals from job descriptions and combines a visual pipeline, revenue analytics, and automated follow-up reminders across Upwork, Fiverr, and direct clients.",
    evidence:
      "Solo-built the frontend, backend, and AI layer; implemented secure Razorpay Starter/Pro billing with webhook-driven activation; launched on Product Hunt with active early-access users.",
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
      "Four agents - Competitor Scout, Review Guardian, Mention Tracker, and Opportunity Hunter - run overnight to replace a $5,000/month agency workflow.",
    evidence:
      "A fully serverless Lambda, S3, SNS, and EventBridge backend uses Nova 2 Lite to synthesize and email a weekly intelligence report; submitted to Amazon Nova AI Hackathon 2026.",
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
      "Drafts and queues outreach, triages incoming connection requests, and stages every external action for explicit approval before sending.",
    evidence:
      "Includes a natural-language network query interface for questions such as finding top supply-chain contacts and targeted prospects.",
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
    impact:
      "A custom Admin CMS lets non-technical staff manage the complete listing catalogue without writing code.",
    evidence:
      "Deployed with PostgreSQL persistence, JWT authentication, route-level API protection, and a complete operational admin workflow.",
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
  const categories = Object.keys(CATEGORY_META) as Category[];
  const [activeCategory, setActiveCategory] = useState<Category | "all">(
    focusedProof?.category ?? "all",
  );

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.classList.add("quick-portfolio-scroll");
    body.classList.add("quick-portfolio-scroll");
    html.style.overflow = "hidden auto";
    body.style.overflow = "hidden auto";

    return () => {
      html.classList.remove("quick-portfolio-scroll");
      body.classList.remove("quick-portfolio-scroll");
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, []);

  useEffect(() => {
    if (!focusedProof) return;

    setActiveCategory(focusedProof.category);

    const frame = window.requestAnimationFrame(() => {
      document
        .querySelector(`[data-proof-id="${focusedProof.id}"]`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [focusedProof]);

  return (
    <div className="quick-portfolio-page relative min-h-dvh overflow-x-hidden bg-background text-foreground">
      <ProofBackdrop />

      <main className="relative z-10 mx-auto w-full max-w-3xl px-5 pb-20 pt-5 sm:px-7 md:pt-7">
        <header className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground/60 transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
            Home
          </Link>

          <nav className="flex items-center gap-3 text-[11px] font-semibold text-foreground/55 sm:gap-4 sm:text-xs">
            <a
              href="https://www.linkedin.com/in/ayush-s-singh"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-foreground"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/Flamki"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-foreground"
            >
              GitHub
            </a>
            <Link to="/resume" className="transition hover:text-foreground">
              Resume
            </Link>
          </nav>
        </header>

        <section className="pb-9 pt-10 md:pb-10 md:pt-12">
          <div className="flex items-center gap-4">
            <img
              src={avatarUrl}
              alt="Ayush Singh"
              width={72}
              height={72}
              className="h-16 w-16 rounded-full border border-white/70 bg-white/35 object-cover object-top shadow-[0_14px_35px_-24px_rgb(15_23_42/0.7)]"
            />
            <div>
              <h1 className="font-display text-4xl font-bold leading-none tracking-[-0.025em] md:text-5xl">
                Ayush Singh
              </h1>
            </div>
          </div>

          <p className="mt-6 text-xl font-medium leading-8 text-foreground/72">
            Full-stack and systems engineer shipping production ERP systems, multi-agent AI
            platforms, open-source systems work, and blockchain security research.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-[15px]">
            60+ merged pull requests across Swift, Rust, Jenkins, Screenpipe, and Python, plus two
            confirmed TON consensus-layer denial-of-service findings.
          </p>

          <div className="mt-7 border-l-2 border-violet-400/45 pl-4">
            <p className="text-sm font-bold text-foreground">3× hackathon winner</p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              Mini chess engine under 1 MB · Telegram bug bounty · Agentic hackathon by a YC company
            </p>
          </div>

          {routeSearch.guided && focusedProof && (
            <div className="glass-subtle mt-7 flex items-center gap-3 rounded-2xl px-3 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <p className="min-w-0 text-xs font-medium text-foreground/65">
                Guided selection: <strong className="text-foreground">{focusedProof.title}</strong>
              </p>
            </div>
          )}
        </section>

        <div className="mt-12">
          <ExperienceSection />
        </div>

        <div className="sticky top-3 z-20 -mx-1 mt-10">
          <CategoryTabs active={activeCategory} onSelect={setActiveCategory} />
        </div>

        <div className="mt-10 space-y-16">
          {categories
            .filter((category) => activeCategory === "all" || activeCategory === category)
            .map((category) => {
              const proofs = PROOFS.filter((proof) => proof.category === category);
              return (
                <ProofSection
                  key={category}
                  category={category}
                  proofs={proofs}
                  focus={focusedProof?.id}
                />
              );
            })}
        </div>

        <ConnectSection />
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
  const tabs: Array<{ id: Category | "all"; label: string; count: number }> = [
    { id: "all", label: "All work", count: PROOFS.length + EXPERIENCES.length },
    ...(Object.keys(CATEGORY_META) as Category[]).map((category) => ({
      id: category,
      label: CATEGORY_META[category].label,
      count:
        PROOFS.filter((proof) => proof.category === category).length +
        (category === "products" ? EXPERIENCES.length : 0),
    })),
  ];

  return (
    <nav
      aria-label="Quick portfolio categories"
      className="quick-category-tabs glass-strong flex gap-1 overflow-x-auto rounded-full p-1.5 shadow-[0_18px_55px_-38px_rgb(15_23_42/0.6)] [scrollbar-width:none]"
    >
      {tabs.map((tab) => {
        const selected = active === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(tab.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[11px] font-bold transition duration-300 md:px-5 ${
              selected
                ? "bg-foreground text-background shadow-[0_9px_26px_-14px_rgb(15_23_42/0.9)]"
                : "text-foreground/52 hover:bg-white/42 hover:text-foreground"
            }`}
          >
            {tab.label}
            <span className={selected ? "text-background/55" : "text-muted-foreground"}>
              {String(tab.count).padStart(2, "0")}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function ExperienceSection() {
  return (
    <section className="proof-library-section">
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-foreground/[0.08] pb-3">
        <div>
          <h2 className="text-2xl font-bold tracking-[-0.02em]">Experience</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Production ownership and end-to-end client delivery
          </p>
        </div>
        <span className="font-mono text-[10px] font-bold text-muted-foreground">
          {String(EXPERIENCES.length).padStart(2, "0")}
        </span>
      </div>

      <div className="space-y-3">
        {EXPERIENCES.map((experience) => (
          <ExperienceCard key={experience.id} experience={experience} />
        ))}
      </div>
    </section>
  );
}

function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <article className="group rounded-[22px] border border-white/60 bg-white/28 p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/42 hover:shadow-[0_20px_55px_-42px_rgb(15_23_42/0.55)] md:p-6">
      <div className="flex gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/65 bg-white/45 text-violet-700/75 shadow-[0_1px_0_rgb(255_255_255/0.85)_inset]">
          <Briefcase className="h-4.5 w-4.5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold leading-tight text-foreground md:text-xl">
                {experience.role}
              </h3>
              <p className="mt-1 text-sm font-semibold text-violet-700/75">{experience.company}</p>
            </div>
            <div className="text-left text-[10px] font-bold leading-5 text-muted-foreground sm:text-right">
              <p>{experience.period}</p>
              <p>{experience.location}</p>
            </div>
          </div>

          <ul className="mt-4 space-y-2 text-sm leading-6 text-foreground/65">
            {experience.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2.5">
                <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-violet-500" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {experience.tech.map((item) => (
              <span
                key={item}
                className="rounded-md bg-foreground/[0.045] px-2.5 py-1 text-[10px] font-bold text-foreground/55"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function ProofSection({
  category,
  proofs,
  focus,
}: {
  category: Category;
  proofs: Proof[];
  focus?: string;
}) {
  const meta = CATEGORY_META[category];

  return (
    <section className="proof-library-section">
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-foreground/[0.08] pb-3">
        <div>
          <h2 className="text-2xl font-bold tracking-[-0.02em]">{meta.label}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{meta.description}</p>
        </div>
        <span className="font-mono text-[10px] font-bold text-muted-foreground">
          {String(proofs.length).padStart(2, "0")}
        </span>
      </div>

      <div className="space-y-3">
        {proofs.map((proof) => (
          <ProofCard key={proof.id} proof={proof} focused={focus === proof.id} />
        ))}
      </div>
    </section>
  );
}

function ProofCard({ proof, focused }: { proof: Proof; focused: boolean }) {
  const meta = CATEGORY_META[proof.category];
  const Icon = meta.icon;

  return (
    <article
      id={proof.id}
      data-proof-id={proof.id}
      className={`group scroll-mt-8 rounded-[22px] border bg-white/28 p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/42 hover:shadow-[0_20px_55px_-42px_rgb(15_23_42/0.55)] md:p-6 ${
        focused
          ? "border-violet-400/35 bg-violet-50/35 ring-2 ring-violet-400/20 shadow-[0_24px_70px_-42px_rgb(124_58_237/0.7)]"
          : "border-white/60"
      }`}
    >
      <div className="flex gap-4">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/65 bg-white/45 shadow-[0_1px_0_rgb(255_255_255/0.85)_inset]"
          style={{ color: meta.accent }}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold leading-tight text-foreground md:text-xl">
                {proof.title}
              </h3>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-muted-foreground">
                {proof.eyebrow}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700/70">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {proof.category === "experiments" ? "Experiment" : "Evidence"}
            </span>
          </div>

          <p className="mt-4 text-sm font-medium leading-6 text-foreground/75">{proof.summary}</p>

          <ul className="mt-4 space-y-2 text-sm leading-6 text-foreground/62">
            <li className="flex gap-2.5">
              <span
                className="mt-2.5 h-1 w-1 shrink-0 rounded-full"
                style={{ background: meta.accent }}
              />
              <span>{proof.impact}</span>
            </li>
            <li className="flex gap-2.5">
              <span
                className="mt-2.5 h-1 w-1 shrink-0 rounded-full"
                style={{ background: meta.accent }}
              />
              <span>{proof.evidence}</span>
            </li>
          </ul>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {proof.tech.map((item) => (
              <span
                key={item}
                className="rounded-md bg-foreground/[0.045] px-2.5 py-1 text-[10px] font-bold text-foreground/55"
              >
                {item}
              </span>
            ))}
          </div>

          {proof.links && proof.links.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
              {proof.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700/75 transition hover:text-violet-700"
                >
                  {link.label}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function ConnectSection() {
  const links = [
    { label: "Email", href: "mailto:9833Ayush@gmail.com", icon: Mail },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/ayush-s-singh", icon: Linkedin },
    { label: "GitHub", href: "https://github.com/Flamki", icon: Github },
    { label: "Resume", href: "/resume", icon: FileText },
  ];

  return (
    <section className="pb-8 pt-20">
      <h2 className="text-2xl font-bold lowercase tracking-[-0.02em]">let’s connect</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
        Building something ambitious, debugging something strange, or looking for an engineer who
        can own the whole path? Let’s talk.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {links.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/30 px-4 py-2 text-xs font-bold text-foreground/65 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/55 hover:text-foreground"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </a>
        ))}
      </div>
    </section>
  );
}

function ProofBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="aurora absolute inset-0 opacity-[0.16]" />
      <div className="paper-grain absolute inset-0 opacity-[0.05]" />
      <div className="proof-glow absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-violet-200/18 blur-[100px]" />
      <div className="proof-glow absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-cyan-200/16 blur-[100px]" />
    </div>
  );
}
