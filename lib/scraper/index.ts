import type { CrawlerConfig } from "@/types/domain";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&hellip;/g, "...")
    .replace(/\s+/g, " ")
    .trim();
}

export async function searchLinkedInTrends(
  query: string,
  serpapiKey?: string,
  crawlerConfig?: CrawlerConfig
): Promise<string[]> {
  const targetYear = crawlerConfig?.targetYear || new Date().getFullYear();
  const searchQuery = `site:linkedin.com ${query} post ${targetYear}`;
  const serpapiEnabled = crawlerConfig ? crawlerConfig.serpapiEnabled : true;

  if (serpapiKey && serpapiEnabled) {
    try {
      const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(searchQuery)}&api_key=${serpapiKey}&tbs=qdr:m`;
      const res = await fetch(url);
      if (res.status === 200) {
        const json = await res.json();
        if (json.organic_results && Array.isArray(json.organic_results)) {
          const snippets = json.organic_results
            .map((item: { snippet?: string; title?: string }) => item.snippet || item.title || "")
            .filter((t: string) => t.trim().length > 10)
            .slice(0, 6);
          if (snippets.length > 0) return snippets;
        }
      }
    } catch (err) {
      console.warn("SerpApi search trends query failed, falling back to local scraping:", err);
    }
  }

  const priority = crawlerConfig?.enginePriority || ["yahoo", "duckduckgo_lite", "duckduckgo_html"];

  for (const engine of priority) {
    if (engine === "yahoo") {
      try {
        const url = `https://search.yahoo.com/search?q=${encodeURIComponent(searchQuery)}&age=1m`;
        const res = await fetch(url, {
          headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "Accept-Language": "en-US,en;q=0.5" },
        });
        if (res.status === 200) {
          const html = await res.text();
          const snippets: string[] = [];
          const regex = /<div class="compText[^>]*>([\s\S]*?)<\/div>/gi;
          let match;
          while ((match = regex.exec(html)) !== null && snippets.length < 5) {
            const snippet = stripHtml(match[1]);
            if (snippet) snippets.push(snippet);
          }
          if (snippets.length > 0) return snippets;
        }
      } catch (err) {
        console.warn("Yahoo search fetch failed, falling back in priority:", err);
      }
    } else if (engine === "duckduckgo_lite") {
      try {
        const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(searchQuery)}&kl=in-en&df=m`;
        const res = await fetch(url, {
          headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "Accept-Language": "en-US,en;q=0.5" },
        });
        if (res.status === 200) {
          const html = await res.text();
          const snippets: string[] = [];
          const regex = /<td class="result-snippet">([\s\S]*?)<\/td>/gi;
          let match;
          while ((match = regex.exec(html)) !== null && snippets.length < 5) {
            const snippet = stripHtml(match[1]);
            if (snippet && !snippet.includes("JavaScript is required")) snippets.push(snippet);
          }
          if (snippets.length > 0) return snippets;
        }
      } catch (err) {
        console.warn("DuckDuckGo Lite fetch failed, falling back in priority:", err);
      }
    } else if (engine === "duckduckgo_html") {
      try {
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}&kl=in-en&df=m`;
        const res = await fetch(url, {
          headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "Accept-Language": "en-US,en;q=0.5" },
        });
        if (res.status === 200) {
          const html = await res.text();
          const snippets: string[] = [];
          const regex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
          let match;
          while ((match = regex.exec(html)) !== null && snippets.length < 5) {
            const snippet = stripHtml(match[1]);
            if (snippet) snippets.push(snippet);
          }
          if (snippets.length === 0) {
            const fallbackRegex = /<div class="result__snippet"[^>]*>([\s\S]*?)<\/div>/gi;
            while ((match = fallbackRegex.exec(html)) !== null && snippets.length < 5) {
              const snippet = stripHtml(match[1]);
              if (snippet) snippets.push(snippet);
            }
          }
          if (snippets.length > 0) return snippets;
        }
      } catch (err) {
        console.error("DuckDuckGo HTML fetch failed in priority loop:", err);
      }
    }
  }

  return [];
}

export const FALLBACK_TRENDS = [
  "Hook Idea: '99% of AI LinkedIn posts fail. Not because the AI is bad, but because the prompts are too polite.'",
  "Hook Idea: 'Stop prompting. Start orchestrating. (How I built a multi-agent writing console)'",
  "Structure: Hook (Pattern Interrupt) -> Body (Actionable 3-part list with bold metrics) -> Outro (Clear, low-friction CTA)",
  "Guideline: Keep paragraphs under 2 sentences. Use crisp whitespace formatting. Do not use generic hashtags.",
];
