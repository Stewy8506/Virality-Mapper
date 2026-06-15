import type { Agent, ApiKeys, AdvancedParams, CrawlerConfig, CustomMetric, CustomModel, CustomPersona, MasterConfig, UserPreferences } from "@/types/domain";

export const DEFAULT_KEYS: ApiKeys = {
  gemini: "",
  openai: "",
  anthropic: "",
  openrouter: "",
  ollamaUrl: "http://localhost:11434",
  lmStudioUrl: "http://localhost:1234",
  customBaseUrl: "",
  customApiKey: "",
  serpapi: "",
};

export const DEFAULT_CUSTOM_MODELS: CustomModel[] = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "gemini", contextLength: 1048576, maxOutputTokens: 8192 },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", contextLength: 128000, maxOutputTokens: 16384 },
  { id: "claude-3-5-haiku-latest", name: "Claude 3.5 Haiku", provider: "anthropic", contextLength: 200000, maxOutputTokens: 8192 },
];

export const DEFAULT_CUSTOM_METRICS: CustomMetric[] = [
  { id: "hookStrength", name: "Hook Strength", weight: 25, scoringInstructions: "Evaluate the hook's ability to stop the scroll, disrupt pattern, and appeal to the target audience. Output score 0-100." },
  { id: "readability", name: "Readability", weight: 25, scoringInstructions: "Evaluate formatting, line spacing, sentence structure, and clarity for mobile scrolling. Output score 0-100." },
  { id: "credibility", name: "Credibility", weight: 25, scoringInstructions: "Evaluate the authority, actions, real metrics bridging, and trust factor. Output score 0-100." },
  { id: "viralPotential", name: "Viral Potential", weight: 25, scoringInstructions: "Evaluate shareability, commentary triggers, polar hot take relevance, and CTA effectiveness. Output score 0-100." },
];

export const DEFAULT_CUSTOM_PERSONAS: CustomPersona[] = [
  { id: "cto", name: "Skeptical CTO", avatar: "🛡️", description: "Values deep architecture details, concrete benchmarks, security integrity, and zero cloud-lockout egress.", commentRatio: 40 },
  { id: "solopreneur", name: "Hustling Solopreneur", avatar: "⚡", description: "Values speed to build, automation efficiency, direct revenue/business growth, and simple tooling.", commentRatio: 75 },
  { id: "vc", name: "Metrics-Driven VC", avatar: "📈", description: "Values market size disruption, high product velocity metrics, team scale, and competitive moats.", commentRatio: 30 },
  { id: "devadvocate", name: "Developer Advocate", avatar: "💡", description: "Values great developer experience (DX), open-source accessibility, local-first setups, and clear templates.", commentRatio: 60 },
];

export const DEFAULT_CRAWLER_CONFIG: CrawlerConfig = {
  enginePriority: ["yahoo", "duckduckgo_lite", "duckduckgo_html"],
  targetYear: new Date().getFullYear(),
  serpapiEnabled: true,
};

export const DEFAULT_ADVANCED_PARAMS: AdvancedParams = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  presencePenalty: 0.0,
  frequencyPenalty: 0.0,
  seed: 42,
  stopSequences: "",
};

export const DEFAULT_AGENTS: Agent[] = [
  {
    id: "agent-alpha",
    name: "Agent Alpha (Hook & Structure)",
    provider: "gemini",
    model: "gemini-2.5-flash",
    systemPrompt: "You are Agent Alpha, a LinkedIn growth expert specializing in scroll-stopping pattern-interrupt hooks, crisp visual spacing, compelling readability formatting, and polarizing engagement triggers. Your goal is to maximize CTR. Always end the post EXACTLY with a hot take formatted as: 'Hot take: [Controversial opinion relevant to project]. Agree or disagree?'. DO NOT use marketing fluff like 'digital abyss'. Start EXACTLY mid-thought with relatable fears of the target audience. Keep the total post under 1200 characters.",
    temperature: 0.8,
    enabled: true,
  },
  {
    id: "agent-beta",
    name: "Agent Beta (Analytical & Metrics)",
    provider: "openai",
    model: "gpt-4o-mini",
    systemPrompt: "You are Agent Beta, a LinkedIn strategist specializing in actionable frameworks, checklist delivery, bold numbers, and direct step-by-step value. Avoid corporate fluff. CRITICAL: Use emoji bullets for all line-by-line breakdowns/feature presentations to draw attention to them. Do not write long product spec sheets or abstract filler. Use 'We built' instead of 'I built'. Use hardcoded/verifiable benchmarks from the description and MUST include a bridging sentence before the metrics. Anchor claims with a clear visual proof placeholder callout. DO NOT use marketing phrases like 'game-changer'. Keep the total post under 1200 characters.",
    temperature: 0.3,
    enabled: true,
  },
  {
    id: "agent-gamma",
    name: "Agent Gamma (Narrative & Story)",
    provider: "gemini",
    model: "gemini-2.5-flash",
    systemPrompt: "You are Agent Gamma, a personal branding ghostwriter specializing in the hero's journey, authenticity, lessons learned, and vulnerability. Your goal is to build organic trust. Ground stories in real professional friction and daily pain. Talk directly to the audience, NOT like a marketer. Do not use phrases like 'digital abyss'. Use 'We built' instead of 'I built' to imply team credibility. Ban abstract filler. Keep the total post under 1200 characters so the best content isn't buried past the 'see more' fold.",
    temperature: 0.85,
    enabled: true,
  },
];

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  linkedinName: "AI Copywriter Agent Network",
  linkedinHeadline: "Synthesized via Virality Settle Engine",
  linkedinAvatar: "💡",
  layoutDensity: "cozy",
  sidebarPosition: "left",
  autoCopyToClipboard: false,
  defaultHookArchetype: "organic",
  fontSize: 14,
  enableRAG: true,
};

export function buildMasterConfig(
  legacyKeys: ApiKeys = DEFAULT_KEYS,
  legacyPrefs: UserPreferences = DEFAULT_USER_PREFERENCES,
  legacyAgents: Agent[] = DEFAULT_AGENTS
): MasterConfig {
  return {
    version: 1,
    apiKeys: legacyKeys,
    preferences: {
      ...legacyPrefs,
      theme: typeof window !== "undefined" ? localStorage.getItem("theme") || "obsidian" : "obsidian",
      font: typeof window !== "undefined" ? localStorage.getItem("font") || "geist" : "geist",
      showTransitions: true,
    },
    agents: legacyAgents,
    customModels: DEFAULT_CUSTOM_MODELS,
    customMetrics: DEFAULT_CUSTOM_METRICS,
    customPersonas: DEFAULT_CUSTOM_PERSONAS,
    crawlerConfig: DEFAULT_CRAWLER_CONFIG,
    advancedParams: DEFAULT_ADVANCED_PARAMS,
  };
}

export function getActiveAgents(agents: Agent[]): Agent[] {
  return agents.filter((a) => a.enabled).slice(0, 3);
}

export const ARCHIVE_MAX_ITEMS = 50;
