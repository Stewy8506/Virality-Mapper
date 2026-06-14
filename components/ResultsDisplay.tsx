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
    scores?: {
      hookStrength: number;
      readability: number;
      credibility: number;
      viralPotential: number;
    };
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
}

// Reusable Circular Progress Ring Indicator
function CircularProgress({ score, size = 42 }: { score: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border-muted)"
          strokeWidth="3"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--accent)"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.35s" }}
        />
      </svg>
      <span className="absolute text-[10px] font-mono font-bold text-zinc-300">{score}</span>
    </div>
  );
}

export default function ResultsDisplay({
  result,
  preferences,
}: {
  result: GenerationResult;
  preferences: UserPreferences;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [arenaTab, setArenaTab] = useState<"drafts" | "critiques" | "refinements">("drafts");
  const [previewMode, setPreviewMode] = useState<"editor" | "linkedin">("editor");
  const [expandedLinkedIn, setExpandedLinkedIn] = useState(false);

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
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-zinc-400" />
            <span style={{ fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground)" }}>
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
        <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden" style={{ minHeight: "420px" }}>
          {/* Top edge gradient stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: "linear-gradient(90deg, var(--border-muted), var(--accent), var(--border-muted))" }}></div>
          
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
                  <Zap size={12} className="text-amber-400" /> Viral Potential: {result.best.scores?.viralPotential || result.best.score || 95}/100
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
                      borderRadius: "10px",
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

                    <div className="flex justify-between items-center border-t mt-4 pt-3 text-zinc-500 font-semibold text-xs flex-wrap gap-2" style={{ borderColor: "var(--border-muted)" }}>
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
                <div className="flex flex-wrap gap-6 mt-3 pt-3 border-t border-zinc-800">
                  <div className="flex items-center gap-3">
                    <CircularProgress score={result.best.scores.hookStrength} size={36} />
                    <span className="text-[10px] font-mono font-semibold text-zinc-500 uppercase">Hook Strength</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CircularProgress score={result.best.scores.readability} size={36} />
                    <span className="text-[10px] font-mono font-semibold text-zinc-500 uppercase">Readability</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CircularProgress score={result.best.scores.credibility} size={36} />
                    <span className="text-[10px] font-mono font-semibold text-zinc-500 uppercase">Credibility</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Persona A/B Focus Group Simulator */}
      {result.best.personas && result.best.personas.length > 0 && (
        <div className="glass-panel p-6 flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "14px" }}>
            <Cpu size={18} className="text-zinc-400" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }} className="text-white">AI Target Audience Focus Group (A/B Test Simulation)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {result.best.personas.map((persona, idx: number) => {
              const avgScore = Math.round((persona.scrollStopping + persona.engagement + persona.virality) / 3);
              return (
                <div key={idx} className="glass-panel p-5 flex flex-col gap-3 hover:border-zinc-700 transition-colors" style={{ background: "var(--background)" }}>
                  <div className="flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-lg" style={{ background: "var(--panel-bg)", borderColor: "var(--border-muted)" }}>
                        {persona.avatar || "👤"}
                      </div>
                      <div className="flex flex-col">
                        <span style={{ fontSize: "0.85rem", fontWeight: 600 }} className="text-white">{persona.name}</span>
                        <span style={{ fontSize: "0.7rem", color: "var(--zinc-500)" }}>Focus Persona</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-xs" style={{ background: "var(--panel-bg)", border: "1px solid var(--border-muted)" }}>
                      <span className="text-zinc-500">SCORE:</span>
                      <span style={{ color: avgScore >= 70 ? "var(--foreground)" : "var(--zinc-500)", fontWeight: 600 }}>
                        {avgScore}/100
                      </span>
                    </div>
                  </div>

                  <p className="italic" style={{ fontSize: "0.8rem", color: "var(--zinc-400)", lineHeight: 1.45, margin: 0 }}>
                    &ldquo;{persona.feedback}&rdquo;
                  </p>

                  <div className="flex flex-col gap-2.5 mt-2 pt-2.5 border-t" style={{ borderColor: "var(--border-muted)" }}>
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-500">Scroll Stopping:</span>
                      <span className="text-zinc-300">{persona.scrollStopping}%</span>
                    </div>
                    <div style={{ height: "4px", width: "100%", background: "var(--border-muted)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${persona.scrollStopping}%`, background: "var(--accent)", borderRadius: "2px" }} />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-500">Likelihood to Comment:</span>
                      <span className="text-zinc-300">{persona.engagement}%</span>
                    </div>
                    <div style={{ height: "4px", width: "100%", background: "var(--border-muted)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${persona.engagement}%`, background: "var(--accent)", opacity: 0.7, borderRadius: "2px" }} />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-500">Virality (Share Rate):</span>
                      <span className="text-zinc-300">{persona.virality}%</span>
                    </div>
                    <div style={{ height: "4px", width: "100%", background: "var(--border-muted)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${persona.virality}%`, background: "var(--accent)", opacity: 0.4, borderRadius: "2px" }} />
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

      {/* Sub-tab Navigation (Pill Segmented Control Switcher) */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-zinc-900/60 p-1 rounded-full border border-zinc-800/40 relative z-10">
          <button
            onClick={() => setArenaTab("drafts")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 relative ${
              arenaTab === "drafts" ? "text-background" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="relative z-10">Phase 1: Initial Drafts</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold relative z-10 ${
              arenaTab === "drafts" ? "bg-background text-foreground" : "bg-zinc-800 text-zinc-400"
            }`}>
              {result.initialDrafts.length}
            </span>
            {arenaTab === "drafts" && (
              <motion.div
                layoutId="activeArenaTab"
                className="absolute inset-0 rounded-full bg-accent z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>

          <button
            onClick={() => setArenaTab("critiques")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 relative ${
              arenaTab === "critiques" ? "text-background" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="relative z-10">Phase 2: Critiques</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold relative z-10 ${
              arenaTab === "critiques" ? "bg-background text-foreground" : "bg-zinc-800 text-zinc-400"
            }`}>
              {result.critiques.length}
            </span>
            {arenaTab === "critiques" && (
              <motion.div
                layoutId="activeArenaTab"
                className="absolute inset-0 rounded-full bg-accent z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>

          <button
            onClick={() => setArenaTab("refinements")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 relative ${
              arenaTab === "refinements" ? "text-background" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="relative z-10">Phase 3: Refined Drafts</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold relative z-10 ${
              arenaTab === "refinements" ? "bg-background text-foreground" : "bg-zinc-800 text-zinc-400"
            }`}>
              {result.refinedDrafts.length}
            </span>
            {arenaTab === "refinements" && (
              <motion.div
                layoutId="activeArenaTab"
                className="absolute inset-0 rounded-full bg-accent z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        </div>
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
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}
          >
            {result.initialDrafts.map((draft, idx) => (
              <div key={idx} className="glass-panel p-5 flex flex-col justify-between" style={{ minHeight: "320px" }}>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "8px" }}>
                    <div className="flex items-center">
                      <span className="text-[10px] text-zinc-500 font-bold mr-1.5 font-mono">#{idx + 1}</span>
                      <span className="custom-badge" style={{ fontSize: "0.68rem" }}>{draft.name.split(" ")[0]}</span>
                    </div>
                    <span style={{ fontSize: "0.68rem", color: "var(--zinc-500)", fontFamily: "var(--font-mono)" }}>
                      {draft.provider.toUpperCase()} • {draft.model.substring(0, 10)}
                    </span>
                  </div>
                  
                  <div
                    className="p-3 font-mono"
                    data-lenis-prevent
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border-muted)",
                      borderRadius: "10px",
                      whiteSpace: "pre-wrap",
                      fontSize: "0.75rem",
                      lineHeight: 1.7,
                      color: "var(--zinc-300)",
                      height: "220px",
                      overflowY: "auto",
                    }}
                  >
                    {draft.content}
                  </div>

                  <div className="p-3 rounded-lg border-l border-zinc-800" style={{ background: "var(--background)", fontSize: "0.72rem", lineHeight: 1.45 }}>
                    <span style={{ fontWeight: 600, display: "block", color: "var(--zinc-400)", marginBottom: "4px" }}>Hook Strategy:</span>
                    <span className="italic" style={{ color: "var(--zinc-400)" }}>{draft.hookExplanation}</span>
                  </div>
                </div>

                <button
                  className="custom-btn custom-btn-secondary w-full"
                  style={{ marginTop: "16px", height: "36px", fontSize: "0.78rem" }}
                  onClick={() => copyToClipboard(`draft-${idx}`, draft.content)}
                >
                  {copiedId === `draft-${idx}` ? "Copied!" : "Copy Draft"}
                </button>
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
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}
          >
            {result.critiques.map((crit, idx) => (
              <div key={idx} className="glass-panel p-5 flex flex-col gap-2">
                <div className="flex justify-between items-center" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "10px", marginBottom: "6px" }}>
                  <div className="flex items-center gap-1.5">
                    <span className="custom-badge" style={{ fontSize: "0.68rem" }}>{crit.from.split(" ")[0]}</span>
                    <span style={{ fontSize: "0.68rem", color: "var(--zinc-600)" }}>→</span>
                    <span className="custom-badge" style={{ fontSize: "0.68rem" }}>{crit.to.split(" ")[0]}</span>
                  </div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>
                    Score: {crit.score}/100
                  </span>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--zinc-300)", lineHeight: 1.5, margin: 0, whiteSpace: "pre-wrap" }} className="italic">
                  &ldquo;{crit.content}&rdquo;
                </p>
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
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}
          >
            {result.refinedDrafts.map((refined, idx) => (
              <div key={idx} className="glass-panel p-5 flex flex-col justify-between" style={{ minHeight: "320px" }}>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "8px" }}>
                    <div className="flex items-center">
                      <span className="text-[10px] text-zinc-500 font-bold mr-1.5 font-mono">#{idx + 1}</span>
                      <span className="custom-badge custom-badge-accent" style={{ fontSize: "0.68rem" }}>{refined.name.split(" ")[0]}</span>
                    </div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--zinc-400)", fontFamily: "var(--font-mono)" }}>
                      Self-Score: {refined.score}/100
                    </span>
                  </div>
                  
                  <div
                    className="p-3 font-mono"
                    data-lenis-prevent
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border-muted)",
                      borderRadius: "10px",
                      whiteSpace: "pre-wrap",
                      fontSize: "0.75rem",
                      lineHeight: 1.7,
                      color: "var(--zinc-300)",
                      height: "220px",
                      overflowY: "auto",
                    }}
                  >
                    {refined.content}
                  </div>

                  <div className="p-3 rounded-lg border-l border-zinc-800" style={{ background: "var(--background)", fontSize: "0.72rem", lineHeight: 1.45 }}>
                    <span style={{ fontWeight: 600, display: "block", color: "var(--zinc-400)", marginBottom: "4px" }}>Change Argument:</span>
                    <span className="italic" style={{ color: "var(--zinc-400)" }}>{refined.argument}</span>
                  </div>
                </div>

                <button
                  className="custom-btn custom-btn-secondary w-full"
                  style={{ marginTop: "16px", height: "36px", fontSize: "0.78rem" }}
                  onClick={() => copyToClipboard(`refined-${idx}`, refined.content)}
                >
                  {copiedId === `refined-${idx}` ? "Copied!" : "Copy Refined"}
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
