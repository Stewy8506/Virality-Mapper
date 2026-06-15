import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { robustJsonParse } from "@/lib/json";
import type { AdvancedParams, ApiKeys } from "@/types/domain";

export const LLM_TIMEOUT_MS = 30000;

type LLMResult = Record<string, unknown>;

function parseLLMResponse(text: string): LLMResult {
  const parsed = robustJsonParse(text);
  if (parsed.variants && Array.isArray(parsed.variants) && parsed.variants[0]) {
    return parsed.variants[0] as LLMResult;
  }
  return parsed;
}

function buildOpenAICompatibleBody(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  cleanTemp: number,
  advancedParams?: AdvancedParams,
  jsonMode = true
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: cleanTemp,
  };
  if (jsonMode) body.response_format = { type: "json_object" };
  if (advancedParams?.topP !== undefined) body.top_p = advancedParams.topP;
  if (advancedParams?.presencePenalty !== undefined) body.presence_penalty = advancedParams.presencePenalty;
  if (advancedParams?.frequencyPenalty !== undefined) body.frequency_penalty = advancedParams.frequencyPenalty;
  if (advancedParams?.seed !== undefined) body.seed = advancedParams.seed;
  if (advancedParams?.stopSequences) {
    body.stop = advancedParams.stopSequences.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return body;
}

