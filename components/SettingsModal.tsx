"use client";

import { useState } from "react";
import {
  CheckCircle2, Loader2,
  Eye, EyeOff, Save, Code, Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

interface UserPreferences {
  linkedinName: string;
  linkedinHeadline: string;
  linkedinAvatar: string;
  layoutDensity: "compact" | "cozy" | "spacious";
  sidebarPosition: "left" | "right";
  autoCopyToClipboard: boolean;
  defaultHookArchetype: string;
  fontSize: number; // 12 to 18px base
  enableRAG: boolean;
  customFontUrl?: string;
  customFontFamily?: string;
}

interface CustomModel {
  id: string;
  name: string;
  provider: string;
  contextLength?: number;
  maxOutputTokens?: number;
}

interface CustomMetric {
  id: string;
  name: string;
  weight: number;
  scoringInstructions: string;
}

interface CustomPersona {
  id: string;
  name: string;
  avatar: string;
  description: string;
  commentRatio: number;
}

interface CrawlerConfig {
  enginePriority: string[];
  targetYear: number;
  serpapiEnabled: boolean;
}

interface AdvancedParams {
  temperature: number;
  topP: number;
  topK: number;
  presencePenalty: number;
  frequencyPenalty: number;
  seed: number;
  stopSequences: string;
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

interface MasterConfig {
  version: number;
  apiKeys: ApiKeys;
  preferences: UserPreferences & {
    theme: string;
    font: string;
    showTransitions: boolean;
  };
  agents: Agent[];
  customModels: CustomModel[];
  customMetrics: CustomMetric[];
  customPersonas: CustomPersona[];
  crawlerConfig: CrawlerConfig;
  advancedParams: AdvancedParams;
}

type TabType = 
  | "credentials"
  | "models"
  | "hyperparams"
  | "metrics"
  | "personas"
  | "crawlers"
  | "ui"
  | "admin";

export default function SettingsModal({
  isOpen,
  onClose,
  masterConfig,
  onSaveConfig,
  customCss,
  onSaveCustomCss,
}: {
  isOpen: boolean;
  onClose: () => void;
  masterConfig: MasterConfig;
  onSaveConfig: (config: MasterConfig) => void;
  customCss: string;
  onSaveCustomCss: (css: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("credentials");
  const [configState, setConfigState] = useState<MasterConfig>(masterConfig);
  const [cssOverride, setCssOverride] = useState(customCss);

  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ [key: string]: { success: boolean; msg: string } | undefined }>({});
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.getAttribute("data-theme") || "obsidian";
    }
    return "obsidian";
  });

  const [font, setFont] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.getAttribute("data-font") || "geist";
    }
    return "geist";
  });

  const handleSelectTheme = (selectedTheme: string) => {
    setTheme(selectedTheme);
    document.documentElement.setAttribute("data-theme", selectedTheme);
    localStorage.setItem("theme", selectedTheme);
    setConfigState(prev => ({
      ...prev,
      preferences: { ...prev.preferences, theme: selectedTheme }
    }));
  };

  const handleSelectFont = (selectedFont: string) => {
    setFont(selectedFont);
    document.documentElement.setAttribute("data-font", selectedFont);
    localStorage.setItem("font", selectedFont);
    setConfigState(prev => ({
      ...prev,
      preferences: { ...prev.preferences, font: selectedFont }
    }));
  };

  const handleCssChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextCss = e.target.value;
    setCssOverride(nextCss);
    onSaveCustomCss(nextCss);
  };

  const handleSaveAll = () => {
    onSaveConfig(configState);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleConfigChange = (path: string, value: unknown) => {
    setConfigState(prev => {
      const parts = path.split(".");
      if (parts.length === 1) {
        return { ...prev, [parts[0]]: value };
      } else if (parts.length === 2) {
        const parentKey = parts[0] as keyof MasterConfig;
        const parentObj = (prev[parentKey] as unknown) as Record<string, unknown>;
        return {
          ...prev,
          [parts[0]]: {
            ...parentObj,
            [parts[1]]: value
          }
        };
      }
      return prev;
    });
  };

  // Custom Model Handlers
  const [newModel, setNewModel] = useState<CustomModel>({ id: "", name: "", provider: "gemini", contextLength: 128000, maxOutputTokens: 4096 });
  const handleAddModel = () => {
    if (!newModel.id || !newModel.name) return;
    setConfigState(prev => ({
      ...prev,
      customModels: [...prev.customModels, newModel]
    }));
    setNewModel({ id: "", name: "", provider: "gemini", contextLength: 128000, maxOutputTokens: 4096 });
  };
  const handleRemoveModel = (id: string) => {
    setConfigState(prev => ({
      ...prev,
      customModels: prev.customModels.filter(m => m.id !== id)
    }));
  };

  // Custom Metric Handlers
  const [newMetric, setNewMetric] = useState<CustomMetric>({ id: "", name: "", weight: 25, scoringInstructions: "" });
  const handleAddMetric = () => {
    if (!newMetric.id || !newMetric.name) return;
    setConfigState(prev => ({
      ...prev,
      customMetrics: [...prev.customMetrics, newMetric]
    }));
    setNewMetric({ id: "", name: "", weight: 25, scoringInstructions: "" });
  };
  const handleRemoveMetric = (id: string) => {
    setConfigState(prev => ({
      ...prev,
      customMetrics: prev.customMetrics.filter(m => m.id !== id)
    }));
  };

  // Custom Persona Handlers
  const [newPersona, setNewPersona] = useState<CustomPersona>({ id: "", name: "", avatar: "💡", description: "", commentRatio: 50 });
  const handleAddPersona = () => {
    if (!newPersona.id || !newPersona.name) return;
    setConfigState(prev => ({
      ...prev,
      customPersonas: [...prev.customPersonas, newPersona]
    }));
    setNewPersona({ id: "", name: "", avatar: "💡", description: "", commentRatio: 50 });
  };
  const handleRemovePersona = (id: string) => {
    setConfigState(prev => ({
      ...prev,
      customPersonas: prev.customPersonas.filter(p => p.id !== id)
    }));
  };

  // Backup & Import handlers
  const handleExportConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(configState, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "virality-mapper-config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;
    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.version === 1 && parsed.apiKeys && parsed.preferences) {
          setConfigState(parsed);
          setTheme(parsed.preferences.theme);
          setFont(parsed.preferences.font);
          alert("Configuration imported successfully!");
        } else {
          alert("Invalid configuration file format. Missing version 1, apiKeys, or preferences.");
        }
      } catch {
        alert("Failed to parse JSON file.");
      }
    };
  };

  const handleFactoryReset = () => {
    if (!confirm("Are you sure you want to completely reset all configurations to default? This will wipe your API keys, preferences, custom metrics, and custom personas.")) return;
    localStorage.removeItem("vm_master_config");
    localStorage.removeItem("vm_sidebar_collapsed");
    localStorage.removeItem("custom_css");
    localStorage.removeItem("theme");
    localStorage.removeItem("font");
    alert("Configurations cleared. Reloading workspace...");
    window.location.reload();
  };

  const toggleShowKey = (field: string) => {
    setShowKeys((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfigState(prev => ({
      ...prev,
      apiKeys: { ...prev.apiKeys, [name]: value }
    }));
  };

  const testConnection = async (provider: string) => {
    setTestingProvider(provider);
    setTestResult((prev) => ({ ...prev, [provider]: undefined }));

    let apiKey = "";
    let customUrl = "";
    const keys = configState.apiKeys;

    if (provider === "gemini") apiKey = keys.gemini;
    if (provider === "openai") apiKey = keys.openai;
    if (provider === "anthropic") apiKey = keys.anthropic;
    if (provider === "openrouter") apiKey = keys.openrouter;
    if (provider === "ollama") customUrl = keys.ollamaUrl || "http://localhost:11434";
    if (provider === "lmstudio") customUrl = keys.lmStudioUrl || "http://localhost:1234";
    if (provider === "custom") {
      customUrl = keys.customBaseUrl;
      apiKey = keys.customApiKey;
    }

    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey, customUrl }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.models && data.models.length > 0) {
        setTestResult((prev) => ({
          ...prev,
          [provider]: { success: true, msg: `Connected! Found ${data.models.length} models.` },
        }));
      } else {
        setTestResult((prev) => ({
          ...prev,
          [provider]: { success: false, msg: data.error || "Failed to fetch models." },
        }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection timed out.";
      setTestResult((prev) => ({
        ...prev,
        [provider]: { success: false, msg: message },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const renderTestStatus = (provider: string) => {
    const result = testResult[provider];
    if (testingProvider === provider) {
      return (
        <span className="flex items-center gap-1.5 text-xs text-rose-400 mt-1 font-medium font-mono">
          <Loader2 className="animate-spin" size={12} /> Testing...
        </span>
      );
    }
    if (!result) return null;
    return result.success ? (
      <span className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1 font-medium font-mono">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> {result.msg}
      </span>
    ) : (
      <span className="flex items-center gap-1.5 text-xs text-rose-400 mt-1 font-medium font-mono">
        <span className="w-2 h-2 rounded-full bg-rose-500"></span> {result.msg}
      </span>
    );
  };

  const handlePrefChange = (key: string, value: unknown) => {
    setConfigState(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const keys = configState.apiKeys;
  const prefs = configState.preferences;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="settings-modal-backdrop" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="settings-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Sidebar Tab List */}
            <div className="settings-modal-sidebar">
              <div className="flex items-center gap-2 mb-6 px-2 border-b border-zinc-800 pb-3">
                <Sliders size={15} className="text-zinc-400" />
                <span className="text-xs font-bold font-mono tracking-wider text-white uppercase">System Config</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <button
                  className={`settings-tab-button ${activeTab === "credentials" ? "active" : ""}`}
                  onClick={() => setActiveTab("credentials")}
                >
                  <span className="archive-item-num">01 /</span>
                  <span className="archive-item-name font-mono uppercase tracking-wider text-[11px]">API Connections</span>
                </button>

                <button
                  className={`settings-tab-button ${activeTab === "models" ? "active" : ""}`}
                  onClick={() => setActiveTab("models")}
                >
                  <span className="archive-item-num">02 /</span>
                  <span className="archive-item-name font-mono uppercase tracking-wider text-[11px]">Model Registry</span>
                </button>

                <button
                  className={`settings-tab-button ${activeTab === "hyperparams" ? "active" : ""}`}
                  onClick={() => setActiveTab("hyperparams")}
                >
                  <span className="archive-item-num">03 /</span>
                  <span className="archive-item-name font-mono uppercase tracking-wider text-[11px]">Hyperparameters</span>
                </button>

                <button
                  className={`settings-tab-button ${activeTab === "metrics" ? "active" : ""}`}
                  onClick={() => setActiveTab("metrics")}
                >
                  <span className="archive-item-num">04 /</span>
                  <span className="archive-item-name font-mono uppercase tracking-wider text-[11px]">Critique Metrics</span>
                </button>

                <button
                  className={`settings-tab-button ${activeTab === "personas" ? "active" : ""}`}
                  onClick={() => setActiveTab("personas")}
                >
                  <span className="archive-item-num">05 /</span>
                  <span className="archive-item-name font-mono uppercase tracking-wider text-[11px]">Focus Personas</span>
                </button>

                <button
                  className={`settings-tab-button ${activeTab === "crawlers" ? "active" : ""}`}
                  onClick={() => setActiveTab("crawlers")}
                >
                  <span className="archive-item-num">06 /</span>
                  <span className="archive-item-name font-mono uppercase tracking-wider text-[11px]">Grounding Scrapers</span>
                </button>

                <button
                  className={`settings-tab-button ${activeTab === "ui" ? "active" : ""}`}
                  onClick={() => setActiveTab("ui")}
                >
                  <span className="archive-item-num">07 /</span>
                  <span className="archive-item-name font-mono uppercase tracking-wider text-[11px]">UI & Styling</span>
                </button>

                <button
                  className={`settings-tab-button ${activeTab === "admin" ? "active" : ""}`}
                  onClick={() => setActiveTab("admin")}
                >
                  <span className="archive-item-num">08 /</span>
                  <span className="archive-item-name font-mono uppercase tracking-wider text-[11px]">Admin Console</span>
                </button>
              </div>

              {/* Close & Save Actions at the bottom of Modal Sidebar */}
              <div className="mt-auto flex flex-col gap-2 w-full pt-4" style={{ borderTop: "1px solid var(--border-muted)" }}>
                <button
                  onClick={handleSaveAll}
                  className="custom-btn custom-btn-accent w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5"
                  disabled={saveSuccess}
                >
                  {saveSuccess ? (
                    <>
                      <CheckCircle2 size={13} />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save size={13} />
                      <span>Save Config</span>
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="custom-btn custom-btn-secondary w-full text-xs py-2.5"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Modal Scrollable Contents Panel */}
            <div className="settings-modal-content" data-lenis-prevent>

              {/* Tab 1: API Connections */}
              {activeTab === "credentials" && (
                <div className="flex flex-col gap-6 anim-fade-up">
                  <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
                    <h3 className="text-base font-semibold text-white">API Connections</h3>
                    <p className="text-xs text-zinc-500">
                      Configure your cloud and local keys. All configurations are stored securely inside your browser storage.
                    </p>
                  </div>

                  <div className="typographic-form">
                    <div className="settings-form-row">
                      <span className="row-num">01 /</span>
                      <div className="row-content">
                        <label className="row-label">Google Gemini API Key</label>
                        <div className="flex gap-4">
                          <div className="relative flex-1">
                            <input
                              type={showKeys["gemini"] ? "text" : "password"}
                              name="gemini"
                              className="minimal-input"
                              placeholder="AIzaSy..."
                              value={keys.gemini}
                              onChange={handleKeyChange}
                              style={{ fontSize: "1.05rem", padding: "6px 0" }}
                            />
                            <button
                              type="button"
                              className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white bg-transparent border-0 cursor-pointer flex items-center justify-center"
                              onClick={() => toggleShowKey("gemini")}
                            >
                              {showKeys["gemini"] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          <button className="custom-btn custom-btn-secondary h-9 px-4 flex-shrink-0" onClick={() => testConnection("gemini")}>
                            Test
                          </button>
                        </div>
                        {renderTestStatus("gemini")}
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <span className="row-num">02 /</span>
                      <div className="row-content">
                        <label className="row-label">OpenAI API Key</label>
                        <div className="flex gap-4">
                          <div className="relative flex-1">
                            <input
                              type={showKeys["openai"] ? "text" : "password"}
                              name="openai"
                              className="minimal-input"
                              placeholder="sk-proj-..."
                              value={keys.openai}
                              onChange={handleKeyChange}
                              style={{ fontSize: "1.05rem", padding: "6px 0" }}
                            />
                            <button
                              type="button"
                              className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white bg-transparent border-0 cursor-pointer flex items-center justify-center"
                              onClick={() => toggleShowKey("openai")}
                            >
                              {showKeys["openai"] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          <button className="custom-btn custom-btn-secondary h-9 px-4 flex-shrink-0" onClick={() => testConnection("openai")}>
                            Test
                          </button>
                        </div>
                        {renderTestStatus("openai")}
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <span className="row-num">03 /</span>
                      <div className="row-content">
                        <label className="row-label">Anthropic API Key</label>
                        <div className="flex gap-4">
                          <div className="relative flex-1">
                            <input
                              type={showKeys["anthropic"] ? "text" : "password"}
                              name="anthropic"
                              className="minimal-input"
                              placeholder="sk-ant-..."
                              value={keys.anthropic}
                              onChange={handleKeyChange}
                              style={{ fontSize: "1.05rem", padding: "6px 0" }}
                            />
                            <button
                              type="button"
                              className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white bg-transparent border-0 cursor-pointer flex items-center justify-center"
                              onClick={() => toggleShowKey("anthropic")}
                            >
                              {showKeys["anthropic"] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          <button className="custom-btn custom-btn-secondary h-9 px-4 flex-shrink-0" onClick={() => testConnection("anthropic")}>
                            Test
                          </button>
                        </div>
                        {renderTestStatus("anthropic")}
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <span className="row-num">04 /</span>
                      <div className="row-content">
                        <label className="row-label">OpenRouter API Key</label>
                        <div className="flex gap-4">
                          <div className="relative flex-1">
                            <input
                              type={showKeys["openrouter"] ? "text" : "password"}
                              name="openrouter"
                              className="minimal-input"
                              placeholder="sk-or-v1-..."
                              value={keys.openrouter}
                              onChange={handleKeyChange}
                              style={{ fontSize: "1.05rem", padding: "6px 0" }}
                            />
                            <button
                              type="button"
                              className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white bg-transparent border-0 cursor-pointer flex items-center justify-center"
                              onClick={() => toggleShowKey("openrouter")}
                            >
                              {showKeys["openrouter"] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          <button className="custom-btn custom-btn-secondary h-9 px-4 flex-shrink-0" onClick={() => testConnection("openrouter")}>
                            Test
                          </button>
                        </div>
                        {renderTestStatus("openrouter")}
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <span className="row-num">05 /</span>
                      <div className="row-content">
                        <label className="row-label">Ollama Host</label>
                        <div className="flex gap-4">
                          <input
                            type="text"
                            name="ollamaUrl"
                            className="minimal-input flex-1"
                            placeholder="http://localhost:11434"
                            value={keys.ollamaUrl}
                            onChange={handleKeyChange}
                            style={{ fontSize: "1.05rem", padding: "6px 0" }}
                          />
                          <button className="custom-btn custom-btn-secondary h-9 px-4 flex-shrink-0" onClick={() => testConnection("ollama")}>
                            Test
                          </button>
                        </div>
                        {renderTestStatus("ollama")}
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <span className="row-num">06 /</span>
                      <div className="row-content">
                        <label className="row-label">LM Studio Host</label>
                        <div className="flex gap-4">
                          <input
                            type="text"
                            name="lmStudioUrl"
                            className="minimal-input flex-1"
                            placeholder="http://localhost:1234"
                            value={keys.lmStudioUrl}
                            onChange={handleKeyChange}
                            style={{ fontSize: "1.05rem", padding: "6px 0" }}
                          />
                          <button className="custom-btn custom-btn-secondary h-9 px-4 flex-shrink-0" onClick={() => testConnection("lmstudio")}>
                            Test
                          </button>
                        </div>
                        {renderTestStatus("lmstudio")}
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <span className="row-num">07 /</span>
                      <div className="row-content">
                        <label className="row-label">Custom API Gateway Base URL</label>
                        <input
                          type="text"
                          name="customBaseUrl"
                          className="minimal-input"
                          placeholder="https://api.mycustomgateway.com/v1"
                          value={keys.customBaseUrl}
                          onChange={handleKeyChange}
                          style={{ fontSize: "1.05rem", padding: "6px 0" }}
                        />
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <span className="row-num">08 /</span>
                      <div className="row-content">
                        <label className="row-label">Custom API Key</label>
                        <div className="flex gap-4">
                          <div className="relative flex-1">
                            <input
                              type={showKeys["customApiKey"] ? "text" : "password"}
                              name="customApiKey"
                              className="minimal-input"
                              placeholder="Enter custom API key..."
                              value={keys.customApiKey}
                              onChange={handleKeyChange}
                              style={{ fontSize: "1.05rem", padding: "6px 0" }}
                            />
                            <button
                              type="button"
                              className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white bg-transparent border-0 cursor-pointer flex items-center justify-center"
                              onClick={() => toggleShowKey("customApiKey")}
                            >
                              {showKeys["customApiKey"] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          <button className="custom-btn custom-btn-secondary h-9 px-4 flex-shrink-0" onClick={() => testConnection("custom")}>
                            Test
                          </button>
                        </div>
                        {renderTestStatus("custom")}
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <span className="row-num">09 /</span>
                      <div className="row-content">
                        <label className="row-label">SerpApi Key (Google / Yahoo Search)</label>
                        <input
                          type="password"
                          name="serpapi"
                          className="minimal-input"
                          placeholder="Enter SerpApi key..."
                          value={keys.serpapi || ""}
                          onChange={handleKeyChange}
                          style={{ fontSize: "1.05rem", padding: "6px 0" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Model Registry */}
              {activeTab === "models" && (
                <div className="flex flex-col gap-6 anim-fade-up">
                  <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
                    <h3 className="text-base font-semibold text-white">Model Registry</h3>
                    <p className="text-xs text-zinc-500">
                      Register custom or local model profiles to populate agent dropdowns.
                    </p>
                  </div>

                  <div className="typographic-form">
                    {/* Add Model Form */}
                    <div className="settings-form-row">
                      <span className="row-num">01 /</span>
                      <div className="row-content">
                        <label className="row-label">Register New Model</label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-mono mb-1">Model Name (Display)</span>
                            <input
                              type="text"
                              placeholder="e.g. Llama 3 8B"
                              className="minimal-input text-xs"
                              value={newModel.name}
                              onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-mono mb-1">Model ID (Identifier)</span>
                            <input
                              type="text"
                              placeholder="e.g. llama3:8b"
                              className="minimal-input text-xs font-mono"
                              value={newModel.id}
                              onChange={(e) => setNewModel(prev => ({ ...prev, id: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-mono mb-1">Provider</span>
                            <select
                              className="minimal-select text-xs"
                              style={{ background: "var(--background)", color: "var(--foreground)" }}
                              value={newModel.provider}
                              onChange={(e) => setNewModel(prev => ({ ...prev, provider: e.target.value }))}
                            >
                              <option value="gemini">Gemini</option>
                              <option value="openai">OpenAI</option>
                              <option value="anthropic">Anthropic</option>
                              <option value="openrouter">OpenRouter</option>
                              <option value="ollama">Ollama</option>
                              <option value="lmstudio">LM Studio</option>
                              <option value="custom">Custom Gateway</option>
                            </select>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-mono mb-1">Context Length</span>
                            <input
                              type="number"
                              placeholder="128000"
                              className="minimal-input text-xs"
                              value={newModel.contextLength || ""}
                              onChange={(e) => setNewModel(prev => ({ ...prev, contextLength: parseInt(e.target.value) || undefined }))}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-mono mb-1">Max Output Tokens</span>
                            <input
                              type="number"
                              placeholder="4096"
                              className="minimal-input text-xs"
                              value={newModel.maxOutputTokens || ""}
                              onChange={(e) => setNewModel(prev => ({ ...prev, maxOutputTokens: parseInt(e.target.value) || undefined }))}
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleAddModel}
                          className="custom-btn custom-btn-accent text-xs font-mono py-2 px-4 mt-4"
                        >
                          + Add Model Profile
                        </button>
                      </div>
                    </div>

                    {/* Model List */}
                    <div className="settings-form-row">
                      <span className="row-num">02 /</span>
                      <div className="row-content">
                        <label className="row-label mb-2 block">Active Registry</label>
                        <div className="flex flex-col border border-zinc-800 divide-y divide-zinc-800 font-mono text-xs">
                          {configState.customModels.length === 0 ? (
                            <div className="p-4 text-center text-zinc-500 font-sans">No custom models registered.</div>
                          ) : (
                            configState.customModels.map((m) => (
                              <div key={m.id} className="flex justify-between items-center p-3">
                                <div>
                                  <div className="font-bold text-white text-[12px]">{m.name}</div>
                                  <div className="text-zinc-500 text-[10px] mt-0.5">
                                    ID: {m.id} | Provider: {m.provider.toUpperCase()} | Context: {m.contextLength?.toLocaleString() || "N/A"} | Max Out: {m.maxOutputTokens || "N/A"}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveModel(m.id)}
                                  className="text-zinc-500 hover:text-rose-500 font-mono text-[9px] uppercase border border-zinc-800 hover:border-rose-500 px-2 py-1 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Hyperparameters */}
              {activeTab === "hyperparams" && (
                <div className="flex flex-col gap-6 anim-fade-up">
                  <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
                    <h3 className="text-base font-semibold text-white">Hyperparameters</h3>
                    <p className="text-xs text-zinc-500">
                      Tune advanced model generation parameters globally.
                    </p>
                  </div>

                  <div className="typographic-form">
                    <div className="settings-form-row">
                      <span className="row-num">01 /</span>
                      <div className="row-content">
                        <label className="row-label flex justify-between">
                          <span>Temperature (Randomness)</span>
                          <span className="text-xs text-white font-mono">{configState.advancedParams.temperature}</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={configState.advancedParams.temperature}
                          onChange={(e) => handleConfigChange("advancedParams.temperature", parseFloat(e.target.value))}
                          className="w-full mt-2"
                        />
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <span className="row-num">02 /</span>
                      <div className="row-content">
                        <label className="row-label flex justify-between">
                          <span>Top-P (Nucleus Sampling)</span>
                          <span className="text-xs text-white font-mono">{configState.advancedParams.topP}</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={configState.advancedParams.topP}
                          onChange={(e) => handleConfigChange("advancedParams.topP", parseFloat(e.target.value))}
                          className="w-full mt-2"
                        />
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <span className="row-num">03 /</span>
                      <div className="row-content">
                        <label className="row-label flex justify-between">
                          <span>Top-K</span>
                          <span className="text-xs text-white font-mono">{configState.advancedParams.topK}</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          step="1"
                          value={configState.advancedParams.topK}
                          onChange={(e) => handleConfigChange("advancedParams.topK", parseInt(e.target.value))}
                          className="w-full mt-2"
                        />
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <span className="row-num">04 /</span>
                      <div className="row-content">
                        <label className="row-label flex justify-between">
                          <span>Presence Penalty</span>
                          <span className="text-xs text-white font-mono">{configState.advancedParams.presencePenalty}</span>
                        </label>
                        <input
                          type="range"
                          min="-2"
                          max="2"
                          step="0.1"
                          value={configState.advancedParams.presencePenalty}
                          onChange={(e) => handleConfigChange("advancedParams.presencePenalty", parseFloat(e.target.value))}
                          className="w-full mt-2"
                        />
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <span className="row-num">05 /</span>
                      <div className="row-content">
                        <label className="row-label flex justify-between">
                          <span>Frequency Penalty</span>
                          <span className="text-xs text-white font-mono">{configState.advancedParams.frequencyPenalty}</span>
                        </label>
                        <input
                          type="range"
                          min="-2"
                          max="2"
                          step="0.1"
                          value={configState.advancedParams.frequencyPenalty}
                          onChange={(e) => handleConfigChange("advancedParams.frequencyPenalty", parseFloat(e.target.value))}
                          className="w-full mt-2"
                        />
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <span className="row-num">06 /</span>
                      <div className="row-content">
                        <label className="row-label">Deterministic Seed</label>
                        <input
                          type="number"
                          className="minimal-input font-mono mt-1"
                          value={configState.advancedParams.seed}
                          onChange={(e) => handleConfigChange("advancedParams.seed", parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <span className="row-num">07 /</span>
                      <div className="row-content">
                        <label className="row-label">Stop Sequences (Comma-separated)</label>
                        <input
                          type="text"
                          className="minimal-input font-mono mt-1"
                          placeholder="e.g. \n, ###, User:"
                          value={configState.advancedParams.stopSequences}
                          onChange={(e) => handleConfigChange("advancedParams.stopSequences", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Critique Metrics */}
              {activeTab === "metrics" && (
                <div className="flex flex-col gap-6 anim-fade-up">
                  <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
                    <h3 className="text-base font-semibold text-white">Critique Metrics</h3>
                    <p className="text-xs text-zinc-500">
                      Define custom evaluation axes used in peer debates and final post scoring.
                    </p>
                  </div>

                  <div className="typographic-form">
                    {/* Add Metric */}
                    <div className="settings-form-row">
                      <span className="row-num">01 /</span>
                      <div className="row-content">
                        <label className="row-label">Add Critique Metric</label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-mono mb-1">Metric Name (Display)</span>
                            <input
                              type="text"
                              placeholder="e.g. Technical Accuracy"
                              className="minimal-input text-xs"
                              value={newMetric.name}
                              onChange={(e) => setNewMetric(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-mono mb-1">Metric Key (CamelCase/id)</span>
                            <input
                              type="text"
                              placeholder="e.g. techAccuracy"
                              className="minimal-input text-xs font-mono"
                              value={newMetric.id}
                              onChange={(e) => setNewMetric(prev => ({ ...prev, id: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col mt-4">
                          <span className="text-[10px] text-zinc-500 font-mono mb-1">Score Weight ({newMetric.weight}%)</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={newMetric.weight}
                            onChange={(e) => setNewMetric(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                            className="w-full"
                          />
                        </div>

                        <div className="flex flex-col mt-4">
                          <span className="text-[10px] text-zinc-500 font-mono mb-1">Scoring Prompts & Instructions</span>
                          <textarea
                            className="minimal-input text-xs"
                            placeholder="Detail guidelines for grading... Output score 0-100."
                            rows={3}
                            value={newMetric.scoringInstructions}
                            onChange={(e) => setNewMetric(prev => ({ ...prev, scoringInstructions: e.target.value }))}
                          />
                        </div>

                        <button
                          onClick={handleAddMetric}
                          className="custom-btn custom-btn-accent text-xs font-mono py-2 px-4 mt-4"
                        >
                          + Add Metric Axis
                        </button>
                      </div>
                    </div>

                    {/* Metrics List */}
                    <div className="settings-form-row">
                      <span className="row-num">02 /</span>
                      <div className="row-content">
                        <label className="row-label mb-2 block">Active Critique Axes</label>
                        <div className="flex flex-col border border-zinc-800 divide-y divide-zinc-800 font-mono text-xs">
                          {configState.customMetrics.length === 0 ? (
                            <div className="p-4 text-center text-zinc-500 font-sans">No evaluation metrics registered.</div>
                          ) : (
                            configState.customMetrics.map((m) => (
                              <div key={m.id} className="flex justify-between items-start p-3">
                                <div className="flex-1 pr-4">
                                  <div className="flex items-center gap-2 font-sans">
                                    <span className="font-bold text-white text-[12px]">{m.name}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono">({m.weight}%)</span>
                                  </div>
                                  <div className="text-zinc-500 text-[10px] mt-0.5 font-mono">ID: {m.id}</div>
                                  <div className="text-zinc-400 text-[10px] mt-1 italic font-sans line-clamp-2" title={m.scoringInstructions}>
                                    {m.scoringInstructions || "No instructions provided."}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveMetric(m.id)}
                                  className="text-zinc-500 hover:text-rose-500 font-mono text-[9px] uppercase border border-zinc-800 hover:border-rose-500 px-2 py-1 transition-colors mt-1"
                                >
                                  Delete
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Focus Personas */}
              {activeTab === "personas" && (
                <div className="flex flex-col gap-6 anim-fade-up">
                  <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
                    <h3 className="text-base font-semibold text-white">Focus Group Personas</h3>
                    <p className="text-xs text-zinc-500">
                      Customize the focus group personas who simulate reactions, comments, and engagement probability.
                    </p>
                  </div>

                  <div className="typographic-form">
                    {/* Add Persona */}
                    <div className="settings-form-row">
                      <span className="row-num">01 /</span>
                      <div className="row-content">
                        <label className="row-label">Create Target Persona</label>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <div className="flex flex-col col-span-2">
                            <span className="text-[10px] text-zinc-500 font-mono mb-1">Persona Name</span>
                            <input
                              type="text"
                              placeholder="e.g. Skeptical CTO"
                              className="minimal-input text-xs"
                              value={newPersona.name}
                              onChange={(e) => setNewPersona(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-mono mb-1">Avatar Emoji</span>
                            <input
                              type="text"
                              maxLength={2}
                              placeholder="💡"
                              className="minimal-input text-xs text-center"
                              value={newPersona.avatar}
                              onChange={(e) => setNewPersona(prev => ({ ...prev, avatar: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-mono mb-1">Unique ID</span>
                            <input
                              type="text"
                              placeholder="e.g. cto"
                              className="minimal-input text-xs font-mono"
                              value={newPersona.id}
                              onChange={(e) => setNewPersona(prev => ({ ...prev, id: e.target.value }))}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-mono mb-1">Comment Ratio ({newPersona.commentRatio}%)</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={newPersona.commentRatio}
                              onChange={(e) => setNewPersona(prev => ({ ...prev, commentRatio: parseInt(e.target.value) || 0 }))}
                              className="w-full mt-2"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col mt-4">
                          <span className="text-[10px] text-zinc-500 font-mono mb-1">Biography & Critique Focus</span>
                          <textarea
                            className="minimal-input text-xs"
                            placeholder="Values deep technical specs, filters marketing hype, prioritizes security..."
                            rows={3}
                            value={newPersona.description}
                            onChange={(e) => setNewPersona(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>

                        <button
                          onClick={handleAddPersona}
                          className="custom-btn custom-btn-accent text-xs font-mono py-2 px-4 mt-4"
                        >
                          + Add Persona Profile
                        </button>
                      </div>
                    </div>

                    {/* Persona List */}
                    <div className="settings-form-row">
                      <span className="row-num">02 /</span>
                      <div className="row-content">
                        <label className="row-label mb-2 block">Active Simulator Panel</label>
                        <div className="flex flex-col border border-zinc-800 divide-y divide-zinc-800 font-mono text-xs">
                          {configState.customPersonas.length === 0 ? (
                            <div className="p-4 text-center text-zinc-500 font-sans">No personas registered.</div>
                          ) : (
                            configState.customPersonas.map((p) => (
                              <div key={p.id} className="flex justify-between items-start p-3">
                                <div className="flex-1 pr-4">
                                  <div className="flex items-center gap-2 font-sans">
                                    <span className="text-[16px]">{p.avatar}</span>
                                    <span className="font-bold text-white text-[12px]">{p.name}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono">({p.commentRatio}% Comments)</span>
                                  </div>
                                  <div className="text-zinc-500 text-[10px] mt-0.5 font-mono">ID: {p.id}</div>
                                  <div className="text-zinc-400 text-[10px] mt-1 italic font-sans line-clamp-2" title={p.description}>
                                    {p.description}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemovePersona(p.id)}
                                  className="text-zinc-500 hover:text-rose-500 font-mono text-[9px] uppercase border border-zinc-800 hover:border-rose-500 px-2 py-1 transition-colors mt-1"
                                >
                                  Delete
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: Grounding Scrapers */}
              {activeTab === "crawlers" && (
                <div className="flex flex-col gap-6 anim-fade-up">
                  <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
                    <h3 className="text-base font-semibold text-white">Grounding & Scrapers</h3>
                    <p className="text-xs text-zinc-500">
                      Manage how real-time news indexing, scraping pipelines, and the internal archive work.
                    </p>
                  </div>

                  <div className="typographic-form">
                    {/* Target Year */}
                    <div className="settings-form-row">
                      <span className="row-num">01 /</span>
                      <div className="row-content">
                        <label className="row-label">Target Year Range</label>
                        <input
                          type="number"
                          min="2000"
                          max="2030"
                          className="minimal-input mt-1"
                          value={configState.crawlerConfig.targetYear}
                          onChange={(e) => handleConfigChange("crawlerConfig.targetYear", parseInt(e.target.value) || 2026)}
                        />
                        <span className="text-[10px] text-zinc-500 font-mono block mt-1">Limits search crawler recency check.</span>
                      </div>
                    </div>

                    {/* SerpApi Activation Toggle */}
                    <div className="settings-form-row">
                      <span className="row-num">02 /</span>
                      <div className="row-content">
                        <div className="flex items-center justify-between py-2">
                          <div className="flex flex-col gap-0.5 font-sans">
                            <span className="text-xs font-semibold text-white">Enable Real-Time Google SerpApi</span>
                            <span className="text-[10px] text-zinc-500 font-mono">Use key under connections to query google search.</span>
                          </div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={configState.crawlerConfig.serpapiEnabled}
                              onChange={(e) => handleConfigChange("crawlerConfig.serpapiEnabled", e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* RAG Toggle */}
                    <div className="settings-form-row">
                      <span className="row-num">03 /</span>
                      <div className="row-content">
                        <div className="flex items-center justify-between py-2">
                          <div className="flex flex-col gap-0.5 font-sans">
                            <span className="text-xs font-semibold text-white">Lightweight RAG Engine</span>
                            <span className="text-[10px] text-zinc-500 font-mono">Use local string similarity vectors matching archives.</span>
                          </div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={prefs.enableRAG}
                              onChange={(e) => handlePrefChange("enableRAG", e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Crawler Engine Priority List */}
                    <div className="settings-form-row">
                      <span className="row-num">04 /</span>
                      <div className="row-content">
                        <label className="row-label mb-2 block">Scraper Pipeline Priority Fallback</label>
                        <div className="flex flex-col border border-zinc-800 divide-y divide-zinc-800 font-mono text-xs">
                          {configState.crawlerConfig.enginePriority.map((engine, idx) => (
                            <div key={engine} className="flex justify-between items-center p-3">
                              <div>
                                <span className="text-zinc-500 mr-2">{idx + 1}.</span>
                                <span className="font-bold text-white uppercase">{engine.replace("_", " ")}</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  disabled={idx === 0}
                                  onClick={() => {
                                    const arr = [...configState.crawlerConfig.enginePriority];
                                    const temp = arr[idx];
                                    arr[idx] = arr[idx - 1];
                                    arr[idx - 1] = temp;
                                    handleConfigChange("crawlerConfig.enginePriority", arr);
                                  }}
                                  className="text-zinc-500 hover:text-white font-mono text-[9px] uppercase border border-zinc-800 hover:border-zinc-500 px-2 py-1 transition-colors disabled:opacity-30 disabled:hover:text-zinc-500"
                                >
                                  Up
                                </button>
                                <button
                                  disabled={idx === configState.crawlerConfig.enginePriority.length - 1}
                                  onClick={() => {
                                    const arr = [...configState.crawlerConfig.enginePriority];
                                    const temp = arr[idx];
                                    arr[idx] = arr[idx + 1];
                                    arr[idx + 1] = temp;
                                    handleConfigChange("crawlerConfig.enginePriority", arr);
                                  }}
                                  className="text-zinc-500 hover:text-white font-mono text-[9px] uppercase border border-zinc-800 hover:border-zinc-500 px-2 py-1 transition-colors disabled:opacity-30 disabled:hover:text-zinc-500"
                                >
                                  Down
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 7: UI & Styling */}
              {activeTab === "ui" && (
                <div className="flex flex-col gap-6 anim-fade-up">
                  <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
                    <h3 className="text-base font-semibold text-white">Themes & UI Styling</h3>
                    <p className="text-xs text-zinc-500">
                      Tailor workspace aesthetics, layout density, and custom css variables.
                    </p>
                  </div>

                  <div className="typographic-form">
                    {/* Theme Swatches */}
                    <div className="settings-form-row">
                      <span className="row-num">01 /</span>
                      <div className="row-content">
                        <label className="row-label">Aesthetic Theme Preset</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                          {[
                            { id: "obsidian", name: "Obsidian Black", bg: "#09090b", panel: "#111113", accent: "#f4f4f5" },
                            { id: "nordic", name: "Nordic Slate", bg: "#0b0f19", panel: "#131c2e", accent: "#38bdf8" },
                            { id: "oled", name: "OLED Pitch", bg: "#000000", panel: "#090909", accent: "#ffffff" },
                            { id: "alabaster", name: "Alabaster Stone", bg: "#fbfbfa", panel: "#ffffff", accent: "#1c1917" },
                            { id: "emerald", name: "Emerald Mint", bg: "#022c22", panel: "#033f30", accent: "#34d399" },
                          ].map((t) => {
                            const isActive = theme === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => handleSelectTheme(t.id)}
                                className={`p-3 border text-left cursor-pointer transition-all flex flex-col justify-between ${
                                  isActive ? "border-zinc-300 bg-zinc-800/20" : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/20"
                                }`}
                                style={{ minHeight: "80px", borderRadius: 0 }}
                              >
                                <div className="flex items-center justify-between w-full mb-1">
                                  <span className="text-[11px] font-semibold text-white">{t.name}</span>
                                  {isActive && <CheckCircle2 size={12} className="text-zinc-300" />}
                                </div>
                                <div className="flex gap-1.5 mt-2">
                                  <span className="w-3.5 h-3.5 rounded-full border border-zinc-800/40 block" style={{ backgroundColor: t.bg }} title="Background" />
                                  <span className="w-3.5 h-3.5 rounded-full border border-zinc-800/40 block" style={{ backgroundColor: t.panel }} title="Panel" />
                                  <span className="w-3.5 h-3.5 rounded-full border border-zinc-800/40 block" style={{ backgroundColor: t.accent }} title="Accent" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Typography Selector */}
                    <div className="settings-form-row">
                      <span className="row-num">02 /</span>
                      <div className="row-content">
                        <label className="row-label">Active Font Family</label>
                        <select
                          value={font}
                          onChange={(e) => handleSelectFont(e.target.value)}
                          className="minimal-select"
                          style={{ background: "var(--background)", color: "var(--foreground)", fontSize: "1.05rem", padding: "6px 0" }}
                        >
                          <option value="geist">Geist (Minimal Sans-Serif)</option>
                          <option value="outfit">Outfit (Geometric Modern)</option>
                          <option value="jakarta">Plus Jakarta Sans (Elegant Accent)</option>
                          <option value="inter">Inter (Classic Balanced)</option>
                          <option value="fira">Fira Code (Monospace Typewriter)</option>
                          <option value="custom">Custom Web Font...</option>
                        </select>
                      </div>
                    </div>

                    {/* Custom Font Config URL & Family (only if font === "custom") */}
                    {font === "custom" && (
                      <div className="settings-form-row">
                        <span className="row-num">03 /</span>
                        <div className="row-content animate-fade-down">
                          <label className="row-label">Google Font / Stylesheet URL</label>
                          <input
                            type="text"
                            className="minimal-input text-xs font-mono"
                            placeholder="e.g. https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap"
                            value={prefs.customFontUrl || ""}
                            onChange={(e) => handlePrefChange("customFontUrl", e.target.value)}
                          />
                          <span className="text-[10px] text-zinc-500 font-mono block mt-1">URL to the stylesheet.</span>
                          
                          <label className="row-label mt-4">Font Family Name Override</label>
                          <input
                            type="text"
                            className="minimal-input text-xs font-mono"
                            placeholder="e.g. 'Playfair Display', serif"
                            value={prefs.customFontFamily || ""}
                            onChange={(e) => handlePrefChange("customFontFamily", e.target.value)}
                          />
                          <span className="text-[10px] text-zinc-500 font-mono block mt-1">Font family name used in CSS rules.</span>
                        </div>
                      </div>
                    )}

                    {/* Font size scale slider */}
                    <div className="settings-form-row">
                      <span className="row-num">04 /</span>
                      <div className="row-content">
                        <label className="row-label flex justify-between">
                          <span>Font Size Scale</span>
                          <span className="text-xs text-white font-semibold font-mono">{prefs.fontSize}px</span>
                        </label>
                        <input
                          type="range"
                          min="12"
                          max="18"
                          step="1"
                          value={prefs.fontSize}
                          onChange={(e) => handlePrefChange("fontSize", parseInt(e.target.value))}
                          className="w-full mt-2"
                        />
                      </div>
                    </div>

                    {/* Layout density swatches */}
                    <div className="settings-form-row">
                      <span className="row-num">05 /</span>
                      <div className="row-content">
                        <label className="row-label">Layout Density</label>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          {[
                            { id: "compact", name: "Compact", desc: "Dense layout" },
                            { id: "cozy", name: "Cozy", desc: "Standard standard" },
                            { id: "spacious", name: "Spacious", desc: "Open margins" },
                          ].map((d) => (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => handlePrefChange("layoutDensity", d.id)}
                              className={`p-3 border text-left cursor-pointer transition-all ${
                                prefs.layoutDensity === d.id ? "bg-zinc-800/20 border-zinc-500" : "bg-transparent border-zinc-800 hover:border-zinc-700"
                              }`}
                              style={{ borderRadius: 0 }}
                            >
                              <span className="text-xs font-semibold text-white block">{d.name}</span>
                              <span className="text-[9px] text-zinc-500 leading-tight mt-1 block font-mono">{d.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sidebar Alignment */}
                    <div className="settings-form-row">
                      <span className="row-num">06 /</span>
                      <div className="row-content">
                        <label className="row-label">Sidebar Alignment</label>
                        <div className="flex gap-6 py-2">
                          <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer font-mono">
                            <input
                              type="radio"
                              name="sidebarPosition"
                              checked={prefs.sidebarPosition === "left"}
                              onChange={() => handlePrefChange("sidebarPosition", "left")}
                              className="accent-zinc-400"
                            />
                            <span>Left Docked</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer font-mono">
                            <input
                              type="radio"
                              name="sidebarPosition"
                              checked={prefs.sidebarPosition === "right"}
                              onChange={() => handlePrefChange("sidebarPosition", "right")}
                              className="accent-zinc-400"
                            />
                            <span>Right Docked</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* LinkedIn preview identity configuration (moved to UI and styling) */}
                    <div className="settings-form-row">
                      <span className="row-num">07 /</span>
                      <div className="row-content">
                        <label className="row-label">Preview Identity Profile Name</label>
                        <input
                          type="text"
                          className="minimal-input text-xs"
                          placeholder="e.g. Jane Doe"
                          value={prefs.linkedinName}
                          onChange={(e) => handlePrefChange("linkedinName", e.target.value)}
                        />
                        
                        <label className="row-label mt-4">Preview Professional Headline</label>
                        <input
                          type="text"
                          className="minimal-input text-xs"
                          placeholder="e.g. CEO @ TechSaaS | Ghostwriter"
                          value={prefs.linkedinHeadline}
                          onChange={(e) => handlePrefChange("linkedinHeadline", e.target.value)}
                        />
                        
                        <label className="row-label mt-4">Preview Avatar Emoji / Character</label>
                        <input
                          type="text"
                          maxLength={2}
                          className="minimal-input w-24 text-center text-xs font-bold font-mono"
                          placeholder="💡"
                          value={prefs.linkedinAvatar}
                          onChange={(e) => handlePrefChange("linkedinAvatar", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Auto copy to clipboard & show animations toggles */}
                    <div className="settings-form-row">
                      <span className="row-num">08 /</span>
                      <div className="row-content">
                        <div className="flex items-center justify-between py-2">
                          <div className="flex flex-col gap-0.5 font-sans">
                            <span className="text-xs font-semibold text-white">Auto-copy Generated Post</span>
                            <span className="text-[10px] text-zinc-500 font-mono">Automatically copy synthesized posts to system clipboard.</span>
                          </div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={prefs.autoCopyToClipboard}
                              onChange={(e) => handlePrefChange("autoCopyToClipboard", e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <span className="row-num">09 /</span>
                      <div className="row-content">
                        <div className="flex items-center justify-between py-2">
                          <div className="flex flex-col gap-0.5 font-sans">
                            <span className="text-xs font-semibold text-white">Enable UI Transitions</span>
                            <span className="text-[10px] text-zinc-500 font-mono">Use Framer Motion animation effects for smooth fading panels.</span>
                          </div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={prefs.showTransitions}
                              onChange={(e) => handlePrefChange("showTransitions", e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Custom CSS overrides */}
                    <div className="settings-form-row">
                      <span className="row-num">10 /</span>
                      <div className="row-content">
                        <label className="row-label flex items-center gap-1.5">
                          <Code size={13} />
                          <span>Advanced Custom CSS Overrides</span>
                        </label>
                        <textarea
                          value={cssOverride}
                          onChange={handleCssChange}
                          className="minimal-input font-mono text-xs mt-2"
                          placeholder="/* Inject style rules here */&#10;.sidebar { border-right: 1px solid var(--border-muted); }"
                          style={{ minHeight: "100px", lineHeight: "1.4", fontSize: "0.85rem" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 8: Admin Console */}
              {activeTab === "admin" && (
                <div className="flex flex-col gap-6 anim-fade-up">
                  <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
                    <h3 className="text-base font-semibold text-white">Admin Console</h3>
                    <p className="text-xs text-zinc-500">
                      Export configuration backups, load settings files, or restore application factory state.
                    </p>
                  </div>

                  <div className="typographic-form">
                    {/* Export & Import */}
                    <div className="settings-form-row">
                      <span className="row-num">01 /</span>
                      <div className="row-content">
                        <label className="row-label">Configuration Backups</label>
                        <div className="flex flex-col sm:flex-row gap-4 mt-2">
                          <button
                            onClick={handleExportConfig}
                            className="custom-btn custom-btn-accent text-xs font-mono py-2.5 px-4 flex-1 flex items-center justify-center gap-2"
                          >
                            Export JSON Backup
                          </button>
                          <div className="relative flex-1">
                            <input
                              type="file"
                              accept=".json"
                              onChange={handleImportConfig}
                              className="hidden"
                              id="import-config-file"
                            />
                            <label
                              htmlFor="import-config-file"
                              className="custom-btn custom-btn-secondary text-xs font-mono py-2.5 px-4 block text-center cursor-pointer hover:border-zinc-500"
                            >
                              Import JSON Backup
                            </label>
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono block mt-2">
                          Import files must match the version 1 schema definition.
                        </span>
                      </div>
                    </div>

                    {/* Factory Reset */}
                    <div className="settings-form-row">
                      <span className="row-num">02 /</span>
                      <div className="row-content">
                        <label className="row-label text-rose-500">Emergency Reset</label>
                        <p className="text-xs text-zinc-500 mt-1 mb-3">
                          Wipes all cached credentials, focus group personas, evaluation metrics, and local styling variables. Wiped data cannot be retrieved.
                        </p>
                        <button
                          onClick={handleFactoryReset}
                          className="custom-btn bg-transparent hover:bg-rose-950/20 text-rose-500 hover:text-rose-400 border border-rose-800 hover:border-rose-600 text-xs font-mono font-bold py-2.5 px-6 transition-all"
                          style={{ borderRadius: 0 }}
                        >
                          Factory Reset Application
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
