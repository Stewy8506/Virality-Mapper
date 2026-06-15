"use client";

import { Eye, EyeOff } from "lucide-react";
import React from "react";

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

interface CredentialsTabProps {
  keys: ApiKeys;
  onKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showKeys: Record<string, boolean>;
  toggleShowKey: (field: string) => void;
  testConnection: (provider: string) => Promise<void>;
  renderTestStatus: (provider: string) => React.ReactNode;
}

export default function CredentialsTab({
  keys,
  onKeyChange,
  showKeys,
  toggleShowKey,
  testConnection,
  renderTestStatus,
}: CredentialsTabProps) {
  return (
    <div className="flex flex-col gap-6 anim-fade-up">
      <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
        <h3 className="text-base font-semibold text-white">API Connections</h3>
        <p className="text-xs text-zinc-500">
          Configure your cloud and local keys. Keys are stored in your browser&apos;s localStorage and sent to the server only during generation. For hosted deployments, set server environment variables instead.
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
                  onChange={onKeyChange}
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
                  onChange={onKeyChange}
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
                  onChange={onKeyChange}
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
                  onChange={onKeyChange}
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
                onChange={onKeyChange}
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
                onChange={onKeyChange}
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
              onChange={onKeyChange}
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
                  onChange={onKeyChange}
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
              onChange={onKeyChange}
              style={{ fontSize: "1.05rem", padding: "6px 0" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
