"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, Info, BookOpen, User, Flame } from "lucide-react";

interface Variant {
  id: number;
  style: string;
  content: string;
  score: number;
  critique: string;
}

const LOADING_STEPS = [
  "Connecting to live LinkedIn trend proxy...",
  "Analyzing top-performing posts (past 24h)...",
  "Synthesizing viral hook structures & formatting...",
  "Applying custom tone guidelines & audience filters...",
  "Composing post variants with Gemini...",
];

export default function PostGeneratorForm({ onGenerate }: { onGenerate: (data: Variant[]) => void }) {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    appName: "",
    description: "",
    targetAudience: "",
    tone: "Professional, punchy, engaging",
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStep(0);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      onGenerate(data.data.variants);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "580px", margin: "0 auto" }}>
      <form 
        onSubmit={handleSubmit} 
        className="glass p-6 animate-fade-in scan-container" 
        style={{ 
          position: "relative",
          zIndex: 1,
          width: "100%"
        }}
      >
        {/* Neon Orange Scanner line when loading */}
        {loading && <div className="scan-line"></div>}

        <div className="flex items-center gap-2 mb-4" style={{ borderBottom: "1px solid var(--zinc-800)", paddingBottom: "12px" }}>
          <div className="glass" style={{ padding: "4px", display: "inline-flex", borderRadius: "4px", background: "var(--zinc-800)", borderColor: "var(--zinc-700)" }}>
            <Flame style={{ color: "var(--accent)" }} size={14} />
          </div>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "white", letterSpacing: "-0.01em" }}>Post Context</h2>
        </div>

        <div className="input-group">
          <label className="input-label flex items-center gap-2" htmlFor="appName">
            <Info size={12} style={{ color: "var(--zinc-500)" }} /> App / Project Name
          </label>
          <input
            required
            type="text"
            id="appName"
            name="appName"
            className="input-field"
            placeholder="e.g., Virality Mapper"
            value={formData.appName}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label className="input-label flex items-center gap-2" htmlFor="description">
            <BookOpen size={12} style={{ color: "var(--zinc-500)" }} /> What does it do?
          </label>
          <textarea
            required
            id="description"
            name="description"
            className="input-field"
            placeholder="Describe the core features and target solution..."
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="grid grid-2 gap-4">
          <div className="input-group">
            <label className="input-label flex items-center gap-2" htmlFor="targetAudience">
              <User size={12} style={{ color: "var(--zinc-500)" }} /> Audience
            </label>
            <input
              type="text"
              id="targetAudience"
              name="targetAudience"
              className="input-field"
              placeholder="e.g., SaaS Founders"
              value={formData.targetAudience}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label className="input-label flex items-center gap-2" htmlFor="tone">
              <Flame size={12} style={{ color: "var(--zinc-500)" }} /> Tone
            </label>
            <input
              type="text"
              id="tone"
              name="tone"
              className="input-field"
              placeholder="e.g., Punchy, Data-driven"
              value={formData.tone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 animate-fade-in" style={{ backgroundColor: "rgba(239, 68, 68, 0.04)", border: "1px solid rgba(239, 68, 68, 0.15)", color: "#fca5a5", borderRadius: "6px", borderLeft: "3px solid #ef4444" }}>
            <p style={{ fontSize: "0.8rem", fontWeight: 600 }}>{error}</p>
          </div>
        )}

        <button 
          type="submit" 
          className="btn" 
          style={{ 
            width: "100%", 
            height: "42px",
            background: "var(--accent)", 
            color: "white", 
            border: "none", 
            borderRadius: "6px",
            marginTop: "8px"
          }} 
          disabled={loading}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = "#c2410c";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = "var(--accent)";
          }}
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="animate-spin" size={16} />
              <div className="flex flex-col items-start" style={{ textAlign: "left", lineHeight: 1.2 }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>Generating Posts...</span>
                <span style={{ fontSize: "0.65rem", color: "#fdba74" }}>{LOADING_STEPS[loadingStep]}</span>
              </div>
            </div>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Viral Posts
            </>
          )}
        </button>
      </form>
    </div>
  );
}
