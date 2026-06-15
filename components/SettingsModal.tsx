"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Loader2, Save, Sliders } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CredentialsTab from "./settings/CredentialsTab";
import ModelsTab from "./settings/ModelsTab";
import HyperparamsTab from "./settings/HyperparamsTab";
import MetricsTab from "./settings/MetricsTab";
import PersonasTab from "./settings/PersonasTab";
import CrawlersTab from "./settings/CrawlersTab";
import UiTab from "./settings/UiTab";
import AdminTab from "./settings/AdminTab";

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
  fontSize: number;
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
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    setTimeout(() => {
      if (modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          (focusable[0] as HTMLElement).focus();
        }
      }
    }, 50);

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
  const [configState, setConfigState] = useState<MasterConfig>(masterConfig);
  const [cssOverride, setCssOverride] = useState(customCss);

  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { success: boolean; msg: string } | undefined>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
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
            ref={modalRef}
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="settings-modal-container"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
            aria-label="Settings configuration modal"
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
              {activeTab === "credentials" && (
                <CredentialsTab
                  keys={keys}
                  onKeyChange={handleKeyChange}
                  showKeys={showKeys}
                  toggleShowKey={toggleShowKey}
                  testConnection={testConnection}
                  renderTestStatus={renderTestStatus}
                />
              )}

              {activeTab === "models" && (
                <ModelsTab
                  customModels={configState.customModels}
                  newModel={newModel}
                  setNewModel={setNewModel}
                  handleAddModel={handleAddModel}
                  handleRemoveModel={handleRemoveModel}
                />
              )}

              {activeTab === "hyperparams" && (
                <HyperparamsTab
                  advancedParams={configState.advancedParams}
                  handleConfigChange={handleConfigChange}
                />
              )}

              {activeTab === "metrics" && (
                <MetricsTab
                  customMetrics={configState.customMetrics}
                  newMetric={newMetric}
                  setNewMetric={setNewMetric}
                  handleAddMetric={handleAddMetric}
                  handleRemoveMetric={handleRemoveMetric}
                />
              )}

              {activeTab === "personas" && (
                <PersonasTab
                  customPersonas={configState.customPersonas}
                  newPersona={newPersona}
                  setNewPersona={setNewPersona}
                  handleAddPersona={handleAddPersona}
                  handleRemovePersona={handleRemovePersona}
                />
              )}

              {activeTab === "crawlers" && (
                <CrawlersTab
                  crawlerConfig={configState.crawlerConfig}
                  enableRAG={prefs.enableRAG}
                  handleConfigChange={handleConfigChange}
                  handlePrefChange={handlePrefChange}
                />
              )}

              {activeTab === "ui" && (
                <UiTab
                  theme={theme}
                  font={font}
                  prefs={prefs}
                  handleSelectTheme={handleSelectTheme}
                  handleSelectFont={handleSelectFont}
                  handlePrefChange={handlePrefChange}
                  cssOverride={cssOverride}
                  handleCssChange={handleCssChange}
                />
              )}

              {activeTab === "admin" && (
                <AdminTab
                  handleExportConfig={handleExportConfig}
                  handleImportConfig={handleImportConfig}
                  handleFactoryReset={handleFactoryReset}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
