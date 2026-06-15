export function robustJsonParse(text: string): Record<string, unknown> {
  let cleanText = text.trim();

  if (cleanText.includes("```")) {
    const matches = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (matches && matches[1]) {
      cleanText = matches[1].trim();
    }
  }

  try {
    return JSON.parse(cleanText) as Record<string, unknown>;
  } catch {
    const firstBrace = cleanText.indexOf("{");
    const lastBrace = cleanText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      const candidate = cleanText.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate) as Record<string, unknown>;
      } catch {
        throw new Error(`Failed to parse response as JSON. Raw: ${text}`);
      }
    }
    throw new Error(`No JSON object found in response. Raw: ${text}`);
  }
}
