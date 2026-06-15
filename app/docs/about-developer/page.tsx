"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Cpu,
  Terminal as TermIcon,
  Layers,
  Zap,
  GitBranch,
  Briefcase,
  MessageSquare
} from "lucide-react";

interface TerminalLine {
  text: string;
  type: "info" | "warning" | "success" | "command";
}

const TERMINAL_LOGS: TerminalLine[] = [
  { text: "npm run start-agent-session --dev", type: "command" },
  { text: "[sys] Initializing multi-agent biographical compiler v1.4...", type: "info" },
  { text: "[01/Grounding] Querying identity database anv.dev...", type: "info" },
  { text: "[01/Grounding] Identity resolved: Anuvab Das (Fullstack AI Engineer).", type: "success" },
  { text: "[02/Drafting] Parsing developer repositories & contributions...", type: "info" },
  { text: "[02/Drafting] Detected major stacks: React, Next.js, TypeScript, LLMs, Node.js.", type: "success" },
  { text: "[03/Critique] Agent: CritiquePanel -> Evaluating initial bio parameters.", type: "info" },
  { text: "[03/Critique] CritiquePanel -> 'Bio is too corporate. Add high-contrast Obsidian UI details.'", type: "warning" },
  { text: "[04/Refinement] Rewriting developer biography details...", type: "info" },
  { text: "[04/Refinement] Injected custom layout tokens and agentic safety parameters.", type: "success" },
  { text: "[05/Settle] Biography synthesized successfully. Releasing view panels.", type: "success" },
  { text: "System State: [ACTIVE] // Blinking cursor ready.", type: "success" },
];

// Niche Hover Character Decoder Animation
const DecodingText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    intervalRef.current = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            if (char === " ") return " ";
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      iteration += 1 / 3;
    }, 30);
  };

  const handleMouseLeave = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayText(text);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <span onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{ cursor: "default" }}>
      {displayText}
    </span>
  );
};

