"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Cpu, ShieldAlert, Flame, BookOpen, User, Info, MessageSquare, Award, TrendingUp, Clock } from "lucide-react";
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
    scores?: {
      hookStrength: number;
      readability: number;
      credibility: number;
      viralPotential: number;
    };
    score?: number; // legacy
    critique: string;
  };
}

interface GenerationCompletePayload extends GenerationResult {
  appName?: string;
  description?: string;
  targetAudience?: string;
  tone?: string;
}

interface ArchivedPost {
  id: string;
  timestamp: string;
  appName: string;
  description: string;
  targetAudience: string;
  tone: string;
  result: GenerationResult;
  performance?: {
    impressions: number;
    likes: number;
    comments: number;
  };
}

interface StreamEventData {
  message?: string;
  type?: "info" | "warning" | "success";
  name?: string;
  content?: string;
  hookExplanation?: string;
  provider?: string;
  model?: string;
  from?: string;
  to?: string;
  score?: number;
  argument?: string;
  best?: GenerationResult["best"];
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
}

export default function PostGeneratorForm({
  agents,
  apiKeys,
  onGenerate,
  onStartGenerate,
  formData,
  setFormData,
  preferences,
}: {
  agents: Agent[];
  apiKeys: ApiKeys;
  onGenerate: (data: GenerationCompletePayload) => void;
  onStartGenerate?: () => void;
  onToggleAgent?: (id: string) => void;
  formData: {
    appName: string;
    description: string;
    targetAudience: string;
    tone: string;
    hookArchetype: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    appName: string;
    description: string;
    targetAudience: string;
    tone: string;
    hookArchetype: string;
  }>>;
  preferences: UserPreferences;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const activeAgentsCount = agents.filter((a) => a.enabled).length;

  // Real-time streaming debate states
  const [statusMessage, setStatusMessage] = useState("");
  const [trends, setTrends] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { content: string; hookExplanation: string }>>({});
  const [critiques, setCritiques] = useState<Array<{ from: string; to: string; content: string; score: number }>>([]);
  const [refinements, setRefinements] = useState<Record<string, { content: string; score: number; argument: string }>>({});
  const [settledPost, setSettledPost] = useState<GenerationResult["best"] | null>(null);

  // Typewriter output states
  const [typedDrafts, setTypedDrafts] = useState<Record<string, string>>({});
  const [typedRefinements, setTypedRefinements] = useState<Record<string, string>>({});
  const [typedSettledContent, setTypedSettledContent] = useState("");

  // Activity logs & elapsed stopwatch
  const [activityLogs, setActivityLogs] = useState<Array<{ id: string; time: string; text: string; type: "info" | "warning" | "success" }>>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activityContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll activity container to bottom on new log
  useEffect(() => {
    if (activityContainerRef.current) {
      activityContainerRef.current.scrollTop = activityContainerRef.current.scrollHeight;
    }
  }, [activityLogs]);

  // Stopwatch Timer
  useEffect(() => {
    if (loading) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Refs to prevent state closure bugs in streams
  const trendsRef = useRef<string[]>([]);
  const draftsRef = useRef<Record<string, { name: string; content: string; hookExplanation: string; provider: string; model: string }>>({});
  const critiquesRef = useRef<Array<{ from: string; to: string; content: string; score: number }>>([]);
  const refinementsRef = useRef<Record<string, { name: string; content: string; score: number; argument: string; provider: string; model: string }>>({});

  // Typewriter simulation helper
  const animateText = (targetKey: string, fullText: string, setter: React.Dispatch<React.SetStateAction<Record<string, string>>>) => {
    let currentIdx = 0;
    setter(prev => ({ ...prev, [targetKey]: "" }));
    const interval = setInterval(() => {
      currentIdx += 20;
      if (currentIdx >= fullText.length) {
        setter(prev => ({ ...prev, [targetKey]: fullText }));
        clearInterval(interval);
      } else {
        setter(prev => ({ ...prev, [targetKey]: fullText.slice(0, currentIdx) }));
      }
    }, 15);
  };

  const animateSettledText = (fullText: string) => {
    let currentIdx = 0;
    setTypedSettledContent("");
    const interval = setInterval(() => {
      currentIdx += 25;
      if (currentIdx >= fullText.length) {
        setTypedSettledContent(fullText);
        clearInterval(interval);
      } else {
        setTypedSettledContent(fullText.slice(0, currentIdx));
      }
    }, 15);
  };

  const getActiveStep = () => {
    if (settledPost || statusMessage.includes("Settle") || statusMessage.includes("Consensus")) return 4;
    if (statusMessage.includes("Refinement") || statusMessage.includes("refinement")) return 3;
    if (statusMessage.includes("Debate") || statusMessage.includes("Critique") || statusMessage.includes("critique")) return 2;
    if (statusMessage.includes("drafting") || statusMessage.includes("Drafting")) return 1;
    return 0;
  };

  const activeStep = getActiveStep();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStreamEvent = (event: string, data: StreamEventData | string[]) => {
    switch (event) {
      case "status": {
        const payload = data as StreamEventData;
        setStatusMessage(payload.message || "");
        break;
      }

      case "trends": {
        const payload = data as string[];
        trendsRef.current = payload;
        setTrends(payload);
        break;
      }

      case "activity": {
        const payload = data as StreamEventData;
        setActivityLogs(prev => [
          ...prev,
          {
            id: `act-${Date.now()}-${Math.random()}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            text: payload.message || "",
            type: payload.type || "info"
          }
        ]);
        break;
      }

      case "draft-complete": {
        const payload = data as { name: string; content: string; hookExplanation: string; provider: string; model: string };
        draftsRef.current[payload.name] = payload;
        setDrafts(prev => {
          const updated = { ...prev, [payload.name]: { content: payload.content, hookExplanation: payload.hookExplanation } };
          animateText(payload.name, payload.content, setTypedDrafts);
          return updated;
        });
        break;
      }

      case "critique-complete": {
        const payload = data as { from: string; to: string; content: string; score: number };
        critiquesRef.current.push({ from: payload.from, to: payload.to, content: payload.content, score: payload.score });
        setCritiques(prev => [
          ...prev,
          { from: payload.from, to: payload.to, content: payload.content, score: payload.score }
        ]);
        break;
      }

      case "refine-complete": {
        const payload = data as { name: string; content: string; score: number; argument: string; provider: string; model: string };
        refinementsRef.current[payload.name] = payload;
        setRefinements(prev => {
          const updated = { ...prev, [payload.name]: { content: payload.content, score: payload.score, argument: payload.argument } };
          animateText(payload.name, payload.content, setTypedRefinements);
          return updated;
        });
        break;
      }

      case "consensus-complete": {
        const payload = data as { best: GenerationResult["best"] };
        setSettledPost(payload.best);
        animateSettledText(payload.best.content);
        
        // Dispatch result after typing transitions complete
        setTimeout(() => {
          onGenerate({
            appName: formData.appName,
            description: formData.description,
            targetAudience: formData.targetAudience,
            tone: formData.tone,
            trends: trendsRef.current,
            initialDrafts: Object.entries(draftsRef.current).map(([name, d]) => ({
              name,
              content: d.content,
              hookExplanation: d.hookExplanation,
              provider: d.provider,
              model: d.model,
            })),
            critiques: critiquesRef.current,
            refinedDrafts: Object.entries(refinementsRef.current).map(([name, r]) => ({
              name,
              content: r.content,
              score: r.score,
              argument: r.argument,
              provider: r.provider,
              model: r.model,
            })),
            best: payload.best
          });
          setLoading(false);
        }, 3000);
        break;
      }

      case "error": {
        const payload = data as StreamEventData;
        setError(payload.message || "An unexpected error occurred.");
        setLoading(false);
        break;
      }

      default:
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setStatusMessage("Connecting to debate server...");
    
    if (onStartGenerate) {
      onStartGenerate();
    }
    
    // Reset debate boards & monitor
    setTrends([]);
    setDrafts({});
    setCritiques([]);
    setRefinements({});
    setSettledPost(null);
    setTypedDrafts({});
    setTypedRefinements({});
    setTypedSettledContent("");
    setActivityLogs([]);
    setElapsedTime(0);

    trendsRef.current = [];
    draftsRef.current = {};
    critiquesRef.current = [];
    refinementsRef.current = {};

    if (agents.length < 3) {
      setError("This debate flow requires exactly 3 configured agents in your playground.");
      setLoading(false);
      return;
    }

    // Load local feedback-loop analytics templates if RAG is enabled
    let enrichedSuccessTemplates: Array<{
      content: string;
      niche: string;
      metrics: {
        likes: number;
        comments: number;
        reposts: number;
      };
      structure: {
        hook: string;
        body: string;
        cta: string;
        metaphor: string;
      };
    }> = [];
    if (preferences.enableRAG) {
      try {
        const localArchiveStr = localStorage.getItem("vm_post_archive");
        if (localArchiveStr) {
          const parsedArchive = JSON.parse(localArchiveStr) as ArchivedPost[];
          enrichedSuccessTemplates = parsedArchive
            .filter((item) => item.performance && item.performance.likes > 0)
            .map((item) => {
              const perf = item.performance!;
              return {
                content: item.result?.best?.content || "",
                niche: item.appName || "LinkedIn Post",
                metrics: {
                  likes: Number(perf.likes),
                  comments: Number(perf.comments),
                  reposts: Math.round(Number(perf.likes) * 0.08)
                },
                structure: {
                  hook: item.result?.best?.scores?.hookStrength ? `Hook strength: ${item.result.best.scores.hookStrength}` : "Enriched RAG Hook Template.",
                  body: "Self-published successful layout.",
                  cta: "Optimized user CTA.",
                  metaphor: "Ground-truth benchmark."
                }
              };
            });
        }
      } catch (e) {
        console.warn("Failed to load local analytics templates for RAG enrichment:", e);
      }
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          apiKeys,
          agents,
          enrichedSuccessTemplates,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to initiate debate arena.");
      }

      if (!res.body) {
        throw new Error("Response stream is not readable.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const lines = part.split("\n");
          let eventName = "";
          let dataStr = "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventName = line.replace("event:", "").trim();
            } else if (line.startsWith("data:")) {
              dataStr = line.replace("data:", "").trim();
            }
          }

          if (eventName && dataStr) {
            try {
              const data = JSON.parse(dataStr);
              handleStreamEvent(eventName, data);
            } catch (err) {
              console.error("Stream payload syntax error:", err, dataStr);
            }
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected debate pipeline error occurred.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <AnimatePresence mode="wait">
        {!loading ? (
          <motion.div
            key="input-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex flex-col gap-6"
          >
            {/* Top Panel: Stacked Input context form */}
            <form onSubmit={handleSubmit} className="glass-panel p-6 flex flex-col gap-5">
              <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "16px" }}>
                <Flame className="text-rose-500 animate-pulse" size={18} />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }} className="text-white">Post Context Parameters</h2>
              </div>

              <div className="grid-2">
                <div className="form-group mb-0">
                  <label className="form-label">
                    <Info size={14} className="text-rose-400" /> App / Project Name
                  </label>
                  <input
                    required
                    type="text"
                    id="appName"
                    name="appName"
                    className="form-input"
                    placeholder="e.g. Virality Mapper"
                    value={formData.appName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group mb-0">
                  <label className="form-label">
                    <Sparkles size={14} className="text-rose-400" /> Hook Archetype
                  </label>
                  <select
                    id="hookArchetype"
                    name="hookArchetype"
                    className="form-input"
                    value={formData.hookArchetype}
                    onChange={handleChange}
                    style={{ background: "var(--zinc-900)", cursor: "pointer" }}
                  >
                    <option value="organic">Organic / Default</option>
                    <option value="contrarian">Contrarian Interrupt (Shock & Debunk)</option>
                    <option value="vulnerable">Vulnerable Disclosure (Failure & Trust)</option>
                    <option value="value-stash">High-Value Stash (Resources & Curation)</option>
                    <option value="threat-fear">Threat & Fear (Risks & Heuristics)</option>
                  </select>
                </div>
              </div>

              <div className="form-group mb-0">
                <label className="form-label">
                  <BookOpen size={14} className="text-rose-400" /> What does it do? (Features & Problems Solved)
                </label>
                <textarea
                  required
                  id="description"
                  name="description"
                  className="form-input"
                  placeholder="Explain what problem it solves, its target core features, benchmarks, and technology used..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid-2">
                <div className="form-group mb-0">
                  <label className="form-label">
                    <User size={14} className="text-rose-400" /> Target Audience
                  </label>
                  <input
                    type="text"
                    id="targetAudience"
                    name="targetAudience"
                    className="form-input"
                    placeholder="e.g. Senior Developers, Tech Managers"
                    value={formData.targetAudience}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group mb-0">
                  <label className="form-label">
                    <Sparkles size={14} className="text-rose-400" /> Writing Tone
                  </label>
                  <input
                    type="text"
                    id="tone"
                    name="tone"
                    className="form-input"
                    placeholder="e.g. Technical, punchy, narrative"
                    value={formData.tone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 flex items-start gap-3 rounded border" style={{ background: "var(--panel-bg)", borderColor: "var(--border-active)", marginTop: "12px" }}>
                  <span className="text-zinc-500" style={{ marginTop: "2px", flexShrink: 0 }}>⚠️</span>
                  <p style={{ fontSize: "0.85rem", color: "var(--foreground)", margin: 0 }}>{error}</p>
                </div>
              )}

              {activeAgentsCount !== 3 && (
                <div className="p-4 flex items-start gap-3 rounded border text-rose-400 bg-rose-950/10 border-rose-500/20 text-xs" style={{ marginTop: "12px" }}>
                  <span>⚠️ <strong>Debate Flow Warning</strong>: You have selected <strong>{activeAgentsCount}</strong> active debaters. Go to the <strong>Specialist Agents</strong> tab to toggle exactly 3 active agents to initiate the debate arena.</span>
                </div>
              )}

              <button 
                type="submit" 
                className="custom-btn custom-btn-accent w-full" 
                style={{ marginTop: "16px", padding: "14px 20px" }}
                disabled={activeAgentsCount !== 3 || loading}
              >
                {loading ? <Sparkles size={16} className="animate-spin" /> : <Sparkles size={16} />} Initiate 3-Agent Copywriting Debate
              </button>
            </form>

            {/* Bottom Panel: Stacked Active agents arena preview */}
            <div className="glass-panel p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "16px" }}>
                <Cpu className="text-rose-500" size={18} />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }} className="text-white">Active Debate Arena Network</h2>
              </div>
              
              <p style={{ fontSize: "0.85rem", color: "var(--zinc-400)", lineHeight: 1.5 }} className="mb-2">
                This panel routes your project characteristics through a 3-agent critique network.
                The writers construct individual drafts, challenge each other&apos;s metrics/hooks, refine their content, and synthesize a single optimized post.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {agents.filter((a) => a.enabled).map((agent) => (
                  <div key={agent.id} className="p-4 rounded-xl border border-zinc-800/40 flex flex-col gap-2 justify-between" style={{ background: "rgba(0,0,0,0.1)" }}>
                    <div className="flex flex-col gap-1">
                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }} className="text-white">
                        {agent.name}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "var(--zinc-500)", fontFamily: "var(--font-mono)" }}>
                        {agent.provider.toUpperCase()} • {agent.model}
                      </span>
                    </div>
                    <span className="custom-badge custom-badge-accent text-[9px] w-fit font-mono uppercase tracking-wider mt-2">ACTIVE WRITER</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Live Visual Whiteboard Debate Panel */
          <motion.div
            key="debate-panel"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="glass-panel p-6 w-full flex flex-col gap-6"
            style={{ minHeight: "480px" }}
          >
            {/* Whiteboard Header */}
            <div className="flex flex-col gap-4 text-center items-center" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "24px" }}>
              <div className="flex items-center gap-4 justify-between w-full">
                <div className="flex items-center gap-2">
                  <Cpu className="animate-spin text-rose-500" size={20} />
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }} className="text-white">Debate Settle Console</h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono text-zinc-400" style={{ background: "var(--background)", borderColor: "var(--border-muted)" }}>
                  <Clock size={12} className="text-rose-500 animate-pulse" />
                  <span>ELAPSED TIME: {formatTime(elapsedTime)}</span>
                </div>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--zinc-300)", fontWeight: 500, margin: 0 }} className="italic">
                {statusMessage || "Grounding and preparing agents..."}
              </p>
            </div>

            {/* Split layout: Vertical timeline on the left rail, debate content on the right */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Left Column: Vertical Timeline */}
              <div className="w-full md:w-[150px] flex-shrink-0">
                <div className="vertical-timeline">
                  <div className="vertical-timeline-line" />
                  
                  <div className={`timeline-node ${activeStep === 0 ? "active" : activeStep > 0 ? "success" : ""}`}>
                    <div className="timeline-node-dot" />
                    <div className="timeline-node-content">
                      <span className="timeline-node-label">Grounding</span>
                    </div>
                  </div>

                  <div className={`timeline-node ${activeStep === 1 ? "active" : activeStep > 1 ? "success" : ""}`}>
                    <div className="timeline-node-dot" />
                    <div className="timeline-node-content">
                      <span className="timeline-node-label">Drafting</span>
                    </div>
                  </div>

                  <div className={`timeline-node ${activeStep === 2 ? "active" : activeStep > 2 ? "success" : ""}`}>
                    <div className="timeline-node-dot" />
                    <div className="timeline-node-content">
                      <span className="timeline-node-label">Critiques</span>
                    </div>
                  </div>

                  <div className={`timeline-node ${activeStep === 3 ? "active" : activeStep > 3 ? "success" : ""}`}>
                    <div className="timeline-node-dot" />
                    <div className="timeline-node-content">
                      <span className="timeline-node-label">Refining</span>
                    </div>
                  </div>

                  <div className={`timeline-node ${activeStep === 4 ? "active" : ""}`}>
                    <div className="timeline-node-dot" />
                    <div className="timeline-node-content">
                      <span className="timeline-node-label">Synthesis</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Main Debate Content */}
              <div className="flex-1 flex flex-col gap-6 w-full">
                
                {/* Error Overlay */}
                {error && (
                  <div className="p-4 flex items-start gap-3 rounded-xl bg-red-950/20 border border-red-500/20">
                    <ShieldAlert size={16} className="text-rose-500" style={{ marginTop: "2px" }} />
                    <p style={{ fontSize: "0.85rem", color: "#fca5a5", margin: 0 }}>{error}</p>
                  </div>
                )}

                {/* Step 1: Trends Box */}
                {trends.length > 0 && activeStep === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-xl border"
                    style={{ background: "var(--panel-bg)", borderColor: "var(--border-active)" }}
                  >
                    <div className="flex items-center gap-2 mb-3 text-rose-400 font-bold text-xs" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
                      <TrendingUp size={14} /> SEARCH TRENDS RETRIEVED
                    </div>
                    <ul className="flex flex-col gap-2 pl-4 m-0" style={{ fontSize: "0.8rem", color: "var(--zinc-300)", lineHeight: 1.4 }}>
                      {trends.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </motion.div>
                )}

                {/* 3-Agent side-by-side cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {agents.filter((a) => a.enabled).map((agent) => {
                    const draft = drafts[agent.name];
                    const refinement = refinements[agent.name];
                    const typedDraft = typedDrafts[agent.name] || "";
                    const typedRefine = typedRefinements[agent.name] || "";

                    // Determine active badge
                    let statusBadge = "🔍 Waiting...";
                    let badgeClass = "text-zinc-500 border-zinc-800";
                    
                    if (activeStep === 0) {
                      statusBadge = "🔍 Grounding...";
                      badgeClass = "text-rose-400 border-rose-500/20 bg-rose-500/5 animate-pulse font-bold";
                    } else if (activeStep === 1) {
                      statusBadge = draft ? "✍️ Draft Ready" : "✍️ Drafting...";
                      badgeClass = draft ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 font-bold" : "text-rose-400 border-rose-500/20 bg-rose-500/5 animate-pulse font-bold";
                    } else if (activeStep === 2) {
                      statusBadge = "💬 Peer Critique";
                      badgeClass = "text-rose-400 border-rose-500/20 bg-rose-500/5 animate-pulse font-bold";
                    } else if (activeStep === 3) {
                      statusBadge = refinement ? "🔄 Refined" : "🔄 Refining...";
                      badgeClass = refinement ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 font-bold" : "text-rose-400 border-rose-500/20 bg-rose-500/5 animate-pulse font-bold";
                    } else if (activeStep === 4) {
                      statusBadge = "🤝 Settled";
                      badgeClass = "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 font-bold";
                    }

                    return (
                      <div
                        key={agent.id}
                        className="glass-panel p-5 flex flex-col gap-4 justify-between relative min-h-[380px]"
                        style={{
                          borderColor: activeStep === 1 && !draft ? "var(--border-active)" : "var(--border-muted)"
                        }}
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center pl-2" style={{ borderLeft: "3px solid var(--accent)", borderBottom: "1px solid var(--border-muted)", paddingBottom: "10px" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 600 }} className="text-white">{agent.name.split(" ")[0]}</span>
                          </div>

                          <span className={`custom-badge ${badgeClass} absolute top-5 right-5`} style={{ fontSize: "0.62rem" }}>
                            {statusBadge}
                          </span>

                          <div
                            className="p-3 font-mono mt-4"
                            style={{
                              background: "var(--background)",
                              border: "1px solid var(--border-muted)",
                              borderRadius: "10px",
                              fontSize: "0.75rem",
                              lineHeight: 1.6,
                              height: "260px",
                              overflowY: "auto",
                              color: "var(--zinc-300)",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {activeStep >= 3 && typedRefine
                              ? typedRefine
                              : typedDraft
                                ? typedDraft
                                : <span className="text-zinc-600 italic">[Awaiting agent processing...]</span>
                            }
                          </div>
                        </div>

                        {refinement && (
                          <div className="p-3 rounded-lg border mt-2" style={{ background: "var(--background)", borderColor: "var(--border-muted)", fontSize: "0.68rem", lineHeight: 1.45 }}>
                            <span style={{ fontWeight: 600, color: "var(--zinc-300)", display: "block", marginBottom: "3px" }}>Change Logic:</span>
                            <span className="italic" style={{ color: "var(--zinc-400)" }}>{refinement.argument}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Critique Feed Chat bubbles */}
                {critiques.length > 0 && (
                  <div className="flex flex-col gap-4 mt-4" style={{ borderTop: "1px solid var(--border-muted)", paddingTop: "24px" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--zinc-400)", fontFamily: "var(--font-mono)" }} className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-zinc-500" />
                      <span>Peer Critique Arena Feed</span>
                    </div>
                    <div className="chat-feed">
                      <AnimatePresence>
                        {critiques.map((crit, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.96, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                            className="chat-bubble-container"
                          >
                            <div className="chat-bubble-meta chat-bubble-left-meta">
                              <span>From: <strong className="text-zinc-300">{crit.from.split(" ")[0]}</strong></span>
                              <span className="text-zinc-600 font-bold mx-1">➔</span>
                              <span>To: <strong className="text-zinc-300">{crit.to.split(" ")[0]}</strong></span>
                            </div>
                            <div className="chat-bubble chat-bubble-left">
                              <p style={{ margin: 0, paddingRight: "36px" }}>
                                &ldquo;{crit.content}&rdquo;
                              </p>
                              <span className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-full bg-zinc-900 text-[10px] font-bold text-rose-400 border border-zinc-800" title="Critique Score">
                                {crit.score}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Live System Monitor HUD terminal */}
                <div className="flex flex-col gap-2 mt-4" style={{ borderTop: "1px solid var(--border-muted)", paddingTop: "24px" }}>
                  <div className="flex items-center justify-between">
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--zinc-400)", fontFamily: "var(--font-mono)" }}>
                      💻 HUD Systems Console
                    </div>
                    {activityLogs.length > 0 && (
                      <span className="text-[10px] font-mono text-rose-400 font-semibold uppercase animate-pulse">
                        Streaming Active Logs
                      </span>
                    )}
                  </div>
                  
                  <div className="hud-console">
                    <div className="hud-header">
                      <div className="hud-dots">
                        <span className="hud-dot red"></span>
                        <span className="hud-dot yellow"></span>
                        <span className="hud-dot green"></span>
                      </div>
                      <span style={{ marginLeft: "12px", marginRight: "auto" }}>LOG BUFFER SYSTEM</span>
                      <span>ID: VM_DEBATE_STREAM</span>
                    </div>
                    <div ref={activityContainerRef} className="hud-body" data-lenis-prevent>
                      {activityLogs.length === 0 ? (
                        <span style={{ color: "var(--zinc-600)" }} className="italic">[Awaiting socket stream initialization...]</span>
                      ) : (
                        activityLogs.map((log) => {
                          let logClass = "hud-log-info";
                          if (log.type === "success") logClass = "hud-log-success";
                          if (log.type === "warning") logClass = "hud-log-warning";
                          
                          return (
                            <div key={log.id} className="hud-log-row">
                              <span className="hud-log-time">[{log.time}]</span>
                              <span className={`hud-log-text ${logClass}`}>{log.text}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Settle consensus panel */}
                {settledPost && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-6 mt-6"
                    style={{ borderColor: "var(--border-active)" }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="custom-badge custom-badge-accent">
                        <Award size={12} /> CONSOLIDATED MASTER POST
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300" style={{ fontFamily: "var(--font-mono)" }}>
                        <TrendingUp size={12} className="text-zinc-500" /> Viral Potential: {settledPost.scores?.viralPotential || settledPost.score || 95}/100
                      </div>
                    </div>

                    <div
                      className="p-4"
                      style={{
                        background: "var(--background)",
                        border: "1px solid var(--border-active)",
                        borderRadius: "10px",
                        whiteSpace: "pre-wrap",
                        fontSize: "0.88rem",
                        lineHeight: 1.6,
                        color: "var(--foreground)",
                        minHeight: "150px",
                        overflowY: "auto",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {typedSettledContent}
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--zinc-500)", fontStyle: "italic", marginTop: "14px", margin: 0 }}>
                      Consensus reached. Writing and synchronizing with workspace displays...
                    </p>
                  </motion.div>
                )}

              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
