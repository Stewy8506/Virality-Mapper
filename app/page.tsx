"use client";

import { useState, useEffect } from "react";
import { Sparkles, Cpu, Key, Sliders, Globe, Activity, Archive } from "lucide-react";
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
    score: number;
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
}

const DEFAULT_AGENTS: Agent[] = [
  {
    id: "agent-alpha",
    name: "Agent Alpha (Hook & Structure)",
    provider: "gemini",
    model: "gemini-2.5-flash",
    systemPrompt: "You are Agent Alpha, a LinkedIn growth expert specializing in scroll-stopping pattern-interrupt hooks, crisp visual spacing, and compelling readability formatting. Your goal is to maximize CTR (Click-Through Rate).",
    temperature: 0.8,
    enabled: true,
  },
  {
    id: "agent-beta",
    name: "Agent Beta (Analytical & Metrics)",
    provider: "openai",
    model: "gpt-4o-mini",
    systemPrompt: "You are Agent Beta, a LinkedIn strategist specializing in actionable frameworks, checklist delivery, bold numbers, clear business metrics, and direct step-by-step value. Avoid any corporate fluff.",
    temperature: 0.3,
    enabled: true,
  },
  {
    id: "agent-gamma",
    name: "Agent Gamma (Narrative & Story)",
    provider: "gemini",
    model: "gemini-2.5-flash",
    systemPrompt: "You are Agent Gamma, a personal branding ghostwriter specializing in the hero's journey, authenticity, lessons learned, and vulnerability. Your goal is to build long-term trust and organic connection.",
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
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"workspace" | "agents" | "settings" | "archive">("workspace");
  const [apiKeys, setApiKeys] = useState<ApiKeys>(DEFAULT_KEYS);
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [archive, setArchive] = useState<any[]>([]);
  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null);

  // Sync state from LocalStorage on mount
  useEffect(() => {
    const keysData = localStorage.getItem("vm_api_keys");
    const agentsData = localStorage.getItem("vm_agents_config");
    const archiveData = localStorage.getItem("vm_post_archive");

    if (keysData) {
      try { setApiKeys(JSON.parse(keysData)); } catch (e) {}
    }
    
    let loadedAgents = DEFAULT_AGENTS;
    if (agentsData) {
      try {
        const parsed = JSON.parse(agentsData);
        const hasOldAgents = parsed.some((a: any) => 
          a.id === "storytelling-ghost" || 
          a.id === "analytical-growth" || 
          a.id === "contrarian-tech-rebel"
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
      } catch (e) {}
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

  if (!loaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#050508]">
        <Activity className="animate-spin text-rose-500" size={32} />
      </div>
    );
  }

  const activeAgentsCount = agents.filter((a) => a.enabled).length;

  return (
    <div className="dashboard-layout">
      {/* 3-Panel: Panel 1 - Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand-text">
          <Sparkles size={16} style={{ color: "white" }} />
          <span>
            Virality <span className="serif-italic" style={{ color: "white" }}>Mapper</span>
          </span>
        </div>

        <nav style={{ flex: 1, marginTop: "24px" }}>
          <div
            className={`nav-item ${activeTab === "workspace" ? "active" : ""}`}
            onClick={() => setActiveTab("workspace")}
          >
            <Sparkles size={14} />
            <span>Workspace</span>
          </div>
          <div
            className={`nav-item ${activeTab === "archive" ? "active" : ""}`}
            onClick={() => setActiveTab("archive")}
          >
            <Archive size={14} />
            <span>Post Archive</span>
          </div>
          <div
            className={`nav-item ${activeTab === "agents" ? "active" : ""}`}
            onClick={() => setActiveTab("agents")}
          >
            <Sliders size={14} />
            <span>Agent Playground</span>
          </div>
          <div
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Key size={14} />
            <span>Settings</span>
          </div>
        </nav>

        {/* Sidebar Info/Stats Widget */}
        <div className="p-4 border border-zinc-800 rounded-lg flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
            <Activity size={11} />
            <span>Active Status</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Enabled Agents:</span>
            <span style={{ color: activeAgentsCount >= 2 ? "white" : "var(--zinc-500)", fontWeight: 600 }}>
              {activeAgentsCount} / 3
            </span>
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Debate Mode:</span>
            <span style={{ color: "white", fontWeight: 600 }}>
              Bidirectional
            </span>
          </div>
        </div>
      </aside>

      {/* 3-Panel: Panel 2 - Content Dashboard */}
      <main className="main-content">
        <header style={{ borderBottom: "1px solid var(--panel-border)", padding: "16px 32px", background: "rgba(5, 5, 8, 0.8)", position: "sticky", top: 0, zIndex: 10 }}>
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
              {activeTab === "workspace" && "Writing Console"}
              {activeTab === "archive" && "Archived Publications"}
              {activeTab === "agents" && "Agent Customizer"}
              {activeTab === "settings" && "Credentials Manager"}
            </h1>
            <div className="status-bar" style={{ margin: 0, padding: "4px 10px" }}>
              <span className="status-dot"></span>
              <span>Debate Engine V3</span>
            </div>
          </div>
        </header>

        <div className="container" style={{ padding: "32px 32px 48px", overflowY: "auto" }}>
          {/* Workspace Tab */}
          <div style={{ display: activeTab === "workspace" ? "flex" : "none", flexDirection: "column", gap: "24px" }} className="w-full">
            <PostGeneratorForm
              agents={agents}
              apiKeys={apiKeys}
              onGenerate={handleGenerateComplete}
              onStartGenerate={() => setResult(null)}
              onToggleAgent={handleToggleAgent}
            />
            {result && <ResultsDisplay result={result} />}
          </div>

          {/* Agent Customizer Tab */}
          <div style={{ display: activeTab === "agents" ? "block" : "none" }} className="w-full">
            <AgentPlayground
              agents={agents}
              apiKeys={apiKeys}
              onUpdateAgents={updateAgents}
            />
          </div>

          {/* Credentials Manager Tab */}
          <div style={{ display: activeTab === "settings" ? "block" : "none" }} className="w-full">
            <SettingsTab
              apiKeys={apiKeys}
              onSave={updateApiKeys}
            />
          </div>

          {/* Post Archive tab */}
          <div style={{ display: activeTab === "archive" ? "block" : "none" }} className="anim-fade-up w-full">
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
                <div className="flex flex-col gap-3 max-h-[750px] overflow-y-auto pr-2" style={{ borderRight: "1px solid var(--zinc-900)" }}>
                  {archive.map((item) => (
                    <div
                      key={item.id}
                      className="glass-panel p-4 flex flex-col gap-2 cursor-pointer transition-all"
                      style={{
                        borderColor: selectedArchiveId === item.id ? "var(--accent)" : "var(--zinc-800)",
                        background: selectedArchiveId === item.id ? "rgba(244, 63, 94, 0.03)" : "rgba(10,10,12,0.3)"
                      }}
                      onClick={() => setSelectedArchiveId(item.id)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 style={{ fontSize: "0.85rem", fontWeight: 700, margin: 0 }} className="line-clamp-1">
                          {item.appName}
                        </h4>
                        <span className="custom-badge custom-badge-accent" style={{ fontSize: "0.6rem", padding: "2px 5px", flexShrink: 0 }}>
                          Score: {item.result?.best?.score || 95}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "var(--zinc-500)", margin: 0 }} className="line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex justify-between items-center mt-2" style={{ borderTop: "1px solid var(--zinc-900)", paddingTop: "8px", fontSize: "0.65rem", color: "var(--zinc-600)", fontFamily: "var(--font-mono)" }}>
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
                            <div className="flex items-center gap-2" style={{ borderBottom: "1px solid var(--zinc-900)", paddingBottom: "8px" }}>
                              <Sparkles size={13} className="text-zinc-500" />
                              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--zinc-400)" }}>Original Prompt Context</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div><strong className="text-zinc-500">AppName:</strong> <span className="text-zinc-300">{selectedItem.appName}</span></div>
                              <div><strong className="text-zinc-500">Tone:</strong> <span className="text-zinc-300">{selectedItem.tone || "General"}</span></div>
                              <div style={{ gridColumn: "span 2" }}><strong className="text-zinc-500">Description:</strong> <span className="text-zinc-400 line-clamp-3">{selectedItem.description}</span></div>
                              <div style={{ gridColumn: "span 2" }}><strong className="text-zinc-500">Target Audience:</strong> <span className="text-zinc-300">{selectedItem.targetAudience || "General Professionals"}</span></div>
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
          </div>
        </div>
      </main>
    </div>
  );
}
