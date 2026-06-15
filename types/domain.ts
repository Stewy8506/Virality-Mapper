export interface Agent {
  id: string;
  name: string;
  provider: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  enabled: boolean;
}

export interface ApiKeys {
  gemini: string;
  openai: string;
  anthropic: string;
  openrouter: string;
  ollamaUrl: string;
  lmStudioUrl: string;
  customBaseUrl: string;
  customApiKey: string;
  serpapi: string;
}

export interface UserPreferences {
  linkedinName: string;
  linkedinHeadline: string;
  linkedinAvatar: string;
  layoutDensity: "compact" | "cozy" | "spacious";
  sidebarPosition: "left" | "right";
  autoCopyToClipboard: boolean;
  defaultHookArchetype: string;
  fontSize: number;
  enableRAG: boolean;
  customFontUrl?: string;
  customFontFamily?: string;
}

export interface CustomModel {
  id: string;
  name: string;
  provider: string;
  contextLength?: number;
  maxOutputTokens?: number;
}

export interface CustomMetric {
  id: string;
  name: string;
  weight: number;
  scoringInstructions: string;
}

export interface CustomPersona {
  id: string;
  name: string;
  avatar: string;
  description: string;
  commentRatio: number;
}

export interface CrawlerConfig {
  enginePriority: string[];
  targetYear: number;
  serpapiEnabled: boolean;
}

export interface AdvancedParams {
  temperature: number;
  topP: number;
  topK: number;
  presencePenalty: number;
  frequencyPenalty: number;
  seed: number;
  stopSequences: string;
}

export interface MasterConfig {
  version: number;
  apiKeys: ApiKeys;
  preferences: UserPreferences & {
    theme: string;
    font: string;
    showTransitions: boolean;
  };
  agents: Agent[];
  customModels: CustomModel[];
  customMetrics: CustomMetric[];
  customPersonas: CustomPersona[];
  crawlerConfig: CrawlerConfig;
  advancedParams: AdvancedParams;
}

export interface GenerationResult {
  trends: string[];
  initialDrafts: Array<{
    name: string;
    content: string;
    hookExplanation: string;
    provider: string;
    model: string;
  }>;
  critiques: Array<{
    from: string;
    to: string;
    content: string;
    score: number;
  }>;
  refinedDrafts: Array<{
    name: string;
    content: string;
    score: number;
    argument: string;
    provider: string;
    model: string;
  }>;
  best: {
    style: string;
    content: string;
    scores?: Record<string, number>;
    score?: number;
    critique: string;
    personas?: Array<{
      name: string;
      avatar: string;
      feedback: string;
      scrollStopping: number;
      engagement: number;
      virality: number;
    }>;
  };
}

export interface GenerationCompletePayload extends GenerationResult {
  appName?: string;
  description?: string;
  targetAudience?: string;
  tone?: string;
}

export interface ArchivedPost {
  id: string;
  timestamp: string;
  appName: string;
  description: string;
  targetAudience: string;
  tone: string;
  result: GenerationResult;
  performance?: {
    impressions: number;
    likes: number;
    comments: number;
  };
}

export interface StreamEventData {
  message?: string;
  type?: "info" | "warning" | "success";
  name?: string;
  content?: string;
  hookExplanation?: string;
  provider?: string;
  model?: string;
  from?: string;
  to?: string;
  score?: number;
  argument?: string;
  best?: GenerationResult["best"];
}

export interface EnrichedSuccessTemplate {
  content: string;
  niche: string;
  metrics: { likes: number; comments: number; reposts: number };
  structure: { hook: string; body: string; cta: string; metaphor: string };
}

export type ActivityType = "info" | "warning" | "success";

export interface ActivityLog {
  id: string;
  time: string;
  text: string;
  type: ActivityType;
}
