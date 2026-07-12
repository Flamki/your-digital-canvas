export type GuidedProof = {
  id: string;
  title: string;
  category: string;
  summary: string;
};

const GUIDED_PROOFS: Array<GuidedProof & { signals: string[] }> = [
  {
    id: "getsolodesk",
    title: "GetSoloDesk",
    category: "Product engineering",
    summary: "A solo-built AI product taken from concept to paying users.",
    signals: ["getsolodesk", "freelancer crm", "paying users", "solo-built product"],
  },
  {
    id: "brandpilot",
    title: "BrandPilot",
    category: "Agentic AI",
    summary: "Four autonomous browser agents running on a serverless AWS stack.",
    signals: ["brandpilot", "amazon nova", "nova act", "marketing agent", "aws agent"],
  },
  {
    id: "social-sherpa",
    title: "Social Sherpa",
    category: "Agentic AI",
    summary: "An approval-safe AI agent for professional network management.",
    signals: ["social sherpa", "linkedin agent", "approval-safe", "network manager"],
  },
  {
    id: "vignaharta",
    title: "Vignaharta",
    category: "Full-stack product",
    summary: "A production real-estate platform with a custom operational CMS.",
    signals: ["vignaharta", "real estate", "custom cms", "client platform"],
  },
  {
    id: "swift",
    title: "Swift Compiler",
    category: "Compiler engineering",
    summary: "A long-standing compiler diagnostic fixed and merged upstream.",
    signals: [
      "swift compiler",
      "compiler work",
      "compiler contribution",
      "property wrapper",
      "type checker",
      "strongest compiler",
    ],
  },
  {
    id: "boa",
    title: "Boa JavaScript Engine",
    category: "Runtime engineering",
    summary: "Rust VM hardening that removed native stack-overflow crashes.",
    signals: ["boa", "javascript engine", "rust runtime", "vm runtime", "stack overflow"],
  },
  {
    id: "jenkins",
    title: "Jenkins Core & AI Plugin",
    category: "Open source",
    summary: "Core, plugin and security work across a major production ecosystem.",
    signals: ["jenkins", "utf-8 redirect", "jenkins ai", "jenkins plugin"],
  },
  {
    id: "screenpipe",
    title: "Screenpipe",
    category: "Cross-platform systems",
    summary: "Seven merged fixes spanning Rust, Tauri, Windows, Linux and CI.",
    signals: ["screenpipe", "sleep wake", "tauri", "cross-platform"],
  },
  {
    id: "nao",
    title: "Nao Labs CLI",
    category: "Developer tooling",
    summary: "AI annotations, data connectivity and release infrastructure for a YC company.",
    signals: ["nao", "yc company", "jinja", "trino", "developer tool"],
  },
  {
    id: "memory-dos",
    title: "TON Memory DoS",
    category: "Security research",
    summary: "A confirmed consensus-layer denial-of-service finding.",
    signals: ["memory dos", "telegram bug", "ton bug", "security finding", "bug bounty"],
  },
  {
    id: "amplification-dos",
    title: "TON Amplification DoS",
    category: "Security research",
    summary: "A confirmed validator RPC response-amplification finding.",
    signals: ["amplification dos", "downloadcandidate", "validator rpc", "byzantine validator"],
  },
  {
    id: "compiler-systems",
    title: "Compiler & Runtime Systems",
    category: "Systems engineering",
    summary: "The systems thread connecting compilers, runtimes and correctness.",
    signals: ["systems work", "systems engineering", "low-level work", "runtime systems"],
  },
  {
    id: "distributed-systems",
    title: "Distributed Systems",
    category: "Systems engineering",
    summary: "Consensus, recovery and failure-oriented engineering foundations.",
    signals: ["distributed systems", "raft", "write-ahead log", "consensus work"],
  },
  {
    id: "pokequest",
    title: "PokéQuest",
    category: "Earlier experiment",
    summary: "A playful digital Pokédex and battle-oriented experience.",
    signals: ["pokequest", "pokemon", "pokédex", "pokedex"],
  },
  {
    id: "sonic-weaver",
    title: "Sonic Weaver",
    category: "Earlier experiment",
    summary: "An interactive spatial-audio processing playground.",
    signals: ["sonic weaver", "spatial audio", "audio project", "4d audio", "8d audio"],
  },
  {
    id: "mood2anime",
    title: "Mood2Anime",
    category: "Earlier experiment",
    summary: "Mood-led anime and manga discovery through a visual interface.",
    signals: ["mood2anime", "anime project", "manga discovery", "mood project"],
  },
];

const BROAD_INTENTS: Array<{ signals: string[]; proofId: string }> = [
  {
    signals: ["strongest work", "strongest proof", "best project", "production product"],
    proofId: "getsolodesk",
  },
  {
    signals: ["open source work", "open-source work", "merged contribution", "upstream work"],
    proofId: "swift",
  },
  {
    signals: ["security research", "security work", "blockchain security", "ton contest"],
    proofId: "memory-dos",
  },
  {
    signals: ["ai agent work", "agentic work", "agentic ai", "ai engineer"],
    proofId: "brandpilot",
  },
];

export function findGuidedProof(text: string): GuidedProof | null {
  const normalized = normalizeText(text);
  if (!normalized) return null;

  const directMatch = GUIDED_PROOFS.find((proof) =>
    proof.signals.some((signal) => normalized.includes(normalizeSignal(signal))),
  );
  if (directMatch) return stripSignals(directMatch);

  const broadMatch = BROAD_INTENTS.find((intent) =>
    intent.signals.some((signal) => normalized.includes(normalizeSignal(signal))),
  );
  if (!broadMatch) return null;

  const proof = GUIDED_PROOFS.find((candidate) => candidate.id === broadMatch.proofId);
  return proof ? stripSignals(proof) : null;
}

function normalizeSignal(signal: string) {
  return normalizeText(signal);
}

function normalizeText(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, " ")
    .trim();
}

function stripSignals(proof: GuidedProof & { signals: string[] }) {
  return {
    id: proof.id,
    title: proof.title,
    category: proof.category,
    summary: proof.summary,
  };
}
