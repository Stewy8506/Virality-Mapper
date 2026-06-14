"use client";

import { useState, useEffect } from "react";
import { Key, Globe, ShieldCheck, CheckCircle2, XCircle, Loader2, Info, Eye, EyeOff, Save } from "lucide-react";
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

export default function SettingsTab({
  apiKeys,
  onSave,
}: {
  apiKeys: ApiKeys;
  onSave: (keys: ApiKeys) => void;
}) {
  const [keys, setKeys] = useState<ApiKeys>(apiKeys);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ [key: string]: { success: boolean; msg: string } }>({});
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setKeys(apiKeys);
  }, [apiKeys]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newKeys = { ...keys, [name]: value };
    setKeys(newKeys);
    onSave(newKeys);
  };

  const toggleShowKey = (field: string) => {
    setShowKeys(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = () => {
    onSave(keys);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const testConnection = async (provider: string) => {
    setTestingProvider(provider);
    setTestResult((prev) => ({ ...prev, [provider]: undefined as any }));

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
          [provider]: { success: true, msg: `Connected successfully! Found ${data.models.length} models.` },
        }));
      } else {
        setTestResult((prev) => ({
          ...prev,
          [provider]: { success: false, msg: data.error || "Failed to fetch models." },
        }));
      }
    } catch (err: any) {
      setTestResult((prev) => ({
        ...prev,
        [provider]: { success: false, msg: err.message || "Connection timed out." },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const renderTestStatus = (provider: string) => {
    const result = testResult[provider];
    if (testingProvider === provider) {
      return (
        <motion.span
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-xs text-rose-400 mt-2 font-medium"
        >
          <Loader2 className="animate-spin" size={12} /> Testing Connection...
        </motion.span>
      );
    }
    if (!result) return null;
    return result.success ? (
      <motion.span
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium"
      >
        <CheckCircle2 size={12} /> {result.msg}
      </motion.span>
    ) : (
      <motion.span
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1.5 text-xs text-red-400 mt-2 font-medium"
      >
        <XCircle size={12} /> {result.msg}
      </motion.span>
    );
  };

  return (
    <div className="anim-fade-up flex flex-col gap-6 max-w-4xl mx-auto" style={{ paddingBottom: "60px" }}>
      <div className="flex flex-col gap-2">
        <h2 style={{ fontSize: "1.45rem", fontWeight: 600, letterSpacing: "-0.02em" }} className="text-white">Credentials Manager</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--zinc-400)" }}>
          Store your API keys and endpoints securely. All credentials remain inside your browser and are never saved on a backend.
        </p>
      </div>

      <div className="grid-2">
        {/* Cloud Providers Card */}
        <div className="glass-panel p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "14px" }}>
            <Globe size={18} className="text-rose-500" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }} className="text-white">Cloud LLM Providers</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Google Gemini API Key</label>
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <input
                  type={showKeys["gemini"] ? "text" : "password"}
                  name="gemini"
                  autoComplete="new-password"
                  className="form-input pr-10"
                  placeholder="AIzaSy..."
                  value={keys.gemini}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors bg-transparent border-0 cursor-pointer flex items-center justify-center"
                  onClick={() => toggleShowKey("gemini")}
                >
                  {showKeys["gemini"] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button className="custom-btn custom-btn-secondary flex-shrink-0" style={{ width: "80px" }} onClick={() => testConnection("gemini")}>
                Test
              </button>
            </div>
            {renderTestStatus("gemini")}
          </div>

          <div className="form-group">
            <label className="form-label">OpenAI API Key</label>
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <input
                  type={showKeys["openai"] ? "text" : "password"}
                  name="openai"
                  autoComplete="new-password"
                  className="form-input pr-10"
                  placeholder="sk-proj-..."
                  value={keys.openai}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors bg-transparent border-0 cursor-pointer flex items-center justify-center"
                  onClick={() => toggleShowKey("openai")}
                >
                  {showKeys["openai"] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button className="custom-btn custom-btn-secondary flex-shrink-0" style={{ width: "80px" }} onClick={() => testConnection("openai")}>
                Test
              </button>
            </div>
            {renderTestStatus("openai")}
          </div>

          <div className="form-group">
            <label className="form-label">Anthropic API Key</label>
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <input
                  type={showKeys["anthropic"] ? "text" : "password"}
                  name="anthropic"
                  autoComplete="new-password"
                  className="form-input pr-10"
                  placeholder="sk-ant-..."
                  value={keys.anthropic}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors bg-transparent border-0 cursor-pointer flex items-center justify-center"
                  onClick={() => toggleShowKey("anthropic")}
                >
                  {showKeys["anthropic"] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button className="custom-btn custom-btn-secondary flex-shrink-0" style={{ width: "80px" }} onClick={() => testConnection("anthropic")}>
                Test
              </button>
            </div>
            {renderTestStatus("anthropic")}
          </div>
        </div>

        {/* Local & Router Providers Card */}
        <div className="glass-panel p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "14px" }}>
            <Key size={18} className="text-rose-500" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }} className="text-white">Local & Router Connections</h3>
          </div>

          <div className="form-group">
            <label className="form-label">OpenRouter API Key</label>
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <input
                  type={showKeys["openrouter"] ? "text" : "password"}
                  name="openrouter"
                  autoComplete="new-password"
                  className="form-input pr-10"
                  placeholder="sk-or-v1-..."
                  value={keys.openrouter}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors bg-transparent border-0 cursor-pointer flex items-center justify-center"
                  onClick={() => toggleShowKey("openrouter")}
                >
                  {showKeys["openrouter"] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button className="custom-btn custom-btn-secondary flex-shrink-0" style={{ width: "80px" }} onClick={() => testConnection("openrouter")}>
                Test
              </button>
            </div>
            {renderTestStatus("openrouter")}
          </div>

          <div className="form-group">
            <label className="form-label">Ollama API Endpoint</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="ollamaUrl"
                className="form-input"
                placeholder="http://localhost:11434"
                value={keys.ollamaUrl}
                onChange={handleChange}
              />
              <button className="custom-btn custom-btn-secondary flex-shrink-0" style={{ width: "80px" }} onClick={() => testConnection("ollama")}>
                Test
              </button>
            </div>
            {renderTestStatus("ollama")}
          </div>

          <div className="form-group">
            <label className="form-label">LM Studio API Endpoint</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="lmStudioUrl"
                className="form-input"
                placeholder="http://localhost:1234"
                value={keys.lmStudioUrl}
                onChange={handleChange}
              />
              <button className="custom-btn custom-btn-secondary flex-shrink-0" style={{ width: "80px" }} onClick={() => testConnection("lmstudio")}>
                Test
              </button>
            </div>
            {renderTestStatus("lmstudio")}
          </div>
        </div>
      </div>

      {/* Custom OpenAI Endpoint Panel */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "14px" }}>
          <ShieldCheck size={18} className="text-rose-500" />
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }} className="text-white">Custom OpenAI-Compatible Endpoint</h3>
        </div>

        <div className="grid-2" style={{ gap: "20px" }}>
          <div className="form-group">
            <label className="form-label">Base URL</label>
            <input
              type="text"
              name="customBaseUrl"
              className="form-input"
              placeholder="e.g. https://api.together.xyz/v1"
              value={keys.customBaseUrl}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">API Key</label>
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <input
                  type={showKeys["custom"] ? "text" : "password"}
                  name="customApiKey"
                  autoComplete="new-password"
                  className="form-input pr-10"
                  placeholder="Bearer Token..."
                  value={keys.customApiKey}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors bg-transparent border-0 cursor-pointer flex items-center justify-center"
                  onClick={() => toggleShowKey("custom")}
                >
                  {showKeys["custom"] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button className="custom-btn custom-btn-secondary flex-shrink-0" style={{ width: "80px" }} onClick={() => testConnection("custom")}>
                Test
              </button>
            </div>
            {renderTestStatus("custom")}
          </div>
        </div>
      </div>

      {/* External Search & Grounding APIs */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "14px" }}>
          <Globe size={18} className="text-rose-500" />
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }} className="text-white">External Search & Grounding APIs</h3>
        </div>

        <div className="form-group">
          <label className="form-label">SerpApi API Key (Optional)</label>
          <div className="flex gap-2 w-full">
            <div className="relative flex-1">
              <input
                type={showKeys["serpapi"] ? "text" : "password"}
                name="serpapi"
                autoComplete="new-password"
                className="form-input pr-10"
                placeholder="Enter SerpApi key for highly accurate trending LinkedIn data..."
                value={keys.serpapi || ""}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors bg-transparent border-0 cursor-pointer flex items-center justify-center"
                onClick={() => toggleShowKey("serpapi")}
              >
                {showKeys["serpapi"] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <span className="text-xs text-zinc-500 mt-1.5 block">
            If provided, Virality Mapper will query Google Search organically via SerpApi for site:linkedin.com trends instead of using local fallback scrapers.
          </span>
        </div>
      </div>

      {/* Info Tip & Save Button Panel */}
      <div className="flex flex-col gap-4">
        <div className="glass-panel p-4 flex items-start gap-3" style={{ background: "rgba(255, 46, 85, 0.02)", borderColor: "rgba(255, 46, 85, 0.1)" }}>
          <Info size={16} className="text-rose-400" style={{ marginTop: "2px", flexShrink: 0 }} />
          <p style={{ fontSize: "0.8rem", color: "var(--zinc-400)", lineHeight: 1.45 }}>
            <strong>Ollama & LM Studio Tip</strong>: Ensure you run the application in your local environment. If they are hosted on a different device or container, configure the dynamic host IP instead of localhost (e.g. <code>http://192.168.1.150:11434</code>).
          </p>
        </div>

        <div className="flex items-center gap-4 justify-end">
          <AnimatePresence>
            {saveSuccess && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5"
              >
                <CheckCircle2 size={16} /> Credentials saved successfully!
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={handleSave}
            className="custom-btn custom-btn-accent flex items-center gap-2"
            style={{ width: "220px", height: "46px" }}
          >
            <Save size={16} /> Save Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
