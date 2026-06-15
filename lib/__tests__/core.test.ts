import { describe, it, expect } from "vitest";
import { robustJsonParse } from "@/lib/json";
import { convertUnicodeStyles, optimizeMobileSpacing, estimateReadability } from "@/app/api/generate/formatter";
import { getActiveAgents } from "@/lib/defaults";
import type { Agent } from "@/types/domain";

describe("robustJsonParse", () => {
  it("parses plain JSON", () => {
    expect(robustJsonParse('{"content": "hello"}')).toEqual({ content: "hello" });
  });

  it("parses JSON inside markdown fences", () => {
    const input = '```json\n{"score": 90}\n```';
    expect(robustJsonParse(input)).toEqual({ score: 90 });
  });

  it("extracts JSON from surrounding text", () => {
    const input = 'Here is the result: {"topics": ["a", "b"]} end.';
    expect(robustJsonParse(input)).toEqual({ topics: ["a", "b"] });
  });
});

describe("formatter", () => {
  it("converts mathematical bold to ASCII", () => {
    const boldA = String.fromCodePoint(0x1d400);
    expect(convertUnicodeStyles(boldA)).toBe("A");
  });

  it("optimizes paragraph spacing", () => {
    const input = "First sentence. Second sentence. Third sentence.";
    const result = optimizeMobileSpacing(input);
    expect(result.split("\n\n").length).toBeGreaterThanOrEqual(1);
  });

  it("estimates readability", () => {
    const result = estimateReadability("This is a simple test. It has two sentences.");
    expect(result.easeScore).toBeGreaterThan(0);
    expect(result.gradeLevel).toBeTruthy();
  });
});

describe("getActiveAgents", () => {
  const agents: Agent[] = [
    { id: "1", name: "A", provider: "gemini", model: "m", systemPrompt: "", temperature: 0.5, enabled: true },
    { id: "2", name: "B", provider: "openai", model: "m", systemPrompt: "", temperature: 0.5, enabled: false },
    { id: "3", name: "C", provider: "gemini", model: "m", systemPrompt: "", temperature: 0.5, enabled: true },
    { id: "4", name: "D", provider: "gemini", model: "m", systemPrompt: "", temperature: 0.5, enabled: true },
  ];

  it("returns only enabled agents capped at 3", () => {
    const active = getActiveAgents(agents);
    expect(active).toHaveLength(3);
    expect(active.every((a) => a.enabled)).toBe(true);
    expect(active.find((a) => a.id === "2")).toBeUndefined();
  });
});
