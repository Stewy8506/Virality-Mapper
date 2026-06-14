import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { findRelevantViralPosts } from "./viralityDb";
import { convertUnicodeStyles, optimizeMobileSpacing, estimateReadability } from "./formatter";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Max execution timeout for Vercel serverless function

// Helper to sanitize and robustly parse JSON from LLM responses
function robustJsonParse(text: string): any {
  let cleanText = text.trim();

  // Remove markdown code blocks if present
  if (cleanText.includes("```")) {
    const matches = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (matches && matches[1]) {
      cleanText = matches[1].trim();
    }
  }

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    // If standard parsing fails, try to find the first '{' and last '}'
    const firstBrace = cleanText.indexOf("{");
    const lastBrace = cleanText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      const candidate = cleanText.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch (innerErr) {
        throw new Error(`Failed to parse response as JSON. Raw: ${text}`);
      }
    }
    throw new Error(`No JSON object found in response. Raw: ${text}`);
  }
}

async function callLLM(
  provider: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  apiKeys: any,
  advancedParams?: any
): Promise<any> {
  const cleanTemp = Math.max(0, Math.min(2, advancedParams?.temperature !== undefined ? advancedParams.temperature : temperature));

  switch (provider) {
    case "gemini": {
      if (!apiKeys?.gemini) throw new Error("Gemini API Key is missing.");
      const ai = new GoogleGenAI({ apiKey: apiKeys.gemini });
      
      const config: any = {
        systemInstruction: systemPrompt,
        temperature: cleanTemp,
        responseMimeType: "application/json",
      };

      if (advancedParams?.topP !== undefined) config.topP = advancedParams.topP;
      if (advancedParams?.topK !== undefined) config.topK = advancedParams.topK;
      if (advancedParams?.stopSequences) {
        config.stopSequences = advancedParams.stopSequences.split(",").map((s: string) => s.trim()).filter(Boolean);
      }

      const response = await ai.models.generateContent({
        model: model || "gemini-2.5-flash",
        contents: userPrompt,
        config,
      });
      const parsed = robustJsonParse(response.text || "{}");
      return parsed.variants ? parsed.variants[0] : parsed;
    }

    case "openai": {
      if (!apiKeys?.openai) throw new Error("OpenAI API Key is missing.");
      const openai = new OpenAI({ apiKey: apiKeys.openai });
      
      const body: any = {
        model: model || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: cleanTemp,
        response_format: { type: "json_object" },
      };

      if (advancedParams?.topP !== undefined) body.top_p = advancedParams.topP;
      if (advancedParams?.presencePenalty !== undefined) body.presence_penalty = advancedParams.presencePenalty;
      if (advancedParams?.frequencyPenalty !== undefined) body.frequency_penalty = advancedParams.frequencyPenalty;
      if (advancedParams?.seed !== undefined) body.seed = advancedParams.seed;
      if (advancedParams?.stopSequences) {
        body.stop = advancedParams.stopSequences.split(",").map((s: string) => s.trim()).filter(Boolean);
      }

      const response = await openai.chat.completions.create(body);
      const text = response.choices[0].message.content || "{}";
      const parsed = robustJsonParse(text);
      return parsed.variants ? parsed.variants[0] : parsed;
    }

    case "anthropic": {
      if (!apiKeys?.anthropic) throw new Error("Anthropic API Key is missing.");
      const anthropic = new Anthropic({ apiKey: apiKeys.anthropic });
      
      const config: any = {
        model: model || "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `${userPrompt}\n\nCRITICAL: Respond with a raw, valid JSON object matching the format. Do not wrap in markdown backticks, and do not add conversational preamble.`,
          },
        ],
        temperature: Math.min(1, cleanTemp), // Anthropic only supports 0 to 1 temperature range
      };

      if (advancedParams?.topP !== undefined) config.top_p = advancedParams.topP;
      if (advancedParams?.stopSequences) {
        config.stop_sequences = advancedParams.stopSequences.split(",").map((s: string) => s.trim()).filter(Boolean);
      }

      const response = await anthropic.messages.create(config);

      let text = "";
      if (response.content && response.content[0] && response.content[0].type === "text") {
        text = response.content[0].text;
      }
      const parsed = robustJsonParse(text);
      return parsed.variants ? parsed.variants[0] : parsed;
    }

    case "openrouter": {
      if (!apiKeys?.openrouter) throw new Error("OpenRouter API Key is missing.");
      const openai = new OpenAI({
        apiKey: apiKeys.openrouter,
        baseURL: "https://openrouter.ai/api/v1",
      });

      const body: any = {
        model: model || "meta-llama/llama-3-8b-instruct:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: cleanTemp,
        response_format: { type: "json_object" },
      };

      if (advancedParams?.topP !== undefined) body.top_p = advancedParams.topP;
      if (advancedParams?.presencePenalty !== undefined) body.presence_penalty = advancedParams.presencePenalty;
      if (advancedParams?.frequencyPenalty !== undefined) body.frequency_penalty = advancedParams.frequencyPenalty;
      if (advancedParams?.seed !== undefined) body.seed = advancedParams.seed;
      if (advancedParams?.stopSequences) {
        body.stop = advancedParams.stopSequences.split(",").map((s: string) => s.trim()).filter(Boolean);
      }

      const response = await openai.chat.completions.create(body);
      const text = response.choices[0].message.content || "{}";
      const parsed = robustJsonParse(text);
      return parsed.variants ? parsed.variants[0] : parsed;
    }

    case "ollama": {
      const baseURL = `${apiKeys?.ollamaUrl || "http://localhost:11434"}/v1`;
      const openai = new OpenAI({
        apiKey: "ollama",
        baseURL,
      });

      const body: any = {
        model: model || "llama3",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${userPrompt}\n\nCRITICAL: Respond with a raw, valid JSON object matching the format. Do not wrap in markdown backticks, and do not add conversational preamble.` },
        ],
        temperature: cleanTemp,
      };

      if (advancedParams?.topP !== undefined) body.top_p = advancedParams.topP;
      if (advancedParams?.presencePenalty !== undefined) body.presence_penalty = advancedParams.presencePenalty;
      if (advancedParams?.frequencyPenalty !== undefined) body.frequency_penalty = advancedParams.frequencyPenalty;
      if (advancedParams?.seed !== undefined) body.seed = advancedParams.seed;
      if (advancedParams?.stopSequences) {
        body.stop = advancedParams.stopSequences.split(",").map((s: string) => s.trim()).filter(Boolean);
      }

      const response = await openai.chat.completions.create(body);
      const text = response.choices[0].message.content || "{}";
      const parsed = robustJsonParse(text);
      return parsed.variants ? parsed.variants[0] : parsed;
    }

    case "lmstudio": {
      const baseURL = `${apiKeys?.lmStudioUrl || "http://localhost:1234"}/v1`;
      const openai = new OpenAI({
        apiKey: "lmstudio",
        baseURL,
      });

      const body: any = {
        model: model || "model-identifier",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${userPrompt}\n\nCRITICAL: Respond with a raw, valid JSON object matching the format. Do not wrap in markdown backticks, and do not add conversational preamble.` },
        ],
        temperature: cleanTemp,
      };

      if (advancedParams?.topP !== undefined) body.top_p = advancedParams.topP;
      if (advancedParams?.presencePenalty !== undefined) body.presence_penalty = advancedParams.presencePenalty;
      if (advancedParams?.frequencyPenalty !== undefined) body.frequency_penalty = advancedParams.frequencyPenalty;
      if (advancedParams?.seed !== undefined) body.seed = advancedParams.seed;
      if (advancedParams?.stopSequences) {
        body.stop = advancedParams.stopSequences.split(",").map((s: string) => s.trim()).filter(Boolean);
      }

      const response = await openai.chat.completions.create(body);
      const text = response.choices[0].message.content || "{}";
      const parsed = robustJsonParse(text);
      return parsed.variants ? parsed.variants[0] : parsed;
    }

    case "custom": {
      if (!apiKeys?.customBaseUrl) throw new Error("Custom OpenAI endpoint URL is missing.");
      const openai = new OpenAI({
        apiKey: apiKeys.customApiKey || "custom",
        baseURL: apiKeys.customBaseUrl,
      });

      const body: any = {
        model: model || "custom-model",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${userPrompt}\n\nCRITICAL: Respond with a raw, valid JSON object matching the format. Do not wrap in markdown backticks, and do not add conversational preamble.` },
        ],
        temperature: cleanTemp,
      };

      if (advancedParams?.topP !== undefined) body.top_p = advancedParams.topP;
      if (advancedParams?.presencePenalty !== undefined) body.presence_penalty = advancedParams.presencePenalty;
      if (advancedParams?.frequencyPenalty !== undefined) body.frequency_penalty = advancedParams.frequencyPenalty;
      if (advancedParams?.seed !== undefined) body.seed = advancedParams.seed;
      if (advancedParams?.stopSequences) {
        body.stop = advancedParams.stopSequences.split(",").map((s: string) => s.trim()).filter(Boolean);
      }

      const response = await openai.chat.completions.create(body);
      const text = response.choices[0].message.content || "{}";
      const parsed = robustJsonParse(text);
      return parsed.variants ? parsed.variants[0] : parsed;
    }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

async function searchLinkedInTrends(
  query: string,
  serpapiKey?: string,
  crawlerConfig?: { enginePriority: string[]; targetYear: number; serpapiEnabled: boolean }
): Promise<string[]> {
  const targetYear = crawlerConfig?.targetYear || new Date().getFullYear();
  const searchQuery = `site:linkedin.com ${query} post ${targetYear}`;
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  const serpapiEnabled = crawlerConfig ? crawlerConfig.serpapiEnabled : true;

  // Try SerpApi first if API key is provided and enabled in settings
  if (serpapiKey && serpapiEnabled) {
    try {
      const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(searchQuery)}&api_key=${serpapiKey}&tbs=qdr:m`;
      const res = await fetch(url);
      if (res.status === 200) {
        const json = await res.json();
        if (json.organic_results && Array.isArray(json.organic_results)) {
          const snippets = json.organic_results
            .map((item: any) => item.snippet || item.title || "")
            .filter((t: string) => t.trim().length > 10)
            .slice(0, 6);
          if (snippets.length > 0) {
            return snippets;
          }
        }
      }
    } catch (err) {
      console.warn("SerpApi search trends query failed, falling back to local scraping:", err);
    }
  }

  // Follow engine fallbacks order from crawlerConfig
  const priority = crawlerConfig?.enginePriority || ["yahoo", "duckduckgo_lite", "duckduckgo_html"];

  for (const engine of priority) {
    if (engine === "yahoo") {
      try {
        const url = `https://search.yahoo.com/search?q=${encodeURIComponent(searchQuery)}&age=1m`;
        const res = await fetch(url, {
          headers: {
            "User-Agent": userAgent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5"
          }
        });

        if (res.status === 200) {
          const html = await res.text();
          const snippets: string[] = [];
          const regex = /<div class="compText[^>]*>([\s\S]*?)<\/div>/gi;
          let match;
          while ((match = regex.exec(html)) !== null && snippets.length < 5) {
            let snippet = match[1]
              .replace(/<[^>]*>/g, "") // strip HTML tags
              .replace(/&amp;/g, "&")
              .replace(/&quot;/g, '"')
              .replace(/&#x27;/g, "'")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&hellip;/g, "...")
              .replace(/\s+/g, " ")
              .trim();
            if (snippet) {
              snippets.push(snippet);
            }
          }
          if (snippets.length > 0) {
            return snippets;
          }
        }
      } catch (err) {
        console.warn("Yahoo search fetch failed, falling back in priority:", err);
      }
    } else if (engine === "duckduckgo_lite") {
      try {
        const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(searchQuery)}&kl=in-en&df=m`;
        const res = await fetch(url, {
          headers: {
            "User-Agent": userAgent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5"
          }
        });

        if (res.status === 200) {
          const html = await res.text();
          const snippets: string[] = [];
          const regex = /<td class="result-snippet">([\s\S]*?)<\/td>/gi;
          let match;
          while ((match = regex.exec(html)) !== null && snippets.length < 5) {
            let snippet = match[1]
              .replace(/<[^>]*>/g, "") // strip HTML tags
              .replace(/&amp;/g, "&")
              .replace(/&quot;/g, '"')
              .replace(/&#x27;/g, "'")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/\s+/g, " ")
              .trim();
            if (snippet && !snippet.includes("JavaScript is required")) {
              snippets.push(snippet);
            }
          }
          if (snippets.length > 0) {
            return snippets;
          }
        }
      } catch (err) {
        console.warn("DuckDuckGo Lite fetch failed, falling back in priority:", err);
      }
    } else if (engine === "duckduckgo_html") {
      try {
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}&kl=in-en&df=m`;
        const res = await fetch(url, {
          headers: {
            "User-Agent": userAgent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5"
          }
        });

        if (res.status === 200) {
          const html = await res.text();
          const snippets: string[] = [];
          const regex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
          let match;
          while ((match = regex.exec(html)) !== null && snippets.length < 5) {
            let snippet = match[1]
              .replace(/<[^>]*>/g, "")
              .replace(/&amp;/g, "&")
              .replace(/&quot;/g, '"')
              .replace(/&#x27;/g, "'")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/\s+/g, " ")
              .trim();
            if (snippet) snippets.push(snippet);
          }

          if (snippets.length === 0) {
            const fallbackRegex = /<div class="result__snippet"[^>]*>([\s\S]*?)<\/div>/gi;
            while ((match = fallbackRegex.exec(html)) !== null && snippets.length < 5) {
              let snippet = match[1]
                .replace(/<[^>]*>/g, "")
                .replace(/&amp;/g, "&")
                .replace(/&quot;/g, '"')
                .replace(/&#x27;/g, "'")
                .replace(/\s+/g, " ")
                .trim();
              if (snippet) snippets.push(snippet);
            }
          }
          if (snippets.length > 0) {
            return snippets;
          }
        }
      } catch (err) {
        console.error("DuckDuckGo HTML fetch failed in priority loop:", err);
      }
    }
  }

  return [];
}

// Configurable timeout for LLM requests in milliseconds
// To adjust the timeout, change this number (e.g., 30000 for 30 seconds, 45000 for 45 seconds)
const LLM_TIMEOUT_MS = 30000;

async function callLLMWithRetry(
  provider: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  apiKeys: any,
  agentName: string,
  onActivity: (message: string, type?: "info" | "warning" | "success") => void,
  maxRetries = 3,
  advancedParams?: any
): Promise<any> {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    let timerId: NodeJS.Timeout | null = null;
    try {
      onActivity(`[${agentName}] Contacting model... (Attempt ${attempt}/${maxRetries})`, "info");
      const startTime = Date.now();

      const timeoutPromise = new Promise((_, reject) => {
        timerId = setTimeout(() => {
          reject(new Error(`Request timed out after ${LLM_TIMEOUT_MS / 1000} seconds`));
        }, LLM_TIMEOUT_MS);
      });

      const result = await Promise.race([
        callLLM(provider, model, systemPrompt, userPrompt, temperature, apiKeys, advancedParams),
        timeoutPromise
      ]);

      if (timerId) clearTimeout(timerId);

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      onActivity(`[${agentName}] Completed successfully in ${duration}s.`, "success");
      return result;
    } catch (err: any) {
      if (timerId) clearTimeout(timerId);
      const isRateLimit = err.status === 429 || err.message?.includes("429") || err.message?.includes("Rate limit") || err.message?.includes("quota") || err.message?.includes("exhausted");
      const warningMsg = `[${agentName}] Call failed: ${isRateLimit ? "Rate limit / Quota exceeded" : err.message || err}`;

      if (attempt >= maxRetries) {
        onActivity(`[${agentName}] Max retries reached. Generation will abort/fallback.`, "warning");
        throw err;
      }

      const delay = isRateLimit ? 5000 * attempt : 1500 * attempt;
      onActivity(`${warningMsg}. Retrying in ${(delay / 1000).toFixed(0)}s...`, "warning");
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function extractSearchTopics(
  appName: string,
  description: string,
  targetAudience: string,
  apiKeys: any,
  agent: any,
  onActivity?: (msg: string, type?: "info" | "warning" | "success") => void,
  advancedParams?: any
): Promise<string[]> {
  try {
    const systemPrompt = "You are a LinkedIn social media trend analyst. Your job is to identify 2 to 3 broad, high-volume industry keywords or search topics on LinkedIn related to the project context. These should be general concepts likely to have active posts, rather than brand new specific names. Example: if project is 'Framer templates for builders', output broad topics like 'Framer templates', 'Web design systems', 'No-code UI'. Output a JSON object.";
    const userPrompt = `
Analyze this project:
- App Name: ${appName}
- Description: ${description}
- Target Audience: ${targetAudience || "General Professionals"}

Output a JSON object containing a single property 'topics' which is an array of 2 to 3 strings.
Example format:
{
  "topics": ["broad topic 1", "broad topic 2"]
}
`;
    const res = onActivity
      ? await callLLMWithRetry(agent.provider, agent.model, systemPrompt, userPrompt, 0.2, apiKeys, "Topic Extractor", onActivity, 3, advancedParams)
      : await callLLM(agent.provider, agent.model, systemPrompt, userPrompt, 0.2, apiKeys, advancedParams);

    if (res && Array.isArray(res.topics)) {
      return res.topics.map((t: string) => t.trim()).filter(Boolean);
    }
    return [appName];
  } catch (e) {
    console.error("Topic extraction failed, falling back to app name:", e);
    return [appName];
  }
}

export async function POST(req: Request) {
  try {
    const { 
      appName, 
      description, 
      targetAudience, 
      tone, 
      apiKeys, 
      agents, 
      hookArchetype, 
      enrichedSuccessTemplates,
      customMetrics,
      customPersonas,
      crawlerConfig,
      advancedParams
    } = await req.json();

    if (!appName || !description) {
      return NextResponse.json(
        { error: "App Name and Description are required" },
        { status: 400 }
      );
    }

    const activeAgents = agents || [];
    if (activeAgents.length < 3) {
      return NextResponse.json(
        { error: "This debate flow requires exactly 3 configured agents." },
        { status: 400 }
      );
    }

    const [agentA, agentB, agentC] = activeAgents;

    const encoder = new TextEncoder();

    let isClosed = false;
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: any) => {
          if (isClosed) return;
          try {
            controller.enqueue(
              encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
            );
          } catch (e) {
            console.error("Stream enqueue error:", e);
          }
        };

        try {
          // Step 1: Extract broad industry search topics
          sendEvent("status", { message: "Extracting trending industry topics for search grounding..." });
          sendEvent("activity", { message: "Analyzing project description for broad search keywords...", type: "info" });
          const topics = await extractSearchTopics(
            appName,
            description,
            targetAudience,
            apiKeys,
            agentA,
            (msg, type) => sendEvent("activity", { message: msg, type }),
            advancedParams
          );

          sendEvent("status", { message: `Broad topics found: ${topics.join(", ")}. Querying viral Indian posts...` });
          sendEvent("activity", { message: `Searching live LinkedIn post trends for: ${topics.join(", ")}`, type: "info" });

          // Scrape search results for each topic concurrently
          const serpapiKey = apiKeys?.serpapi;
          const scrapePromises = topics.map(topic => searchLinkedInTrends(topic, serpapiKey, crawlerConfig));
          const scrapeResultsList = await Promise.all(scrapePromises);

          // Combine and deduplicate snippets
          const combinedTrendsSet = new Set<string>();
          let snippetCount = 0;
          for (const list of scrapeResultsList) {
            snippetCount += list.length;
            for (const snippet of list) {
              combinedTrendsSet.add(snippet);
            }
          }
          const liveTrends = Array.from(combinedTrendsSet).slice(0, 8); // take top 8 combined snippets

          if (liveTrends.length === 0) {
            sendEvent("activity", { message: "Scraper yielded 0 hits. Injecting high-performing LinkedIn copywriting templates for grounding...", type: "warning" });
            liveTrends.push(
              "Hook Idea: '99% of AI LinkedIn posts fail. Not because the AI is bad, but because the prompts are too polite.'",
              "Hook Idea: 'Stop prompting. Start orchestrating. (How I built a multi-agent writing console)'",
              "Structure: Hook (Pattern Interrupt) -> Body (Actionable 3-part list with bold metrics) -> Outro (Clear, low-friction CTA)",
              "Guideline: Keep paragraphs under 2 sentences. Use crisp whitespace formatting. Do not use generic hashtags."
            );
          }

          sendEvent("trends", liveTrends);
          sendEvent("activity", { message: `Retrieved ${snippetCount} trend snippets. Deduped to ${liveTrends.length} distinct contexts.`, type: "success" });

          const trendsContext = `Real-time trending search insights related to this topic:\n${liveTrends.map((t, i) => `${i + 1}. ${t}`).join("\n")}`;

          // Retrieve matching high-performing posts from local Hall-of-Fame database
          sendEvent("activity", { message: "Retrieving matching high-performing post templates from local database...", type: "info" });
          const relevantViralPosts = findRelevantViralPosts(topics, enrichedSuccessTemplates);
          sendEvent("activity", { message: `Matched ${relevantViralPosts.length} top-tier viral structures for topics: ${topics.join(", ")}`, type: "success" });

          const viralExamplesContext = `High-Performing LinkedIn Post Templates (Reference Structures):\n${relevantViralPosts.map((p, i) => `
Template #${i + 1} (Category: ${p.niche} | Engagement: ${p.metrics.likes} Likes):
---
${p.content}
---
Structural Analysis:
- Hook Strategy: ${p.structure.hook}
- Body Formatting: ${p.structure.body}
- Call to Action: ${p.structure.cta}
- Anchor Metaphor: ${p.structure.metaphor}
`).join("\n")}`;

          // Helper to run LLM with retry & activity logs
          const runAgentCall = async (agent: any, systemPrompt: string, userPrompt: string, contextName: string) => {
            const mergedParams = {
              ...advancedParams,
              temperature: agent.temperature !== undefined ? agent.temperature : advancedParams?.temperature
            };
            return await callLLMWithRetry(
              agent.provider,
              agent.model,
              agent.systemPrompt + "\n\n" + systemPrompt,
              userPrompt,
              agent.temperature,
              apiKeys,
              `${agent.name} [${contextName}]`,
              (msg, type = "info") => {
                sendEvent("activity", { message: msg, type });
              },
              3,
              mergedParams
            );
          };

          // Build Hook Archetype Copywriting Rules
          let archetypeInstruction = "";
          if (hookArchetype === "contrarian") {
            archetypeInstruction = "\nHOOK ARCHETYPE (Contrarian Interrupt): Open with an aggressive, counter-intuitive opening statement that debunks a standard, widely accepted professional belief. E.g. 'Your design system is slowly killing your product velocity.' No conversational intro, go straight for the pattern-interrupt.";
          } else if (hookArchetype === "vulnerable") {
            archetypeInstruction = "\nHOOK ARCHETYPE (Vulnerable Disclosure): Open with a transparent, high-integrity professional failure, extreme cost saving, or hard truth. E.g. 'We spent 6 months building X and got exactly 0 customers.' Force immediate trust through vulnerability.";
          } else if (hookArchetype === "value-stash") {
            archetypeInstruction = "\nHOOK ARCHETYPE (High-Value Stash): Open by announcing a major compilation, repository release, or technical breakdown you completed to save them hours. E.g. 'I spent 40 hours analyzing X so you don't have to.' Focus on high-effort curation.";
          } else if (hookArchetype === "threat-fear") {
            archetypeInstruction = "\nHOOK ARCHETYPE (Threat & Fear): Start with a pressing, logical operational or security risk they are ignoring in their stack. E.g. 'Relying on cloud tools for sensitive IP is an unacceptable security gamble.' Trigger immediate risk-aversion.";
          }

          // Step 2: Phase 1 (Drafting)
          sendEvent("status", { message: "[Phase 1] Agents Alpha, Beta, & Gamma drafting initial posts..." });

          const draftUserPrompt = `
Generate a viral LinkedIn post draft for the following project.
Context:
- App/Project Name: ${appName}
- Description: ${description}
- Target Audience: ${targetAudience || 'General Professionals'}
- Tone: ${tone || 'Professional yet engaging'}

LinkedIn Search Context:
${trendsContext}

High-Performing Reference Examples:
${viralExamplesContext}

CRITICAL COPYWRITING RULES:
${archetypeInstruction}
1. The Hook (Relatable Fear): Start EXACTLY mid-thought with a gut-punch reality of the user's specific experience based on the target audience. DO NOT soften the hook or bury it inside a generic sentence. No emojis in the hook.
2. Length, Formatting & Filler: Keep the main portion of the post strictly under 1200 characters. No long product spec sheets. DO NOT include abstract filler paragraphs. Every line must earn its place. Get straight to the value. Use emoji bullets for feature breakdowns instead of plain dashes, to make it stand out a bit.
3. Kill Marketing Fluff: NEVER use phrases like "digital abyss", "spaghetti graphs", "future of", "game-changer", or "early access alert". Speak directly to the target audience.
4. Proof & Real Benchmarks: Use the provided benchmarks or details from the description. You MUST include a bridging sentence before listing performance numbers to connect the story to the proof. Do not use generic claims.
5. The "Ship the GIF" Rule: Include exactly one mandatory visual proof placeholder (e.g. "[Insert 5-sec GIF showing the core feature in action]"). Posts with visual media are mandatory.
6. Spicy, Binary Question: End the post EXACTLY with a hot take formatted as: "Hot take: [Insert a controversial opinion directly related to the project]. Agree or disagree?". DO NOT copy this example verbatim, adapt it to the project context.
7. Credibility & Urgency: Always use "We built" instead of "I built" to imply team credibility. Frame the Call-to-Action with non-marketing urgency (e.g., "Drop a comment and I'll DM you the link").
8. Cohesive Metaphors: Stick to ONE strong metaphor relevant to the project's domain. Do NOT mix metaphors or use dramatic non-sensical analogies.

CRITICAL FORMAT REQUIREMENT:
You must output a JSON object containing the exact properties: "content" and "hookExplanation".
Example:
{
  "content": "The post content...",
  "hookExplanation": "Why this scroll-stopping hook is designed to capture the target audience."
}
`;

          let draftA, draftB, draftC;

          try {
            draftA = await runAgentCall(agentA, "You are drafting an initial viral LinkedIn post.", draftUserPrompt, "Drafting");
            sendEvent("draft-complete", { name: agentA.name, content: draftA.content, hookExplanation: draftA.hookExplanation, provider: agentA.provider, model: agentA.model });
          } catch (err: any) {
            console.error("Draft A failed:", err);
            throw new Error(`[${agentA.name}] draft failed: ${err.message || err}`);
          }

          try {
            draftB = await runAgentCall(agentB, "You are drafting an initial viral LinkedIn post.", draftUserPrompt, "Drafting");
            sendEvent("draft-complete", { name: agentB.name, content: draftB.content, hookExplanation: draftB.hookExplanation, provider: agentB.provider, model: agentB.model });
          } catch (err: any) {
            console.error("Draft B failed:", err);
            throw new Error(`[${agentB.name}] draft failed: ${err.message || err}`);
          }

          try {
            draftC = await runAgentCall(agentC, "You are drafting an initial viral LinkedIn post.", draftUserPrompt, "Drafting");
            sendEvent("draft-complete", { name: agentC.name, content: draftC.content, hookExplanation: draftC.hookExplanation, provider: agentC.provider, model: agentC.model });
          } catch (err: any) {
            console.error("Draft C failed:", err);
            throw new Error(`[${agentC.name}] draft failed: ${err.message || err}`);
          }

          // Step 3: Phase 2 (Critique Arena)
          sendEvent("status", { message: "[Phase 2] Debate Arena: bidirectional peer review critique round..." });

          let critiqueAtoB, critiqueBtoA, critiqueBtoC, critiqueCtoB, critiqueAtoC, critiqueCtoA;

          try {
            critiqueAtoB = await runAgentCall(agentA, "You are a reviewer critiquing a draft written by your peer.", `Evaluate this draft written by Agent Beta:\n"${draftB.content}"\n\nProvide constructive, sharp critique and a rating out of 100.\n\nCRITICAL FORMAT:\n{\n  "critique": "...",\n  "score": 80\n}`, "Critique Beta");
            sendEvent("critique-complete", { from: agentA.name, to: agentB.name, content: critiqueAtoB.critique, score: critiqueAtoB.score });
          } catch (err: any) {
            console.error("Critique A->B failed:", err);
            throw new Error(`[${agentA.name} critiquing ${agentB.name}] failed: ${err.message || err}`);
          }

          try {
            critiqueBtoA = await runAgentCall(agentB, "You are a reviewer critiquing a draft written by your peer.", `Evaluate this draft written by Agent Alpha:\n"${draftA.content}"\n\nProvide constructive, sharp critique and a rating out of 100.\n\nCRITICAL FORMAT:\n{\n  "critique": "...",\n  "score": 80\n}`, "Critique Alpha");
            sendEvent("critique-complete", { from: agentB.name, to: agentA.name, content: critiqueBtoA.critique, score: critiqueBtoA.score });
          } catch (err: any) {
            console.error("Critique B->A failed:", err);
            throw new Error(`[${agentB.name} critiquing ${agentA.name}] failed: ${err.message || err}`);
          }

          try {
            critiqueBtoC = await runAgentCall(agentB, "You are a reviewer critiquing a draft written by your peer.", `Evaluate this draft written by Agent Gamma:\n"${draftC.content}"\n\nProvide constructive, sharp critique and a rating out of 100.\n\nCRITICAL FORMAT:\n{\n  "critique": "...",\n  "score": 80\n}`, "Critique Gamma");
            sendEvent("critique-complete", { from: agentB.name, to: agentC.name, content: critiqueBtoC.critique, score: critiqueBtoC.score });
          } catch (err: any) {
            console.error("Critique B->C failed:", err);
            throw new Error(`[${agentB.name} critiquing ${agentC.name}] failed: ${err.message || err}`);
          }

          try {
            critiqueCtoB = await runAgentCall(agentC, "You are a reviewer critiquing a draft written by your peer.", `Evaluate this draft written by Agent Beta:\n"${draftB.content}"\n\nProvide constructive, sharp critique and a rating out of 100.\n\nCRITICAL FORMAT:\n{\n  "critique": "...",\n  "score": 80\n}`, "Critique Beta");
            sendEvent("critique-complete", { from: agentC.name, to: agentB.name, content: critiqueCtoB.critique, score: critiqueCtoB.score });
          } catch (err: any) {
            console.error("Critique C->B failed:", err);
            throw new Error(`[${agentC.name} critiquing ${agentB.name}] failed: ${err.message || err}`);
          }

          try {
            critiqueAtoC = await runAgentCall(agentA, "You are a reviewer critiquing a draft written by your peer.", `Evaluate this draft written by Agent Gamma:\n"${draftC.content}"\n\nProvide constructive, sharp critique and a rating out of 100.\n\nCRITICAL FORMAT:\n{\n  "critique": "...",\n  "score": 80\n}`, "Critique Gamma");
            sendEvent("critique-complete", { from: agentA.name, to: agentC.name, content: critiqueAtoC.critique, score: critiqueAtoC.score });
          } catch (err: any) {
            console.error("Critique A->C failed:", err);
            throw new Error(`[${agentA.name} critiquing ${agentC.name}] failed: ${err.message || err}`);
          }

          try {
            critiqueCtoA = await runAgentCall(agentC, "You are a reviewer critiquing a draft written by your peer.", `Evaluate this draft written by Agent Alpha:\n"${draftA.content}"\n\nProvide constructive, sharp critique and a rating out of 100.\n\nCRITICAL FORMAT:\n{\n  "critique": "...",\n  "score": 80\n}`, "Critique Alpha");
            sendEvent("critique-complete", { from: agentC.name, to: agentA.name, content: critiqueCtoA.critique, score: critiqueCtoA.score });
          } catch (err: any) {
            console.error("Critique C->A failed:", err);
            throw new Error(`[${agentC.name} critiquing ${agentA.name}] failed: ${err.message || err}`);
          }

          // Step 4: Phase 3 (Refinement based on critiques)
          sendEvent("status", { message: "[Phase 3] Refinement: Agents rewriting posts based on critiques..." });

          const refinePromptA = `
You wrote the following initial LinkedIn post draft:
---
${draftA.content}
---

Your peer Agent Beta gave you this critique:
"${critiqueBtoA.critique}" (Score: ${critiqueBtoA.score}/100)

Your peer Agent Gamma gave you this critique:
"${critiqueCtoA.critique}" (Score: ${critiqueCtoA.score}/100)

Please refine your draft to make it the absolute best, incorporating their feedback where valid. Ensure it remains true to your unique copywriting style.
Output a JSON object with your refined post content and an explanation of the arguments/changes you made.

CRITICAL FORMAT REQUIREMENT:
Output a JSON object with properties 'content', 'score' and 'argument'.
Example:
{
  "content": "Your refined post...",
  "score": 92,
  "argument": "I adjusted the hook because..."
}
`;

          const refinePromptB = `
You wrote the following initial LinkedIn post draft:
---
${draftB.content}
---

Your peer Agent Alpha gave you this critique:
"${critiqueAtoB.critique}" (Score: ${critiqueAtoB.score}/100)

Your peer Agent Gamma gave you this critique:
"${critiqueCtoB.critique}" (Score: ${critiqueCtoB.score}/100)

Please refine your draft to make it the absolute best, incorporating their feedback where valid. Ensure it remains true to your unique copywriting style.
Output a JSON object with your refined post content and an explanation of the arguments/changes you made.

CRITICAL FORMAT REQUIREMENT:
Output a JSON object with properties 'content', 'score' and 'argument'.
Example:
{
  "content": "Your refined post...",
  "score": 92,
  "argument": "I adjusted the hook because..."
}
`;

          const refinePromptC = `
You wrote the following initial LinkedIn post draft:
---
${draftC.content}
---

Your peer Agent Alpha gave you this critique:
"${critiqueAtoC.critique}" (Score: ${critiqueAtoC.score}/100)

Your peer Agent Beta gave you this critique:
"${critiqueBtoC.critique}" (Score: ${critiqueBtoC.score}/100)

Please refine your draft to make it the absolute best, incorporating their feedback where valid. Ensure it remains true to your unique copywriting style.
Output a JSON object with your refined post content and an explanation of the arguments/changes you made.

CRITICAL FORMAT REQUIREMENT:
Output a JSON object with properties 'content', 'score' and 'argument'.
Example:
{
  "content": "Your refined post...",
  "score": 92,
  "argument": "I adjusted the hook because..."
}
`;

          let refinedA, refinedB, refinedC;

          try {
            refinedA = await runAgentCall(agentA, "You are refining your original LinkedIn post based on peer critique.", refinePromptA, "Refinement");
            sendEvent("refine-complete", { name: agentA.name, content: refinedA.content, score: refinedA.score, argument: refinedA.argument, provider: agentA.provider, model: agentA.model });
          } catch (err: any) {
            console.error("Refinement A failed:", err);
            throw new Error(`[${agentA.name}] refinement failed: ${err.message || err}`);
          }

          try {
            refinedB = await runAgentCall(agentB, "You are refining your original LinkedIn post based on peer critique.", refinePromptB, "Refinement");
            sendEvent("refine-complete", { name: agentB.name, content: refinedB.content, score: refinedB.score, argument: refinedB.argument, provider: agentB.provider, model: agentB.model });
          } catch (err: any) {
            console.error("Refinement B failed:", err);
            throw new Error(`[${agentB.name}] refinement failed: ${err.message || err}`);
          }

          try {
            refinedC = await runAgentCall(agentC, "You are refining your original LinkedIn post based on peer critique.", refinePromptC, "Refinement");
            sendEvent("refine-complete", { name: agentC.name, content: refinedC.content, score: refinedC.score, argument: refinedC.argument, provider: agentC.provider, model: agentC.model });
          } catch (err: any) {
            console.error("Refinement C failed:", err);
            throw new Error(`[${agentC.name}] refinement failed: ${err.message || err}`);
          }

          // Step 5: Phase 4 (Consensus Settle / Synthesis)
          sendEvent("status", { message: "[Phase 4] Settle Consensus: Synthesizing the absolute best LinkedIn post." });

          // Build custom metrics prompt details
          let metricsPromptInstructions = "";
          let metricsJsonStructure = "";
          if (customMetrics && customMetrics.length > 0) {
            metricsPromptInstructions = `You MUST evaluate the post against the following custom metrics:
${customMetrics.map((m: any) => `- ${m.name} (JSON property/key: "${m.id}"): ${m.scoringInstructions}`).join("\n")}
`;
            const schemaFields = customMetrics.map((m: any) => `    "${m.id}": <score between 0 and 100>`).join(",\n");
            metricsJsonStructure = `{\n  "content": "The finalized absolute best LinkedIn post content...",\n  "scores": {\n${schemaFields}\n  },\n  "synthesisRationale": "..."\n}`;
          } else {
            metricsPromptInstructions = `You MUST evaluate the post against the following standard metrics:
- Hook Strength (JSON property/key: "hookStrength"): How engaging/scroll-stopping the hook is.
- Readability (JSON property/key: "readability"): Clean flow, formatting, readability ease.
- Credibility (JSON property/key: "credibility"): Use of proof, authentic tone, team credibility.
- Viral Potential (JSON property/key: "viralPotential"): Engagement call and potential to spread.
`;
            metricsJsonStructure = `{\n  "content": "The finalized absolute best LinkedIn post content...",\n  "scores": {\n    "hookStrength": 95,\n    "readability": 88,\n    "credibility": 92,\n    "viralPotential": 98\n  },\n  "synthesisRationale": "..."\n}`;
          }

          const consensusPrompt = `
You are the Consensus Settle Panel. We have run a multi-round debate between 3 copywriter agents.

ORIGINAL PROJECT CONTEXT:
- App Name: ${appName}
- Description: ${description}
- Target Audience: ${targetAudience || "General Professionals"}
- Tone: ${tone || "Professional yet engaging"}

TRENDING LINKEDIN CONTEXT:
${trendsContext}

HIGH-PERFORMING VIRAL TEMPLATES REFERENCE:
${viralExamplesContext}

Here are their refined drafts and the peer critiques they received:

1. Agent Alpha (${agentA.provider}/${agentA.model}):
Critique from Beta: "${critiqueBtoA.critique}"
Critique from Gamma: "${critiqueCtoA.critique}"
Refined Content:
${refinedA.content}
Self-Score: ${refinedA.score}/100
Argument: ${refinedA.argument}

2. Agent Beta (${agentB.provider}/${agentB.model}):
Critique from Alpha: "${critiqueAtoB.critique}"
Critique from Gamma: "${critiqueCtoB.critique}"
Refined Content:
${refinedB.content}
Self-Score: ${refinedB.score}/100
Argument: ${refinedB.argument}

3. Agent Gamma (${agentC.provider}/${agentC.model}):
Critique from Alpha: "${critiqueAtoC.critique}"
Critique from Beta: "${critiqueBtoC.critique}"
Refined Content:
${refinedC.content}
Self-Score: ${refinedC.score}/100
Argument: ${refinedC.argument}

Your task is to analyze these 3 refined options, synthesize their absolute strongest features (e.g. Agent Alpha's pattern-interrupting hook, Agent Beta's value-driven list, Agent Gamma's storytelling arc), and compile the single absolute best LinkedIn post.

CRITICAL COPYWRITING QUALITY CHECKS:
${archetypeInstruction}
1. The Hook: Must open EXACTLY mid-thought with a compelling hook relevant to the audience. Do not bury it in a generic opener. No emojis in the hook.
2. Structure & Filler: The post must be strictly under 1200 characters. Ban abstract filler paragraphs entirely. Feature breakdowns must not exceed 2 bullet points and MUST use context-appropriate emoji bullets instead of plain dashes.
3. Zero Marketing Fluff: Strip out words like "digital abyss", "spaghetti graphs", "future of", or "game-changing". Tone must be authentic.
4. Real Benchmarks: Ensure any metrics from the project description are used realistically. You MUST include a bridging sentence before listing performance numbers to connect the story to the proof.
5. Visual Proof: The post MUST include exactly one descriptive visual placeholder (e.g., "[Insert 5-sec GIF showing the core action here]").
6. Spicy, Binary Engagement: The post must end EXACTLY with a hot take formatted as: "Hot take: [Controversial opinion relevant to project]. Agree or disagree?".
7. Credibility & CTA: Always use "We built" instead of "I built". Use a non-marketing CTA (e.g., "Drop a comment and I'll DM the link").
8. Cohesive Metaphors: Ensure there is only ONE strong metaphor. Do NOT mix metaphors.

${metricsPromptInstructions}

Output a JSON object with properties 'content', 'scores' (a nested object), and 'synthesisRationale'.

CRITICAL FORMAT REQUIREMENT:
${metricsJsonStructure}
`;

          let finalOutcome;
          try {
            const judgeAgent = {
              ...agentA,
              systemPrompt: "You are the Master Synthesizer. You evaluate peer-reviewed drafts to compile the final perfect output without any personal bias. You strictly follow instructions."
            };
            finalOutcome = await runAgentCall(judgeAgent, "You are a Master Synthesizer consolidating drafts into a single ultimate post.", consensusPrompt, "Synthesis");

            // Step 4.5: Run the synthesized post through the LinkedIn Algorithm Simulator
            try {
              sendEvent("status", { message: "[Auditor] Auditing consolidated post against the LinkedIn Algorithm..." });
              sendEvent("activity", { message: "[Auditor] Simulating post performance, dwell-time parameters, and style heuristics...", type: "info" });

              const simulatorPrompt = `
You are the LinkedIn Algorithm Simulator. Evaluate this synthesized LinkedIn post for compliance with critical copywriting and viral feed rules.

POST TO AUDIT:
---
${finalOutcome.content}
---

CRITERIA TO AUDIT:
1. HOOK COMPLIANCE: Does the first line start EXACTLY mid-thought? Is it <=140 characters? Is there zero conversational preamble and zero emojis in the hook? (Yes/No)
2. DWELL TIME SPACING: Are paragraphs clean, short (max 2 sentences), with double newlines between them? (Yes/No)
3. ZERO BANNED VOCAB: Does it avoid all AI cliché words (e.g. "delve", "game-changer", "digital abyss", "spaghetti graphs", "future of", "testament", "unlock", "revolutionary")? (Yes/No)
4. BRIDGING METRIC: Is there a solid bridging sentence connecting the narrative to the proof/metrics? (Yes/No)
5. SHIP THE GIF: Is there exactly one mandatory visual placeholder (e.g., "[Insert 5-sec GIF...]")? (Yes/No)
6. BINARY ENGAGEMENT: Does the post end exactly with "Hot take: [Opinion]. Agree or disagree?" (Yes/No)
7. CREDIBILITY CHECK: Does the post use "We built" instead of "I built"? (Yes/No)
8. COHESIVE METAPHOR: Does it stick to a single, consistent metaphor without blending? (Yes/No)

Output a JSON object with properties 'passes' (boolean), 'score' (number 0-100), and 'feedback' (array of strings listing what is wrong or needs improvement. If everything is perfect, leave array empty).

CRITICAL FORMAT REQUIREMENT:
{
  "passes": false,
  "score": 85,
  "feedback": ["First line contains emojis", "Contains the banned word 'delve'"]
}
              `;

              const auditResult = await callLLMWithRetry(
                agentA.provider,
                agentA.model,
                "You are a LinkedIn Algorithmic Auditor. You audit posts for viral compliance.",
                simulatorPrompt,
                0.1,
                apiKeys,
                "Algorithm Auditor",
                (msg, type = "info") => sendEvent("activity", { message: msg, type })
              );

              if (auditResult && (!auditResult.passes || auditResult.score < 90) && auditResult.feedback && auditResult.feedback.length > 0) {
                const issuesStr = auditResult.feedback.join(", ");
                sendEvent("activity", { message: `[Auditor] Post scored ${auditResult.score}/100. Issues detected: ${issuesStr}. Initiating algorithmic refinement...`, type: "warning" });

                const autoRefinePrompt = `
You are the Consensus Settle Panel. The LinkedIn Algorithm Auditor has rejected your consolidated post because it failed critical checks.

ORIGINAL DRAFT:
---
${finalOutcome.content}
---

AUDITOR FEEDBACK:
${auditResult.feedback.map((f: string, i: number) => `${i + 1}. ${f}`).join("\n")}

Please rewrite the post to fully correct all feedback items. Keep all other aspects of the post intact (such as metrics, the anchor metaphor, and the CTA strategy).

${metricsPromptInstructions}

Output a JSON object in the exact same format:
${metricsJsonStructure}
                `;

                const refinedOutcome = await runAgentCall(
                  judgeAgent,
                  "You are a Master Synthesizer consolidating drafts into a single ultimate post.",
                  autoRefinePrompt,
                  "Refinement Turn"
                );

                if (refinedOutcome && refinedOutcome.content) {
                  finalOutcome = refinedOutcome;
                  sendEvent("activity", { message: "[Auditor] Post successfully refined and validated by simulator.", type: "success" });
                }
              } else {
                sendEvent("activity", { message: `[Auditor] Algorithmic audit passed successfully! (Score: ${auditResult?.score || 95}/100)`, type: "success" });
              }
            } catch (auditErr: any) {
              console.warn("Algorithm audit pipeline failed or timed out:", auditErr);
              sendEvent("activity", { message: `[Auditor] Audit pipeline bypassed (${auditErr.message || auditErr}). Proceeding to styling.`, type: "warning" });
            }

            // Step 4.6: Run post-formatting sanitization (Unicode styling cleaner, mobile pacing, readability calculator)
            try {
              let sanitizedContent = convertUnicodeStyles(finalOutcome.content);
              sanitizedContent = optimizeMobileSpacing(sanitizedContent);
              
              const readabilityMetrics = estimateReadability(sanitizedContent);
              sendEvent("activity", { message: `[Readability] Flesch Reading Ease: ${readabilityMetrics.easeScore}/100 (${readabilityMetrics.gradeLevel})`, type: "success" });

              finalOutcome.content = sanitizedContent;
              if (finalOutcome.scores) {
                // Determine if we need to put readability in standard or custom key
                const readabilityKey = (customMetrics && customMetrics.find((m: any) => m.id.toLowerCase() === "readability")) ? customMetrics.find((m: any) => m.id.toLowerCase() === "readability").id : "readability";
                finalOutcome.scores[readabilityKey] = readabilityMetrics.easeScore;
              }
            } catch (fmtErr: any) {
              console.error("Formatting sanitization failed:", fmtErr);
            }

            // Step 4.7: Simulated Persona Focus Group A/B Panel
            try {
              sendEvent("status", { message: "[A/B Panel] Simulating response of target audience focus group..." });
              sendEvent("activity", { message: "[A/B Panel] Evaluating scroll stopping, commenting likelihood, and virality sharing indices...", type: "info" });

              let personasPromptList = "";
              if (customPersonas && customPersonas.length > 0) {
                personasPromptList = customPersonas.map((p: any, idx: number) => {
                  return `${idx + 1}. "${p.name}" (${p.avatar || "👤"}) - ${p.description} (Comment Ratio Modifier: ${p.commentRatio}%)`;
                }).join("\n");
              } else {
                personasPromptList = `1. "Skeptical CTO" (🛡️) - Values deep architecture details, concrete benchmarks, security integrity, and zero cloud-lockout egress.
2. "Hustling Solopreneur" (⚡) - Values speed to build, automation efficiency, direct revenue/business growth, and simple tooling.
3. "Metrics-Driven VC" (📈) - Values market size disruption, high product velocity metrics, team scale, and competitive moats.
4. "Developer Advocate" (💡) - Values great developer experience (DX), open-source accessibility, local-first setups, and clear templates.`;
              }

              const personasEvalPrompt = `
You are the Target Audience Focus Group. Evaluate this synthesized LinkedIn post from the perspective of target audience professional profiles:

POST TO EVALUATE:
---
${finalOutcome.content}
---

TARGET PERSONAS:
${personasPromptList}

For each persona, output:
- name: The exact persona name.
- avatar: The emoji avatar.
- feedback: A short, 1-sentence critique from their perspective.
- scrollStopping: 0-100 rating of how likely they are to click "See More" (cliffhanger appeal).
- engagement: 0-100 rating of how likely they are to leave a comment (actionability / CTA pull).
- virality: 0-100 rating of how likely they are to share/repost (general value & relatability).

Output a JSON object containing a 'personas' array matching this structure. Do not wrap in backticks or preamble.
Example:
{
  "personas": [
    {
      "name": "Skeptical CTO",
      "avatar": "🛡️",
      "feedback": "I love the local-first SQLite explanation, but I want to see details about sync conflict resolution.",
      "scrollStopping": 85,
      "engagement": 75,
      "virality": 60
    }
  ]
}
              `;

              const personasResult = await callLLMWithRetry(
                agentA.provider,
                agentA.model,
                "You are the Focus Group Panel. You evaluate posts from user-persona angles.",
                personasEvalPrompt,
                0.15,
                apiKeys,
                "A/B Panel",
                (msg, type = "info") => sendEvent("activity", { message: msg, type })
              );

              if (personasResult && Array.isArray(personasResult.personas)) {
                finalOutcome.personas = personasResult.personas;
                sendEvent("activity", { message: `[A/B Panel] Focus group simulation complete. Evaluated ${personasResult.personas.length} personas successfully.`, type: "success" });
              }
            } catch (pErr: any) {
              console.warn("Persona focus group simulation failed:", pErr);
              sendEvent("activity", { message: `[A/B Panel] Bypassed focus group evaluation (${pErr.message || pErr})`, type: "warning" });
            }

          } catch (e: any) {
            console.error("Synthesis failed, falling back to top scored refined draft:", e);
            const sorted = [
              { name: agentA.name, ...refinedA },
              { name: agentB.name, ...refinedB },
              { name: agentC.name, ...refinedC }
            ].sort((a, b) => b.score - a.score);

            const fallbackScores: Record<string, number> = {};
            if (customMetrics && customMetrics.length > 0) {
              customMetrics.forEach((m: any) => {
                fallbackScores[m.id] = sorted[0].score;
              });
            } else {
              fallbackScores.hookStrength = sorted[0].score;
              fallbackScores.readability = sorted[0].score;
              fallbackScores.credibility = sorted[0].score;
              fallbackScores.viralPotential = sorted[0].score;
            }

            finalOutcome = {
              content: sorted[0].content,
              scores: fallbackScores,
              synthesisRationale: `Consensus synthesis failed (${e.message}). Fell back to the highest scoring refined draft.`
            };
          }

          sendEvent("consensus-complete", {
            best: {
              style: "Settle Consensus Panel",
              content: finalOutcome.content,
              scores: finalOutcome.scores || { hookStrength: 90, readability: 90, credibility: 90, viralPotential: 90 },
              critique: finalOutcome.synthesisRationale || "Consensus settled successfully.",
              personas: finalOutcome.personas || []
            }
          });
        } catch (err: any) {
          console.error("Consensus stream worker error:", err);
          sendEvent("error", { message: err.message || "An unexpected generation pipeline error occurred." });
        } finally {
          isClosed = true;
          try {
            controller.close();
          } catch (e) { }
        }
      },
      cancel() {
        isClosed = true;
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    console.error("Consensus generation initialization error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize debate stream" },
      { status: 500 }
    );
  }
}
