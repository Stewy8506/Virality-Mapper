"use client";

import { ArrowRight } from "lucide-react";
import React from "react";

interface Agent {
  id: string;
  name: string;
  provider: string;
  model: string;
  enabled: boolean;
}

interface PostInputFieldsProps {
  formData: {
    appName: string;
    description: string;
    targetAudience: string;
    tone: string;
    hookArchetype: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  activeAgentsCount: number;
  loading: boolean;
  error: string;
  agents: Agent[];
  handleSubmit: (e: React.FormEvent) => void;
}

export default function PostInputFields({
  formData,
  handleChange,
  activeAgentsCount,
  loading,
  error,
  agents,
  handleSubmit,
}: PostInputFieldsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Panel: Stacked Input context form */}
      <form onSubmit={handleSubmit} className="glass-panel typographic-form">
        <div className="form-row">
          <div className="row-num">01 /</div>
          <div className="row-content">
            <label htmlFor="appName" className="row-label">We are building (App / Project Name)</label>
            <input
              required
              type="text"
              id="appName"
              name="appName"
              className="minimal-input"
              placeholder="e.g. Virality Mapper"
              value={formData.appName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="row-num">02 /</div>
          <div className="row-content">
            <label htmlFor="description" className="row-label">What does it do? (Features & Problems Solved)</label>
            <textarea
              required
              id="description"
              name="description"
              className="minimal-input"
              placeholder="Explain what problem it solves, its target core features, benchmarks, and technology used..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row grid-2">
          <div style={{ display: "flex", gap: "24px", alignItems: "start" }}>
            <div className="row-num">03 /</div>
            <div className="row-content">
              <label htmlFor="targetAudience" className="row-label">Target Audience</label>
              <input
                type="text"
                id="targetAudience"
                name="targetAudience"
                className="minimal-input"
                placeholder="e.g. Senior Developers, Tech Managers"
                value={formData.targetAudience}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "24px", alignItems: "start" }}>
            <div className="row-num">04 /</div>
            <div className="row-content">
              <label htmlFor="tone" className="row-label">Writing Tone</label>
              <input
                type="text"
                id="tone"
                name="tone"
                className="minimal-input"
                placeholder="e.g. Technical, punchy, narrative"
                value={formData.tone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="row-num">05 /</div>
          <div className="row-content">
            <label htmlFor="hookArchetype" className="row-label">Hook Archetype</label>
            <select
              id="hookArchetype"
              name="hookArchetype"
              className="minimal-select"
              value={formData.hookArchetype}
              onChange={handleChange}
            >
              <option value="organic">Organic / Default</option>
              <option value="contrarian">Contrarian Interrupt (Shock & Debunk)</option>
              <option value="vulnerable">Vulnerable Disclosure (Failure & Trust)</option>
              <option value="value-stash">High-Value Stash (Resources & Curation)</option>
              <option value="threat-fear">Threat & Fear (Risks & Heuristics)</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 flex items-start gap-3 rounded border" style={{ background: "var(--panel-bg)", borderColor: "var(--border-active)", marginTop: "24px" }}>
            <span className="text-zinc-500" style={{ marginTop: "2px", flexShrink: 0 }}>⚠️</span>
            <p style={{ fontSize: "0.85rem", color: "var(--foreground)", margin: 0 }}>{error}</p>
          </div>
        )}

        {activeAgentsCount !== 3 && (
          <div className="p-4 flex items-start gap-3 rounded border text-rose-400 bg-rose-950/10 border-rose-500/20 text-xs" style={{ marginTop: "24px" }}>
            <span>⚠️ <strong>Debate Flow Warning</strong>: You have selected <strong>{activeAgentsCount}</strong> active debaters. Go to the <strong>Specialist Agents</strong> tab to toggle exactly 3 active agents to initiate the debate arena.</span>
          </div>
        )}

        <button
          type="submit"
          className="minimal-submit-btn"
          disabled={activeAgentsCount !== 3 || loading}
        >
          <span>Initiate 3-Agent Copywriting Debate</span>
          <ArrowRight size={18} />
        </button>
      </form>

      {/* Bottom Panel: plain text agent pool list directly under card */}
      <div className="arena-preview-pane">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span className="status-dot animate-pulse" style={{ background: "var(--accent)" }}></span>
          <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--zinc-400)" }}>
            Active Debate Arena Pool
          </span>
        </div>
        <p style={{ fontSize: "0.82rem", color: "var(--zinc-400)", lineHeight: 1.5, margin: "0 0 16px 0" }}>
          Your project characteristics are routed through a 3-agent peer critique network.
          The writers construct drafts, review metrics/hooks, refine recursively, and consolidate outputs.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", columnGap: "32px", rowGap: "8px", fontSize: "0.8rem", fontFamily: "var(--font-mono)", color: "var(--zinc-300)" }}>
          {agents.filter((a) => a.enabled).map((agent, index) => (
            <div key={agent.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "var(--accent)", fontWeight: 700 }}>0{index + 1} {"//"}</span>
              <span style={{ color: "var(--foreground)", fontWeight: 700 }}>{agent.name.split(" ")[0]} {agent.name.split(" ")[1] || ""}</span>
              <span style={{ fontSize: "0.7rem", color: "var(--zinc-500)" }}>({agent.provider.toUpperCase()} &bull; {agent.model})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
