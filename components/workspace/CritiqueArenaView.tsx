"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, CheckCircle2 } from "lucide-react";

interface Draft {
  name: string;
  content: string;
  hookExplanation: string;
  provider: string;
  model: string;
}

interface Critique {
  from: string;
  to: string;
  content: string;
  score: number;
}

interface RefinedDraft {
  name: string;
  content: string;
  score: number;
  argument: string;
  provider: string;
  model: string;
}

interface CritiqueArenaViewProps {
  initialDrafts: Draft[];
  critiques: Critique[];
  refinedDrafts: RefinedDraft[];
  copiedId: string | null;
  copyToClipboard: (id: string, text: string) => void;
}

export default function CritiqueArenaView({
  initialDrafts,
  critiques,
  refinedDrafts,
  copiedId,
  copyToClipboard,
}: CritiqueArenaViewProps) {
  const [arenaTab, setArenaTab] = useState<"drafts" | "critiques" | "refinements">("drafts");

  return (
    <>
      {/* Sub-tab Navigation (Typographic Menu list) */}
      <div className="minimal-tabs-header max-w-4xl mx-auto w-full">
        <button
          onClick={() => setArenaTab("drafts")}
          className={`minimal-tab ${arenaTab === "drafts" ? "active" : ""}`}
        >
          <span>01 / INITIAL DRAFTS</span>
          <span className="tab-badge">({initialDrafts.length})</span>
        </button>

        <span className="tab-divider">/</span>

        <button
          onClick={() => setArenaTab("critiques")}
          className={`minimal-tab ${arenaTab === "critiques" ? "active" : ""}`}
        >
          <span>02 / CRITIQUES</span>
          <span className="tab-badge">({critiques.length})</span>
        </button>

        <span className="tab-divider">/</span>

        <button
          onClick={() => setArenaTab("refinements")}
          className={`minimal-tab ${arenaTab === "refinements" ? "active" : ""}`}
        >
          <span>03 / REFINED DRAFTS</span>
          <span className="tab-badge">({refinedDrafts.length})</span>
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
            className="focus-group-list max-w-4xl mx-auto w-full"
          >
            {initialDrafts.map((draft, idx) => (
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
                      className="action-pill-btn"
                      onClick={() => copyToClipboard(`draft-${idx}`, draft.content)}
                    >
                      {copiedId === `draft-${idx}` ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                      <span>{copiedId === `draft-${idx}` ? "COPIED" : "COPY DRAFT"}</span>
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
            className="focus-group-list max-w-4xl mx-auto w-full"
          >
            {critiques.map((crit, idx) => (
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
            className="focus-group-list max-w-4xl mx-auto w-full"
          >
            {refinedDrafts.map((refined, idx) => (
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
                      className="action-pill-btn"
                      onClick={() => copyToClipboard(`refined-${idx}`, refined.content)}
                    >
                      {copiedId === `refined-${idx}` ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                      <span>{copiedId === `refined-${idx}` ? "COPIED" : "COPY REFINED"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
