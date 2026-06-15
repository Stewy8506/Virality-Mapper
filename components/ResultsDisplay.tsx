"use client";

import { TrendingUp, Zap, Cpu } from "lucide-react";
import { useState, useEffect } from "react";
import CritiqueArenaView from "./workspace/CritiqueArenaView";
import FocusGroupSimulatorView from "./workspace/FocusGroupSimulatorView";
import SynthesisOutputView from "./workspace/SynthesisOutputView";

interface GenerationResult {
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

interface UserPreferences {
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

interface CustomMetric {
  id: string;
  name: string;
  weight: number;
  scoringInstructions: string;
}

export default function ResultsDisplay({
  result,
  preferences,
  customMetrics = [],
}: {
  result: GenerationResult;
  preferences: UserPreferences;
  customMetrics?: CustomMetric[];
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-copy clipboard logic
  useEffect(() => {
    if (result?.best?.content && preferences.autoCopyToClipboard) {
      navigator.clipboard.writeText(result.best.content)
        .then(() => {
          setCopiedId("best-settled");
          setTimeout(() => setCopiedId(null), 2000);
        })
        .catch((err) => {
          console.warn("Auto-copy clipboard failed:", err);
        });
    }
  }, [result, preferences.autoCopyToClipboard]);

  const copyToClipboard = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  if (!result || !result.best) return null;

  return (
    <div className="w-full mx-auto flex flex-col gap-8 anim-fade-up" style={{ marginTop: "40px", paddingBottom: "40px" }}>

      {/* Title */}
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
        <div className="flex justify-center items-center gap-2.5 mb-2">
          <div className="flow-step-icon active" style={{ width: "32px", height: "32px" }}>
            <Zap size={14} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 400 }} className="text-white">
            Settle Panel Outputs
          </h2>
        </div>
      </div>


      {/* Synthesis Section */}
      <div className="max-w-6xl mx-auto w-full">
        <SynthesisOutputView
          best={result.best}
          preferences={preferences}
          customMetrics={customMetrics}
          copiedId={copiedId}
          copyToClipboard={copyToClipboard}
        />
      </div>

      {/* AI Persona A/B Focus Group Simulator */}
      {result.best.personas && result.best.personas.length > 0 && (
        <div className="max-w-6xl mx-auto w-full">
          <FocusGroupSimulatorView personas={result.best.personas} />
        </div>
      )}

      {/* Divider */}
      <div className="max-w-6xl mx-auto w-full flex items-center gap-4 my-8">
        <div style={{ flex: 1, height: "1px", background: "var(--border-muted)" }}></div>
        <div className="flex items-center gap-2 text-zinc-400 font-semibold uppercase text-m font-mono tracking-wider">
          <Cpu size={12} />
          <span>Debate Arena logs</span>
        </div>
        <div style={{ flex: 1, height: "1px", background: "var(--border-muted)" }}></div>
      </div>

      {/* Critique Arena Section */}
      <div className="max-w-6xl mx-auto w-full">
        <CritiqueArenaView
          initialDrafts={result.initialDrafts}
          critiques={result.critiques}
          refinedDrafts={result.refinedDrafts}
          copiedId={copiedId}
          copyToClipboard={copyToClipboard}
        />
      </div>

      {/* Live Trends Box */}
      {result.trends && result.trends.length > 0 && (
        <div className="max-w-4xl mx-auto w-full" style={{ borderTop: "1px dashed var(--border-muted)", paddingTop: "24px", marginTop: "24px" }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-zinc-400" />
            <span style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground)", fontFamily: "var(--font-mono)" }}>
              Real-time LinkedIn Trends Integrated
            </span>
          </div>
          <ul style={{ paddingLeft: "18px", margin: 0, display: "flex", flexDirection: "column", gap: "8px" }} className="text-zinc-300">
            {result.trends.map((trend: string, idx: number) => (
              <li key={idx} style={{ fontSize: "0.82rem", lineHeight: 1.5, color: "var(--foreground)", opacity: 0.85 }}>
                {trend}
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}
