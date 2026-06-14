"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";
import { motion } from "framer-motion";

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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
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

  if (!loaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center" style={{ background: "var(--background)" }}>
        <Activity className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }



  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>

      {/* Dynamic font scaling to ensure high typographic layout readability */}
      <style id="landing-font-size-overrides" dangerouslySetInnerHTML={{
        __html: `
          :root {
            font-size: 16px;
          }
        `
      }} />

      <div className="typographic-landing">

        {/* Minimal Navigation */}
        <header className="minimal-nav">
          <motion.div
            className="logo-text"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Virality Mapper
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/workspace" className="studio-link">
              Enter Studio &rarr;
            </Link>
          </motion.div>
        </header>

        {/* Typographic Hero */}
        <section className="hero-wrapper">
          <motion.h1
            className="hero-large-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            Settle the copy. <br />
            Dominate the feed.
          </motion.h1>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            Stop guessing LinkedIn performance. Put specialist AI copywriters in a peer-critique debate arena, ground drafts against real-time feed trends, and output the survivor copy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/workspace" className="hero-cta-button">
              <span>Launch Settle Engine</span>
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </section>

        {/* Raw vs Settle Split Visualizer */}
        <motion.div
          className="visualizer-split"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="visualizer-pane">
            <span className="pane-title">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" style={{ display: "inline-block" }}></span>
              <span>Raw Input Draft</span>
            </span>
            <p className="pane-text obsolete-style">
              I built a new app that allows you to optimize LinkedIn posts by using a multi-agent critique debate arena. It connects to trends, and uses RAG databases. It will help you write better copy. Let me know what you think in the comments!
            </p>
          </div>

          <div className="visualizer-divider" />

          <div className="visualizer-pane">
            <span className="pane-title">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" style={{ display: "inline-block" }}></span>
              <span>Consensus Survivor</span>
            </span>
            <p className="pane-text survivor-style">
              We spent 45 hours putting 3 AI copywriters in a room to argue over single line hooks.
              {"\n\n"}
              No speculative writing. No fluff. Just peer-critiqued copy variants that survive validation.
              {"\n\n"}
              Here is how we built the Settle Engine:
              {"\n"}
              1. Hook Generation (Pattern Interrupt)
              {"\n"}
              2. Metrics injection (Targeted Proof)
              {"\n"}
              3. Consensus selection (Settle Arena)
              {"\n\n"}
              Hot take: Speculative copywriters are obsolete. Agree or disagree?
            </p>
          </div>
        </motion.div>

        {/* Clean catalog features list */}
        <section className="catalog-section" id="features">
          <motion.h2
            className="catalog-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Platform Modules
          </motion.h2>

          <motion.div
            className="catalog-item"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="catalog-number">01 /</span>
            <h3 className="catalog-title">Debate Arena</h3>
            <p className="catalog-desc">
              Alpha, Beta, and Gamma agents generate posts in parallel and critique hooks, proof metrics, and readability. Only the settled survivor is outputted.
            </p>
          </motion.div>

          <motion.div
            className="catalog-item"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="catalog-number">02 /</span>
            <h3 className="catalog-title">RAG Context</h3>
            <p className="catalog-desc">
              Retrieve previous top-performing copy structures and visual layouts from your local database to ground drafts in proven visual formats.
            </p>
          </motion.div>

          <motion.div
            className="catalog-item"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="catalog-number">03 /</span>
            <h3 className="catalog-title">Focus Group</h3>
            <p className="catalog-desc">
              Pre-evaluate scroll-stopping hook strength, readability indices, and click-through metrics before publishing copy.
            </p>
          </motion.div>

          <motion.div
            className="catalog-item"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="catalog-number">04 /</span>
            <h3 className="catalog-title">Feed Trends</h3>
            <p className="catalog-desc">
              Integrate real-time trending topics and hashtags directly from LinkedIn to align with the active delivery algorithms.
            </p>
          </motion.div>
        </section>

        {/* Stepper Pipeline timeline */}
        <section className="timeline-section" id="pipeline">
          <motion.h2
            className="catalog-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Consensus Stepper
          </motion.h2>

          <div className="timeline-rail">
            <motion.div
              className="timeline-step"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="timeline-marker active" />
              <span className="timeline-subtitle">Phase 01</span>
              <h4 className="timeline-heading">Grounding</h4>
              <p className="timeline-desc">
                Scan trending keywords and query local RAG memory to build copy foundation parameters.
              </p>
            </motion.div>

            <motion.div
              className="timeline-step"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="timeline-marker active" />
              <span className="timeline-subtitle">Phase 02</span>
              <h4 className="timeline-heading">Drafting</h4>
              <p className="timeline-desc">
                Parallel generation models propose distinct structure variants (hooks vs numbers vs stories).
              </p>
            </motion.div>

            <motion.div
              className="timeline-step"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="timeline-marker active" />
              <span className="timeline-subtitle">Phase 03</span>
              <h4 className="timeline-heading">Critique</h4>
              <p className="timeline-desc">
                Agent network debates layout density, CTR potential, and flag weak marketing clichés.
              </p>
            </motion.div>

            <motion.div
              className="timeline-step"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="timeline-marker active" />
              <span className="timeline-subtitle">Phase 04</span>
              <h4 className="timeline-heading">Refinement</h4>
              <p className="timeline-desc">
                Multi-turn adjustment loops rewrite drafts addressing agent peer reviews.
              </p>
            </motion.div>

            <motion.div
              className="timeline-step"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="timeline-marker active" />
              <span className="timeline-subtitle">Phase 05</span>
              <h4 className="timeline-heading">Settle</h4>
              <p className="timeline-desc">
                Consensus model selects the final survivor copy, ready for clip copying.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Minimal Footer */}
        <footer className="minimal-footer">
          <span>Virality Mapper Studio</span>
          <span>&copy; 2026. All rights reserved.</span>
          <div className="flex items-center gap-2" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[10px] font-bold text-zinc-500">Live</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
