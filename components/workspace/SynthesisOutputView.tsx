"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, CheckCircle2, Award, Zap, Cpu, Eye, EyeOff, MessageSquare, Heart, Share2, Send } from "lucide-react";

interface BestPost {
  style: string;
  content: string;
  scores?: Record<string, number>;
  score?: number;
  critique: string;
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

interface SynthesisOutputViewProps {
  best: BestPost;
  preferences: UserPreferences;
  customMetrics?: CustomMetric[];
  copiedId: string | null;
  copyToClipboard: (id: string, text: string) => void;
}

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

export default function SynthesisOutputView({
  best,
  preferences,
  customMetrics = [],
  copiedId,
  copyToClipboard,
}: SynthesisOutputViewProps) {
  const [previewMode, setPreviewMode] = useState<"editor" | "linkedin">("editor");
  const [expandedLinkedIn, setExpandedLinkedIn] = useState(false);

  const getSettleScore = () => {
    if (!best.scores) return best.score || 95;
    if (customMetrics.length === 0) return best.scores.viralPotential || best.score || 95;

    let totalScore = 0;
    let totalWeight = 0;
    customMetrics.forEach((m) => {
      const scoresObj = best.scores as Record<string, number>;
      const val = scoresObj[m.id] ?? scoresObj[m.id.toLowerCase()];
      if (val !== undefined) {
        totalScore += val * m.weight;
        totalWeight += m.weight;
      }
    });
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : (best.score || 95);
  };

  const charCount = best.content.length;
  const isOverLimit = charCount > 1200;

  // Split text for LinkedIn simulation
  const lines = best.content.split("\n");
  const initialShownLines = lines.slice(0, 4).join("\n");
  const restLines = lines.slice(4).join("\n");

  return (
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
                  className="p-6 pb-16 transition-all duration-300"
                  style={{
                    background: "rgba(255, 255, 255, 0.012)",
                    border: "1px solid var(--border-active)",
                    borderLeft: "4px solid var(--accent)",
                    borderRadius: "12px",
                    whiteSpace: "pre-wrap",
                    fontSize: "1.05rem",
                    lineHeight: 1.75,
                    color: "var(--foreground)",
                    minHeight: "150px",
                    maxHeight: "none",
                    fontFamily: "var(--font-sans)",
                    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 0 40px var(--accent-glow), 0 0 15px var(--accent-glow)",
                  }}
                >
                  {best.content}
                </div>

                {/* Sleek Copy Button */}
                <button
                  onClick={() => copyToClipboard("best-settled", best.content)}
                  className="absolute bottom-4 right-4 action-pill-btn z-20"
                  title={copiedId === "best-settled" ? "Copied!" : "Copy to clipboard"}
                >
                  {copiedId === "best-settled" ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  <span>{copiedId === "best-settled" ? "COPIED" : "COPY"}</span>
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
                        {best.content}
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
            className="rounded-r-xl"
            style={{
              fontSize: "0.82rem",
              background: "var(--background)",
              borderLeft: "3px solid var(--accent)",
              lineHeight: 1.5,
              padding: "26px 28px",
            }}
          >
            <div className="flex items-center gap-2 mb-2 text-zinc-400 font-semibold uppercase text-[10px] font-mono tracking-wider">
              <Cpu size={12} className="text-rose-500" />
              <span>Settle consensus rationale</span>
            </div>
            <p className="italic mb-3" style={{ color: "var(--zinc-400)", margin: 0 }}>
              {best.critique}
            </p>

            {best.scores && (
              <div className="flex flex-col gap-4 mt-3 pt-3" style={{ borderTop: "1px solid var(--border-muted)" }}>
                {customMetrics.length > 0 ? (
                  customMetrics.map((metric) => {
                    const scoresObj = best.scores as Record<string, number>;
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
                    <ScoreProgressBar label="Hook Strength" score={best.scores.hookStrength} />
                    <ScoreProgressBar label="Readability" score={best.scores.readability} />
                    <ScoreProgressBar label="Credibility" score={best.scores.credibility} />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