export async function callLLM(
  provider: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  apiKeys: ApiKeys,
  advancedParams?: AdvancedParams
): Promise<LLMResult> {
  const cleanTemp = Math.max(0, Math.min(2, advancedParams?.temperature !== undefined ? advancedParams.temperature : temperature));

  switch (provider) {
    case "gemini": {
      if (!apiKeys.gemini) throw new Error("Gemini API Key is missing.");
      const ai = new GoogleGenAI({ apiKey: apiKeys.gemini });
      const config: Record<string, unknown> = {
        systemInstruction: systemPrompt,
        temperature: cleanTemp,
        responseMimeType: "application/json",
      };
      if (advancedParams?.topP !== undefined) config.topP = advancedParams.topP;
      if (advancedParams?.topK !== undefined) config.topK = advancedParams.topK;
      if (advancedParams?.stopSequences) {
        config.stopSequences = advancedParams.stopSequences.split(",").map((s) => s.trim()).filter(Boolean);
      }
      const response = await ai.models.generateContent({
        model: model || "gemini-2.5-flash",
        contents: userPrompt,
        config,
      });
      return parseLLMResponse(response.text || "{}");
    }

    case "openai": {
      if (!apiKeys.openai) throw new Error("OpenAI API Key is missing.");
      const openai = new OpenAI({ apiKey: apiKeys.openai });
      const response = await openai.chat.completions.create(
        buildOpenAICompatibleBody(model || "gpt-4o-mini", systemPrompt, userPrompt, cleanTemp, advancedParams) as unknown as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming
      );
      return parseLLMResponse(response.choices[0].message.content || "{}");
    }

    case "anthropic": {
      if (!apiKeys.anthropic) throw new Error("Anthropic API Key is missing.");
      const anthropic = new Anthropic({ apiKey: apiKeys.anthropic });
      const config: Anthropic.MessageCreateParams = {
        model: model || "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `${userPrompt}\n\nCRITICAL: Respond with a raw, valid JSON object matching the format. Do not wrap in markdown backticks, and do not add conversational preamble.`,
        }],
        temperature: Math.min(1, cleanTemp),
      };
      if (advancedParams?.topP !== undefined) config.top_p = advancedParams.topP;
      if (advancedParams?.stopSequences) {
        config.stop_sequences = advancedParams.stopSequences.split(",").map((s) => s.trim()).filter(Boolean);
      }
      const response = await anthropic.messages.create(config);
      const block = response.content[0];
      const text = block && block.type === "text" ? block.text : "";
      return parseLLMResponse(text);
    }

    case "openrouter": {
      if (!apiKeys.openrouter) throw new Error("OpenRouter API Key is missing.");
      const openai = new OpenAI({ apiKey: apiKeys.openrouter, baseURL: "https://openrouter.ai/api/v1" });
      const response = await openai.chat.completions.create(
        buildOpenAICompatibleBody(model || "meta-llama/llama-3-8b-instruct:free", systemPrompt, userPrompt, cleanTemp, advancedParams) as unknown as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming
      );
      return parseLLMResponse(response.choices[0].message.content || "{}");
    }

    case "ollama":
    case "lmstudio":
    case "custom": {
      const baseURLs: Record<string, string> = {
        ollama: `${apiKeys.ollamaUrl || "http://localhost:11434"}/v1`,
        lmstudio: `${apiKeys.lmStudioUrl || "http://localhost:1234"}/v1`,
        custom: apiKeys.customBaseUrl,
      };
      const defaultModels: Record<string, string> = {
        ollama: "llama3",
        lmstudio: "model-identifier",
        custom: "custom-model",
      };
      const apiKeyMap: Record<string, string> = {
        ollama: "ollama",
        lmstudio: "lmstudio",
        custom: apiKeys.customApiKey || "custom",
      };
      if (provider === "custom" && !apiKeys.customBaseUrl) throw new Error("Custom OpenAI endpoint URL is missing.");
      const openai = new OpenAI({ apiKey: apiKeyMap[provider], baseURL: baseURLs[provider] });
      const body = buildOpenAICompatibleBody(
        model || defaultModels[provider],
        systemPrompt,
        `${userPrompt}\n\nCRITICAL: Respond with a raw, valid JSON object matching the format. Do not wrap in markdown backticks, and do not add conversational preamble.`,
        cleanTemp,
        advancedParams,
        false
      );
      const response = await openai.chat.completions.create(body as unknown as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming);
      return parseLLMResponse(response.choices[0].message.content || "{}");
    }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export async function callLLMWithRetry(
  provider: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  apiKeys: ApiKeys,
  agentName: string,
  onActivity: (message: string, type?: "info" | "warning" | "success") => void,
  maxRetries = 3,
  advancedParams?: AdvancedParams
): Promise<LLMResult> {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    let timerId: NodeJS.Timeout | null = null;
    try {
      onActivity(`[${agentName}] Contacting model... (Attempt ${attempt}/${maxRetries})`, "info");
      const startTime = Date.now();
      const timeoutPromise = new Promise<never>((_, reject) => {
        timerId = setTimeout(() => reject(new Error(`Request timed out after ${LLM_TIMEOUT_MS / 1000} seconds`)), LLM_TIMEOUT_MS);
      });
      const result = await Promise.race([
        callLLM(provider, model, systemPrompt, userPrompt, temperature, apiKeys, advancedParams),
        timeoutPromise,
      ]);
      if (timerId) clearTimeout(timerId);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      onActivity(`[${agentName}] Completed successfully in ${duration}s.`, "success");
      return result;
    } catch (err: unknown) {
      if (timerId) clearTimeout(timerId);
      const errObj = err as { status?: number; message?: string };
      const isRateLimit = errObj.status === 429 || errObj.message?.includes("429") || errObj.message?.includes("Rate limit") || errObj.message?.includes("quota") || errObj.message?.includes("exhausted");
      const warningMsg = `[${agentName}] Call failed: ${isRateLimit ? "Rate limit / Quota exceeded" : errObj.message || String(err)}`;
      if (attempt >= maxRetries) {
        onActivity(`[${agentName}] Max retries reached. Generation will abort/fallback.`, "warning");
        throw err;
      }
      const delay = isRateLimit ? 5000 * attempt : 1500 * attempt;
      onActivity(`${warningMsg}. Retrying in ${(delay / 1000).toFixed(0)}s...`, "warning");
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error(`[${agentName}] Max retries exceeded`);
}
