"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Cpu, ShieldAlert, Flame, BookOpen, User, Info, Search, MessageSquare, PenTool, GitCompare, Award, TrendingUp, CheckCircle2, Clock } from "lucide-react";
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

export default function PostGeneratorForm({
  agents,
  apiKeys,
  onGenerate,
  onStartGenerate,
}: {
  agents: Agent[];
  apiKeys: ApiKeys;
  onGenerate: (data: any) => void;
  onStartGenerate?: () => void;
  onToggleAgent?: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    appName: "",
    description: "",
    targetAudience: "",
    tone: "Professional, punchy, engaging",
  });

  // Real-time streaming debate states
  const [statusMessage, setStatusMessage] = useState("");
  const [trends, setTrends] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { content: string; hookExplanation: string }>>({});
  const [critiques, setCritiques] = useState<Array<{ from: string; to: string; content: string; score: number }>>([]);
  const [refinements, setRefinements] = useState<Record<string, { content: string; score: number; argument: string }>>({});
  const [settledPost, setSettledPost] = useState<{ content: string; scores?: any; score?: number; critique: string } | null>(null);

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
      setElapsedTime(0);
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
  const draftsRef = useRef<Record<string, any>>({});
  const critiquesRef = useRef<any[]>([]);
  const refinementsRef = useRef<Record<string, any>>({});

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStreamEvent = (event: string, data: any) => {
    switch (event) {
      case "status":
        setStatusMessage(data.message);
        break;

      case "trends":
        trendsRef.current = data;
        setTrends(data);
        break;

      case "activity":
        setActivityLogs(prev => [
          ...prev,
          {
            id: `act-${Date.now()}-${Math.random()}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            text: data.message,
            type: data.type || "info"
          }
        ]);
        break;

      case "draft-complete":
        draftsRef.current[data.name] = data;
        setDrafts(prev => {
          const updated = { ...prev, [data.name]: { content: data.content, hookExplanation: data.hookExplanation } };
          animateText(data.name, data.content, setTypedDrafts);
          return updated;
        });
        break;

      case "critique-complete":
        critiquesRef.current.push({ from: data.from, to: data.to, content: data.content, score: data.score });
        setCritiques(prev => [
          ...prev,
          { from: data.from, to: data.to, content: data.content, score: data.score }
        ]);
        break;

      case "refine-complete":
        refinementsRef.current[data.name] = data;
        setRefinements(prev => {
          const updated = { ...prev, [data.name]: { content: data.content, score: data.score, argument: data.argument } };
          animateText(data.name, data.content, setTypedRefinements);
          return updated;
        });
        break;

      case "consensus-complete":
        setSettledPost(data.best);
        animateSettledText(data.best.content);
        
        // Dispatch result after typing transitions complete
        setTimeout(() => {
          onGenerate({
            appName: formData.appName,
            description: formData.description,
            targetAudience: formData.targetAudience,
            tone: formData.tone,
            trends: trendsRef.current,
            initialDrafts: Object.entries(draftsRef.current).map(([name, d]: any) => ({
              name,
              content: d.content,
              hookExplanation: d.hookExplanation,
              provider: d.provider,
              model: d.model,
            })),
            critiques: critiquesRef.current,
            refinedDrafts: Object.entries(refinementsRef.current).map(([name, r]: any) => ({
              name,
              content: r.content,
              score: r.score,
              argument: r.argument,
              provider: r.provider,
              model: r.model,
            })),
            best: data.best
          });
          setLoading(false);
        }, 3000);
        break;

      case "error":
        setError(data.message);
        setLoading(false);
        break;

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

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          apiKeys,
          agents,
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
    } catch (err: any) {
      setError(err.message || "An unexpected debate pipeline error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <AnimatePresence mode="wait">
        {!loading ? (
          <motion.div
            key="input-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="grid"
            style={{ gridTemplateColumns: "1.3fr 1fr", gap: "28px" }}
          >
            {/* Left Panel: Input context */}
            <form onSubmit={handleSubmit} className="glass-panel p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "16px" }}>
                <Flame className="text-rose-500 animate-pulse" size={18} />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }} className="text-white">Post Context Parameters</h2>
              </div>

              <div className="form-group">
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

              <div className="form-group">
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
                <div className="form-group">
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

                <div className="form-group">
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
                <div className="p-4 flex items-start gap-3 rounded bg-red-950/20 border border-red-500/20">
                  <ShieldAlert size={16} className="text-rose-500" style={{ marginTop: "2px" }} />
                  <p style={{ fontSize: "0.85rem", color: "#fca5a5" }}>{error}</p>
                </div>
              )}

              <button type="submit" className="custom-btn custom-btn-accent w-full" style={{ marginTop: "16px" }}>
                <Sparkles size={16} className="animate-spin" /> Initiate 3-Agent Copywriting Debate
              </button>
            </form>

            {/* Right Panel: Active agents widget */}
            <div className="glass-panel p-6 flex flex-col gap-4 justify-between">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "16px" }}>
                  <Cpu className="text-rose-500" size={18} />
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }} className="text-white">Debate Arena Structure</h2>
                </div>
                
                <p style={{ fontSize: "0.85rem", color: "var(--zinc-400)", lineHeight: 1.5 }}>
                  This panel routes your project characteristics through a 3-agent critique network.
                  The writers construct individual drafts, challenge each other's metrics/hooks, refine their content, and synthesize a single optimized post.
                </p>

                <div className="flex flex-col border border-zinc-800 rounded-lg divide-y divide-zinc-800 bg-[#060608]/40">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 transition-all hover:bg-white/5">
                      <div className="flex flex-col gap-1">
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "white" }}>
                          {agent.name}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "var(--zinc-500)", fontFamily: "var(--font-mono)" }}>
                          {agent.provider.toUpperCase()} • {agent.model}
                        </span>
                      </div>
                      <span className="custom-badge custom-badge-accent text-[10px]">ACTIVE WRITER</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Live Visual Whiteboard Debate Panel */
          <motion.div
            key="debate-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
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
                <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                  <Clock size={12} className="text-rose-500 animate-pulse" />
                  <span>ELAPSED TIME: {formatTime(elapsedTime)}</span>
                </div>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--zinc-300)", fontWeight: 500, margin: 0 }} className="serif-italic">
                {statusMessage || "Grounding and preparing agents..."}
              </p>

              {/* Debate Pipeline Flow Visual Map */}
              <div className="w-full mt-4">
                <div className="pipeline-container">
                  <div className="pipeline-connector">
                    <div className="pipeline-connector-flow" />
                  </div>
                  
                  <div className={`pipeline-node ${activeStep === 0 ? "active" : activeStep > 0 ? "success" : ""}`}>
                    <div className="pipeline-node-icon">
                      <Search size={16} />
                    </div>
                    <span className="pipeline-node-label">Grounding</span>
                  </div>

                  <div className={`pipeline-node ${activeStep === 1 ? "active" : activeStep > 1 ? "success" : ""}`}>
                    <div className="pipeline-node-icon">
                      <PenTool size={16} />
                    </div>
                    <span className="pipeline-node-label">Drafting</span>
                  </div>

                  <div className={`pipeline-node ${activeStep === 2 ? "active" : activeStep > 2 ? "success" : ""}`}>
                    <div className="pipeline-node-icon">
                      <MessageSquare size={16} />
                    </div>
                    <span className="pipeline-node-label">Critiques</span>
                  </div>

                  <div className={`pipeline-node ${activeStep === 3 ? "active" : activeStep > 3 ? "success" : ""}`}>
                    <div className="pipeline-node-icon">
                      <GitCompare size={16} />
                    </div>
                    <span className="pipeline-node-label">Refinements</span>
                  </div>

                  <div className={`pipeline-node ${activeStep === 4 ? "active" : ""}`}>
                    <div className="pipeline-node-icon">
                      <Award size={16} />
                    </div>
                    <span className="pipeline-node-label">Synthesis</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Overlay */}
            {error && (
              <div className="p-4 flex items-start gap-3 rounded bg-red-950/20 border border-red-500/20">
                <ShieldAlert size={16} className="text-rose-500" style={{ marginTop: "2px" }} />
                <p style={{ fontSize: "0.85rem", color: "#fca5a5", margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Step 1: Trends Box */}
            {trends.length > 0 && activeStep === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded bg-rose-500/5 border border-rose-500/10"
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "18px" }}>
              {agents.map((agent) => {
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
                  statusBadge = "💬 Critiquing...";
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
                    className="glass-panel p-4 flex flex-col gap-4 justify-between"
                    style={{
                      minHeight: "320px",
                      borderColor: activeStep === 1 && !draft ? "rgba(255, 46, 85, 0.35)" : "var(--border-muted)"
                    }}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "10px" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "white" }}>{agent.name.split(" ")[0]}</span>
                        <span className={`custom-badge ${badgeClass}`} style={{ fontSize: "0.62rem" }}>{statusBadge}</span>
                      </div>

                      <div
                        className="p-3 font-mono"
                        style={{
                          background: "#010102",
                          border: "1px solid rgba(255,255,255,0.04)",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          lineHeight: 1.6,
                          height: "240px",
                          overflowY: "auto",
                          color: "var(--zinc-300)",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {activeStep >= 3 && typedRefine
                          ? typedRefine
                          : typedDraft
                            ? typedDraft
                            : <span className="text-zinc-600 italic">[Waiting for agent pipeline flow...]</span>
                        }
                      </div>
                    </div>

                    {refinement && (
                      <div className="p-3 rounded bg-emerald-500/5 border border-emerald-500/10" style={{ fontSize: "0.68rem", lineHeight: 1.4 }}>
                        <span style={{ fontWeight: 600, color: "var(--zinc-300)", display: "block", marginBottom: "3px" }}>Change Logic:</span>
                        <span className="serif-italic" style={{ color: "var(--zinc-400)" }}>{refinement.argument}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Critique Feed Chat */}
            {critiques.length > 0 && (
              <div className="flex flex-col gap-3 mt-4" style={{ borderTop: "1px solid var(--border-muted)", paddingTop: "24px" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--zinc-400)", fontFamily: "var(--font-mono)" }}>
                  💬 Peer Critique Arena Feed
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  <AnimatePresence>
                    {critiques.map((crit, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="p-4 rounded flex flex-col gap-2 bg-[#020204] border border-zinc-800/60"
                      >
                        <div className="flex justify-between items-center" style={{ fontSize: "0.68rem" }}>
                          <div className="flex items-center gap-1.5">
                            <span className="custom-badge" style={{ fontSize: "0.62rem" }}>{crit.from.split(" ")[0]}</span>
                            <span style={{ color: "var(--zinc-600)" }}>➔</span>
                            <span className="custom-badge" style={{ fontSize: "0.62rem" }}>{crit.to.split(" ")[0]}</span>
                          </div>
                          <span className="font-bold text-rose-400">Score: {crit.score}</span>
                        </div>
                        <p style={{ fontSize: "0.78rem", color: "var(--zinc-300)", lineHeight: 1.45, margin: 0 }} className="serif-italic">
                          "{crit.content}"
                        </p>
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
                  <span>LOG BUFFER SYSTEM</span>
                  <span>ID: VM_DEBATE_STREAM</span>
                </div>
                <div ref={activityContainerRef} className="hud-body">
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
                style={{ border: "1px solid rgba(255, 46, 85, 0.35)", background: "rgba(255, 46, 85, 0.02)" }}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="custom-badge custom-badge-accent">
                    <Award size={12} /> CONSOLIDATED MASTER POST
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300" style={{ fontFamily: "var(--font-mono)" }}>
                    <TrendingUp size={12} className="text-amber-400 animate-bounce" /> Viral Potential: {settledPost.scores?.viralPotential || settledPost.score || 95}/100
                  </div>
                </div>

                <div
                  className="p-4"
                  style={{
                    background: "#000000",
                    border: "1px solid var(--border-active)",
                    borderRadius: "8px",
                    whiteSpace: "pre-wrap",
                    fontSize: "0.88rem",
                    lineHeight: 1.6,
                    color: "white",
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

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
