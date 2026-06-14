"use client";

import { useState, useEffect } from "react";
import { Sparkles, Sliders, Activity, TrendingUp, ChevronLeft, ChevronRight, Plus, LayoutDashboard, Key, Database, Terminal, Search, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PostGeneratorForm from "@/components/PostGeneratorForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import AgentPlayground from "@/components/AgentPlayground";
import SettingsModal from "@/components/SettingsModal";

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

interface ArchivedPost {
  id: string;
  timestamp: string;
  appName: string;
  description: string;
  targetAudience: string;
  tone: string;
  result: GenerationResult;
  performance?: {
    impressions: number;
    likes: number;
    comments: number;
  };
}

interface GenerationCompletePayload extends GenerationResult {
  appName?: string;
  description?: string;
  targetAudience?: string;
  tone?: string;
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

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState<"workspace" | "new-publication" | "agents">("workspace");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [archiveSearch, setArchiveSearch] = useState("");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("vm_sidebar_collapsed") === "true";
    }
    return false;
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vm_user_preferences");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch { }
      }
    }
    return {
      linkedinName: "AI Copywriter Agent Network",
      linkedinHeadline: "Synthesized via Virality Settle Engine",
      linkedinAvatar: "💡",
      layoutDensity: "cozy",
      sidebarPosition: "left",
      autoCopyToClipboard: false,
      defaultHookArchetype: "organic",
      fontSize: 14,
      enableRAG: true,
    };
  });

  const updatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    localStorage.setItem("vm_user_preferences", JSON.stringify(newPrefs));
  };

  const [customCss, setCustomCss] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("custom_css") || "";
    }
    return "";
  });

  const [editorFormData, setEditorFormData] = useState({
    appName: "",
    description: "",
    targetAudience: "",
    tone: "Professional, punchy, engaging",
    hookArchetype: "organic",
  });

  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    if (typeof window !== "undefined") {
      const keysData = localStorage.getItem("vm_api_keys");
      if (keysData) {
        try { return JSON.parse(keysData); } catch { }
      }
    }
    return DEFAULT_KEYS;
  });

  const [agents, setAgents] = useState<Agent[]>(() => {
    if (typeof window !== "undefined") {
      const agentsData = localStorage.getItem("vm_agents_config");
      if (agentsData) {
        try {
          const parsed = JSON.parse(agentsData);
          if (Array.isArray(parsed) && parsed.length >= 3) {
            return parsed;
          }
        } catch { }
      }
    }
    return DEFAULT_AGENTS;
  });

  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [archive, setArchive] = useState<ArchivedPost[]>(() => {
    if (typeof window !== "undefined") {
      const archiveData = localStorage.getItem("vm_post_archive");
      if (archiveData) {
        try { return JSON.parse(archiveData); } catch { }
      }
    }
    return [];
  });

  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null);

  const [editingPerformanceId, setEditingPerformanceId] = useState<string | null>(null);
  const [impressions, setImpressions] = useState(0);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(0);

  // Sync state from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!localStorage.getItem("vm_agents_config")) {
        localStorage.setItem("vm_agents_config", JSON.stringify(DEFAULT_AGENTS));
      }
    }
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("vm_sidebar_collapsed", String(next));
      return next;
    });
  };

  // Keyboard shortcut listener to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Toggle body class for layout density dynamically
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.className = `layout-${preferences.layoutDensity}`;
    }
  }, [preferences.layoutDensity]);

  const handleSaveCustomCss = (css: string) => {
    setCustomCss(css);
    localStorage.setItem("custom_css", css);
    const styleEl = document.getElementById("custom-css-overrides");
    if (styleEl) {
      styleEl.innerHTML = css;
    }
  };

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

  const handleGenerateComplete = (data: GenerationCompletePayload) => {
    setResult(data);
    const newArchivedItem = {
      id: `arch-${Date.now()}`,
      timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      appName: data.appName || "LinkedIn Post",
      description: data.description || "",
      targetAudience: data.targetAudience || "",
      tone: data.tone || "",
      result: data as GenerationResult
    };
    setArchive(prev => {
      const updated = [newArchivedItem, ...prev];
      localStorage.setItem("vm_post_archive", JSON.stringify(updated));
      return updated;
    });
    setSelectedArchiveId(newArchivedItem.id);
  };

  const handleDeleteArchive = (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this publication record?")) return;
    setArchive(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem("vm_post_archive", JSON.stringify(updated));
      if (selectedArchiveId === id) {
        setSelectedArchiveId(null);
        setResult(null);
        setActiveTab("workspace");
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
      <div className="flex h-screen w-screen items-center justify-center" style={{ background: "var(--background)" }}>
        <Activity className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  const activeAgentsCount = agents.filter((a) => a.enabled).length;

  const filteredArchive = archive.filter(item =>
    item.appName.toLowerCase().includes(archiveSearch.toLowerCase()) ||
    item.description.toLowerCase().includes(archiveSearch.toLowerCase()) ||
    (item.result?.best?.content || "").toLowerCase().includes(archiveSearch.toLowerCase())
  );

  return (
    <div className={`dashboard-layout layout-${preferences.layoutDensity} ${preferences.sidebarPosition === "right" ? "sidebar-right" : ""}`}>
      {/* Dynamic Style Injection element */}
      <style id="custom-css-overrides-runtime" dangerouslySetInnerHTML={{ __html: customCss }} />
      <style id="preferences-fontSize-overrides" dangerouslySetInnerHTML={{
        __html: `
        :root {
          font-size: ${preferences.fontSize}px;
        }
      `}} />

      {/* Collapsible Sidebar edge pane */}
      <aside className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className="flex flex-col gap-6 flex-1 overflow-hidden">

          {/* Header & toggle menu */}
          <div className="flex items-center justify-between w-full sidebar-header-container">
            <div className="brand-text">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-zinc-300 animate-pulse" />
                <span className="font-semibold tracking-tight">Virality Mapper</span>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="sidebar-toggle-btn"
              title={isSidebarCollapsed ? "Expand Sidebar (Ctrl + \\)" : "Collapse Sidebar (Ctrl + \\)"}
            >
              {isSidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          </div>

          {/* New publication trigger */}
          <button
            className="custom-btn custom-btn-accent w-full flex items-center gap-2 new-pub-btn"
            onClick={() => {
              setSelectedArchiveId(null);
              setResult(null);
              setActiveTab("new-publication");
            }}
            style={{ padding: "12px 18px", fontSize: "0.82rem" }}
            title="Create New Publication"
          >
            <Plus size={15} />
            <span>New Publication</span>
          </button>

          {/* Main navigation links */}
          <nav>
            <div
              className={`nav-item ${activeTab === "workspace" && !selectedArchiveId ? "active" : ""}`}
              onClick={() => {
                setSelectedArchiveId(null);
                setActiveTab("workspace");
              }}
              title="Workspace Control Hub"
            >
              <LayoutDashboard size={16} />
              <span>Workspace</span>
            </div>
            <div
              className={`nav-item ${activeTab === "agents" ? "active" : ""}`}
              onClick={() => setActiveTab("agents")}
              title="Specialist Agents"
            >
              <Sliders size={16} />
              <span>Specialist Agents</span>
            </div>
          </nav>

          {/* Historical Saved Publications integrated */}
          <div className="flex flex-col gap-2 flex-1 overflow-hidden sidebar-archive-list" style={{ borderTop: "1px solid var(--border-muted)", paddingTop: "16px" }}>
            <div className="text-[10px] font-mono font-semibold uppercase text-zinc-500 tracking-wider mb-1 px-2 flex items-center justify-between">
              <span>Saved History</span>
              {archive.length > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold">{archive.length}</span>}
            </div>

            {/* Filter Search */}
            {archive.length > 0 && (
              <div className="relative px-2 mb-1 flex items-center">
                <Search size={12} className="absolute left-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter history..."
                  value={archiveSearch}
                  onChange={(e) => setArchiveSearch(e.target.value)}
                  className="form-input text-xs w-full pl-7 py-1.5"
                  style={{
                    borderRadius: "8px",
                    height: "28px",
                    background: "rgba(0, 0, 0, 0.15)",
                    border: "1px solid var(--border-muted)"
                  }}
                />
              </div>
            )}

            {filteredArchive.length === 0 ? (
              <div className="text-[10px] text-zinc-500 italic px-2 py-3 leading-normal">
                {archive.length === 0 ? "No publications saved yet." : "No matching records found."}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 flex-1">
                {filteredArchive.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedArchiveId(item.id);
                      setResult(item.result);
                      setActiveTab("workspace");
                    }}
                    className="p-2.5 rounded text-left cursor-pointer transition-all hover:bg-zinc-800/20"
                    style={{
                      borderLeft: selectedArchiveId === item.id ? "3px solid var(--accent)" : "3px solid transparent",
                      paddingLeft: "10px",
                      background: selectedArchiveId === item.id ? "var(--accent-glow)" : "transparent",
                      fontSize: "0.78rem"
                    }}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-semibold text-white truncate max-w-[130px]">{item.appName}</span>
                      <span className="text-[9px] text-zinc-500 font-mono flex-shrink-0">{item.timestamp.split(",")[0]}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5" style={{ margin: 0 }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info/Stats Widget merged above profile */}
        {!isSidebarCollapsed && (
          <div className="sidebar-footer-widget flex flex-col gap-1 font-mono text-[9px] text-zinc-500 px-3 py-2 border-t border-zinc-800/40 mb-2 mt-auto">
            <div className="flex justify-between">
              <span>POOL:</span>
              <span className="text-zinc-400 font-bold">{activeAgentsCount} ACTIVE</span>
            </div>
            <div className="flex justify-between">
              <span>ENGINE:</span>
              <span className="text-zinc-400 font-bold">DEBATE SETTLE</span>
            </div>
          </div>
        )}

        {/* Profile Card & Settings trigger at the bottom of the sidebar */}
        {!isSidebarCollapsed ? (
          <div className="sidebar-profile">
            <div className="sidebar-profile-info cursor-pointer" onClick={() => setIsSettingsOpen(true)}>
              <div className="sidebar-profile-avatar">
                {preferences.linkedinAvatar || "💡"}
              </div>
              <div className="sidebar-profile-meta">
                <span className="sidebar-profile-name">
                  {preferences.linkedinName || "AI Copywriter"}
                </span>
                <span className="sidebar-profile-headline">
                  {preferences.linkedinHeadline || "Consensus strategist"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="sidebar-profile-btn"
              title="Settings & Configurations"
            >
              <Settings size={15} className="transition-transform duration-300 hover:rotate-90" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="sidebar-profile-collapsed-btn"
            title="Settings & Configurations"
          >
            {preferences.linkedinAvatar || "💡"}
          </button>
        )}
      </aside>

      {/* Main dashboard console workspace */}
      <main className="main-content">
        {/* Floating Command Bar inside main canvas */}
        <div className="command-bar animate-fade-up">
          <span className="text-xs text-zinc-500 font-mono font-semibold uppercase tracking-wider">
            {activeTab === "workspace" && (selectedArchiveId ? "Review Pane" : "Workspace Hub")}
            {activeTab === "new-publication" && "Debate Console"}
            {activeTab === "agents" && "Agents Playground"}
          </span>
          <div className="h-4 w-px bg-zinc-800"></div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="sidebar-toggle-btn h-7 w-7"
            title="Configurations"
          >
            <Sliders size={13} />
          </button>
          <div className="status-bar py-1 px-3">
            <span className="status-dot"></span>
            <span className="text-[10px] font-bold">DEBATE V3</span>
          </div>
        </div>

        <div className="container">
          <AnimatePresence mode="wait">
            {activeTab === "workspace" && (
              <motion.div
                key="workspace"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="w-full flex flex-col gap-6"
              >
                {selectedArchiveId ? (
                  /* Consolidated integrated historical post results viewer */
                  (() => {
                    const selectedItem = archive.find(item => item.id === selectedArchiveId);
                    if (!selectedItem) {
                      return (
                        <div className="glass-panel p-8 text-center text-zinc-500 text-xs">
                          Publication record not found.
                        </div>
                      );
                    }
                    return (
                      <>
                        <div className="glass-panel p-6 flex flex-col gap-4">
                          <div className="flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "12px" }}>
                            <div className="flex items-center gap-2">
                              <Sparkles size={15} className="text-zinc-400" />
                              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--zinc-400)" }}>Original Prompt Context</span>
                            </div>
                            <button
                              onClick={() => {
                                setEditorFormData({
                                  appName: selectedItem.appName,
                                  description: selectedItem.description,
                                  targetAudience: selectedItem.targetAudience,
                                  tone: selectedItem.tone,
                                  hookArchetype: selectedItem.result?.best?.style || "organic",
                                });
                                setSelectedArchiveId(null);
                                setResult(null);
                                setActiveTab("new-publication");
                              }}
                              className="custom-btn custom-btn-secondary text-[11px] h-8 px-4 flex items-center justify-center cursor-pointer font-bold"
                            >
                              Clone parameters to Editor
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div><strong className="text-zinc-500 uppercase tracking-wider text-[10px] block mb-1">AppName</strong> <span className="text-zinc-200 font-medium">{selectedItem.appName}</span></div>
                            <div><strong className="text-zinc-500 uppercase tracking-wider text-[10px] block mb-1">Tone</strong> <span className="text-zinc-200 font-medium">{selectedItem.tone || "General"}</span></div>
                            <div style={{ gridColumn: "span 2" }}><strong className="text-zinc-500 uppercase tracking-wider text-[10px] block mb-1">Description</strong> <span className="text-zinc-300 leading-relaxed">{selectedItem.description}</span></div>
                            <div style={{ gridColumn: "span 2" }}><strong className="text-zinc-500 uppercase tracking-wider text-[10px] block mb-1">Target Audience</strong> <span className="text-zinc-300 leading-relaxed">{selectedItem.targetAudience || "General Professionals"}</span></div>
                          </div>

                          {/* Performance metrics dashboard inline */}
                          <div style={{ borderTop: "1px dashed var(--border-muted)", paddingTop: "16px", marginTop: "8px" }}>
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-1.5 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider font-mono">
                                <TrendingUp size={13} className="text-zinc-400 animate-pulse" />
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
                                  className="text-[10px] text-zinc-400 font-semibold cursor-pointer hover:underline border-0 bg-transparent"
                                >
                                  + Record Actual Metrics
                                </button>
                              )}
                            </div>

                            {editingPerformanceId === selectedItem.id ? (
                              <div className="flex flex-wrap gap-4 items-end p-4 rounded-xl border border-zinc-800/40" style={{ background: "rgba(0,0,0,0.15)", borderColor: "var(--border-muted)" }}>
                                <div className="flex flex-col gap-1 text-[10px] font-mono text-zinc-400">
                                  <span>Impressions</span>
                                  <input
                                    type="number"
                                    className="form-input text-xs w-28 h-8 p-1.5"
                                    value={impressions}
                                    onChange={(e) => setImpressions(Number(e.target.value))}
                                  />
                                </div>
                                <div className="flex flex-col gap-1 text-[10px] font-mono text-zinc-400">
                                  <span>Likes</span>
                                  <input
                                    type="number"
                                    className="form-input text-xs w-28 h-8 p-1.5"
                                    value={likes}
                                    onChange={(e) => setLikes(Number(e.target.value))}
                                  />
                                </div>
                                <div className="flex flex-col gap-1 text-[10px] font-mono text-zinc-400">
                                  <span>Comments</span>
                                  <input
                                    type="number"
                                    className="form-input text-xs w-28 h-8 p-1.5"
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
                                    className="custom-btn custom-btn-accent text-[11px] h-8 px-4 flex items-center justify-center cursor-pointer"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingPerformanceId(null)}
                                    className="custom-btn custom-btn-secondary text-[11px] h-8 px-4 flex items-center justify-center cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : selectedItem.performance ? (
                              <div className="flex items-center gap-4 justify-between bg-zinc-900/10 border border-zinc-800/20 p-3 rounded-xl text-xs font-mono text-zinc-300">
                                <div className="flex gap-6">
                                  <div><span className="text-zinc-500 font-semibold uppercase text-[9px] mr-1">Impressions:</span> {selectedItem.performance!.impressions.toLocaleString()}</div>
                                  <div><span className="text-zinc-500 font-semibold uppercase text-[9px] mr-1">Likes:</span> {selectedItem.performance!.likes.toLocaleString()}</div>
                                  <div><span className="text-zinc-500 font-semibold uppercase text-[9px] mr-1">Comments:</span> {selectedItem.performance!.comments.toLocaleString()}</div>
                                </div>
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => {
                                      setEditingPerformanceId(selectedItem.id);
                                      setImpressions(selectedItem.performance!.impressions);
                                      setLikes(selectedItem.performance!.likes);
                                      setComments(selectedItem.performance!.comments);
                                    }}
                                    className="text-[10px] text-zinc-500 hover:text-white cursor-pointer border-0 bg-transparent"
                                  >
                                    [Edit]
                                  </button>
                                  <button
                                    onClick={() => handleDeleteArchive(selectedItem.id)}
                                    className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer border-0 bg-transparent font-bold"
                                  >
                                    [Delete]
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono italic">
                                <span>No performance metrics recorded for this publication yet. Record them once published to feed the self-improving RAG database.</span>
                                <button
                                  onClick={() => handleDeleteArchive(selectedItem.id)}
                                  className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer border-0 bg-transparent font-bold ml-2"
                                >
                                  [Delete Publication]
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <ResultsDisplay result={selectedItem.result} preferences={preferences} />
                      </>
                    );
                  })()
                ) : (
                  /* Workspace Dashboard Overview Bento style */
                  (() => {
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

                    return (
                      <div className="flex flex-col gap-8 w-full animate-fade-up">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="kpi-card glass-panel">
                            <span className="kpi-label">Total Publications</span>
                            <span className="kpi-value">{totalPubs}</span>
                            <span className="kpi-meta text-[10px]">Saved in archive</span>
                          </div>
                          <div className="kpi-card glass-panel">
                            <span className="kpi-label">Impressions</span>
                            <span className="kpi-value">{totalImpressions.toLocaleString()}</span>
                            <span className="kpi-meta text-[10px]">Recorded reach</span>
                          </div>
                          <div className="kpi-card glass-panel">
                            <span className="kpi-label">Engagement</span>
                            <span className="kpi-value">{totalEngagement.toLocaleString()}</span>
                            <span className="kpi-meta text-[10px]">Likes & comments</span>
                          </div>
                          <div className="kpi-card glass-panel">
                            <span className="kpi-label">Avg Quality Score</span>
                            <span className="kpi-value">{avgQualityScore}</span>
                            <span className="kpi-meta text-[10px]">Strategist rating</span>
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
                              <div className="glass-panel p-10 text-center text-zinc-500 text-xs flex flex-col items-center justify-center gap-4">
                                <span>No publications generated yet. Ready to start your first draft?</span>
                                <button
                                  onClick={() => setActiveTab("new-publication")}
                                  className="custom-btn custom-btn-secondary text-xs px-4 py-2"
                                >
                                  Launch Debate Engine
                                </button>
                              </div>
                            ) : (
                              <div className="pub-grid">
                                {archive.map((item) => {
                                  const hasPerformance = !!item.performance;
                                  return (
                                    <div
                                      key={item.id}
                                      onClick={() => {
                                        setSelectedArchiveId(item.id);
                                        setResult(item.result);
                                        setActiveTab("workspace");
                                      }}
                                      className="pub-grid-card glass-panel"
                                    >
                                      <div className="pub-card-header">
                                        <span className="pub-card-title">{item.appName}</span>
                                        <span className="pub-card-date">{item.timestamp.split(",")[0]}</span>
                                      </div>
                                      <p className="pub-card-desc text-zinc-400">
                                        {item.result?.best?.content || item.description}
                                      </p>
                                      <div className="pub-card-footer">
                                        <span className="custom-badge custom-badge-accent font-mono text-[9px] uppercase">
                                          {item.result?.best?.style || "Organic"}
                                        </span>
                                        {hasPerformance ? (
                                          <div className="pub-card-metrics">
                                            <span>👁️ {item.performance!.impressions.toLocaleString()}</span>
                                            <span>👍 {item.performance!.likes.toLocaleString()}</span>
                                          </div>
                                        ) : (
                                          <span className="pub-card-no-metrics">No recorded stats</span>
                                        )}
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
                                <div className="glass-panel flex flex-col gap-3 p-4">
                                  <div className="flex items-center gap-2 text-zinc-300 font-semibold text-xs">
                                    <Key size={14} className="text-zinc-400" />
                                    <span>API Gateway Status</span>
                                  </div>
                                  <div className="flex flex-col gap-2 font-mono text-[10px] border-t border-zinc-800/40 pt-2.5">
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
                                <div className="glass-panel flex flex-col gap-3 p-4">
                                  <div className="flex items-center gap-2 text-zinc-300 font-semibold text-xs">
                                    <Database size={14} className="text-zinc-400" />
                                    <span>Database Context (RAG)</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs border-t border-zinc-800/40 pt-2.5">
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
                                <div className="glass-panel flex flex-col gap-3 p-4">
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
                  })()
                )}
              </motion.div>
            )}

            {activeTab === "new-publication" && (
              <motion.div
                key="new-publication"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="w-full flex flex-col gap-6"
              >
                <PostGeneratorForm
                  agents={agents}
                  apiKeys={apiKeys}
                  onGenerate={handleGenerateComplete}
                  onStartGenerate={() => setResult(null)}
                  onToggleAgent={handleToggleAgent}
                  formData={editorFormData}
                  setFormData={setEditorFormData}
                  preferences={preferences}
                />
                {result && <ResultsDisplay result={result} preferences={preferences} />}
              </motion.div>
            )}

            {activeTab === "agents" && (
              <motion.div
                key="agents"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
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

          </AnimatePresence>
        </div>
      </main>

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          apiKeys={apiKeys}
          onSaveKeys={updateApiKeys}
          customCss={customCss}
          onSaveCustomCss={handleSaveCustomCss}
          preferences={preferences}
          onSavePreferences={updatePreferences}
        />
      )}
    </div>
  );
}
