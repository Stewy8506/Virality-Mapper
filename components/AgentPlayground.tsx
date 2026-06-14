"use client";

import { useState } from "react";
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

export default function AgentPlayground({
  agents,
  apiKeys,
  onUpdateAgents,
  onResetAgents,
}: {
  agents: Agent[];
  apiKeys: ApiKeys;
  onUpdateAgents: (agents: Agent[]) => void;
  onResetAgents: () => void;
}) {
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);

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
      if (res.ok && data.success && data.models) {
        setModels(data.models);
      }
    } catch (e) {
      console.error("Failed to load models dynamically:", e);
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
        <div className="p-4 rounded-xl border flex items-center gap-3 bg-rose-950/10 border-rose-500/20 text-rose-400 text-xs">
          <span>⚠️ <strong>Debate Flow Warning</strong>: You have selected <strong>{activeAgentsCount}</strong> active agents. You must enable <strong>exactly 3</strong> agents from the list below to run the debate arena.</span>
        </div>
      )}

      {/* Floating Cards Layout */}
      <div className="flex flex-col gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            onMouseEnter={() => setHoveredAgentId(agent.id)}
            onMouseLeave={() => setHoveredAgentId(null)}
            className="glass-panel p-5 flex items-center justify-between transition-all hover:translate-y-[-2px] flex-wrap md:flex-nowrap gap-4"
          >
            <div className="flex flex-col gap-1 pr-6" style={{ flex: 1 }}>
              <div className="flex items-center gap-3 flex-wrap">
                <span style={{ fontWeight: 600, fontSize: "0.92rem" }} className="text-white">{agent.name}</span>
                <span className="custom-badge custom-badge-accent uppercase tracking-wider font-mono text-[9px]">
                  {agent.provider.toUpperCase()} • {agent.model}
                </span>
              </div>
              <p 
                style={{ fontSize: "0.8rem", color: "var(--zinc-500)", marginTop: "6px", lineHeight: 1.5 }}
                className={`italic transition-all duration-300 ${hoveredAgentId === agent.id ? "" : "line-clamp-2"}`}
              >
                &ldquo;{agent.systemPrompt}&rdquo;
              </p>
            </div>
            
            {/* Switch & Action Controls */}
            <div className="flex items-center gap-5 flex-shrink-0">
              <div className="flex items-center gap-2">
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
              
              <div className="flex gap-2">
                <button 
                  className="custom-btn custom-btn-secondary" 
                  style={{ padding: "8px 12px", fontSize: "0.78rem" }} 
                  onClick={() => handleEditAgent(agent)}
                >
                  Configure
                </button>
                <button 
                  className="p-2 hover:bg-zinc-800/40 border border-transparent hover:border-zinc-800 rounded-lg text-zinc-500 hover:text-rose-400 cursor-pointer"
                  onClick={() => handleDeleteAgent(agent.id)}
                  title="Delete Agent"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overlay Configuration Drawer Panel */}
      <AnimatePresence>
        {editingAgent && (
          <div className="settings-modal-backdrop" onClick={() => setEditingAgent(null)}>
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="settings-modal-container flex-col"
              style={{ maxWidth: "520px" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-800/60" style={{ background: "rgba(0,0,0,0.1)" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }} className="text-white font-heading">
                  <Sliders size={15} className="text-zinc-400" />
                  Configure Specialist
                </h3>
                <button
                  style={{ background: "none", border: "none", color: "var(--zinc-500)", cursor: "pointer" }}
                  className="hover:text-white transition-colors"
                  onClick={() => setEditingAgent(null)}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5" data-lenis-prevent>
                <div className="form-group mb-0">
                  <label className="form-label">Agent Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingAgent.name}
                    onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                  />
                </div>

                <div className="form-group mb-0">
                  <label className="form-label">Provider</label>
                  <select
                    className="form-input"
                    style={{ background: "var(--background)" }}
                    value={editingAgent.provider}
                    onChange={(e) => {
                      setEditingAgent({ ...editingAgent, provider: e.target.value });
                      loadModels(e.target.value);
                    }}
                  >
                    {PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id} style={{ background: "var(--background)" }}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-0">
                  <label className="form-label flex justify-between items-center">
                    <span>Model Name</span>
                    {loadingModels && <RefreshCw size={12} className="animate-spin text-zinc-500" />}
                  </label>
                  
                  {loadingModels ? (
                    <div className="shimmer form-input h-10 w-full rounded-lg" style={{ opacity: 0.8 }} />
                  ) : models.length > 0 ? (
                    <select
                      className="form-input"
                      style={{ background: "var(--background)" }}
                      value={editingAgent.model}
                      onChange={(e) => setEditingAgent({ ...editingAgent, model: e.target.value })}
                    >
                      {models.map((m) => (
                        <option key={m} value={m} style={{ background: "var(--background)" }}>
                          {m}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. gpt-4o-mini"
                      value={editingAgent.model}
                      onChange={(e) => setEditingAgent({ ...editingAgent, model: e.target.value })}
                    />
                  )}
                </div>

                <div className="form-group mb-0">
                  <label className="form-label">System Persona Prompt</label>
                  <textarea
                    className="form-input font-mono text-xs"
                    style={{ background: "var(--background)" }}
                    rows={8}
                    value={editingAgent.systemPrompt}
                    onChange={(e) => setEditingAgent({ ...editingAgent, systemPrompt: e.target.value })}
                  />
                </div>

                <div className="form-group mb-0">
                  <label className="form-label flex justify-between font-mono text-xs text-zinc-500 mb-1">
                    <span>Creativity Temperature</span>
                    <span className="text-white font-bold">{editingAgent.temperature}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={editingAgent.temperature}
                    onChange={(e) => setEditingAgent({ ...editingAgent, temperature: parseFloat(e.target.value) })}
                    style={{
                      background: "linear-gradient(to right, #60a5fa, #f59e0b)"
                    }}
                  />
                </div>
              </div>

              {/* Drawer Actions */}
              <div className="px-6 py-4 border-t border-zinc-800/60 flex gap-3" style={{ background: "rgba(0,0,0,0.05)" }}>
                <button className="custom-btn custom-btn-accent flex-1 py-2.5" onClick={handleSaveAgent}>
                  Save Changes
                </button>
                <button className="custom-btn custom-btn-secondary flex-1 py-2.5" onClick={() => setEditingAgent(null)}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
