"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Zap, RefreshCw, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Virality Mapper",
  "operatingSystem": "All",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "Stop guessing LinkedIn performance. Put specialist AI copywriters in a peer-critique debate arena, ground drafts against real-time feed trends, and output the survivor copy.",
  "featureList": [
    "3-Agent Copywriting debate panel",
    "Bidirectional peer review critique arena",
    "Real-time professional search trend grounding",
    "Simulated Focus Group target audience persona testing"
  ]
};

// Simulation mock database items
const mockSimulationData = {
  trends: [
    "Local-first SQLite syncing algorithms (0ms latency, flat AWS database costs)",
    "UX bloat: migrating from 450+ styled components to 8 primitive tokens",
    "Remote async workflows: cancellation of synchronous daily standup meetings"
  ],
  agents: [
    {
      name: "Alpha Agent",
      provider: "Gemini 2.5",
      draft: "We stopped relying on hope-driven development to manage our archives.\n\nMost SaaS tools let links rot in a black hole. We built a local-first SQLite library to treat info as a perishable asset.",
      critique: "Gemini 2.5 → GPT-4o:\n'Draft has great technical grounding, but layout density is too tight for mobile dwell times. Split the second paragraph.'",
      refinement: "We stopped relying on hope-driven development to manage our archives.\n\nMost apps let saved links rot in a black hole.\n\nSo we built LinkShelf to treat info as a perishable asset."
    },
    {
      name: "Beta Agent",
      provider: "GPT-4o",
      draft: "Your design system is slowly killing your product velocity.\n\nWe went from 12 button styles to 450+ components. Our mobile parse latency spiked to 4.2 seconds. We didn't build a system, we built a digital graveyard.",
      critique: "GPT-4o → Claude 3.5:\n'Excellent hooks, but CTA is missing. Recommend adding a low-friction comment request to distribute synchronization blueprints.'",
      refinement: "Your design system is slowly killing your product velocity.\n\nWe went from 12 buttons to 450+ components and 4.2s parse latency.\n\nComment 'CLEAN' below to get our primitive CSS variables blueprint."
    },
    {
      name: "Gamma Agent",
      provider: "Claude 3.5",
      draft: "We deleted our cloud database cluster and saved $1,200/month.\n\nNo postgres clusters. No Serverless connection pools. Just SQLite synced via CRDTs directly in browser memory.",
      critique: "Claude 3.5 → Gemini 2.5:\n'Metaphors are clean, but needs concrete metrics to justify offline synchronization reliability.'",
      refinement: "We deleted our cloud database cluster and saved $1,200/month.\n\nSQLite synced in local memory via CRDTs.\n\n⚡ 0.8ms DB queries. 🔋 100% Offline capability. 💸 flat $40/month costs."
    }
  ],
  survivor: {
    content: "We deleted our cloud database cluster and saved $1,200/month.\n\nNo Postgres. No Redis cluster. No serverless connection pooling.\n\nWe migrated the entire application to local-first SQLite databases running directly in the browser and syncing via CRDTs.\n\nHere is the telemetry data from our production release:\n\n⚡ 0.8ms DB queries: Reads/writes happen in local memory.\n🔋 Offline capability: The app works on a flight, syncing upon landing.\n💸 Flat $40/month server cost.\n\nComment \"SYNC\" below and we will DM you the synchronization script repository.\n\nHot take: 90% of user data does not need to live in a centralized cloud database. Agree or disagree?",
    score: 96,
    critique: "Gamma Agent proposed the cleanest architecture narrative. The debate pool resolved to incorporate Beta Agent's low-friction CTA and Alpha Agent's performance grounding metrics, maximizing conversion potential."
  }
};

const firstTitleVariants = {
  initial: { y: "115%", opacity: 0 },
  animate: (idx: number) => ({
    y: "0%",
    opacity: 1,
    transition: { duration: 0.8, delay: 0.6 + idx * 0.035, ease: [0.16, 1, 0.3, 1] as const }
  }),
  hover: {
    y: -15,
    scale: 1.12,
    transition: { type: "spring" as const, stiffness: 400, damping: 10 }
  }
};

