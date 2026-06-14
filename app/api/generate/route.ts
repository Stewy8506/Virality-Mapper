import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

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
  apiKeys: any
): Promise<any> {
  const cleanTemp = Math.max(0, Math.min(1, temperature));

  switch (provider) {
    case "gemini": {
      if (!apiKeys?.gemini) throw new Error("Gemini API Key is missing.");
      const ai = new GoogleGenAI({ apiKey: apiKeys.gemini });
      const response = await ai.models.generateContent({
        model: model || "gemini-2.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: cleanTemp,
          responseMimeType: "application/json",
        },
      });
      const parsed = robustJsonParse(response.text || "{}");
      return parsed.variants ? parsed.variants[0] : parsed;
    }

    case "openai": {
      if (!apiKeys?.openai) throw new Error("OpenAI API Key is missing.");
      const openai = new OpenAI({ apiKey: apiKeys.openai });
      const response = await openai.chat.completions.create({
        model: model || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: cleanTemp,
        response_format: { type: "json_object" },
      });
      const text = response.choices[0].message.content || "{}";
      const parsed = robustJsonParse(text);
      return parsed.variants ? parsed.variants[0] : parsed;
    }

    case "anthropic": {
      if (!apiKeys?.anthropic) throw new Error("Anthropic API Key is missing.");
      const anthropic = new Anthropic({ apiKey: apiKeys.anthropic });
      const response = await anthropic.messages.create({
        model: model || "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `${userPrompt}\n\nCRITICAL: Respond with a raw, valid JSON object matching the format. Do not wrap in markdown backticks, and do not add conversational preamble.`,
          },
        ],
        temperature: cleanTemp,
      });

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
      const response = await openai.chat.completions.create({
        model: model || "meta-llama/llama-3-8b-instruct:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: cleanTemp,
        response_format: { type: "json_object" },
      });
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
      const response = await openai.chat.completions.create({
        model: model || "llama3",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${userPrompt}\n\nCRITICAL: Respond with a raw, valid JSON object matching the format. Do not wrap in markdown backticks, and do not add conversational preamble.` },
        ],
        temperature: cleanTemp,
      });
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
      const response = await openai.chat.completions.create({
        model: model || "model-identifier",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${userPrompt}\n\nCRITICAL: Respond with a raw, valid JSON object matching the format. Do not wrap in markdown backticks, and do not add conversational preamble.` },
        ],
        temperature: cleanTemp,
      });
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
      const response = await openai.chat.completions.create({
        model: model || "custom-model",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${userPrompt}\n\nCRITICAL: Respond with a raw, valid JSON object matching the format. Do not wrap in markdown backticks, and do not add conversational preamble.` },
        ],
        temperature: cleanTemp,
      });
      const text = response.choices[0].message.content || "{}";
      const parsed = robustJsonParse(text);
      return parsed.variants ? parsed.variants[0] : parsed;
    }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

async function searchLinkedInTrends(query: string): Promise<string[]> {
  const searchQuery = `site:linkedin.com ${query} post`;
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  // Try Yahoo Search first (highly stable, simple div classes, no Cloudflare block)
  try {
    const url = `https://search.yahoo.com/search?q=${encodeURIComponent(searchQuery)}`;
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
    console.warn("Yahoo search fetch failed, falling back to DuckDuckGo:", err);
  }

  // Fallback 1: DuckDuckGo Lite (if Yahoo is down/blocked)
  try {
    const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(searchQuery)}&kl=in-en`;
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
    console.warn("DuckDuckGo Lite fetch failed, falling back to HTML search:", err);
  }

  // Fallback 2: standard DuckDuckGo HTML Search
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}&kl=in-en`;
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
      return snippets;
    }
    return [];
  } catch (err) {
    console.error("DuckDuckGo HTML fetch failed:", err);
    return [];
  }
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
  maxRetries = 3
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
        callLLM(provider, model, systemPrompt, userPrompt, temperature, apiKeys),
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
  onActivity?: (msg: string, type?: "info" | "warning" | "success") => void
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
      ? await callLLMWithRetry(agent.provider, agent.model, systemPrompt, userPrompt, 0.2, apiKeys, "Topic Extractor", onActivity)
      : await callLLM(agent.provider, agent.model, systemPrompt, userPrompt, 0.2, apiKeys);
      
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
    const { appName, description, targetAudience, tone, apiKeys, agents } = await req.json();

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
            (msg, type) => sendEvent("activity", { message: msg, type })
          );
          
          sendEvent("status", { message: `Broad topics found: ${topics.join(", ")}. Querying viral Indian posts...` });
          sendEvent("activity", { message: `Searching live LinkedIn post trends for: ${topics.join(", ")}`, type: "info" });
          
          // Scrape search results for each topic concurrently
          const scrapePromises = topics.map(topic => searchLinkedInTrends(topic));
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

          // Helper to run LLM with retry & activity logs
          const runAgentCall = async (agent: any, systemPrompt: string, userPrompt: string, contextName: string) => {
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
              }
            );
          };

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

          const consensusPrompt = `
You are the Consensus Settle Panel. We have run a multi-round debate between 3 copywriter agents. Here are their refined drafts:

1. Agent Alpha (${agentA.provider}/${agentA.model}):
Refined Content:
${refinedA.content}
Self-Score: ${refinedA.score}/100
Argument: ${refinedA.argument}

2. Agent Beta (${agentB.provider}/${agentB.model}):
Refined Content:
${refinedB.content}
Self-Score: ${refinedB.score}/100
Argument: ${refinedB.argument}

3. Agent Gamma (${agentC.provider}/${agentC.model}):
Refined Content:
${refinedC.content}
Self-Score: ${refinedC.score}/100
Argument: ${refinedC.argument}

Your task is to analyze these 3 refined options, synthesize their absolute strongest features (e.g. Agent Alpha's pattern-interrupting hook, Agent Beta's value-driven list, Agent Gamma's storytelling arc), and compile the single absolute best LinkedIn post.
Output a JSON object with properties 'content', 'score' (estimated viral likelihood out of 100), and 'synthesisRationale'.

CRITICAL FORMAT REQUIREMENT:
{
  "content": "The finalized absolute best LinkedIn post content...",
  "score": 98,
  "synthesisRationale": "A detailed explanation of how you merged their best parts..."
}
`;

          let finalOutcome;
          try {
            finalOutcome = await runAgentCall(agentA, "You are a Master Synthesizer consolidating drafts into a single ultimate post.", consensusPrompt, "Synthesis");
          } catch (e: any) {
            console.error("Synthesis failed, falling back to top scored refined draft:", e);
            const sorted = [
              { name: agentA.name, ...refinedA },
              { name: agentB.name, ...refinedB },
              { name: agentC.name, ...refinedC }
            ].sort((a, b) => b.score - a.score);
            finalOutcome = {
              content: sorted[0].content,
              score: sorted[0].score,
              synthesisRationale: `Consensus synthesis failed (${e.message}). Fell back to the highest scoring refined draft.`
            };
          }

          sendEvent("consensus-complete", {
            best: {
              style: "Settle Consensus Panel",
              content: finalOutcome.content,
              score: finalOutcome.score || 95,
              critique: finalOutcome.synthesisRationale || "Consensus settled successfully."
            }
          });
        } catch (err: any) {
          console.error("Consensus stream worker error:", err);
          sendEvent("error", { message: err.message || "An unexpected generation pipeline error occurred." });
        } finally {
          isClosed = true;
          try {
            controller.close();
          } catch (e) {}
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
