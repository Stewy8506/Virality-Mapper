import type { ApiKeys } from "@/types/domain";

const ENV_KEY_MAP: Record<keyof ApiKeys, string | undefined> = {
  gemini: process.env.GEMINI_API_KEY,
  openai: process.env.OPENAI_API_KEY,
  anthropic: process.env.ANTHROPIC_API_KEY,
  openrouter: process.env.OPENROUTER_API_KEY,
  ollamaUrl: process.env.OLLAMA_URL,
  lmStudioUrl: process.env.LM_STUDIO_URL,
  customBaseUrl: process.env.CUSTOM_LLM_BASE_URL,
  customApiKey: process.env.CUSTOM_LLM_API_KEY,
  serpapi: process.env.SERPAPI_KEY,
};

export function getServerConfiguredProviders(): Partial<Record<keyof ApiKeys, boolean>> {
  const configured: Partial<Record<keyof ApiKeys, boolean>> = {};
  for (const [key, envVal] of Object.entries(ENV_KEY_MAP)) {
    if (envVal && envVal.trim()) {
      configured[key as keyof ApiKeys] = true;
    }
  }
  return configured;
}

export function resolveApiKeys(clientKeys?: Partial<ApiKeys>): ApiKeys {
  return {
    gemini: ENV_KEY_MAP.gemini || clientKeys?.gemini || "",
    openai: ENV_KEY_MAP.openai || clientKeys?.openai || "",
    anthropic: ENV_KEY_MAP.anthropic || clientKeys?.anthropic || "",
    openrouter: ENV_KEY_MAP.openrouter || clientKeys?.openrouter || "",
    ollamaUrl: ENV_KEY_MAP.ollamaUrl || clientKeys?.ollamaUrl || "http://localhost:11434",
    lmStudioUrl: ENV_KEY_MAP.lmStudioUrl || clientKeys?.lmStudioUrl || "http://localhost:1234",
    customBaseUrl: ENV_KEY_MAP.customBaseUrl || clientKeys?.customBaseUrl || "",
    customApiKey: ENV_KEY_MAP.customApiKey || clientKeys?.customApiKey || "",
    serpapi: ENV_KEY_MAP.serpapi || clientKeys?.serpapi || "",
  };
}

export function stripServerConfiguredKeys(clientKeys: ApiKeys): Partial<ApiKeys> {
  const serverConfigured = getServerConfiguredProviders();
  const stripped: Partial<ApiKeys> = { ...clientKeys };
  for (const key of Object.keys(serverConfigured) as (keyof ApiKeys)[]) {
    if (serverConfigured[key]) {
      stripped[key] = "";
    }
  }
  return stripped;
}

export function agentHasRequiredKey(provider: string, keys: ApiKeys): boolean {
  switch (provider) {
    case "gemini": return !!keys.gemini;
    case "openai": return !!keys.openai;
    case "anthropic": return !!keys.anthropic;
    case "openrouter": return !!keys.openrouter;
    case "ollama": return !!keys.ollamaUrl;
    case "lmstudio": return !!keys.lmStudioUrl;
    case "custom": return !!keys.customBaseUrl;
    default: return false;
  }
}

export function validateAgentsHaveKeys(agents: { provider: string }[], keys: ApiKeys): string | null {
  for (const agent of agents) {
    if (!agentHasRequiredKey(agent.provider, keys)) {
      return `Missing API key or endpoint for ${agent.provider}. Configure it in Settings → API Connections.`;
    }
  }
  return null;
}
