"use client";

import { useState, useEffect } from "react";
import { Sliders, Activity, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PostGeneratorForm from "@/components/PostGeneratorForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import AgentPlayground from "@/components/AgentPlayground";
import SettingsModal from "@/components/SettingsModal";
import Sidebar from "@/components/workspace/Sidebar";
import DashboardOverview from "@/components/workspace/DashboardOverview";
import PerformanceAnalytics from "@/components/workspace/PerformanceAnalytics";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import {
  DEFAULT_AGENTS,
  DEFAULT_KEYS,
  DEFAULT_USER_PREFERENCES,
  buildMasterConfig,
  ARCHIVE_MAX_ITEMS,
} from "@/lib/defaults";
import type { Agent, ArchivedPost, GenerationCompletePayload, GenerationResult, MasterConfig } from "@/types/domain";

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [masterConfig, setMasterConfig] = useState<MasterConfig>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vm_master_config");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.version === 1) {
            return parsed;
          }
        } catch (e) {
          console.warn("Failed to parse vm_master_config:", e);
        }
      }

      // Fallback migration of legacy keys
      let legacyKeys = DEFAULT_KEYS;
      try {
        const storedKeys = localStorage.getItem("vm_api_keys");
        if (storedKeys) legacyKeys = JSON.parse(storedKeys);
      } catch (e) {
        console.warn("Failed to migrate legacy API keys:", e);
      }

      let legacyPrefs = {
        linkedinName: "AI Copywriter Agent Network",
        linkedinHeadline: "Synthesized via Virality Settle Engine",
        linkedinAvatar: "💡",
        layoutDensity: "cozy" as const,
        sidebarPosition: "left" as const,
        autoCopyToClipboard: false,
        defaultHookArchetype: "organic",
        fontSize: 14,
        enableRAG: true,
      };
      try {
        const storedPrefs = localStorage.getItem("vm_user_preferences");
        if (storedPrefs) legacyPrefs = JSON.parse(storedPrefs);
      } catch (e) {
        console.warn("Failed to migrate legacy API keys:", e);
      }

      let legacyAgents = DEFAULT_AGENTS;
      try {
        const storedAgents = localStorage.getItem("vm_agents_config");
        if (storedAgents) {
          const parsed = JSON.parse(storedAgents);
          if (Array.isArray(parsed) && parsed.length >= 3) legacyAgents = parsed;
        }
      } catch (e) {
        console.warn("Failed to migrate legacy API keys:", e);
      }

      const config = buildMasterConfig(legacyKeys, legacyPrefs, legacyAgents);
      localStorage.setItem("vm_master_config", JSON.stringify(config));
      return config;
    }

    return buildMasterConfig(DEFAULT_KEYS, DEFAULT_USER_PREFERENCES, DEFAULT_AGENTS);
  });

  const apiKeys = masterConfig.apiKeys;
  const preferences = masterConfig.preferences;
  const agents = masterConfig.agents;

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

  // Load dynamic font stylesheet at runtime
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Remove old dynamic font elements
    const oldLink = document.getElementById("dynamic-custom-font-link");
    if (oldLink) oldLink.remove();

    const font = preferences.font;
    if (font === "fira") {
      const link = document.createElement("link");
      link.id = "dynamic-custom-font-link";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&display=swap";
      document.head.appendChild(link);
      document.documentElement.setAttribute("data-font", "fira");
      localStorage.setItem("font", "fira");
    } else if (font === "custom") {
      document.documentElement.setAttribute("data-font", "custom");
      localStorage.setItem("font", "custom");
      if (preferences.customFontUrl && preferences.customFontUrl.startsWith("http")) {
        const link = document.createElement("link");
        link.id = "dynamic-custom-font-link";
        link.rel = "stylesheet";
        link.href = preferences.customFontUrl;
        document.head.appendChild(link);
      }
      if (preferences.customFontFamily) {
        document.documentElement.style.setProperty("--font-custom-family", preferences.customFontFamily);
      } else {
        document.documentElement.style.removeProperty("--font-custom-family");
      }
    } else {
      document.documentElement.setAttribute("data-font", font);
      localStorage.setItem("font", font);
    }
  }, [preferences.font, preferences.customFontUrl, preferences.customFontFamily]);

  const handleSaveCustomCss = (css: string) => {
    setCustomCss(css);
    localStorage.setItem("custom_css", css);
    const styleEl = document.getElementById("custom-css-overrides");
    if (styleEl) {
      styleEl.innerHTML = css;
    }
  };

  const updateAgents = (newAgents: Agent[]) => {
    setMasterConfig(prev => {
      const next = { ...prev, agents: newAgents };
      localStorage.setItem("vm_master_config", JSON.stringify(next));
      return next;
    });
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
      const updated = [newArchivedItem, ...prev].slice(0, ARCHIVE_MAX_ITEMS);
      localStorage.setItem("vm_post_archive", JSON.stringify(updated));
      return updated;
    });
    setSelectedArchiveId(newArchivedItem.id);
  };

  const handleDeleteArchive = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDeleteArchive = () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
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

  return (
    <div className={`dashboard-layout layout-${preferences.layoutDensity} ${preferences.sidebarPosition === "right" ? "sidebar-right" : ""}`}>
      <div
        className={`sidebar-backdrop ${isMobileSidebarOpen ? "visible" : ""}`}
        onClick={() => setIsMobileSidebarOpen(false)}
        aria-hidden="true"
      />
      {/* Dynamic Style Injection element */}
      <style id="custom-css-overrides-runtime" dangerouslySetInnerHTML={{ __html: customCss }} />
      <style id="preferences-fontSize-overrides" dangerouslySetInnerHTML={{
        __html: `
        :root {
          font-size: ${preferences.fontSize}px;
        }
      `}} />

      {/* Collapsible Sidebar edge pane */}
      <Sidebar
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedArchiveId={selectedArchiveId}
        setSelectedArchiveId={setSelectedArchiveId}
        setResult={setResult}
        archive={archive}
        archiveSearch={archiveSearch}
        setArchiveSearch={setArchiveSearch}
        activeAgentsCount={activeAgentsCount}
        preferences={preferences}
        setIsSettingsOpen={setIsSettingsOpen}
      />

      {/* Main dashboard console workspace */}
      <main className="main-content">
        {/* Floating Command Bar inside main canvas */}
        <div className="command-bar animate-fade-up">
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={16} aria-hidden="true" />
          </button>
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
            aria-label="Open settings"
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
                        <div className="p-8 text-center text-zinc-500 text-xs" style={{ background: "transparent" }}>
                          Publication record not found.
                        </div>
                      );
                    }
                    return (
                      <>
                        <PerformanceAnalytics
                          selectedItem={selectedItem}
                          editingPerformanceId={editingPerformanceId}
                          setEditingPerformanceId={setEditingPerformanceId}
                          impressions={impressions}
                          setImpressions={setImpressions}
                          likes={likes}
                          setLikes={setLikes}
                          comments={comments}
                          setComments={setComments}
                          handleSavePerformance={handleSavePerformance}
                          handleDeleteArchive={handleDeleteArchive}
                          setEditorFormData={setEditorFormData}
                          setSelectedArchiveId={setSelectedArchiveId}
                          setResult={setResult}
                          setActiveTab={setActiveTab}
                        />
                        <ResultsDisplay result={selectedItem.result} preferences={preferences} />
                      </>
                    );
                  })()
                ) : (
                  /* Workspace Dashboard Overview Bento style */
                  <DashboardOverview
                    archive={archive}
                    apiKeys={apiKeys}
                    preferences={preferences}
                    setActiveTab={setActiveTab}
                    setSelectedArchiveId={setSelectedArchiveId}
                    setResult={setResult}
                    setIsSettingsOpen={setIsSettingsOpen}
                  />
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
                  masterConfig={masterConfig}
                />
                {result && (
                  <ResultsDisplay
                    result={result}
                    preferences={preferences}
                    customMetrics={masterConfig.customMetrics}
                  />
                )}
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
                  customModels={masterConfig.customModels}
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
          masterConfig={masterConfig}
          onSaveConfig={async (newConfig) => {
            setMasterConfig(newConfig);
            localStorage.setItem("vm_master_config", JSON.stringify(newConfig));
            try {
              await fetch("/api/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiKeys: newConfig.apiKeys }),
              });
            } catch (e) {
              console.error("Failed to sync session cookie:", e);
            }
          }}
          customCss={customCss}
          onSaveCustomCss={handleSaveCustomCss}
        />
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTargetId}
        title="Delete Publication"
        message="Are you sure you want to permanently delete this publication record?"
        onConfirm={confirmDeleteArchive}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
