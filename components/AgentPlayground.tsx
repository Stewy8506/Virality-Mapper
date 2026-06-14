"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Sliders, RefreshCw, X, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const PROVIDERS = [
  { id: "gemini", name: "Google Gemini" },
  { id: "openai", name: "OpenAI" },
  { id: "anthropic", name: "Anthropic" },
  { id: "openrouter", name: "OpenRouter" },
  { id: "ollama", name: "Ollama (Local)" },
  { id: "lmstudio", name: "LM Studio (Local)" },
  { id: "custom", name: "Custom OpenAI Endpoint" },
];

interface CustomModel {
  id: string;
  name: string;
  provider: string;
  contextLength?: number;
  maxOutputTokens?: number;
}

export default function AgentPlayground({
  agents,
  apiKeys,
  onUpdateAgents,
  onResetAgents,
  customModels = [],
}: {
  agents: Agent[];
  apiKeys: ApiKeys;
  onUpdateAgents: (agents: Agent[]) => void;
  onResetAgents: () => void;
  customModels?: CustomModel[];
}) {
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const loadModels = async (provider: string) => {
    setLoadingModels(true);
    setModels([]);
    let apiKey = "";
    let customUrl = "";

    if (provider === "gemini") apiKey = apiKeys.gemini;
    if (provider === "openai") apiKey = apiKeys.openai;
    if (provider === "anthropic") apiKey = apiKeys.anthropic;
    if (provider === "openrouter") apiKey = apiKeys.openrouter;
    if (provider === "ollama") customUrl = apiKeys.ollamaUrl || "http://localhost:11434";
    if (provider === "lmstudio") customUrl = apiKeys.lmStudioUrl || "http://localhost:1234";
    if (provider === "custom") {
      customUrl = apiKeys.customBaseUrl;
      apiKey = apiKeys.customApiKey;
    }

    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey, customUrl }),
      });
      const data = await res.json();
      
      let fetchedModels: string[] = [];
      if (res.ok && data.success && data.models) {
        fetchedModels = data.models;
      }
      
      const localCustom = customModels
        .filter((m) => m.provider === provider)
        .map((m) => m.id);
      
      const merged = Array.from(new Set([...fetchedModels, ...localCustom]));
      setModels(merged);
    } catch (e) {
      console.error("Failed to load models dynamically:", e);
      const localCustom = customModels
        .filter((m) => m.provider === provider)
        .map((m) => m.id);
      setModels(localCustom);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent({ ...agent });
    loadModels(agent.provider);
  };

  const handleSaveAgent = () => {
    if (!editingAgent) return;
    const updated = agents.map((a) => (a.id === editingAgent.id ? editingAgent : a));
    onUpdateAgents(updated);
    setEditingAgent(null);
  };

  const handleAddAgent = () => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: `Custom Copywriter ${agents.length + 1}`,
      provider: "gemini",
      model: "gemini-2.5-flash",
      systemPrompt: "You are a copywriter persona specializing in direct, highly engaging social posts.",
      temperature: 0.7,
      enabled: false,
    };
    onUpdateAgents([...agents, newAgent]);
    setEditingAgent(newAgent);
    loadModels("gemini");
  };

  const handleDeleteAgent = (id: string) => {
    if (agents.length <= 3) {
      alert("You must maintain at least 3 copywriting agent personas in your workspace library.");
      return;
    }
    if (!confirm("Are you sure you want to permanently delete this copywriter persona?")) return;
    const updated = agents.filter((a) => a.id !== id);
    onUpdateAgents(updated);
    if (editingAgent?.id === id) {
      setEditingAgent(null);
    }
  };

  const activeAgentsCount = agents.filter((a) => a.enabled).length;

  return (
    <div className="anim-fade-up max-w-6xl mx-auto flex flex-col gap-6" style={{ paddingBottom: "40px" }}>

      {/* Title Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <h2 style={{ fontSize: "1.35rem", fontWeight: 500, letterSpacing: "-0.01em" }} className="text-white font-heading">
            Specialist Agents Pool
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--zinc-500)" }}>
            Build, edit, and toggle agent personas. Select exactly 3 enabled agents to initiate the debate console.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="custom-btn custom-btn-accent flex items-center gap-2"
            onClick={handleAddAgent}
            style={{ padding: "8px 16px", fontSize: "0.8rem" }}
          >
            <Plus size={14} />
            <span>Add Custom Agent</span>
          </button>
          <button
            className="custom-btn custom-btn-secondary flex items-center gap-2"
            onClick={() => {
              if (confirm("Are you sure you want to reset all agent configurations to defaults? This will overwrite your current configs.")) {
                onResetAgents();
              }
            }}
            style={{ padding: "8px 16px", fontSize: "0.8rem" }}
          >
            <RefreshCw size={12} className="text-zinc-500 animate-spin-hover" />
            <span>Reset Library</span>
          </button>
        </div>
      </div>

      {/* Validation Warning Alert */}
      {activeAgentsCount !== 3 && (
        <div
          className="p-4 flex items-center gap-3 text-rose-400 text-xs"
          style={{
            borderLeft: "3px solid var(--rose-500, #ef4444)",
            background: "rgba(239, 68, 68, 0.05)",
            borderTop: "none",
            borderRight: "none",
            borderBottom: "none",
            borderRadius: 0,
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}
        >
          <span>⚠️ Debate Flow Warning: You have selected {activeAgentsCount} active agents. You must enable exactly 3 agents to run the debate.</span>
        </div>
      )}

      {/* Sequential Ruled Table Layout */}
      <div className="minimal-agent-list">
        {agents.map((agent, idx) => (
          <div
            key={agent.id}
            className="minimal-agent-row"
          >
            <div className="row-num">{String(idx + 1).padStart(2, "0")} /</div>
            <div className="minimal-agent-main">
              <div className="minimal-agent-header">
                <div className="minimal-agent-title-group">
                  <span className="minimal-agent-name">{agent.name}</span>
                </div>
                <div className="minimal-agent-meta-group">
                  <span>PROVIDER: {agent.provider.toUpperCase()}</span>
                  <span>MODEL: {agent.model}</span>
                  <span>TEMP: {agent.temperature}</span>
                </div>
              </div>

              <div className="minimal-agent-prompt-box">
                &ldquo;{agent.systemPrompt}&rdquo;
              </div>

              {/* Controls Footer Row */}
              <div className="flex justify-between items-center flex-wrap gap-4" style={{ borderTop: "1px dashed var(--border-muted)", paddingTop: "24px", marginTop: "24px", paddingBottom: "12px" }}>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-zinc-500 font-mono">ACTIVE DEBATER:</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={agent.enabled}
                      onChange={() => {
                        const updated = agents.map((a) => a.id === agent.id ? { ...a, enabled: !a.enabled } : a);
                        onUpdateAgents(updated);
                      }}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="flex gap-4 items-center">
                  <button
                    className="minimal-text-btn"
                    onClick={() => handleEditAgent(agent)}
                  >
                    [Configure]
                  </button>
                  <button
                    className="minimal-trash-btn"
                    onClick={() => handleDeleteAgent(agent.id)}
                    title="Delete Agent"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overlay Configuration Drawer Panel */}
      {mounted && createPortal(
        <AnimatePresence>
          {editingAgent && (
            <div className="settings-modal-backdrop" onClick={() => setEditingAgent(null)}>
              <motion.div
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="agent-config-drawer"
                style={{ maxWidth: "560px" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drawer Header */}
                <div className="flex justify-between items-center pb-6 border-b border-zinc-800/40 flex-shrink-0">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Sliders size={16} className="text-accent" />
                    <span style={{ fontSize: "0.8rem", fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--foreground)" }}>
                      Configure Specialist
                    </span>
                  </div>
                  <button
                    style={{ background: "none", border: "none", color: "var(--zinc-500)", cursor: "pointer", display: "flex", alignItems: "center" }}
                    className="hover:text-white transition-colors"
                    onClick={() => setEditingAgent(null)}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Scrollable Content (Safe centering via margin auto) */}
                <div className="flex-1 overflow-y-auto pr-1" style={{ minHeight: 0 }} data-lenis-prevent>
                  <div style={{ display: "flex", flexDirection: "column", gap: "40px", marginTop: "auto", marginBottom: "auto", paddingTop: "40px", paddingBottom: "40px" }}>

                    {/* Row 1: Agent Name */}
                    <div style={{ display: "flex", gap: "20px", alignItems: "start" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--zinc-500)", fontWeight: 700, paddingTop: "8px" }}>01 /</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                        <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--zinc-500)", fontWeight: 700 }}>Agent Name</label>
                        <input
                          type="text"
                          className="minimal-input"
                          value={editingAgent.name}
                          onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                          placeholder="e.g. Agent Alpha"
                        />
                      </div>
                    </div>

                    {/* Row 2: Provider */}
                    <div style={{ display: "flex", gap: "20px", alignItems: "start" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--zinc-500)", fontWeight: 700, paddingTop: "8px" }}>02 /</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                        <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--zinc-500)", fontWeight: 700 }}>Provider</label>
                        <select
                          className="minimal-select"
                          value={editingAgent.provider}
                          onChange={(e) => {
                            setEditingAgent({ ...editingAgent, provider: e.target.value });
                            loadModels(e.target.value);
                          }}
                        >
                          {PROVIDERS.map((p) => (
                            <option key={p.id} value={p.id} style={{ background: "var(--background)", color: "var(--foreground)" }}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Row 3: Model Name */}
                    <div style={{ display: "flex", gap: "20px", alignItems: "start" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--zinc-500)", fontWeight: 700, paddingTop: "8px" }}>03 /</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                        <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--zinc-500)", fontWeight: 700 }} className="flex justify-between items-center">
                          <span>Model Name</span>
                          {loadingModels && <RefreshCw size={10} className="animate-spin text-zinc-500" />}
                        </label>
                        {loadingModels ? (
                          <div className="shimmer form-input h-10 w-full rounded-lg" style={{ opacity: 0.8 }} />
                        ) : models.length > 0 ? (
                          <select
                            className="minimal-select"
                            value={editingAgent.model}
                            onChange={(e) => setEditingAgent({ ...editingAgent, model: e.target.value })}
                          >
                            {models.map((m) => (
                              <option key={m} value={m} style={{ background: "var(--background)", color: "var(--foreground)" }}>
                                {m}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="minimal-input"
                            placeholder="e.g. gpt-4o-mini"
                            value={editingAgent.model}
                            onChange={(e) => setEditingAgent({ ...editingAgent, model: e.target.value })}
                          />
                        )}
                      </div>
                    </div>

                    {/* Row 4: System Persona Prompt */}
                    <div style={{ display: "flex", gap: "20px", alignItems: "start" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--zinc-500)", fontWeight: 700, paddingTop: "8px" }}>04 /</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                        <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--zinc-500)", fontWeight: 700 }}>System Persona Prompt</label>
                        <textarea
                          className="minimal-input font-mono text-xs"
                          style={{ minHeight: "120px", fontSize: "0.8rem", fontWeight: 400 }}
                          value={editingAgent.systemPrompt}
                          onChange={(e) => setEditingAgent({ ...editingAgent, systemPrompt: e.target.value })}
                          placeholder="Define agent's core guidelines, personality, and formatting requirements..."
                        />
                      </div>
                    </div>

                    {/* Row 5: Creativity Temperature */}
                    <div style={{ display: "flex", gap: "20px", alignItems: "start" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--zinc-500)", fontWeight: 700, paddingTop: "4px" }}>05 /</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                        <div className="flex justify-between items-center">
                          <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--zinc-500)", fontWeight: 700 }}>Creativity Temperature</label>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: 700, color: "var(--accent)" }}>{editingAgent.temperature}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={editingAgent.temperature}
                          onChange={(e) => setEditingAgent({ ...editingAgent, temperature: parseFloat(e.target.value) })}
                          style={{
                            background: "linear-gradient(to right, var(--accent-glow), var(--accent))",
                            height: "4px",
                            borderRadius: "2px",
                            outline: "none"
                          }}
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Drawer Actions (Floating towards the bottom, not pinned) */}
                <div className="agent-config-footer flex-shrink-0">
                  <button
                    className="minimal-submit-btn"
                    style={{ flex: 1, padding: "16px 24px", marginTop: 0, borderRadius: "10px", textTransform: "uppercase" }}
                    onClick={handleSaveAgent}
                  >
                    <span>Save Persona</span>
                    <Sliders size={16} />
                  </button>
                  <button
                    className="custom-btn custom-btn-secondary"
                    style={{ padding: "16px 24px", borderRadius: "10px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}
                    onClick={() => setEditingAgent(null)}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