export default function AboutDeveloperPage() {
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [logIndex, setLogIndex] = useState(0);

  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Stats Counters
  const [agentsCount, setAgentsCount] = useState(0);
  const [coffeeCount, setCoffeeCount] = useState(0);
  const [uptime, setUptime] = useState(99.0);

  useEffect(() => {
    if (logIndex < TERMINAL_LOGS.length) {
      const timer = setTimeout(() => {
        setTerminalLines((prev) => [...prev, TERMINAL_LOGS[logIndex]]);
        setLogIndex((prev) => prev + 1);
      }, logIndex === 0 ? 500 : logIndex === 1 ? 1000 : 800);
      return () => clearTimeout(timer);
    }
  }, [logIndex]);

  // Safe inner-terminal auto-scrolling that doesn't trigger parent/viewport scroll shifts
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [terminalLines]);

  // Metric triggers
  useEffect(() => {
    if (logIndex >= TERMINAL_LOGS.length - 2) {
      const interval = setInterval(() => {
        setAgentsCount((prev) => (prev < 3 ? prev + 1 : 3));
        setCoffeeCount((prev) => (prev < 6 ? prev + 1 : 6));
        setUptime((prev) => (prev < 99.98 ? +(prev + 0.1).toFixed(2) : 99.98));
      }, 150);
      return () => clearInterval(interval);
    }
  }, [logIndex]);

  const skillCards = [
    {
      num: "01",
      title: "Agentic Orchestration",
      desc: "Architecting multi-agent consensus protocols, critique debate arenas, and structured schema validations.",
      ascii: `
+-----------------+
| AGENT   DEBATE  |
|  [H] -> [S] ->  |
|  ^      |       |
|  +--[C]-+       |
+-----------------+`
    },
    {
      num: "02",
      title: "Front-end & Typography",
      desc: "Creating high-fidelity, high-contrast, token-driven interfaces. Sleek Obsidian colors with custom typography.",
      ascii: `
+-----------------+
| obsidian-tokens |
|  --bg: #09090b  |
|  --fg: #f4f4f5  |
|  font: geist    |
+-----------------+`
    },
    {
      num: "03",
      title: "Security & Validation",
      desc: "Protecting custom endpoints against SSRF vulnerabilities, implementing path sanitizers, and securing cookies.",
      ascii: `
+-----------------+
|   SSRF_GUARD    |
|   [IP: BLOCK]   |
|   [DIR: SANIT]  |
|   STATUS: SAFE  |
+-----------------+`
    },
    {
      num: "04",
      title: "Trend Scraping & RAG",
      desc: "Building low-latency crawler fallback structures and local database embeddings for few-shot prompt injection.",
      ascii: `
+-----------------+
| RAG_FEEDBACK    |
|   LIKES: 104    |
|   IMPR:  2.4K   |
|   LOOP: ACTIVE  |
+-----------------+`
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
      <div>
        <h1 style={{ display: "flex", alignItems: "center", gap: "12px", margin: 0 }}>
          <TermIcon size={24} className="text-zinc-400" />
          <DecodingText text="About Developer" />
        </h1>
        <p style={{ color: "var(--zinc-400)", fontSize: "0.95rem", marginTop: "8px", marginBottom: 0 }}>
          Anuvab Das — Fullstack Architect, Compiler Craftsman & Creator of Vantage AI.
        </p>
      </div>

      {/* Grid containing Terminal and Stat counter panel */}
      <div className="developer-header-grid">
        {/* Terminal Simulation */}
        <div className="terminal-window" style={{ overflowAnchor: "none" }}>
          <div className="terminal-header">
            <div className="terminal-dots">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
            </div>
            <span className="terminal-title">anv.dev @ agent-console</span>
            <span style={{ width: "32px" }}></span>
          </div>
          <div className="terminal-body" ref={terminalBodyRef} style={{ overflowAnchor: "none" }}>
            {terminalLines.map((line, idx) => (
              <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                {line.type === "command" ? (
                  <span style={{ color: "var(--zinc-500)" }}>$</span>
                ) : (
                  <span style={{ color: "var(--zinc-600)" }}>//</span>
                )}
                <span
                  style={{
                    color:
                      line.type === "command" ? "var(--zinc-100)" :
                        line.type === "success" ? "#22c55e" :
                          line.type === "warning" ? "#eab308" : "var(--zinc-300)"
                  }}
                >
                  {line.text}
                </span>
              </div>
            ))}
            {logIndex < TERMINAL_LOGS.length ? (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ color: "var(--zinc-600)" }}>//</span>
                <span className="animate-pulse" style={{ color: "var(--zinc-500)" }}>Compiling biography...</span>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <span style={{ color: "#22c55e" }}>$</span>
                <span
                  style={{
                    width: "8px",
                    height: "14px",
                    backgroundColor: "#22c55e",
                    display: "inline-block",
                    animation: "pulse 1s infinite"
                  }}
                />
              </div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* Dynamic Uptime Metrics Panel - Redesigned to 01-04 Typographic Rows */}
        <div className="typographic-form" style={{ borderTop: "1px solid var(--border-muted)", marginBottom: 0 }}>
          <div className="form-row" style={{ gridTemplateColumns: "50px 1fr", padding: "16px 0" }}>
            <span className="row-num" style={{ fontSize: "0.8rem", color: "var(--zinc-600)" }}>01 /</span>
            <div className="row-content">
              <span className="row-label" style={{ fontSize: "0.6rem" }}>Compiler Status</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", fontWeight: 700, color: logIndex >= TERMINAL_LOGS.length ? "#22c55e" : "#eab308" }}>
                {logIndex >= TERMINAL_LOGS.length ? "ONLINE" : "COMPILING"}
              </span>
            </div>
          </div>

          <div className="form-row" style={{ gridTemplateColumns: "50px 1fr", padding: "16px 0" }}>
            <span className="row-num" style={{ fontSize: "0.8rem", color: "var(--zinc-600)" }}>02 /</span>
            <div className="row-content">
              <span className="row-label" style={{ fontSize: "0.6rem" }}>Active Writing Agents</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", fontWeight: 700 }}>{agentsCount} / 3</span>
              <div className="stat-metric-bar" style={{ marginTop: "4px" }}>
                <div className="stat-metric-fill" style={{ width: `${(agentsCount / 3) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div className="form-row" style={{ gridTemplateColumns: "50px 1fr", padding: "16px 0" }}>
            <span className="row-num" style={{ fontSize: "0.8rem", color: "var(--zinc-600)" }}>03 /</span>
            <div className="row-content">
              <span className="row-label" style={{ fontSize: "0.6rem" }}>Engine Coffee Intake</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", fontWeight: 700 }}>{coffeeCount} Cups</span>
              <div className="stat-metric-bar" style={{ marginTop: "4px" }}>
                <div className="stat-metric-fill" style={{ width: `${(coffeeCount / 6) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div className="form-row" style={{ gridTemplateColumns: "50px 1fr", padding: "16px 0", borderBottom: "none" }}>
            <span className="row-num" style={{ fontSize: "0.8rem", color: "var(--zinc-600)" }}>04 /</span>
            <div className="row-content">
              <span className="row-label" style={{ fontSize: "0.6rem" }}>Biographical Uptime</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", fontWeight: 700 }}>{uptime}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Profile Bio */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="docs-banner docs-banner-info"
        style={{ margin: 0 }}
      >
        <div className="docs-banner-icon">
          <Zap size={18} className="text-zinc-200" />
        </div>
        <div>
          <h3 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: 700 }}># 01 / Synthesis Core</h3>
          <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.6, color: "var(--zinc-300)" }}>
            Anuvab is a software craftsman building AI developer tools, robust compiler structures, and fast front-ends.
            He designed Vantage AI to escape standard ChatGPT templates and provide a high-agency workspace that
            empowers professionals to write authentic, high-impact content.
          </p>
        </div>
      </motion.section>

      {/* Skills Matrix */}
      <div>
        <h2 id="core-expertise-grid" style={{ marginTop: "20px" }}>
          <DecodingText text="01 / Core Expertise Grid" />
        </h2>
        <p style={{ color: "var(--zinc-400)" }}>Hover over nodes to inspect structural ASCII schematics.</p>
        <div className="skill-matrix-grid">
          {skillCards.map((card, idx) => (
            <motion.div
              key={card.num}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx + 0.3 }}
              className="skill-matrix-card"
            >
              <div className="flex justify-between items-center" style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <span className="skill-num">{card.num} /</span>
                {idx === 0 && <Cpu size={14} className="text-zinc-500" />}
                {idx === 1 && <Layers size={14} className="text-zinc-500" />}
                {idx === 2 && <TermIcon size={14} className="text-zinc-500" />}
                {idx === 3 && <Globe size={14} className="text-zinc-500" />}
              </div>
              <h3 className="skill-title">
                <DecodingText text={`# ${card.num} / ${card.title}`} />
              </h3>
              <p className="skill-desc">{card.desc}</p>
              <pre className="skill-ascii">{card.ascii.trim()}</pre>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Developer Social Links */}
      <div style={{ marginTop: "24px", borderTop: "1px solid var(--border-muted)", paddingTop: "32px" }}>
        <h2 id="social-handshakes">
          <DecodingText text="02 / Social Handshakes" />
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "16px" }}>
          {[
            { label: "anv.dev", url: "https://anvv.tech", icon: <Globe size={14} /> },
            { label: "GitHub", url: "https://github.com/Stewy8506", icon: <GitBranch size={14} /> },
            { label: "LinkedIn", url: "https://www.linkedin.com/in/anv-dev/", icon: <Briefcase size={14} /> },
            { label: "Twitter / X", url: "https://twitter.com/anuvab_das", icon: <MessageSquare size={14} /> },
          ].map((social) => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="docs-page-nav-link"
              style={{ width: "auto", flexGrow: 1, minWidth: "150px", display: "flex", flexDirection: "row", gap: "12px", padding: "12px 16px", alignItems: "center" }}
            >
              <div style={{ color: "var(--accent)" }}>{social.icon}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "var(--zinc-500)" }}>Connect</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--zinc-200)" }}>{social.label}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
