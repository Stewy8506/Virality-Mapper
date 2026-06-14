"use client";

import { useState, useEffect } from "react";
import { Sparkles, Cpu, Key, Sliders, Globe, Activity, Archive, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PostGeneratorForm from "@/components/PostGeneratorForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import AgentPlayground from "@/components/AgentPlayground";
import SettingsTab from "@/components/SettingsTab";

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
    score?: number; // legacy
    critique: string;
  };
}

interface Agent {
  id: string;
  name: string;
  provider: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  enabled: boolean;
}

interface ApiKeys {
  gemini: string;
  openai: string;
  anthropic: string;
  openrouter: string;
  ollamaUrl: string;
  lmStudioUrl: string;
  customBaseUrl: string;
  customApiKey: string;
  serpapi: string;
}

const DEFAULT_AGENTS: Agent[] = [
  {
    id: "agent-alpha",
    name: "Agent Alpha (Hook & Structure)",
    provider: "gemini",
    model: "gemini-2.5-flash",
    systemPrompt: "You are Agent Alpha, a LinkedIn growth expert specializing in scroll-stopping pattern-interrupt hooks, crisp visual spacing, compelling readability formatting, and polarizing engagement triggers. Your goal is to maximize CTR. Always end the post EXACTLY with a hot take formatted as: 'Hot take: [Controversial opinion relevant to project]. Agree or disagree?'. DO NOT use marketing fluff like 'digital abyss'. Start EXACTLY mid-thought with relatable fears of the target audience. Keep the total post under 1200 characters.",
    temperature: 0.8,
    enabled: true,
  },
  {
    id: "agent-beta",
    name: "Agent Beta (Analytical & Metrics)",
    provider: "openai",
    model: "gpt-4o-mini",
    systemPrompt: "You are Agent Beta, a LinkedIn strategist specializing in actionable frameworks, checklist delivery, bold numbers, and direct step-by-step value. Avoid corporate fluff. CRITICAL: Use emoji bullets for all line-by-line breakdowns/feature presentations to draw attention to them. Do not write long product spec sheets or abstract filler. Use 'We built' instead of 'I built'. Use hardcoded/verifiable benchmarks from the description and MUST include a bridging sentence before the metrics. Anchor claims with a clear visual proof placeholder callout. DO NOT use marketing phrases like 'game-changer'. Keep the total post under 1200 characters.",
    temperature: 0.3,
    enabled: true,
  },
  {
    id: "agent-gamma",
    name: "Agent Gamma (Narrative & Story)",
    provider: "gemini",
    model: "gemini-2.5-flash",
    systemPrompt: "You are Agent Gamma, a personal branding ghostwriter specializing in the hero's journey, authenticity, lessons learned, and vulnerability. Your goal is to build organic trust. Ground stories in real professional friction and daily pain. Talk directly to the audience, NOT like a marketer. Do not use phrases like 'digital abyss'. Use 'We built' instead of 'I built' to imply team credibility. Ban abstract filler. Keep the total post under 1200 characters so the best content isn't buried past the 'see more' fold.",
    temperature: 0.85,
    enabled: true,
  },
];

