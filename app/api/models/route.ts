import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/crypto";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { ApiKeys } from "@/types/domain";

function isValidBaseUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    
    // Allow only http and https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    
    // Prevent credentials/user info in URL
    if (parsed.username || parsed.password) {
      return false;
    }
    
    // Block common cloud metadata services to prevent SSRF
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "169.254.169.254" ||
      hostname === "metadata.google.internal" ||
      hostname === "instance-data"
    ) {
      return false;
    }
    
    // Prevent path traversal attempts
    if (
      urlStr.includes("..") ||
      urlStr.includes("%2e%2e") ||
      urlStr.includes("%2E%2E")
    ) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 1024 * 1024) {
      return NextResponse.json({ error: "Payload size limit exceeded (1MB max)" }, { status: 413 });
    }

    const rateCheck = checkRateLimit(getClientIp(req));
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${Math.ceil((rateCheck.retryAfterMs || 60000) / 1000)} seconds.` },
        { status: 429 }
      );
    }

    const { provider, apiKey: clientApiKey, customUrl } = await req.json();

    if (!provider) {
      return NextResponse.json({ error: "Provider is required" }, { status: 400 });
    }

    if (customUrl && !isValidBaseUrl(customUrl)) {
      return NextResponse.json({ error: "Invalid or unsafe custom URL provided" }, { status: 400 });
    }

    let apiKey = clientApiKey;
    if (!apiKey) {
      try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("vm_session");
        if (sessionCookie && sessionCookie.value) {
          const decrypted = decrypt(sessionCookie.value);
          const sessionKeys = JSON.parse(decrypted) as Partial<ApiKeys>;
          if (provider === "gemini") apiKey = sessionKeys.gemini;
          if (provider === "openai") apiKey = sessionKeys.openai;
          if (provider === "anthropic") apiKey = sessionKeys.anthropic;
          if (provider === "openrouter") apiKey = sessionKeys.openrouter;
          if (provider === "custom") apiKey = sessionKeys.customApiKey;
        }
      } catch (e) {
        console.warn("Failed to decrypt session cookie in models route:", e);
      }
    }

    let models: string[] = [];

    switch (provider) {
      case "gemini":
        if (!apiKey) break;
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
          if (res.ok) {
            const data = (await res.json()) as { models: Array<{ name: string; supportedGenerationMethods: string[] }> };
            models = data.models
              .filter((m) => m.supportedGenerationMethods.includes("generateContent"))
              .map((m) => m.name.replace("models/", ""));
          }
        } catch (e) {
          console.error("Failed to fetch Gemini models:", e);
        }
        break;

      case "openai":
        if (!apiKey) break;
        try {
          const res = await fetch("https://api.openai.com/v1/models", {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          if (res.ok) {
            const data = (await res.json()) as { data: Array<{ id: string }> };
            models = data.data
              .filter((m) => m.id.startsWith("gpt") || m.id.startsWith("o1") || m.id.startsWith("chatgpt"))
              .map((m) => m.id);
          }
        } catch (e) {
          console.error("Failed to fetch OpenAI models:", e);
        }
        break;

      case "anthropic":
        // Fallback to static model names since Anthropic does not have a public listModels endpoint.
        models = [
          "claude-3-5-sonnet-20241022",
          "claude-3-5-haiku-20241022",
          "claude-3-opus-20240229",
          "claude-3-sonnet-20240229",
          "claude-3-haiku-20240307",
        ];
        break;

      case "openrouter":
        if (!apiKey) break;
        try {
          const res = await fetch("https://openrouter.ai/api/v1/models", {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          if (res.ok) {
            const data = (await res.json()) as { data: Array<{ id: string }> };
            models = data.data.map((m) => m.id);
          }
        } catch (e) {
          console.error("Failed to fetch OpenRouter models:", e);
        }
        break;

      case "ollama":
        const ollamaBase = customUrl || "http://localhost:11434";
        try {
          // Try standard tags endpoint first
          const res = await fetch(`${ollamaBase}/api/tags`);
          if (res.ok) {
            const data = (await res.json()) as { models: Array<{ name: string }> };
            models = data.models.map((m) => m.name);
          } else {
            // Try OpenAI endpoint fallback
            const resV1 = await fetch(`${ollamaBase}/v1/models`);
            if (resV1.ok) {
              const data = (await resV1.json()) as { data: Array<{ id: string }> };
              models = data.data.map((m) => m.id);
            }
          }
        } catch (e) {
          console.error("Failed to fetch Ollama models:", e);
        }
        break;

      case "lmstudio":
        const lmStudioBase = customUrl || "http://localhost:1234";
        try {
          const res = await fetch(`${lmStudioBase}/v1/models`);
          if (res.ok) {
            const data = (await res.json()) as { data: Array<{ id: string }> };
            models = data.data.map((m) => m.id);
          }
        } catch (e) {
          console.error("Failed to fetch LM Studio models:", e);
        }
        break;

      case "custom":
        if (!customUrl) break;
        try {
          const headers: HeadersInit = {};
          if (apiKey) {
            headers["Authorization"] = `Bearer ${apiKey}`;
          }
          const res = await fetch(`${customUrl}/models`, { headers });
          if (res.ok) {
            const data = (await res.json()) as { data: Array<{ id: string }> };
            models = data.data.map((m) => m.id);
          }
        } catch (e) {
          console.error("Failed to fetch Custom models:", e);
        }
        break;

      default:
        break;
    }

    // Default fallbacks in case endpoint request is empty/failed
    if (models.length === 0) {
      if (provider === "gemini") models = ["gemini-2.5-flash", "gemini-2.5-pro"];
      if (provider === "openai") models = ["gpt-4o-mini", "gpt-4o", "o1-mini"];
      if (provider === "openrouter") models = ["meta-llama/llama-3-8b-instruct:free", "google/gemini-flash-1.5-exp"];
    }

    return NextResponse.json({ success: true, models });
  } catch (error: unknown) {
    console.error("Model fetching route error:", error);
    const errMessage = error instanceof Error ? error.message : "Failed to fetch models";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
