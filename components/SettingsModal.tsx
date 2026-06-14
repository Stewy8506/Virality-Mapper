"use client";

import { useState } from "react";
import {
  Key, CheckCircle2, Loader2,
  Eye, EyeOff, Save, Palette, Code, User, Sliders, Cpu
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
}

type TabType = "credentials" | "linkedin" | "workspace" | "styling";

export default function SettingsModal({
  isOpen,
  onClose,
  apiKeys,
  onSaveKeys,
  customCss,
  onSaveCustomCss,
  preferences,
  onSavePreferences,
}: {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeys;
  onSaveKeys: (keys: ApiKeys) => void;
  customCss: string;
  onSaveCustomCss: (css: string) => void;
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => void;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("credentials");
  const [keys, setKeys] = useState<ApiKeys>(apiKeys);
  const [prefs, setPrefs] = useState<UserPreferences>(preferences);
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

  // Apply theme & font overrides live
  const handleSelectTheme = (selectedTheme: string) => {
    setTheme(selectedTheme);
    document.documentElement.setAttribute("data-theme", selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  };

  const handleSelectFont = (selectedFont: string) => {
    setFont(selectedFont);
    document.documentElement.setAttribute("data-font", selectedFont);
    localStorage.setItem("font", selectedFont);
  };

  const handleCssChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextCss = e.target.value;
    setCssOverride(nextCss);
    onSaveCustomCss(nextCss);
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newKeys = { ...keys, [name]: value };
    setKeys(newKeys);
  };

  const handlePrefChange = (name: keyof UserPreferences, value: string | number | boolean) => {
    const newPrefs = { ...prefs, [name]: value };
    setPrefs(newPrefs);
    onSavePreferences(newPrefs);
  };

  const toggleShowKey = (field: string) => {
    setShowKeys((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSaveAll = () => {
    onSaveKeys(keys);
    onSavePreferences(prefs);
    onSaveCustomCss(cssOverride);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const testConnection = async (provider: string) => {
    setTestingProvider(provider);
    setTestResult((prev) => ({ ...prev, [provider]: undefined }));

    let apiKey = "";
    let customUrl = "";

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
              <div className="flex items-center gap-2 mb-4 px-2">
                <Sliders size={18} className="text-zinc-400" />
                <span className="text-sm font-semibold text-white">System Config</span>
              </div>

              <button
                className={`settings-tab-button ${activeTab === "credentials" ? "active" : ""}`}
                onClick={() => setActiveTab("credentials")}
              >
                <Key size={14} />
                <span>API Credentials</span>
              </button>

              <button
                className={`settings-tab-button ${activeTab === "linkedin" ? "active" : ""}`}
                onClick={() => setActiveTab("linkedin")}
              >
                <User size={14} />
                <span>LinkedIn Preview</span>
              </button>

              <button
                className={`settings-tab-button ${activeTab === "workspace" ? "active" : ""}`}
                onClick={() => setActiveTab("workspace")}
              >
                <Cpu size={14} />
                <span>Preferences</span>
              </button>

              <button
                className={`settings-tab-button ${activeTab === "styling" ? "active" : ""}`}
                onClick={() => setActiveTab("styling")}
              >
                <Palette size={14} />
                <span>Themes & Styling</span>
              </button>

              {/* Close & Save Actions at the bottom of Modal Sidebar */}
              <div className="mt-auto flex flex-col gap-2 w-full pt-4 border-t border-zinc-800">
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

              {/* Tab 1: API Key Manager */}
              {activeTab === "credentials" && (
                <div className="flex flex-col gap-6 anim-fade-up">
                  <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
                    <h3 className="text-base font-semibold text-white">API Key Credentials</h3>
                    <p className="text-xs text-zinc-500">
                      Configure your cloud and local keys. All configurations are stored securely inside your browser storage.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/10 flex flex-col gap-3">
                      <label className="form-label mb-0">Google Gemini API Key</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showKeys["gemini"] ? "text" : "password"}
                            name="gemini"
                            className="form-input pr-10"
                            placeholder="AIzaSy..."
                            value={keys.gemini}
                            onChange={handleKeyChange}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white bg-transparent border-0 cursor-pointer flex items-center justify-center"
                            onClick={() => toggleShowKey("gemini")}
                          >
                            {showKeys["gemini"] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        <button className="custom-btn custom-btn-secondary h-10 px-4 flex-shrink-0" onClick={() => testConnection("gemini")}>
                          Test
                        </button>
                      </div>
                      {renderTestStatus("gemini")}
                    </div>

                    <div className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/10 flex flex-col gap-3">
                      <label className="form-label mb-0">OpenAI API Key</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showKeys["openai"] ? "text" : "password"}
                            name="openai"
                            className="form-input pr-10"
                            placeholder="sk-proj-..."
                            value={keys.openai}
                            onChange={handleKeyChange}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white bg-transparent border-0 cursor-pointer flex items-center justify-center"
                            onClick={() => toggleShowKey("openai")}
                          >
                            {showKeys["openai"] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        <button className="custom-btn custom-btn-secondary h-10 px-4 flex-shrink-0" onClick={() => testConnection("openai")}>
                          Test
                        </button>
                      </div>
                      {renderTestStatus("openai")}
                    </div>

                    <div className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/10 flex flex-col gap-3">
                      <label className="form-label mb-0">Anthropic API Key</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showKeys["anthropic"] ? "text" : "password"}
                            name="anthropic"
                            className="form-input pr-10"
                            placeholder="sk-ant-..."
                            value={keys.anthropic}
                            onChange={handleKeyChange}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white bg-transparent border-0 cursor-pointer flex items-center justify-center"
                            onClick={() => toggleShowKey("anthropic")}
                          >
                            {showKeys["anthropic"] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        <button className="custom-btn custom-btn-secondary h-10 px-4 flex-shrink-0" onClick={() => testConnection("anthropic")}>
                          Test
                        </button>
                      </div>
                      {renderTestStatus("anthropic")}
                    </div>

                    <div className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/10 flex flex-col gap-3">
                      <label className="form-label mb-0">OpenRouter API Key</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showKeys["openrouter"] ? "text" : "password"}
                            name="openrouter"
                            className="form-input pr-10"
                            placeholder="sk-or-v1-..."
                            value={keys.openrouter}
                            onChange={handleKeyChange}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white bg-transparent border-0 cursor-pointer flex items-center justify-center"
                            onClick={() => toggleShowKey("openrouter")}
                          >
                            {showKeys["openrouter"] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        <button className="custom-btn custom-btn-secondary h-10 px-4 flex-shrink-0" onClick={() => testConnection("openrouter")}>
                          Test
                        </button>
                      </div>
                      {renderTestStatus("openrouter")}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/10 flex flex-col gap-2">
                        <label className="form-label">Ollama Host</label>
                        <input
                          type="text"
                          name="ollamaUrl"
                          className="form-input"
                          placeholder="http://localhost:11434"
                          value={keys.ollamaUrl}
                          onChange={handleKeyChange}
                        />
                      </div>
                      <div className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/10 flex flex-col gap-2">
                        <label className="form-label">LM Studio Host</label>
                        <input
                          type="text"
                          name="lmStudioUrl"
                          className="form-input"
                          placeholder="http://localhost:1234"
                          value={keys.lmStudioUrl}
                          onChange={handleKeyChange}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/10 flex flex-col gap-2">
                      <label className="form-label">SerpApi Key (LinkedIn ground-truth search)</label>
                      <input
                        type="password"
                        name="serpapi"
                        className="form-input"
                        placeholder="Enter SerpApi key..."
                        value={keys.serpapi || ""}
                        onChange={handleKeyChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: LinkedIn Profile Customizer */}
              {activeTab === "linkedin" && (
                <div className="flex flex-col gap-6 anim-fade-up">
                  <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
                    <h3 className="text-base font-semibold text-white">LinkedIn Preview Identity</h3>
                    <p className="text-xs text-zinc-500">
                      Customize how your brand is represented inside the simulated LinkedIn feed container.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="form-group">
                      <label className="form-label">Profile Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Jane Doe"
                        value={prefs.linkedinName}
                        onChange={(e) => handlePrefChange("linkedinName", e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Professional Headline / Subtitle</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. CEO @ TechSaaS | Ex-Google | Ghostwriter"
                        value={prefs.linkedinHeadline}
                        onChange={(e) => handlePrefChange("linkedinHeadline", e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Avatar Character / Emoji</label>
                      <input
                        type="text"
                        maxLength={2}
                        className="form-input w-24 text-center text-lg font-bold"
                        placeholder="💡"
                        value={prefs.linkedinAvatar}
                        onChange={(e) => handlePrefChange("linkedinAvatar", e.target.value)}
                      />
                      <span className="text-[10px] text-zinc-500">Enter a single emoji or double character initials (e.g. JD).</span>
                    </div>

                    {/* Visual Mock Example Card */}
                    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg font-bold text-zinc-400">
                        {prefs.linkedinAvatar || "💡"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">{prefs.linkedinName || "AI Copywriter Agent"}</span>
                        <span className="text-[10px] text-zinc-400 truncate max-w-sm">{prefs.linkedinHeadline || "Creative writer"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Workspace Preferences */}
              {activeTab === "workspace" && (
                <div className="flex flex-col gap-6 anim-fade-up">
                  <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
                    <h3 className="text-base font-semibold text-white">Workspace Preferences</h3>
                    <p className="text-xs text-zinc-500">
                      Tailor the workspace density, automatic helper operations, and local database properties.
                    </p>
                  </div>

                  <div className="flex flex-col gap-5">
                    {/* Layout Density */}
                    <div className="form-group">
                      <label className="form-label">Layout Density</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "compact", name: "Compact", desc: "Dense text & spacing" },
                          { id: "cozy", name: "Cozy", desc: "Standard standard padding" },
                          { id: "spacious", name: "Spacious", desc: "Open margins & spacing" },
                        ].map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => handlePrefChange("layoutDensity", d.id)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${prefs.layoutDensity === d.id ? "bg-zinc-800/40 border-zinc-500" : "bg-transparent border-zinc-800 hover:border-zinc-700"
                              }`}
                          >
                            <span className="text-xs font-semibold text-white block">{d.name}</span>
                            <span className="text-[10px] text-zinc-500 leading-tight mt-1 block">{d.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sidebar Position */}
                    <div className="form-group">
                      <label className="form-label">Sidebar Alignment</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer">
                          <input
                            type="radio"
                            name="sidebarPosition"
                            checked={prefs.sidebarPosition === "left"}
                            onChange={() => handlePrefChange("sidebarPosition", "left")}
                            className="accent-zinc-400"
                          />
                          <span>Left Docked (Default)</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer">
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

                    {/* Slider for UI Font Scale */}
                    <div className="form-group">
                      <label className="form-label flex justify-between">
                        <span>Font Size Scaling</span>
                        <span className="text-xs text-white font-semibold font-mono">{prefs.fontSize}px</span>
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="18"
                        step="1"
                        value={prefs.fontSize}
                        onChange={(e) => handlePrefChange("fontSize", parseInt(e.target.value))}
                      />
                    </div>

                    {/* Toggles */}
                    <div className="flex flex-col gap-4 pt-2.5 border-t border-zinc-800/60">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-white">Self-Improving RAG Database</span>
                          <span className="text-[10px] text-zinc-500">Inject high-engagement local historic posts as training context for the debate.</span>
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

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-white">Auto-copy Post to Clipboard</span>
                          <span className="text-[10px] text-zinc-500">Automatically copy the synthesized debate post to your clipboard on completion.</span>
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
                </div>
              )}

              {/* Tab 4: Themes & Styling */}
              {activeTab === "styling" && (
                <div className="flex flex-col gap-6 anim-fade-up">
                  <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
                    <h3 className="text-base font-semibold text-white">Themes & Styling Customizer</h3>
                    <p className="text-xs text-zinc-500">
                      Modify layout aesthetics, select structural typography, and inject advanced custom CSS overrides.
                    </p>
                  </div>

                  <div className="flex flex-col gap-5">
                    {/* Theme Presets */}
                    <div className="flex flex-col gap-2">
                      <label className="form-label">Theme Preset Swatches</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                              className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${isActive ? "border-zinc-300 bg-zinc-800/20" : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/20"
                                }`}
                              style={{ minHeight: "80px" }}
                            >
                              <div className="flex items-center justify-between w-full mb-1">
                                <span className="text-[12px] font-semibold text-white">{t.name}</span>
                                {isActive && <CheckCircle2 size={13} className="text-zinc-300" />}
                              </div>
                              <div className="flex gap-1.5 mt-2">
                                <span className="w-4 h-4 rounded-full border border-zinc-800/40 block" style={{ backgroundColor: t.bg }} title="Background" />
                                <span className="w-4 h-4 rounded-full border border-zinc-800/40 block" style={{ backgroundColor: t.panel }} title="Panel" />
                                <span className="w-4 h-4 rounded-full border border-zinc-800/40 block" style={{ backgroundColor: t.accent }} title="Accent" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Typography picker */}
                    <div className="form-group">
                      <label className="form-label">Typography Family</label>
                      <select
                        value={font}
                        onChange={(e) => handleSelectFont(e.target.value)}
                        className="form-input cursor-pointer"
                        style={{ background: "var(--background)", color: "var(--foreground)" }}
                      >
                        <option value="geist">Geist (Minimal Sans-Serif)</option>
                        <option value="outfit">Outfit (Geometric Modern)</option>
                        <option value="jakarta">Plus Jakarta Sans (Elegant Accent)</option>
                        <option value="inter">Inter (Classic Balanced)</option>
                      </select>
                    </div>

                    {/* Advanced CSS Override */}
                    <div className="form-group">
                      <label className="form-label flex items-center gap-1.5">
                        <Code size={13} />
                        <span>Advanced Custom CSS Overrides</span>
                      </label>
                      <textarea
                        value={cssOverride}
                        onChange={handleCssChange}
                        className="form-input font-mono text-xs"
                        placeholder="/* Inject style rules here, e.g. */&#10;.sidebar { border-right-color: var(--accent); }"
                        style={{ minHeight: "100px", lineHeight: "1.4" }}
                      />
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
