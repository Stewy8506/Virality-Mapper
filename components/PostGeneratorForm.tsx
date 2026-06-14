"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Cpu, ShieldAlert, Flame, BookOpen, User, Info, Search, MessageSquare, PenTool, GitCompare, Award, TrendingUp, CheckCircle2 } from "lucide-react";

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
  const [settledPost, setSettledPost] = useState<{ content: string; score: number; critique: string } | null>(null);

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
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="grid" style={{ gridTemplateColumns: loading ? "1fr" : "1.2fr 1fr", gap: "24px" }}>
        
        {/* Left Panel: Input context */}
        {!loading && (
          <form onSubmit={handleSubmit} className="glass-panel p-6 flex flex-col gap-4 anim-fade-up">
            <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--zinc-800)", paddingBottom: "12px" }}>
              <Flame style={{ color: "var(--accent)" }} size={16} />
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Post Context</h2>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Info size={14} style={{ color: "var(--zinc-500)" }} /> App / Project Name
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
                <BookOpen size={14} style={{ color: "var(--zinc-500)" }} /> What does it do?
              </label>
              <textarea
                required
                id="description"
                name="description"
                className="form-input"
                placeholder="Explain what problem it solves and its main features..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">
                  <User size={14} style={{ color: "var(--zinc-500)" }} /> Target Audience
                </label>
                <input
                  type="text"
                  id="targetAudience"
                  name="targetAudience"
                  className="form-input"
                  placeholder="e.g. Indie Hackers"
                  value={formData.targetAudience}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Flame size={14} style={{ color: "var(--zinc-500)" }} /> Writing Tone
                </label>
                <input
                  type="text"
                  id="tone"
                  name="tone"
                  className="form-input"
                  placeholder="e.g. Inspiring, data-driven"
                  value={formData.tone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 flex items-start gap-3" style={{ background: "rgba(239, 68, 68, 0.03)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "8px" }}>
                <ShieldAlert size={16} style={{ color: "var(--accent)", marginTop: "2px" }} />
                <p style={{ fontSize: "0.85rem", color: "#fca5a5" }}>{error}</p>
              </div>
            )}

            <button type="submit" className="custom-btn custom-btn-accent w-full" style={{ marginTop: "12px" }}>
              <Sparkles size={16} /> Run 3-Agent Debate Arena
            </button>
          </form>
        )}

        {/* Right Panel: Live Visual Whiteboard Debate */}
        {loading ? (
          <div className="glass-panel p-6 w-full flex flex-col gap-6 anim-fade-up" style={{ minHeight: "600px", background: "rgba(5,5,8,0.3)" }}>
            
            {/* Whiteboard Header */}
            <div className="flex flex-col gap-4 text-center items-center" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "20px" }}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Cpu className="animate-spin text-rose-500" size={20} />
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>Debate Settle Panel</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>ELAPSED: {formatTime(elapsedTime)}</span>
                </div>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--zinc-300)", fontWeight: 600, margin: 0 }}>
                {statusMessage || "Grounding and preparing agents..."}
              </p>

              {/* Progress Steps Indicators */}
              <div className="flex items-center gap-2 justify-center w-full max-w-lg mt-2 flex-wrap" style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
                <span className={`px-2 py-1 rounded ${activeStep === 0 ? "bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20" : activeStep > 0 ? "text-emerald-400 font-semibold" : "text-zinc-600"}`}>
                  1. Trends
                </span>
                <span className="text-zinc-600">➔</span>
                <span className={`px-2 py-1 rounded ${activeStep === 1 ? "bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20" : activeStep > 1 ? "text-emerald-400 font-semibold" : "text-zinc-600"}`}>
                  2. Drafting
                </span>
                <span className="text-zinc-600">➔</span>
                <span className={`px-2 py-1 rounded ${activeStep === 2 ? "bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20" : activeStep > 2 ? "text-emerald-400 font-semibold" : "text-zinc-600"}`}>
                  3. Critique
                </span>
                <span className="text-zinc-600">➔</span>
                <span className={`px-2 py-1 rounded ${activeStep === 3 ? "bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20" : activeStep > 3 ? "text-emerald-400 font-semibold" : "text-zinc-600"}`}>
                  4. Refine
                </span>
                <span className="text-zinc-600">➔</span>
                <span className={`px-2 py-1 rounded ${activeStep === 4 ? "bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20" : "text-zinc-600"}`}>
                  5. Settle
                </span>
              </div>
            </div>

            {/* Error Overlay */}
            {error && (
              <div className="p-4 flex items-start gap-3 rounded" style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                <ShieldAlert size={16} className="text-rose-500" style={{ marginTop: "2px" }} />
                <p style={{ fontSize: "0.85rem", color: "#fca5a5", margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Step 1: Trends Box */}
            {trends.length > 0 && activeStep === 0 && (
              <div className="p-4 rounded bg-rose-500/5 border border-rose-500/10 anim-fade-up">
                <div className="flex items-center gap-2 mb-2 text-rose-400 font-bold text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                  <Search size={12} /> SEARCH TRENDS RETRIEVED
                </div>
                <ul className="flex flex-col gap-1.5 pl-4 m-0" style={{ fontSize: "0.75rem", color: "var(--zinc-400)" }}>
                  {trends.map((t, i) => <li key={i} className="line-clamp-2">{t}</li>)}
                </ul>
              </div>
            )}

            {/* 3-Agent side-by-side cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
              {agents.map((agent) => {
                const draft = drafts[agent.name];
                const refinement = refinements[agent.name];
                const typedDraft = typedDrafts[agent.name] || "";
                const typedRefine = typedRefinements[agent.name] || "";

                // Determine active badge
                let statusBadge = "🔍 Waiting...";
                let badgeClass = "text-zinc-500";
                
                if (activeStep === 0) {
                  statusBadge = "🔍 Grounding...";
                  badgeClass = "text-rose-400 animate-pulse font-semibold";
                } else if (activeStep === 1) {
                  statusBadge = draft ? "✍️ Draft Ready" : "✍️ Drafting...";
                  badgeClass = draft ? "text-emerald-400 font-bold" : "text-rose-400 animate-pulse font-semibold";
                } else if (activeStep === 2) {
                  statusBadge = "💬 Critiquing...";
                  badgeClass = "text-rose-400 animate-pulse font-semibold";
                } else if (activeStep === 3) {
                  statusBadge = refinement ? "🔄 Refined" : "🔄 Refining...";
                  badgeClass = refinement ? "text-emerald-400 font-bold" : "text-rose-400 animate-pulse font-semibold";
                } else if (activeStep === 4) {
                  statusBadge = "🤝 Settled";
                  badgeClass = "text-emerald-400 font-bold";
                }

                return (
                  <div key={agent.id} className="glass-panel p-4 flex flex-col gap-3 justify-between" style={{ minHeight: "380px", border: activeStep === 1 && !draft ? "1px dashed rgba(244, 63, 94, 0.3)" : "1px solid var(--border-muted)" }}>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center" style={{ borderBottom: "1px solid var(--zinc-900)", paddingBottom: "8px" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "white" }}>{agent.name}</span>
                        <span className={`custom-badge ${badgeClass}`} style={{ fontSize: "0.65rem" }}>{statusBadge}</span>
                      </div>

                      <div
                        className="p-3 font-mono"
                        style={{
                          background: "#000000",
                          border: "1px solid var(--zinc-800)",
                          borderRadius: "4px",
                          fontSize: "0.7rem",
                          lineHeight: 1.55,
                          height: "220px",
                          overflowY: "auto",
                          color: "var(--zinc-300)",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {activeStep >= 3 && typedRefine
                          ? typedRefine
                          : typedDraft
                            ? typedDraft
                            : <span style={{ color: "var(--zinc-600)" }}>[Waiting for agent to brainstorm...]</span>
                        }
                      </div>
                    </div>

                    {refinement && (
                      <div className="p-2.5 rounded bg-emerald-500/5 border border-emerald-500/15" style={{ fontSize: "0.65rem", lineHeight: 1.35 }}>
                        <span style={{ fontWeight: 700, color: "var(--zinc-300)", display: "block", marginBottom: "2px" }}>Change Logic:</span>
                        <span className="serif-italic" style={{ color: "var(--zinc-400)" }}>{refinement.argument}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Critique Feed Chat */}
            {critiques.length > 0 && (
              <div className="flex flex-col gap-3 mt-4 anim-fade-up" style={{ borderTop: "1px solid var(--border-muted)", paddingTop: "20px" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--zinc-500)", fontFamily: "var(--font-mono)" }}>
                  💬 Peer Critique Arena Feed
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
                  {critiques.map((crit, idx) => (
                    <div key={idx} className="p-4 rounded flex flex-col gap-1.5 anim-fade-up" style={{ background: "rgba(10,10,12,0.6)", border: "1px solid var(--zinc-800)" }}>
                      <div className="flex justify-between items-center" style={{ fontSize: "0.65rem" }}>
                        <div className="flex items-center gap-1.5">
                          <span className="custom-badge" style={{ fontSize: "0.6rem", background: "rgba(255,255,255,0.03)" }}>{crit.from}</span>
                          <span style={{ color: "var(--zinc-600)" }}>➔</span>
                          <span className="custom-badge" style={{ fontSize: "0.6rem" }}>{crit.to}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: "var(--accent)" }}>Score: {crit.score}</span>
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "var(--zinc-400)", lineHeight: 1.4, margin: 0 }}>
                        "{crit.content}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live System Monitor console */}
            <div className="flex flex-col gap-2 mt-4 anim-fade-up" style={{ borderTop: "1px solid var(--border-muted)", paddingTop: "20px" }}>
              <div className="flex items-center justify-between">
                <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--zinc-500)", fontFamily: "var(--font-mono)" }}>
                  💻 Live System Monitor
                </div>
                {activityLogs.length > 0 && (
                  <span className="text-[10px] font-mono text-zinc-500">
                    Active stream feeds: {activityLogs.length} events
                  </span>
                )}
              </div>
              
              <div
                ref={activityContainerRef}
                className="p-3 font-mono"
                style={{
                  background: "#000000",
                  border: "1px solid var(--zinc-800)",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  lineHeight: 1.5,
                  height: "140px",
                  overflowY: "auto",
                  color: "var(--zinc-400)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {activityLogs.length === 0 ? (
                  <span style={{ color: "var(--zinc-600)" }}>[Waiting for backend execution logs...]</span>
                ) : (
                  activityLogs.map((log) => {
                    let logColor = "var(--zinc-400)";
                    if (log.type === "success") logColor = "#34d399";
                    if (log.type === "warning") logColor = "#fca5a5";
                    
                    return (
                      <div key={log.id} className="flex gap-2 items-start text-xs">
                        <span style={{ color: "var(--zinc-600)", flexShrink: 0 }}>[{log.time}]</span>
                        <span style={{ color: logColor }}>{log.text}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Settle consensus panel */}
            {settledPost && (
              <div className="glass-panel p-6 mt-6 anim-fade-up" style={{ border: "1px solid rgba(244, 63, 94, 0.3)", background: "rgba(244, 63, 94, 0.03)" }}>
                <div className="flex justify-between items-center mb-4">
                  <span className="custom-badge custom-badge-accent">
                    <Award size={10} /> CONSOLIDATED MASTER POST
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-zinc-400" style={{ fontFamily: "var(--font-mono)" }}>
                    <TrendingUp size={11} className="text-amber-400" /> Settling score: {settledPost.score}/100
                  </div>
                </div>

                <div
                  className="p-4"
                  style={{
                    background: "#000000",
                    border: "1px solid var(--border-active)",
                    borderRadius: "6px",
                    whiteSpace: "pre-wrap",
                    fontSize: "0.85rem",
                    lineHeight: 1.6,
                    color: "white",
                    minHeight: "150px",
                    overflowY: "auto",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {typedSettledContent}
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--zinc-400)", fontStyle: "italic", marginTop: "12px", margin: 0 }}>
                  Consensus reached. Finalizing workspace formats...
                </p>
              </div>
            )}

          </div>
        ) : (
          /* Active agents dashboard widget */
          <div className="glass-panel p-6 flex flex-col gap-4 anim-fade-up">
            <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--zinc-800)", paddingBottom: "12px" }}>
              <Cpu style={{ color: "var(--accent)" }} size={16} />
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Debate Panel Status</h2>
            </div>
            
            <p style={{ fontSize: "0.85rem", color: "var(--zinc-400)", marginBottom: "8px" }}>
              All 3 specialist copywriter agents participate in the debate, arguing and critiquing each other to reach consensus.
            </p>

            <div className="flex flex-col border border-zinc-800 rounded-lg divide-y divide-zinc-800 bg-[#0a0a0a]">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-4">
                  <div className="flex flex-col gap-1">
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "white" }}>
                      {agent.name}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--zinc-500)", fontFamily: "var(--font-mono)" }}>
                      {agent.provider.toUpperCase()} • {agent.model}
                    </span>
                  </div>
                  <span className="custom-badge custom-badge-accent" style={{ fontSize: "0.65rem", padding: "3px 6px" }}>ACTIVE WRITER</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
