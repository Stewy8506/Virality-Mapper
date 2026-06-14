"use client";

import { Copy, TrendingUp, CheckCircle2, Award, Zap, Cpu, Eye, EyeOff, MessageSquare, Heart, Share2, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

// Reusable Typographic Progress Bar Indicator
function ScoreProgressBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="minimal-score-bar-group">
      <div className="score-bar-label">
        <span>{label}</span>
        <span>{score}/100</span>
      </div>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
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
  const [arenaTab, setArenaTab] = useState<"drafts" | "critiques" | "refinements">("drafts");
  const [previewMode, setPreviewMode] = useState<"editor" | "linkedin">("editor");
  const [expandedLinkedIn, setExpandedLinkedIn] = useState(false);

  const getSettleScore = () => {
    if (!result.best.scores) return result.best.score || 95;
    if (customMetrics.length === 0) return result.best.scores.viralPotential || result.best.score || 95;
    
    let totalScore = 0;
    let totalWeight = 0;
    customMetrics.forEach((m) => {
      const scoresObj = result.best.scores as Record<string, number>;
      const val = scoresObj[m.id] ?? scoresObj[m.id.toLowerCase()];
      if (val !== undefined) {
        totalScore += val * m.weight;
        totalWeight += m.weight;
      }
    });
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : (result.best.score || 95);
  };

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

  const charCount = result.best.content.length;
  const isOverLimit = charCount > 1200;

  // Split text for LinkedIn simulation
  const lines = result.best.content.split("\n");
  const initialShownLines = lines.slice(0, 4).join("\n");
  const restLines = lines.slice(4).join("\n");

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 anim-fade-up" style={{ marginTop: "40px", paddingBottom: "40px" }}>
      
      {/* Title */}
      <div className="flex justify-center items-center gap-2.5 mb-2">
        <div className="flow-step-icon active" style={{ width: "32px", height: "32px" }}>
          <Zap size={14} />
        </div>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 600 }} className="text-white">
          Settle Panel Outputs
        </h2>
      </div>

      {/* Live Trends Box */}
      {result.trends && result.trends.length > 0 && (
        <div style={{ borderTop: "1px dashed var(--border-muted)", paddingTop: "24px" }}>
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

      {/* Synthesis Section */}
      <div style={{ width: "100%" }}>
        <div style={{ borderTop: "1px solid var(--border-muted)", paddingTop: "24px", minHeight: "400px" }} className="flex flex-col justify-between relative">
          
          <div className="flex flex-col gap-4 flex-1 mt-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="custom-badge custom-badge-accent">
                  <Award size={12} /> CONSOLIDATED MASTER POST
                </span>
                
                {/* Preview Mode Toggle */}
                <button
                  onClick={() => setPreviewMode(previewMode === "editor" ? "linkedin" : "editor")}
                  className="custom-badge hover:bg-white/5 border-zinc-800 flex items-center gap-1.5 cursor-pointer text-zinc-300 font-semibold transition-all"
                  style={{ textTransform: "none", fontFamily: "var(--font-sans)" }}
                >
                  {previewMode === "editor" ? (
                    <>
                      <Eye size={12} className="text-rose-500" />
                      <span>LinkedIn Feed Preview</span>
                    </>
                  ) : (
                    <>
                      <EyeOff size={12} className="text-zinc-400" />
                      <span>Editor Preview</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400 font-mono">
                <div className="flex items-center gap-1">
                  <Zap size={12} className="text-amber-400" /> {customMetrics.length > 0 ? "Settle Score" : "Viral Potential"}: {getSettleScore()}/100
                </div>
                <div className={`flex items-center gap-1 ${isOverLimit ? "text-rose-400" : "text-emerald-400"}`}>
                  <span>{charCount}</span>
                  <span className="text-zinc-600">/ 1200 chars</span>
                </div>
              </div>
            </div>

            {/* Preview Area Toggle */}
            <AnimatePresence mode="wait">
              {previewMode === "editor" ? (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 relative"
                >
                  {/* Clean editor-style preview pane */}
                  <div
                    className="p-4 pr-14"
                    data-lenis-prevent
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border-muted)",
                      borderRadius: 0,
                      whiteSpace: "pre-wrap",
                      fontSize: "1.02rem",
                      lineHeight: 1.7,
                      color: "var(--foreground)",
                      minHeight: "220px",
                      maxHeight: "400px",
                      overflowY: "auto",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {result.best.content}
                  </div>

                  {/* Circular FAB Copy Button */}
                  <button
                    onClick={() => copyToClipboard("best-settled", result.best.content)}
                    className="absolute bottom-4 right-4 h-10 w-10 rounded-full flex items-center justify-center bg-accent text-background hover:bg-accent-hover transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg z-20"
                    title={copiedId === "best-settled" ? "Copied!" : "Copy to clipboard"}
                  >
                    {copiedId === "best-settled" ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="linkedin"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 py-4"
                >
                  {/* Simulated LinkedIn Desktop Layout Frame */}
                  <div className="linkedin-frame">
                    <div className="linkedin-header">
                      <div className="linkedin-avatar">{preferences.linkedinAvatar || "💡"}</div>
                      <div className="linkedin-meta">
                        <span className="linkedin-name">{preferences.linkedinName || "AI Copywriter Agent Network"}</span>
                        <span className="linkedin-title">{preferences.linkedinHeadline || "Synthesized via Virality Settle Engine"}</span>
                        <span className="linkedin-time">Just now • 🌐</span>
                      </div>
                    </div>

                    <div className="linkedin-body">
                      {!expandedLinkedIn ? (
                        <>
                          {initialShownLines}
                          {restLines && (
                            <span className="linkedin-readmore" onClick={() => setExpandedLinkedIn(true)}>
                              ... see more
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          {result.best.content}
                          <span className="linkedin-readmore block mt-2" style={{ color: "#71717a" }} onClick={() => setExpandedLinkedIn(false)}>
                            Show less
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-3 text-zinc-500 font-semibold text-xs flex-wrap gap-2" style={{ borderTop: "1px solid var(--border-muted)" }}>
                      <div className="flex gap-1.5 items-center cursor-pointer hover:opacity-80 p-1.5 rounded"><Heart size={14} /> <span>Like</span></div>
                      <div className="flex gap-1.5 items-center cursor-pointer hover:opacity-80 p-1.5 rounded"><MessageSquare size={14} /> <span>Comment</span></div>
                      <div className="flex gap-1.5 items-center cursor-pointer hover:opacity-80 p-1.5 rounded"><Share2 size={14} /> <span>Repost</span></div>
                      <div className="flex gap-1.5 items-center cursor-pointer hover:opacity-80 p-1.5 rounded"><Send size={14} /> <span>Send</span></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Rationale Section */}
            <div
              className="py-3.5 px-5 rounded-r-xl"
              style={{
                fontSize: "0.82rem",
                background: "var(--background)",
                borderLeft: "3px solid var(--accent)",
                lineHeight: 1.5,
              }}
            >
              <div className="flex items-center gap-2 mb-2 text-zinc-400 font-semibold uppercase text-[10px] font-mono tracking-wider">
                <Cpu size={12} className="text-rose-500" />
                <span>Settle consensus rationale</span>
              </div>
              <p className="italic mb-3" style={{ color: "var(--zinc-400)", margin: 0 }}>
                {result.best.critique}
              </p>
              
              {result.best.scores && (
                <div className="flex flex-col gap-4 mt-3 pt-3" style={{ borderTop: "1px solid var(--border-muted)" }}>
                  {customMetrics.length > 0 ? (
                    customMetrics.map((metric) => {
                      const scoresObj = result.best.scores as Record<string, number>;
                      const score = scoresObj[metric.id] ?? scoresObj[metric.id.toLowerCase()];
                      return (
                        <ScoreProgressBar
                          key={metric.id}
                          label={metric.name}
                          score={score !== undefined ? score : 0}
                        />
                      );
                    })
                  ) : (
                    <>
                      <ScoreProgressBar label="Hook Strength" score={result.best.scores.hookStrength} />
                      <ScoreProgressBar label="Readability" score={result.best.scores.readability} />
                      <ScoreProgressBar label="Credibility" score={result.best.scores.credibility} />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Persona A/B Focus Group Simulator */}
      {result.best.personas && result.best.personas.length > 0 && (
        <div className="flex flex-col gap-6" style={{ marginTop: "24px" }}>
          <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "14px" }}>
            <Cpu size={18} className="text-zinc-400" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }} className="text-white">AI Target Audience Focus Group (A/B Test Simulation)</h3>
          </div>

          <div className="focus-group-list">
            {result.best.personas.map((persona, idx) => {
              const avgScore = Math.round((persona.scrollStopping + persona.engagement + persona.virality) / 3);
              return (
                <div key={idx} className="focus-group-row">
                  <div className="row-num">{String(idx + 1).padStart(2, "0")} /</div>
                  <div className="focus-group-main">
                    <div className="focus-group-header">
                      <div className="persona-info-group">
                        <div className="persona-avatar">
                          {persona.avatar || "👤"}
                        </div>
                        <span className="persona-name">{persona.name}</span>
                      </div>
                      <span className="persona-overall-score">OVERALL SCORE: {avgScore}/100</span>
                    </div>

                    <p className="persona-feedback">
                      &ldquo;{persona.feedback}&rdquo;
                    </p>

                    <div className="persona-metric-bars">
                      <ScoreProgressBar label="Scroll Stopping" score={persona.scrollStopping} />
                      <ScoreProgressBar label="Likelihood to Comment" score={persona.engagement} />
                      <ScoreProgressBar label="Virality (Share Rate)" score={persona.virality} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-4 my-8" style={{ width: "100%" }}>
        <div style={{ flex: 1, height: "1px", background: "var(--border-muted)" }}></div>
        <div className="flex items-center gap-2 text-zinc-500 font-semibold uppercase text-xs font-mono tracking-wider">
          <Cpu size={12} />
          <span>Debate Arena logs</span>
        </div>
        <div style={{ flex: 1, height: "1px", background: "var(--border-muted)" }}></div>
      </div>

      {/* Sub-tab Navigation (Typographic Menu list) */}
      <div className="minimal-tabs-header">
        <button
          onClick={() => setArenaTab("drafts")}
          className={`minimal-tab ${arenaTab === "drafts" ? "active" : ""}`}
        >
          <span>01 / INITIAL DRAFTS</span>
          <span className="tab-badge">({result.initialDrafts.length})</span>
        </button>

        <span className="tab-divider">/</span>

        <button
          onClick={() => setArenaTab("critiques")}
          className={`minimal-tab ${arenaTab === "critiques" ? "active" : ""}`}
        >
          <span>02 / CRITIQUES</span>
          <span className="tab-badge">({result.critiques.length})</span>
        </button>

        <span className="tab-divider">/</span>

        <button
          onClick={() => setArenaTab("refinements")}
          className={`minimal-tab ${arenaTab === "refinements" ? "active" : ""}`}
        >
          <span>03 / REFINED DRAFTS</span>
          <span className="tab-badge">({result.refinedDrafts.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {arenaTab === "drafts" && (
          <motion.div
            key="drafts-tab"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="focus-group-list"
          >
            {result.initialDrafts.map((draft, idx) => (
              <div key={idx} className="focus-group-row">
                <div className="row-num">{String(idx + 1).padStart(2, "0")} /</div>
                <div className="focus-group-main">
                  <div className="focus-group-header">
                    <span className="font-bold text-white uppercase text-xs font-mono">{draft.name}</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--zinc-500)", fontFamily: "var(--font-mono)" }}>
                      {draft.provider.toUpperCase()} • {draft.model}
                    </span>
                  </div>

                  <div
                    className="p-4 font-mono"
                    data-lenis-prevent
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border-muted)",
                      borderRadius: 0,
                      whiteSpace: "pre-wrap",
                      fontSize: "0.82rem",
                      lineHeight: 1.7,
                      color: "var(--zinc-300)",
                      maxHeight: "300px",
                      overflowY: "auto",
                    }}
                  >
                    {draft.content}
                  </div>

                  <div className="p-3 border-l border-zinc-800" style={{ background: "transparent", fontSize: "0.76rem", lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600, display: "block", color: "var(--zinc-500)", marginBottom: "4px", textTransform: "uppercase", fontSize: "0.7rem", fontFamily: "var(--font-mono)" }}>Hook Strategy:</span>
                    <span className="italic" style={{ color: "var(--zinc-400)" }}>{draft.hookExplanation}</span>
                  </div>

                  <div className="flex justify-end mt-2">
                    <button
                      className="text-[11px] font-mono font-bold uppercase text-zinc-400 hover:text-white cursor-pointer bg-transparent border-0"
                      onClick={() => copyToClipboard(`draft-${idx}`, draft.content)}
                    >
                      {copiedId === `draft-${idx}` ? "[Copied!]" : "[Copy Draft]"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {arenaTab === "critiques" && (
          <motion.div
            key="critiques-tab"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="focus-group-list"
          >
            {result.critiques.map((crit, idx) => (
              <div key={idx} className="focus-group-row">
                <div className="row-num">{String(idx + 1).padStart(2, "0")} /</div>
                <div className="focus-group-main">
                  <div className="focus-group-header">
                    <span className="font-mono text-xs uppercase font-bold text-white">
                      {crit.from.split(" ")[0]} &rarr; {crit.to.split(" ")[0]}
                    </span>
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>
                      Score: {crit.score}/100
                    </span>
                  </div>
                  <p className="persona-feedback" style={{ whiteSpace: "pre-wrap" }}>
                    &ldquo;{crit.content}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {arenaTab === "refinements" && (
          <motion.div
            key="refinements-tab"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="focus-group-list"
          >
            {result.refinedDrafts.map((refined, idx) => (
              <div key={idx} className="focus-group-row">
                <div className="row-num">{String(idx + 1).padStart(2, "0")} /</div>
                <div className="focus-group-main">
                  <div className="focus-group-header">
                    <span className="font-bold text-white uppercase text-xs font-mono">{refined.name}</span>
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--zinc-400)", fontFamily: "var(--font-mono)" }}>
                      Self-Score: {refined.score}/100
                    </span>
                  </div>

                  <div
                    className="p-4 font-mono"
                    data-lenis-prevent
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border-muted)",
                      borderRadius: 0,
                      whiteSpace: "pre-wrap",
                      fontSize: "0.82rem",
                      lineHeight: 1.7,
                      color: "var(--zinc-300)",
                      maxHeight: "300px",
                      overflowY: "auto",
                    }}
                  >
                    {refined.content}
                  </div>

                  <div className="p-3 border-l border-zinc-800" style={{ background: "transparent", fontSize: "0.76rem", lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600, display: "block", color: "var(--zinc-500)", marginBottom: "4px", textTransform: "uppercase", fontSize: "0.7rem", fontFamily: "var(--font-mono)" }}>Change Argument:</span>
                    <span className="italic" style={{ color: "var(--zinc-400)" }}>{refined.argument}</span>
                  </div>

                  <div className="flex justify-end mt-2">
                    <button
                      className="text-[11px] font-mono font-bold uppercase text-zinc-400 hover:text-white cursor-pointer bg-transparent border-0"
                      onClick={() => copyToClipboard(`refined-${idx}`, refined.content)}
                    >
                      {copiedId === `refined-${idx}` ? "[Copied!]" : "[Copy Refined]"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