const DEFAULT_KEYS: ApiKeys = {
  gemini: "",
  openai: "",
  anthropic: "",
  openrouter: "",
  ollamaUrl: "http://localhost:11434",
  lmStudioUrl: "http://localhost:1234",
  customBaseUrl: "",
  customApiKey: "",
  serpapi: "",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"workspace" | "agents" | "settings" | "archive">("workspace");
  const [apiKeys, setApiKeys] = useState<ApiKeys>(DEFAULT_KEYS);
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [archive, setArchive] = useState<any[]>([]);
  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null);
  const [editingPerformanceId, setEditingPerformanceId] = useState<string | null>(null);
  const [impressions, setImpressions] = useState(0);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(0);

  // Sync state from LocalStorage on mount
  useEffect(() => {
    const keysData = localStorage.getItem("vm_api_keys");
    const agentsData = localStorage.getItem("vm_agents_config");
    const archiveData = localStorage.getItem("vm_post_archive");

    if (keysData) {
      try { setApiKeys(JSON.parse(keysData)); } catch (e) { }
    }

    let loadedAgents = DEFAULT_AGENTS;
    if (agentsData) {
      try {
        const parsed = JSON.parse(agentsData);
        const hasOldAgents = parsed.some((a: any) =>
          a.id === "storytelling-ghost" ||
          a.id === "analytical-growth" ||
          a.id === "contrarian-tech-rebel" ||
          a.systemPrompt.includes("hope-driven development")
        );
        if (parsed.length === 3 && !hasOldAgents) {
          loadedAgents = parsed;
        } else {
          localStorage.setItem("vm_agents_config", JSON.stringify(DEFAULT_AGENTS));
        }
      } catch (e) {
        localStorage.setItem("vm_agents_config", JSON.stringify(DEFAULT_AGENTS));
      }
    } else {
      localStorage.setItem("vm_agents_config", JSON.stringify(DEFAULT_AGENTS));
    }
    setAgents(loadedAgents);

    if (archiveData) {
      try {
        const parsedArchive = JSON.parse(archiveData);
        setArchive(parsedArchive);
        if (parsedArchive.length > 0) {
          setSelectedArchiveId(parsedArchive[0].id);
        }
      } catch (e) { }
    }

    setLoaded(true);
  }, []);

  const updateApiKeys = (newKeys: ApiKeys) => {
    setApiKeys(newKeys);
    localStorage.setItem("vm_api_keys", JSON.stringify(newKeys));
  };

  const updateAgents = (newAgents: Agent[]) => {
    setAgents(newAgents);
    localStorage.setItem("vm_agents_config", JSON.stringify(newAgents));
  };

  const handleToggleAgent = (id: string) => {
    const updated = agents.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
    updateAgents(updated);
  };

  const handleGenerateComplete = (data: any) => {
    setResult(data);
    const newArchivedItem = {
      id: `arch-${Date.now()}`,
      timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      appName: data.appName || "LinkedIn Post",
      description: data.description || "",
      targetAudience: data.targetAudience || "",
      tone: data.tone || "",
      result: data
    };
    setArchive(prev => {
      const updated = [newArchivedItem, ...prev];
      localStorage.setItem("vm_post_archive", JSON.stringify(updated));
      return updated;
    });
    setSelectedArchiveId(newArchivedItem.id);
  };

  const handleDeleteArchive = (id: string) => {
    setArchive(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem("vm_post_archive", JSON.stringify(updated));
      if (selectedArchiveId === id) {
        setSelectedArchiveId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  };

  const handleSavePerformance = (id: string, perfData: { impressions: number; likes: number; comments: number }) => {
    setArchive(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, performance: perfData } : item);
      localStorage.setItem("vm_post_archive", JSON.stringify(updated));
      return updated;
    });
  };

  if (!loaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#030305]">
        <Activity className="animate-spin text-rose-500" size={32} />
      </div>
    );
  }

  const activeAgentsCount = agents.filter((a) => a.enabled).length;

  return (
    <div className="dashboard-layout">
      {/* 3-Panel: Panel 1 - Sidebar Navigation */}
      <aside className="sidebar">
        <div className="flex flex-col gap-8">
          <div className="brand-text">
            <Sparkles size={20} className="text-rose-500 animate-pulse" />
            <span>
              Virality <span className="serif-italic font-normal">Mapper</span>
            </span>
          </div>

          <nav>
            <div
              className={`nav-item ${activeTab === "workspace" ? "active" : ""}`}
              onClick={() => setActiveTab("workspace")}
            >
              <Sparkles size={16} />
              <span>Workspace</span>
            </div>
            <div
              className={`nav-item ${activeTab === "archive" ? "active" : ""}`}
              onClick={() => setActiveTab("archive")}
            >
              <Archive size={16} />
              <span>Post Archive</span>
            </div>
            <div
              className={`nav-item ${activeTab === "agents" ? "active" : ""}`}
              onClick={() => setActiveTab("agents")}
            >
              <Sliders size={16} />
              <span>Agent Playground</span>
            </div>
            <div
              className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <Key size={16} />
              <span>Settings</span>
            </div>
          </nav>
        </div>

        {/* Sidebar Info/Stats Widget */}
        <div className="p-4 border border-zinc-800 rounded-lg flex flex-col gap-3 background-zinc-900/40 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <Activity size={12} className="text-rose-500" />
            <span>Active Status</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Enabled Agents:</span>
            <span style={{ color: activeAgentsCount >= 2 ? "#ff2e55" : "#71717a", fontWeight: 700 }}>
              {activeAgentsCount} / 3
            </span>
          </div>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Debate Mode:</span>
            <span className="text-white font-bold">
              Bidirectional
            </span>
          </div>
        </div>
      </aside>

      {/* 3-Panel: Panel 2 - Content Dashboard */}
      <main className="main-content">
        <header style={{ borderBottom: "1px solid var(--border-muted)", padding: "20px 36px", background: "rgba(3, 3, 5, 0.75)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 30 }}>
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <h1 style={{ fontSize: "1.35rem", fontWeight: 500 }} className="tracking-tight text-white font-heading">
              {activeTab === "workspace" && "Writing Console"}
              {activeTab === "archive" && "Archived Publications"}
              {activeTab === "agents" && "Agent Customizer"}
              {activeTab === "settings" && "Credentials Manager"}
            </h1>
            <div className="status-bar">
              <span className="status-dot"></span>
              <span>Debate Engine V3</span>
            </div>
          </div>
        </header>

        <div className="container">
          <AnimatePresence mode="wait">
            {activeTab === "workspace" && (
              <motion.div
                key="workspace"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full flex flex-col gap-6"
              >
                <PostGeneratorForm
                  agents={agents}
                  apiKeys={apiKeys}
                  onGenerate={handleGenerateComplete}
                  onStartGenerate={() => setResult(null)}
                  onToggleAgent={handleToggleAgent}
                />
                {result && <ResultsDisplay result={result} />}
              </motion.div>
            )}

            {activeTab === "agents" && (
              <motion.div
                key="agents"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full"
              >
                <AgentPlayground
                  agents={agents}
                  apiKeys={apiKeys}
                  onUpdateAgents={updateAgents}
                  onResetAgents={() => {
                    updateAgents(DEFAULT_AGENTS);
                  }}
                />
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full"
              >
                <SettingsTab
                  apiKeys={apiKeys}
                  onSave={updateApiKeys}
                />
              </motion.div>
            )}

            {activeTab === "archive" && (
              <motion.div
                key="archive"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full"
              >
                {archive.length === 0 ? (
                  <div className="glass-panel p-12 text-center flex flex-col items-center justify-center gap-4" style={{ minHeight: "400px" }}>
                    <Archive size={48} className="text-zinc-600 animate-pulse" />
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>No archived publications</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--zinc-500)", maxWidth: "320px", margin: 0 }}>
                      Start running 3-agent debates in the Workspace. Completed posts are automatically saved here!
                    </p>
                  </div>
                ) : (
                  <div className="grid" style={{ gridTemplateColumns: "320px 1fr", gap: "24px", alignItems: "start" }}>
                    {/* Left pane: Archive List */}
                    <div className="flex flex-col gap-3 max-h-[750px] overflow-y-auto pr-2" style={{ borderRight: "1px solid var(--border-muted)" }}>
                      {archive.map((item) => (
                        <div
                          key={item.id}
                          className="glass-panel p-4 flex flex-col gap-2 cursor-pointer transition-all"
                          style={{
                            borderColor: selectedArchiveId === item.id ? "var(--accent)" : "var(--border-muted)",
                            background: selectedArchiveId === item.id ? "rgba(255, 46, 85, 0.04)" : "rgba(10,10,12,0.3)"
                          }}
                          onClick={() => setSelectedArchiveId(item.id)}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, margin: 0 }} className="line-clamp-1">
                              {item.appName}
                            </h4>
                            <span className="custom-badge custom-badge-accent" style={{ fontSize: "0.6rem", padding: "2px 5px", flexShrink: 0 }}>
                              Score: {item.result?.best?.scores?.viralPotential || item.result?.best?.score || 95}
                            </span>
                          </div>
                          <p style={{ fontSize: "0.75rem", color: "var(--zinc-500)", margin: 0 }} className="line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex justify-between items-center mt-2" style={{ borderTop: "1px solid var(--border-muted)", paddingTop: "8px", fontSize: "0.65rem", color: "var(--zinc-600)", fontFamily: "var(--font-mono)" }}>
                            <span>{item.timestamp}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteArchive(item.id);
                              }}
                              style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "0.65rem", fontFamily: "var(--font-mono)" }}
                              className="hover:underline"
                            >
                              DELETE
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right pane: Archive Details */}
                    <div className="flex flex-col gap-6">
                      {archive.find(item => item.id === selectedArchiveId) ? (
                        (() => {
                          const selectedItem = archive.find(item => item.id === selectedArchiveId);
                          return (
                            <>
                              <div className="glass-panel p-4 flex flex-col gap-3" style={{ background: "rgba(10,10,12,0.2)" }}>
                                <div className="flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "8px" }}>
                                  <Sparkles size={13} className="text-zinc-500" />
                                  <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--zinc-400)" }}>Original Prompt Context</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                  <div><strong className="text-zinc-500">AppName:</strong> <span className="text-zinc-300">{selectedItem.appName}</span></div>
                                  <div><strong className="text-zinc-500">Tone:</strong> <span className="text-zinc-300">{selectedItem.tone || "General"}</span></div>
                                  <div style={{ gridColumn: "span 2" }}><strong className="text-zinc-500">Description:</strong> <span className="text-zinc-400 line-clamp-3">{selectedItem.description}</span></div>
                                  <div style={{ gridColumn: "span 2" }}><strong className="text-zinc-500">Target Audience:</strong> <span className="text-zinc-300">{selectedItem.targetAudience || "General Professionals"}</span></div>
                                </div>

                                {/* Performance metrics dashboard inline */}
                                <div style={{ borderTop: "1px dashed var(--border-muted)", paddingTop: "12px", marginTop: "4px" }}>
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-1.5 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider font-mono">
                                      <TrendingUp size={12} className="text-rose-500 animate-pulse" />
                                      <span>Self-Published Analytics (Feedback Loop)</span>
                                    </div>
                                    {!selectedItem.performance && editingPerformanceId !== selectedItem.id && (
                                      <button
                                        onClick={() => {
                                          setEditingPerformanceId(selectedItem.id);
                                          setImpressions(0);
                                          setLikes(0);
                                          setComments(0);
                                        }}
                                        className="text-[10px] text-rose-400 font-semibold cursor-pointer hover:underline border-0 bg-transparent"
                                      >
                                        + Record Actual Metrics
                                      </button>
                                    )}
                                  </div>

                                  {editingPerformanceId === selectedItem.id ? (
                                    <div className="flex flex-wrap gap-3 items-end bg-[#010102] p-3 rounded border border-zinc-800">
                                      <div className="flex flex-col gap-1 text-[10px] font-mono text-zinc-400">
                                        <span>Impressions</span>
                                        <input
                                          type="number"
                                          className="form-input text-xs w-24 h-7 p-1"
                                          style={{ background: "#0c0c0e", borderColor: "#27272a" }}
                                          value={impressions}
                                          onChange={(e) => setImpressions(Number(e.target.value))}
                                        />
                                      </div>
                                      <div className="flex flex-col gap-1 text-[10px] font-mono text-zinc-400">
                                        <span>Likes</span>
                                        <input
                                          type="number"
                                          className="form-input text-xs w-24 h-7 p-1"
                                          style={{ background: "#0c0c0e", borderColor: "#27272a" }}
                                          value={likes}
                                          onChange={(e) => setLikes(Number(e.target.value))}
                                        />
                                      </div>
                                      <div className="flex flex-col gap-1 text-[10px] font-mono text-zinc-400">
                                        <span>Comments</span>
                                        <input
                                          type="number"
                                          className="form-input text-xs w-24 h-7 p-1"
                                          style={{ background: "#0c0c0e", borderColor: "#27272a" }}
                                          value={comments}
                                          onChange={(e) => setComments(Number(e.target.value))}
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => {
                                            handleSavePerformance(selectedItem.id, { impressions, likes, comments });
                                            setEditingPerformanceId(null);
                                          }}
                                          className="custom-btn custom-btn-accent text-[10px] h-7 px-3 flex items-center justify-center cursor-pointer"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() => setEditingPerformanceId(null)}
                                          className="custom-btn custom-btn-secondary text-[10px] h-7 px-3 flex items-center justify-center cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : selectedItem.performance ? (
                                    <div className="flex items-center gap-4 justify-between bg-zinc-900/30 border border-zinc-800/40 p-2.5 rounded text-xs font-mono text-zinc-300">
                                      <div className="flex gap-4">
                                        <div><span className="text-zinc-500">Impressions:</span> {selectedItem.performance.impressions.toLocaleString()}</div>
                                        <div><span className="text-zinc-500">Likes:</span> {selectedItem.performance.likes.toLocaleString()}</div>
                                        <div><span className="text-zinc-500">Comments:</span> {selectedItem.performance.comments.toLocaleString()}</div>
                                      </div>
                                      <button
                                        onClick={() => {
                                          setEditingPerformanceId(selectedItem.id);
                                          setImpressions(selectedItem.performance.impressions);
                                          setLikes(selectedItem.performance.likes);
                                          setComments(selectedItem.performance.comments);
                                        }}
                                        className="text-[10px] text-zinc-500 hover:text-white cursor-pointer border-0 bg-transparent animate-pulse"
                                      >
                                        [Edit]
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-zinc-500 font-mono italic">
                                      No performance metrics recorded for this publication yet. Record them once published to feed the self-improving RAG database.
                                    </div>
                                  )}
                                </div>
                              </div>
                              <ResultsDisplay result={selectedItem.result} />
                            </>
                          );
                        })()
                      ) : (
                        <div className="glass-panel p-8 text-center text-zinc-500 text-xs">
                          Select an archived post from the list to view details
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