const secondTitleVariants = {
  initial: { y: "115%", opacity: 0 },
  animate: (idx: number) => ({
    y: "0%",
    opacity: 1,
    transition: { duration: 0.8, delay: 0.95 + idx * 0.035, ease: [0.16, 1, 0.3, 1] as const }
  }),
  hover: {
    y: -20,
    scale: 1.15,
    transition: { type: "spring" as const, stiffness: 400, damping: 10 }
  }
};

export default function LandingPage() {
  const [activeTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "obsidian";
    }
    return "obsidian";
  });
  const [activeFont] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("font") || "geist";
    }
    return "outfit";
  });

  const [simStep, setSimStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sandboxActiveIndex, setSandboxActiveIndex] = useState(0);
  const sandboxPrompts = [
    {
      title: "Local-first Synchronization CRDTs",
      preview: "Querying local DB context...\nIntegrating Alpha hooks:\n'Most apps let saved links rot in a black hole. We built a local-first SQLite library to treat info as a perishable asset.'\nStatus: [Consensus Settle Complete - CTR Ready]"
    },
    {
      title: "Design System Velocity Bloat",
      preview: "Analyzing Button Primitive latency...\nIntegrating Beta hooks:\n'Your design system is slowly killing your product velocity. We went from 12 button styles to 450+ components.'\nStatus: [Consensus Settle Complete - CTR Ready]"
    },
    {
      title: "Cloud Database Cost Reductions",
      preview: "Analyzing flat server cost metrics...\nIntegrating Gamma hooks:\n'We deleted our cloud database cluster and saved $1,200/month. No postgres clusters. No Serverless pools.'\nStatus: [Consensus Settle Complete - CTR Ready]"
    }
  ];

  // Monospace Loader simulation
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      const increment = Math.floor(Math.random() * 8) + 4; // 4 to 11%
      current = Math.min(current + increment, 100);
      setLoadingPercent(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    }, 70 + Math.random() * 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const spotlight = document.querySelector(".grid-spotlight") as HTMLElement | null;
    const glow = document.querySelector(".cursor-spotlight-glow") as HTMLElement | null;

    const handleMouseMove = (e: MouseEvent) => {
      const x = `${e.clientX}px`;
      const y = `${e.clientY}px`;
      document.documentElement.style.setProperty("--mouse-x", x);
      document.documentElement.style.setProperty("--mouse-y", y);

      if (spotlight) {
        const mask = `radial-gradient(circle 350px at ${x} ${y}, black 0%, rgba(0, 0, 0, 0.45) 45%, rgba(0, 0, 0, 0.12) 75%, transparent 100%)`;
        spotlight.style.maskImage = mask;
        spotlight.style.webkitMaskImage = mask;
      }
      if (glow) {
        glow.style.backgroundImage = `radial-gradient(circle 350px at ${x} ${y}, var(--accent-glow) 0%, rgba(255, 255, 255, 0.01) 60%, transparent 100%)`;
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  // Debate Simulation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setSimStep((prev) => (prev + 1) % 5);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Sync theme changes reactively
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", activeTheme);
      localStorage.setItem("theme", activeTheme);
    }
  }, [activeTheme]);

  // Sync font changes reactively
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-font", activeFont);
      localStorage.setItem("font", activeFont);
    }
  }, [activeFont]);

  const copySurvivor = () => {
    navigator.clipboard.writeText(mockSimulationData.survivor.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>

      {/* Custom Monospace Loader Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="custom-loader"
            className="monospace-loader"
            exit={{ y: "-100%", opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Immersive Background Orbs */}
            <div className="loader-glow-orb loader-glow-orb-1" />
            <div className="loader-glow-orb loader-glow-orb-2" />

            <div className="loader-terminal">
              {/* Spinning Logo Stack */}
              <div className="loader-logo-pulse">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="smiley-svg">
                  <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2.5" fill="var(--background)" />
                  <line x1="20" y1="20" x2="27" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="20" y1="20" x2="13" y2="27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="20" y1="20" x2="13" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="20" cy="20" r="3.5" fill="currentColor" />
                  <circle cx="27" cy="13" r="2.5" fill="currentColor" />
                  <circle cx="13" cy="27" r="2.5" fill="currentColor" />
                  <circle cx="13" cy="14" r="2.5" fill="currentColor" />
                </svg>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="smiley-svg second">
                  <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2.5" fill="var(--background)" />
                  <line x1="20" y1="20" x2="27" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="20" y1="20" x2="13" y2="27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="20" y1="20" x2="13" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="20" cy="20" r="3.5" fill="currentColor" />
                  <circle cx="27" cy="13" r="2.5" fill="currentColor" />
                  <circle cx="13" cy="27" r="2.5" fill="currentColor" />
                  <circle cx="13" cy="14" r="2.5" fill="currentColor" />
                </svg>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="smiley-svg third">
                  <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2.5" fill="var(--background)" />
                  <line x1="20" y1="20" x2="27" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="20" y1="20" x2="13" y2="27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="20" y1="20" x2="13" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="20" cy="20" r="3.5" fill="currentColor" />
                  <circle cx="27" cy="13" r="2.5" fill="currentColor" />
                  <circle cx="13" cy="27" r="2.5" fill="currentColor" />
                  <circle cx="13" cy="14" r="2.5" fill="currentColor" />
                </svg>
              </div>

              <div className="loader-header">
                <span className="loader-header-title">[ VIRALITY MAPPER STUDIO ]</span>
                <span>v1.0.4</span>
              </div>
              <div className="loader-logs">
                <div className={`loader-log-row ${loadingPercent >= 0 ? (loadingPercent >= 25 ? "done" : "active") : ""}`}>
                  <span>01 / INITIALIZE DEBATE CONTEXT CORE</span>
                  <span>{loadingPercent >= 25 ? "[OK]" : "[BUSY]"}</span>
                </div>
                <div className={`loader-log-row ${loadingPercent >= 25 ? (loadingPercent >= 55 ? "done" : "active") : ""}`}>
                  <span>02 / CONNECTING DEBATE ARENA GATEWAYS</span>
                  <span>{loadingPercent >= 55 ? "[OK]" : (loadingPercent >= 25 ? "[BUSY]" : "[WAIT]")}</span>
                </div>
                <div className={`loader-log-row ${loadingPercent >= 55 ? (loadingPercent >= 85 ? "done" : "active") : ""}`}>
                  <span>03 / GROUNDING LIVE FEED TELEMETRY</span>
                  <span>{loadingPercent >= 85 ? "[OK]" : (loadingPercent >= 55 ? "[BUSY]" : "[WAIT]")}</span>
                </div>
                <div className={`loader-log-row ${loadingPercent >= 85 ? (loadingPercent >= 100 ? "done" : "active") : ""}`}>
                  <span>04 / AGENT POOL SYNCHRONIZATION</span>
                  <span>{loadingPercent >= 100 ? "[OK]" : (loadingPercent >= 85 ? "[BUSY]" : "[WAIT]")}</span>
                </div>
              </div>

              <div className="loader-progress-section">
                <div className="loader-progress-info">
                  <span>BOOTING SETTLE ENGINE</span>
                  <span>{loadingPercent}%</span>
                </div>
                <div className="loader-progress-bar">
                  <div className="loader-progress-fill" style={{ width: `${loadingPercent}%` }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic font scaling */}
      <style id="landing-font-size-overrides" dangerouslySetInnerHTML={{
        __html: `
          :root {
            font-size: 16px;
          }
        `
      }} />

      {/* SVG Noise Grain Backdrop Overlay */}
      <div className="noise-grain-overlay" />

      {/* Dynamic Grid Backdrop & Spotlight */}
      <div className="grid-base" />
      <div className="cursor-spotlight-glow" />
      <div className="grid-spotlight" />


      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="typographic-landing">

        {/* Redesigned Navigation Bar matching the Sample */}
        <header className="minimal-nav">
          <div className="nav-horizontal-line" />
          <motion.div
            className="smiley-logo-stack"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="smiley-svg">
              <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2.5" fill="var(--background)" />
              <line x1="20" y1="20" x2="27" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="20" y1="20" x2="13" y2="27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="20" y1="20" x2="13" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="20" cy="20" r="3.5" fill="currentColor" />
              <circle cx="27" cy="13" r="2.5" fill="currentColor" />
              <circle cx="13" cy="27" r="2.5" fill="currentColor" />
              <circle cx="13" cy="14" r="2.5" fill="currentColor" />
            </svg>
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="smiley-svg second">
              <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2.5" fill="var(--background)" />
              <line x1="20" y1="20" x2="27" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="20" y1="20" x2="13" y2="27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="20" y1="20" x2="13" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="20" cy="20" r="3.5" fill="currentColor" />
              <circle cx="27" cy="13" r="2.5" fill="currentColor" />
              <circle cx="13" cy="27" r="2.5" fill="currentColor" />
              <circle cx="13" cy="14" r="2.5" fill="currentColor" />
            </svg>
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="smiley-svg third">
              <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2.5" fill="var(--background)" />
              <line x1="20" y1="20" x2="27" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="20" y1="20" x2="13" y2="27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="20" y1="20" x2="13" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="20" cy="20" r="3.5" fill="currentColor" />
              <circle cx="27" cy="13" r="2.5" fill="currentColor" />
              <circle cx="13" cy="27" r="2.5" fill="currentColor" />
              <circle cx="13" cy="14" r="2.5" fill="currentColor" />
            </svg>
          </motion.div>

          <nav className="minimal-nav-links">
            <Link href="#features" className="nav-link-item">FEATURES</Link>
            <Link href="#pipeline" className="nav-link-item">PROCESS</Link>
            <Link href="/workspace" className="nav-link-item">WORKSPACE</Link>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/workspace" className="nav-pill-cta">
              LAUNCH ENGINE
            </Link>
          </motion.div>
        </header>

        <main>
          {/* Premium Typographic Hero Section with Sacramento Cursive Overlay */}
          <section className="hero-typography-container">
            <div className="hero-editorial-layout">
              {/* Row 1 */}
              <div className="hero-row-1">
                <div className="hero-col-left">
                  <motion.div
                    className="script-overlay"
                    initial={{ clipPath: "polygon(-50% -100%, -50% -100%, -50% 200%, -50% 200%)", opacity: 0, y: 15 }}
                    animate={isLoading ? "initial" : { clipPath: "polygon(-50% -100%, 150% -100%, 150% 200%, -50% 200%)", opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05, rotate: -2, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{
                      clipPath: { duration: 1.4, delay: 1.2, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.8, delay: 1.1 },
                      y: { duration: 1.0, delay: 1.1, ease: [0.16, 1, 0.3, 1] },
                      scale: { type: "spring", stiffness: 350, damping: 12 },
                      rotate: { type: "spring", stiffness: 350, damping: 12 }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    Draft
                  </motion.div>
                </div>
                <div className="hero-col-right">
                  <h1 className="outline-hero-title">
                    {"POSTS THAT".split("").map((char, idx) => (
                      <motion.span
                        key={idx}
                        custom={idx}
                        variants={firstTitleVariants}
                        initial="initial"
                        animate={isLoading ? "initial" : "animate"}
                        whileHover="hover"
                        style={{ display: "inline-block", whiteSpace: "pre", cursor: "pointer" }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </h1>
                </div>
              </div>

              {/* Row 2 */}
              <div className="hero-row-2">
                <div className="hero-col-left">
                  <motion.div
                    className="hero-editorial-desc"
                    initial={{ opacity: 0, y: 15 }}
                    animate={isLoading ? { opacity: 0, y: 15 } : { opacity: 1, y: 0 }}
                    transition={{ duration: 1.0, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span>
                      Stop guessing LinkedIn performance. Put specialist AI copywriters in a peer-critique debate arena, ground drafts against real-time feed trends, and output the survivor copy.
                    </span>
                    <Link href="/workspace" className="editorial-text-cta">
                      LAUNCH STUDIO WORKSPACE <ArrowRight size={12} style={{ marginLeft: "4px" }} />
                    </Link>
                  </motion.div>
                </div>
                <div className="hero-col-right">
                  <h1 className="outline-hero-title large-title">
                    {"ENGAGE.".split("").map((char, idx) => (
                      <motion.span
                        key={idx}
                        custom={idx}
                        variants={secondTitleVariants}
                        initial="initial"
                        animate={isLoading ? "initial" : "animate"}
                        whileHover="hover"
                        style={{ display: "inline-block", whiteSpace: "pre", cursor: "pointer" }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </h1>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Live Debate Arena Simulator */}
          <motion.section
            className="scroll-reveal"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="simulator-widget">
              <div className="simulator-header">
                <div className="flex items-center gap-2" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Zap size={14} className="text-amber-400 animate-pulse" />
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.08em", color: "var(--zinc-300)" }}>
                    LIVE ARENA SIMULATOR
                  </span>
                </div>
                <button
                  onClick={() => setSimStep(0)}
                  className="text-[10px] font-mono uppercase text-zinc-500 hover:text-white flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <RefreshCw size={10} />
                  <span>Restart Simulation</span>
                </button>
              </div>

              <div className="simulator-body">
                {/* Timeline Rail */}
                <div className="simulator-timeline-rail">
                  {["01 / GROUNDING", "02 / DRAFTING", "03 / CRITIQUE", "04 / REFINEMENT", "05 / SETTLE"].map((step, idx) => (
                    <div
                      key={idx}
                      className={`simulator-timeline-step ${simStep === idx ? "active" : ""}`}
                    >
                      {step}
                    </div>
                  ))}
                </div>

                {/* Simulator Content Panel */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <AnimatePresence mode="wait">
                    {simStep === 0 && (
                      <motion.div
                        key="step-grounding"
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.99 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex flex-col gap-4">
                          <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 700 }}>
                            [CRAWLER GROUNDING ENGINE] RETRIEVING CRAWLED LINKEDIN TARGET TELEMETRY...
                          </span>
                          <div className="flex flex-col gap-3">
                            {mockSimulationData.trends.map((trend, idx) => (
                              <div
                                key={idx}
                                className="p-4 border border-zinc-800 bg-zinc-950/20 font-mono text-xs text-zinc-300"
                                style={{ borderLeft: "2px solid var(--accent)" }}
                              >
                                &bull; {trend}
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {simStep === 1 && (
                      <motion.div
                        key="step-drafting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex flex-col gap-4">
                          <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 700 }}>
                            [CONCURRENT GENERATORS] CREATING FIRST DRAFT PROPOSALS...
                          </span>
                          <div className="simulator-agent-cards">
                            {mockSimulationData.agents.map((agent, idx) => (
                              <div key={idx} className="simulator-agent-card active">
                                <div className="flex justify-between items-center" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-muted)", paddingBottom: "8px" }}>
                                  <span style={{ fontSize: "0.75rem", fontWeight: 700 }} className="text-white font-mono">{agent.name}</span>
                                  <span style={{ fontSize: "0.65rem", color: "var(--zinc-500)" }} className="font-mono">{agent.provider}</span>
                                </div>
                                <p style={{ fontSize: "0.78rem", color: "var(--zinc-400)", margin: 0, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                                  {agent.draft}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {simStep === 2 && (
                      <motion.div
                        key="step-critique"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex flex-col gap-4">
                          <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 700 }}>
                            [DEBATE ARENA] CROSS-CRITIQUING DRAFT CLICHES & MOBILE CTR READABILITY...
                          </span>
                          <div className="simulator-critique-flow">
                            {mockSimulationData.agents.map((agent, idx) => (
                              <div key={idx} className="simulator-critique-row">
                                {agent.critique}
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {simStep === 3 && (
                      <motion.div
                        key="step-refinement"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex flex-col gap-4">
                          <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 700 }}>
                            [ITERATIVE REFINEMENT] REWRITING POSTS TO COMPLY WITH PEER FEEDBACK...
                          </span>
                          <div className="simulator-agent-cards">
                            {mockSimulationData.agents.map((agent, idx) => (
                              <div key={idx} className="simulator-agent-card active">
                                <div className="flex justify-between items-center" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-muted)", paddingBottom: "8px" }}>
                                  <span style={{ fontSize: "0.75rem", fontWeight: 700 }} className="text-white font-mono">{agent.name}</span>
                                  <span style={{ fontSize: "0.65rem", color: "var(--zinc-500)" }} className="font-mono">{agent.provider}</span>
                                </div>
                                <p style={{ fontSize: "0.78rem", color: "var(--zinc-300)", margin: 0, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                                  {agent.refinement}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {simStep === 4 && (
                      <motion.div
                        key="step-settle"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-center" style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 700 }}>
                              [CONSENSUS SETTLED] MASTER COPIWRITER SURVIVOR OUTPUT
                            </span>
                            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                              <span>Score: {mockSimulationData.survivor.score}/100</span>
                              <button
                                onClick={copySurvivor}
                                className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-white cursor-pointer bg-transparent border-0"
                                style={{ display: "flex", alignItems: "center", gap: "4px" }}
                              >
                                {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                <span>{copied ? "Copied" : "Copy survivor"}</span>
                              </button>
                            </div>
                          </div>

                          <div
                            className="p-5 font-mono"
                            style={{
                              background: "rgba(0,0,0,0.2)",
                              border: "1px solid var(--border-muted)",
                              whiteSpace: "pre-wrap",
                              fontSize: "0.82rem",
                              lineHeight: 1.6,
                              color: "var(--foreground)",
                              maxHeight: "240px",
                              overflowY: "auto"
                            }}
                          >
                            {mockSimulationData.survivor.content}
                          </div>

                          <div
                            className="p-4"
                            style={{
                              fontSize: "0.78rem",
                              background: "rgba(255,255,255,0.01)",
                              borderLeft: "2px solid var(--accent)",
                              color: "var(--zinc-400)",
                              lineHeight: 1.5,
                              fontStyle: "italic"
                            }}
                          >
                            {mockSimulationData.survivor.critique}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Bento Grid catalog features list */}
          <section className="bento-section" id="features">
            <div className="relative mb-14">
              <h2 className="catalog-header scroll-reveal">
                {"Platform Modules".split("").map((char, idx) => (
                  <span key={idx}>{char === " " ? "\u00a0" : char}</span>
                ))}
              </h2>
            </div>

            <div className="bento-grid">
              <div className="bento-card bento-card-large scroll-reveal">
                <span className="bento-card-num">01</span>
                <div>
                  <h3 className="bento-card-title">AI Copywriter Debate</h3>
                  <p className="bento-card-desc">
                    Three specialized AI agents draft your post and critique each other&apos;s copywriting style. They highlight generic cliches, edit visual line breaks, and vote on the survivor copy.
                  </p>
                </div>
              </div>

              <div className="bento-card scroll-reveal">
                <span className="bento-card-num">02</span>
                <div>
                  <h3 className="bento-card-title">Self-Improving RAG</h3>
                  <p className="bento-card-desc">
                    Log views and likes from your published posts. The system feeds successful runs back into the AI context, using your best posts as templates for future copies.
                  </p>
                </div>
              </div>

              <div className="bento-card scroll-reveal">
                <span className="bento-card-num">03</span>
                <div>
                  <h3 className="bento-card-title">Audience Testing</h3>
                  <p className="bento-card-desc">
                    Test your final post against a simulated panel of custom reader personas (VCs, CTOs, founders) to preview comment rates and scroll-stopping probability.
                  </p>
                </div>
              </div>

              <div className="bento-card bento-card-large scroll-reveal">
                <span className="bento-card-num">04</span>
                <div>
                  <h3 className="bento-card-title">LinkedIn Trend Grounding</h3>
                  <p className="bento-card-desc">
                    The engine crawls live LinkedIn search topics and regional feeds to extract current hooks, making sure your posts reference active industry conversations.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Stepper Pipeline timeline */}
          <section className="timeline-section" id="pipeline">
            <div className="relative mb-14">
              <h2 className="catalog-header scroll-reveal">
                {"Consensus Stepper".split("").map((char, idx) => (
                  <span key={idx}>{char === " " ? "\u00a0" : char}</span>
                ))}
              </h2>
            </div>

            <div className="stepper-list">
              {[
                { phase: "Phase 01", title: "Grounding", desc: "Scan trending keywords and query local RAG memory to build copy foundation parameters." },
                { phase: "Phase 02", title: "Drafting", desc: "Parallel generation models propose distinct structure variants (hooks vs numbers vs stories)." },
                { phase: "Phase 03", title: "Critique", desc: "Agent network debates layout density, CTR potential, and flag weak marketing clichés." },
                { phase: "Phase 04", title: "Refinement", desc: "Multi-turn adjustment loops rewrite drafts addressing agent peer reviews." },
                { phase: "Phase 05", title: "Settle", desc: "Consensus model selects the final survivor copy, ready for clip copying." }
              ].map((step, idx) => (
                <div key={idx} className="stepper-row scroll-reveal">
                  <span className="stepper-index">0{idx + 1} /</span>
                  <div className="stepper-content">
                    <div className="stepper-header-group">
                      <h4 className="timeline-heading" style={{ margin: 0 }}>{step.title}</h4>
                      <span className="timeline-subtitle" style={{ marginBottom: 0 }}>{step.phase}</span>
                    </div>
                    <p className="timeline-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom CTA Runway Section */}
          <section className="cta-runway-section scroll-reveal" id="cta">
            <div className="cta-runway-grid">
              <div className="cta-left">
                <div className="cta-title-small">
                  <Zap size={14} className="text-amber-400" />
                  <span>READY TO SHIFT THE CTR CURVE?</span>
                </div>
                <h2 className="cta-title-large">
                  {"Settle the copy. Settle the score.".split("").map((char, idx) => (
                    <span key={idx}>{char === " " ? "\u00a0" : char}</span>
                  ))}
                </h2>
                <p className="cta-desc">
                  Join the elite group of developers and founders optimizing their growth channels. Ground drafts, simulate debates, and run professional campaigns with peer-critiqued copywriting models.
                </p>
                <div>
                  <Link href="/workspace" className="hero-cta-button">
                    <span>Enter Settle Engine Workspace</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="cta-right">
                {/* Prompt Sandbox Widget */}
                <div className="sandbox-widget">
                  <div className="sandbox-header">
                    <span>Interactive Prompt Sandbox</span>
                  </div>
                  <div className="sandbox-prompt-list">
                    {sandboxPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSandboxActiveIndex(idx)}
                        className={`sandbox-prompt-option ${sandboxActiveIndex === idx ? "active" : ""}`}
                      >
                        {prompt.title}
                      </button>
                    ))}
                  </div>
                  <div className="sandbox-preview-container">
                    <div className="sandbox-preview-label">Compilation Preview</div>
                    <div className="sandbox-preview-box">
                      {sandboxPrompts[sandboxActiveIndex].preview}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Minimal Footer */}
        <footer className="minimal-footer">
          <span>anv.dev</span>
          <span>&copy; 2026. All rights reserved.</span>
          <div className="flex items-center gap-2" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[10px] font-bold text-zinc-500 font-mono">Live</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
