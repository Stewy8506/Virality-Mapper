"use client";

import { ShieldAlert, Award, TrendingUp, Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";
import type { Agent } from "@/types/domain";

interface ActivityLog {
  id: string;
  time: string;
  text: string;
  type: "info" | "warning" | "success";
}

interface Critique {
  from: string;
  to: string;
  content: string;
  score: number;
}

interface HUDLogConsoleProps {
  statusMessage: string;
  elapsedTime: number;
  formatTime: (seconds: number) => string;
  activityLogs: ActivityLog[];
  activityContainerRef: React.RefObject<HTMLDivElement | null>;
  trends: string[];
  activeStep: number;
  typedDrafts: Record<string, string>;
  typedRefinements: Record<string, string>;
  typedSettledContent: string;
  error: string;
  critiques: Critique[];
  enabledAgents: Agent[];
}

export default function HUDLogConsole({
  statusMessage,
  elapsedTime,
  formatTime,
  activityLogs,
  activityContainerRef,
  trends,
  activeStep,
  typedDrafts,
  typedRefinements,
  typedSettledContent,
  error,
  critiques,
  enabledAgents,
}: HUDLogConsoleProps) {
  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      {/* Error Overlay */}
      {error && (
        <div className="p-4 flex items-start gap-3 rounded-xl bg-red-950/20 border border-red-500/20">
          <ShieldAlert size={16} className="text-rose-500" style={{ marginTop: "2px" }} />
          <p style={{ fontSize: "0.85rem", color: "#fca5a5", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Step 1: Trends Box */}
      {trends.length > 0 && activeStep === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-xl border"
          style={{ background: "var(--panel-bg)", borderColor: "var(--border-active)" }}
        >
          <div className="flex items-center gap-2 mb-3 text-rose-400 font-bold text-xs" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
            <TrendingUp size={14} /> SEARCH TRENDS RETRIEVED
          </div>
          <ul style={{ paddingLeft: "20px", margin: 0, fontSize: "0.85rem", lineHeight: 1.6 }} className="text-zinc-300">
            {trends.map((t, idx) => (
              <li key={idx} style={{ marginBottom: "6px" }}>{t}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Step 2: Live Typewriting Initial Drafts */}
      {activeStep >= 1 && (
        <div className="flex flex-col gap-4">
          <div className="text-[10px] font-mono font-semibold uppercase text-zinc-500 tracking-wider">
            Phase 01 // Parallel Generator Proposal Drafts
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {enabledAgents.map((agent) => {
              const draftText = typedDrafts[agent.name];
              const isLoaded = !!draftText;
              return (
                <div key={agent.id} className={`flex flex-col p-4 border border-zinc-800 bg-zinc-950/10 ${!isLoaded ? "animate-pulse" : ""}`} style={{ minHeight: "200px" }}>
                  <span className="text-[11px] font-bold text-white mb-2 uppercase font-mono">{agent.name}</span>
                  {isLoaded ? (
                    <p style={{ fontSize: "0.82rem", lineHeight: 1.6, whiteSpace: "pre-wrap", color: "var(--zinc-300)", margin: 0 }} className="font-mono">
                      {draftText}
                    </p>
                  ) : (
                    <div className="flex-1 flex flex-col gap-2 justify-center items-center text-zinc-500">
                      <Loader2 className="animate-spin text-rose-500/80 mb-2" size={16} />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Agent is drafting...</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Critiques Logs */}
      {activeStep >= 2 && (
        <div className="flex flex-col gap-4">
          <div className="text-[10px] font-mono font-semibold uppercase text-zinc-500 tracking-wider">
            Phase 02 // Bidirectional Peer Review Critique Panel
          </div>
          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
            {critiques.map((c, idx) => (
              <div key={idx} className="flex flex-col p-4 border border-zinc-800 bg-zinc-900/5 text-xs font-mono">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white uppercase">{c.from.split(" ")[0]} &rarr; {c.to.split(" ")[0]}</span>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>Critique Score: {c.score}/100</span>
                </div>
                <p style={{ margin: 0, color: "var(--zinc-400)", lineHeight: 1.5 }}>
                  &ldquo;{c.content}&rdquo;
                </p>
              </div>
            ))}
            {critiques.length < 6 && (
              <div className="flex items-center gap-2 p-3 border border-dashed border-zinc-800/80 bg-zinc-950/5 text-[10px] font-mono text-zinc-500 animate-pulse">
                <Loader2 className="animate-spin text-rose-500/60" size={12} />
                <span>BI-DIRECTIONAL REVIEW IN PROGRESS ({critiques.length}/6 COMMITTED)...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Refined Drafts */}
      {activeStep >= 3 && (
        <div className="flex flex-col gap-4">
          <div className="text-[10px] font-mono font-semibold uppercase text-zinc-500 tracking-wider">
            Phase 03 // Recursive Refinement Outputs
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {enabledAgents.map((agent) => {
              const refinedText = typedRefinements[agent.name];
              const isLoaded = !!refinedText;
              return (
                <div key={agent.id} className={`flex flex-col p-4 border border-zinc-800 bg-zinc-950/10 ${!isLoaded ? "animate-pulse" : ""}`} style={{ minHeight: "200px" }}>
                  <span className="text-[11px] font-bold text-white mb-2 uppercase font-mono">{agent.name}</span>
                  {isLoaded ? (
                    <p style={{ fontSize: "0.82rem", lineHeight: 1.6, whiteSpace: "pre-wrap", color: "var(--zinc-300)", margin: 0 }} className="font-mono">
                      {refinedText}
                    </p>
                  ) : (
                    <div className="flex-1 flex flex-col gap-2 justify-center items-center text-zinc-500">
                      <Loader2 className="animate-spin text-rose-500/80 mb-2" size={16} />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Refinement in progress...</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 5: Settle Survivor Consolidated Draft */}
      {typedSettledContent && (
        <div className="flex flex-col gap-4">
          <div className="text-[10px] font-mono font-semibold uppercase text-zinc-500 tracking-wider">
            Phase 04 // Master Consensus Survivor
          </div>
          <div className="p-5 border border-zinc-800 bg-zinc-900/10 rounded-xl relative overflow-hidden">
            <span className="custom-badge custom-badge-accent mb-3">
              <Award size={11} /> SURVIVOR COPY
            </span>
            <p style={{ fontSize: "0.95rem", lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--foreground)", margin: "8px 0 0 0" }}>
              {typedSettledContent}
            </p>
          </div>
        </div>
      )}

      {/* Monochrome Stopwatch Log Console */}
      <div className="hud-console">
        <div className="hud-console-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="hud-console-header-dot"></span>
            <span className="text-[10px] font-mono font-bold text-zinc-400">HUD TERMINAL CONSOLE</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[9px] text-zinc-500">
            <div className="flex items-center gap-1">
              <Clock size={11} /> ELAPSED: {formatTime(elapsedTime)}
            </div>
            <div>STATUS: {statusMessage.toUpperCase()}</div>
          </div>
        </div>

        <div className="hud-console-body" ref={activityContainerRef} data-lenis-prevent aria-live="polite" aria-label="Generation activity log">
          {activityLogs.length === 0 ? (
            <div className="text-zinc-600 italic font-mono text-[10px]">Initializing secure debate arena crawler pipelines...</div>
          ) : (
            activityLogs.map((log) => (
              <div key={log.id} className="hud-console-log-row flex items-start gap-3 font-mono text-[10px] py-0.5">
                <span className="text-zinc-600 flex-shrink-0">[{log.time}]</span>
                <span className={log.type === "success" ? "text-emerald-400" : log.type === "warning" ? "text-rose-400" : "text-zinc-400"}>
                  {log.type === "success" ? "✓" : log.type === "warning" ? "!" : "•"} {log.text}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
