"use client";

import { Plus, Key, Database, Terminal, Sliders } from "lucide-react";

interface ApiKeys {
  gemini: string;
  openai: string;
  anthropic: string;
  openrouter: string;
}

interface UserPreferences {
  enableRAG: boolean;
}

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
  };
}

interface ArchivedPost {
  id: string;
  timestamp: string;
  appName: string;
  description: string;
  result: GenerationResult;
  performance?: {
    impressions: number;
    likes: number;
    comments: number;
  };
}

interface DashboardOverviewProps {
  archive: ArchivedPost[];
  apiKeys: ApiKeys;
  preferences: UserPreferences;
  setActiveTab: (tab: "workspace" | "new-publication" | "agents") => void;
  setSelectedArchiveId: (id: string | null) => void;
  setResult: (result: GenerationResult | null) => void;
  setIsSettingsOpen: (open: boolean) => void;
}

export default function DashboardOverview({
  archive,
  apiKeys,
  preferences,
  setActiveTab,
  setSelectedArchiveId,
  setResult,
  setIsSettingsOpen,
}: DashboardOverviewProps) {
  const totalPubs = archive.length;
  const totalImpressions = archive.reduce((sum, item) => sum + (item.performance?.impressions || 0), 0);
  const totalLikes = archive.reduce((sum, item) => sum + (item.performance?.likes || 0), 0);
  const totalComments = archive.reduce((sum, item) => sum + (item.performance?.comments || 0), 0);
  const totalEngagement = totalLikes + totalComments;

  const validScores = archive.map(item => {
    const scores = item.result?.best?.scores;
    if (scores) {
      return (scores.hookStrength + scores.readability + scores.credibility + scores.viralPotential) / 4;
    }
    return item.result?.best?.score || 0;
  }).filter(s => s > 0);

  const avgQualityScore = validScores.length > 0
    ? (validScores.reduce((sum, s) => sum + s, 0) / validScores.length).toFixed(1) + "/10"
    : "N/A";

  const hasAnyKey = !!(apiKeys.gemini || apiKeys.openai || apiKeys.anthropic || apiKeys.openrouter);

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-up">
      {!hasAnyKey && (
        <div className="onboarding-banner" role="status">
          <div>
            <p><strong>Get started:</strong> Open Settings and add at least one API key (Gemini, OpenAI, or Anthropic). Then configure 3 enabled agents in the Specialist Agents tab before running your first debate.</p>
          </div>
          <button type="button" onClick={() => setIsSettingsOpen(true)}>Open Settings</button>
        </div>
      )}
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Workspace Studio</h2>
          <p className="text-xs text-zinc-400 mt-1">Review metrics, analyze critiques, and manage drafts in your publication history.</p>
        </div>
        <button
          onClick={() => setActiveTab("new-publication")}
          className="custom-btn custom-btn-accent text-xs h-9 px-4 flex items-center justify-center gap-1.5 cursor-pointer font-bold"
        >
          <Plus size={14} />
          <span>Create Publication</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="minimal-kpi-row">
        <div className="minimal-kpi-col">
          <span className="kpi-index">01 /</span>
          <div className="kpi-content">
            <span className="kpi-label">Total Publications</span>
            <span className="kpi-value">{totalPubs}</span>
            <span className="kpi-meta">Saved in archive</span>
          </div>
        </div>
        <div className="minimal-kpi-col">
          <span className="kpi-index">02 /</span>
          <div className="kpi-content">
            <span className="kpi-label">Impressions</span>
            <span className="kpi-value">{totalImpressions.toLocaleString()}</span>
            <span className="kpi-meta">Recorded reach</span>
          </div>
        </div>
        <div className="minimal-kpi-col">
          <span className="kpi-index">03 /</span>
          <div className="kpi-content">
            <span className="kpi-label">Engagement</span>
            <span className="kpi-value">{totalEngagement.toLocaleString()}</span>
            <span className="kpi-meta">Likes & comments</span>
          </div>
        </div>
        <div className="minimal-kpi-col">
          <span className="kpi-index">04 /</span>
          <div className="kpi-content">
            <span className="kpi-label">Avg Quality Score</span>
            <span className="kpi-value">{avgQualityScore}</span>
            <span className="kpi-meta">Strategist rating</span>
          </div>
        </div>
      </div>

      {/* Split section */}
      <div className="dashboard-layout-split">
        {/* Left: Saved Publications Grid (2/3 width) */}
        <div className="dashboard-split-main flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Publications Catalog</h3>
            {totalPubs > 0 && <span className="text-xs text-zinc-500 font-mono">Showing {totalPubs} posts</span>}
          </div>

          {archive.length === 0 ? (
            <div className="p-10 text-center text-zinc-500 text-xs flex flex-col items-center justify-center gap-4" style={{ background: "transparent" }}>
              <span>No publications generated yet. Ready to start your first draft?</span>
              <button
                onClick={() => setActiveTab("new-publication")}
                className="custom-btn custom-btn-secondary text-xs px-4 py-2"
              >
                Launch Debate Engine
              </button>
            </div>
          ) : (
            <div className="minimal-catalog-list">
              {archive.map((item, idx) => {
                const hasPerformance = !!item.performance;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedArchiveId(item.id);
                      setResult(item.result);
                      setActiveTab("workspace");
                    }}
                    className="minimal-catalog-item"
                  >
                    <div className="row-num">{String(idx + 1).padStart(2, "0")} /</div>
                    <div className="catalog-item-main">
                      <div className="catalog-item-header">
                        <span className="catalog-item-title">{item.appName}</span>
                        <span className="catalog-item-date">{item.timestamp.split(",")[0]}</span>
                      </div>
                      <p className="catalog-item-desc">
                        {item.result?.best?.content || item.description}
                      </p>
                      <div className="catalog-item-footer">
                        <span className="catalog-item-tag">
                          {item.result?.best?.style || "Organic"}
                        </span>
                        {hasPerformance ? (
                          <div className="catalog-item-metrics">
                            <span>👁️ {item.performance!.impressions.toLocaleString()}</span>
                            <span>👍 {item.performance!.likes.toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-500 font-mono">No stats recorded</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Quick Actions & Engine Status (1/3 width) */}
        <div className="dashboard-split-side flex flex-col gap-6">
          <div>
            <h3 className="text-xs font-semibold uppercase text-zinc-500 tracking-wider mb-4">Engine Integration</h3>
            <div className="flex flex-col gap-4">

              {/* API Key Checklist */}
              <div className="flex flex-col gap-3" style={{ borderTop: "1px dashed var(--border-muted)", paddingTop: "24px", background: "transparent" }}>
                <div className="flex items-center gap-2 text-zinc-300 font-semibold text-xs">
                  <Key size={14} className="text-zinc-400" />
                  <span>API Gateway Status</span>
                </div>
                <div className="flex flex-col gap-2 font-mono text-[10px] pt-2.5" style={{ borderTop: "1px solid var(--border-muted)" }}>
                  <div className="flex justify-between items-center">
                    <span>Gemini API:</span>
                    <span className={apiKeys.gemini ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                      {apiKeys.gemini ? "CONNECTED" : "MISSING"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>OpenAI API:</span>
                    <span className={apiKeys.openai ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                      {apiKeys.openai ? "CONNECTED" : "MISSING"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Anthropic API:</span>
                    <span className={apiKeys.anthropic ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                      {apiKeys.anthropic ? "CONNECTED" : "MISSING"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>OpenRouter:</span>
                    <span className={apiKeys.openrouter ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                      {apiKeys.openrouter ? "CONNECTED" : "MISSING"}
                    </span>
                  </div>
                </div>
              </div>

              {/* RAG Context Card */}
              <div className="flex flex-col gap-3" style={{ borderTop: "1px dashed var(--border-muted)", paddingTop: "24px", background: "transparent", marginTop: "12px" }}>
                <div className="flex items-center gap-2 text-zinc-300 font-semibold text-xs">
                  <Database size={14} className="text-zinc-400" />
                  <span>Database Context (RAG)</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2.5" style={{ borderTop: "1px solid var(--border-muted)" }}>
                  <span className="text-zinc-400">Feedback Loop database:</span>
                  <span className={preferences.enableRAG ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                    {preferences.enableRAG ? "ACTIVE" : "DISABLED"}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  {preferences.enableRAG
                    ? "Synthesis will dynamically query historical publication parameters and performance metrics to align generation hooks."
                    : "RAG query is disabled. Standard templates will be used for synthesis context."}
                </p>
              </div>

              {/* Quick Launch Panel */}
              <div className="flex flex-col gap-3" style={{ borderTop: "1px dashed var(--border-muted)", paddingTop: "24px", background: "transparent", marginTop: "12px" }}>
                <div className="flex items-center gap-2 text-zinc-300 font-semibold text-xs">
                  <Terminal size={14} className="text-zinc-400" />
                  <span>Console Management</span>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="custom-btn custom-btn-secondary text-[11px] w-full py-2.5 flex items-center justify-center gap-1.5"
                >
                  <Sliders size={12} />
                  <span>Aesthetic Configurations</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
