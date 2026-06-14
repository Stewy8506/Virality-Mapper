"use client";

import { Copy, TrendingUp, CheckCircle2, Award, Zap, Cpu, Eye, EyeOff, MessageSquare, Heart, Share2, Send } from "lucide-react";
import { useState } from "react";
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
  };
}

export default function ResultsDisplay({ result }: { result: GenerationResult }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [arenaTab, setArenaTab] = useState<"drafts" | "critiques" | "refinements">("drafts");
  const [previewMode, setPreviewMode] = useState<"editor" | "linkedin">("editor");
  const [expandedLinkedIn, setExpandedLinkedIn] = useState(false);

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
    <div className="max-w-4xl mx-auto flex flex-col gap-6 anim-fade-up" style={{ marginTop: "40px", paddingBottom: "40px" }}>
      
      {/* Title */}
      <div className="flex justify-center items-center gap-2 mb-2">
        <div className="flow-step-icon active" style={{ width: "32px", height: "32px" }}>
          <Zap size={14} />
        </div>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 600 }} className="text-white">
          Settle Panel Outputs
        </h2>
      </div>

      {/* Live Trends Box */}
      {result.trends && result.trends.length > 0 && (
        <div className="glass-panel p-5 bg-[#030305]/60 border-rose-500/10">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-rose-500 animate-pulse" />
            <span style={{ fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--zinc-300)" }}>
              Real-time LinkedIn Trends Integrated
            </span>
          </div>
          <ul style={{ paddingLeft: "18px", margin: 0, display: "flex", flexDirection: "column", gap: "8px" }} className="text-zinc-300">
            {result.trends.map((trend: string, idx: number) => (
              <li key={idx} style={{ fontSize: "0.82rem", lineHeight: 1.5 }}>
                {trend}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Synthesis Section */}
      <div style={{ width: "100%" }}>
        <div className="glass-panel p-6 flex flex-col justify-between" style={{ minHeight: "420px", border: "1px solid rgba(255, 46, 85, 0.2)", background: "rgba(255, 46, 85, 0.01)" }}>
          <div className="flex flex-col gap-4 flex-1">
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
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1"
                >
                  {/* Clean editor-style preview pane */}
                  <div
                    className="p-4"
                    style={{
                      background: "#010102",
                      border: "1px solid var(--border-muted)",
                      borderRadius: "8px",
                      whiteSpace: "pre-wrap",
                      fontSize: "0.9rem",
                      lineHeight: 1.65,
                      color: "white",
                      minHeight: "220px",
                      maxHeight: "400px",
                      overflowY: "auto",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {result.best.content}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="linkedin"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 py-4"
                >
                  {/* Simulated LinkedIn Desktop Layout Frame */}
                  <div className="linkedin-frame">
                    <div className="linkedin-header">
                      <div className="linkedin-avatar">💡</div>
                      <div className="linkedin-meta">
                        <span className="linkedin-name">AI Copywriter Agent Network</span>
                        <span className="linkedin-title">Synthesized via Virality Settle Engine</span>
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

                    <div className="flex justify-between items-center border-t border-zinc-200 mt-4 pt-3 text-zinc-500 font-semibold text-xs flex-wrap gap-2">
                      <div className="flex gap-1.5 items-center cursor-pointer hover:bg-zinc-100 p-1.5 rounded"><Heart size={14} /> <span>Like</span></div>
                      <div className="flex gap-1.5 items-center cursor-pointer hover:bg-zinc-100 p-1.5 rounded"><MessageSquare size={14} /> <span>Comment</span></div>
                      <div className="flex gap-1.5 items-center cursor-pointer hover:bg-zinc-100 p-1.5 rounded"><Share2 size={14} /> <span>Repost</span></div>
                      <div className="flex gap-1.5 items-center cursor-pointer hover:bg-zinc-100 p-1.5 rounded"><Send size={14} /> <span>Send</span></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Rationale Section */}
            <div
              className="py-3.5 px-4 rounded"
              style={{
                fontSize: "0.82rem",
                background: "#010102",
                borderLeft: "3px solid var(--accent)",
                borderRadius: "0 8px 8px 0",
                lineHeight: 1.5,
              }}
            >
              <div className="flex items-center gap-2 mb-1 text-zinc-400 font-semibold uppercase text-[10px] font-mono tracking-wider">
                <Cpu size={12} className="text-rose-500" />
                <span>Settle consensus rationale</span>
              </div>
              <p className="serif-italic" style={{ color: "var(--zinc-400)", margin: 0 }}>
                {result.best.critique}
              </p>
              
              {result.best.scores && (
                <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-zinc-800">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold">
                    <span className="text-zinc-500 uppercase">Hook:</span>
                    <span className={result.best.scores.hookStrength >= 90 ? "text-emerald-400" : "text-amber-400"}>{result.best.scores.hookStrength}/100</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold">
                    <span className="text-zinc-500 uppercase">Readability:</span>
                    <span className={result.best.scores.readability >= 90 ? "text-emerald-400" : "text-amber-400"}>{result.best.scores.readability}/100</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold">
                    <span className="text-zinc-500 uppercase">Credibility:</span>
                    <span className={result.best.scores.credibility >= 90 ? "text-emerald-400" : "text-amber-400"}>{result.best.scores.credibility}/100</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Copy Button */}
          <button
            className="custom-btn custom-btn-accent w-full"
            style={{
              marginTop: "20px",
              height: "44px",
              fontSize: "0.88rem",
            }}
            onClick={() => copyToClipboard("best-settled", result.best.content)}
          >
            <AnimatePresence mode="wait">
              {copiedId === "best-settled" ? (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} /> Copied to Clipboard!
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Copy size={16} /> Copy Final Settle Post
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8" style={{ width: "100%" }}>
        <div style={{ flex: 1, height: "1px", background: "var(--border-muted)" }}></div>
        <div className="flex items-center gap-2 text-zinc-500 font-semibold uppercase text-xs font-mono tracking-wider">
          <Cpu size={12} />
          <span>Debate Arena logs</span>
        </div>
        <div style={{ flex: 1, height: "1px", background: "var(--border-muted)" }}></div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex justify-center items-center gap-8 mb-6" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "14px" }}>
        <button
          className="tab-btn"
          style={{
            background: "none",
            border: "none",
            color: arenaTab === "drafts" ? "white" : "var(--zinc-500)",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            paddingBottom: "10px",
            borderBottom: arenaTab === "drafts" ? "2px solid var(--accent)" : "none",
            outline: "none",
            transition: "all 0.2s",
          }}
          onClick={() => setArenaTab("drafts")}
        >
          Phase 1: Initial Drafts
        </button>
        <button
          className="tab-btn"
          style={{
            background: "none",
            border: "none",
            color: arenaTab === "critiques" ? "white" : "var(--zinc-500)",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            paddingBottom: "10px",
            borderBottom: arenaTab === "critiques" ? "2px solid var(--accent)" : "none",
            outline: "none",
            transition: "all 0.2s",
          }}
          onClick={() => setArenaTab("critiques")}
        >
          Phase 2: Critique Arena
        </button>
        <button
          className="tab-btn"
          style={{
            background: "none",
            border: "none",
            color: arenaTab === "refinements" ? "white" : "var(--zinc-500)",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            paddingBottom: "10px",
            borderBottom: arenaTab === "refinements" ? "2px solid var(--accent)" : "none",
            outline: "none",
            transition: "all 0.2s",
          }}
          onClick={() => setArenaTab("refinements")}
        >
          Phase 3: Refined Drafts
        </button>
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {arenaTab === "drafts" && (
          <motion.div
            key="drafts-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}
          >
            {result.initialDrafts.map((draft, idx) => (
              <div key={idx} className="glass-panel p-5 flex flex-col justify-between" style={{ minHeight: "320px" }}>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "8px" }}>
                    <span className="custom-badge" style={{ fontSize: "0.68rem" }}>{draft.name.split(" ")[0]}</span>
                    <span style={{ fontSize: "0.68rem", color: "var(--zinc-500)", fontFamily: "var(--font-mono)" }}>
                      {draft.provider.toUpperCase()} • {draft.model.substring(0, 10)}
                    </span>
                  </div>
                  
                  <div
                    className="p-3 font-mono"
                    style={{
                      background: "#010102",
                      border: "1px solid rgba(255,255,255,0.04)",
                      borderRadius: "6px",
                      whiteSpace: "pre-wrap",
                      fontSize: "0.75rem",
                      lineHeight: 1.6,
                      color: "var(--zinc-300)",
                      height: "220px",
                      overflowY: "auto",
                    }}
                  >
                    {draft.content}
                  </div>

                  <div className="p-3 rounded bg-[#020204] border-l border-zinc-800" style={{ fontSize: "0.72rem", lineHeight: 1.45 }}>
                    <span style={{ fontWeight: 600, display: "block", color: "var(--zinc-400)", marginBottom: "4px" }}>Hook Strategy:</span>
                    <span className="serif-italic" style={{ color: "var(--zinc-400)" }}>{draft.hookExplanation}</span>
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}
          >
            {result.critiques.map((crit, idx) => (
              <div key={idx} className="glass-panel p-5 flex flex-col gap-2" style={{ background: "rgba(10,10,12,0.4)" }}>
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
                <p style={{ fontSize: "0.78rem", color: "var(--zinc-300)", lineHeight: 1.5, margin: 0, whiteSpace: "pre-wrap" }} className="serif-italic">
                  "{crit.content}"
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {arenaTab === "refinements" && (
          <motion.div
            key="refinements-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}
          >
            {result.refinedDrafts.map((refined, idx) => (
              <div key={idx} className="glass-panel p-5 flex flex-col justify-between" style={{ minHeight: "320px" }}>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "8px" }}>
                    <span className="custom-badge custom-badge-accent" style={{ fontSize: "0.68rem" }}>{refined.name.split(" ")[0]}</span>
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--zinc-400)", fontFamily: "var(--font-mono)" }}>
                      Self-Score: {refined.score}/100
                    </span>
                  </div>
                  
                  <div
                    className="p-3 font-mono"
                    style={{
                      background: "#010102",
                      border: "1px solid rgba(255,255,255,0.04)",
                      borderRadius: "6px",
                      whiteSpace: "pre-wrap",
                      fontSize: "0.75rem",
                      lineHeight: 1.6,
                      color: "var(--zinc-300)",
                      height: "220px",
                      overflowY: "auto",
                    }}
                  >
                    {refined.content}
                  </div>

                  <div className="p-3 rounded bg-[#020204] border-l border-zinc-800" style={{ fontSize: "0.72rem", lineHeight: 1.45 }}>
                    <span style={{ fontWeight: 600, display: "block", color: "var(--zinc-400)", marginBottom: "4px" }}>Change Argument:</span>
                    <span className="serif-italic" style={{ color: "var(--zinc-400)" }}>{refined.argument}</span>
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
