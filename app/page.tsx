"use client";

import { useState } from "react";
import PostGeneratorForm from "@/components/PostGeneratorForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import { Sparkles } from "lucide-react";

interface Variant {
  id: number;
  style: string;
  content: string;
  score: number;
  critique: string;
}

export default function Home() {
  const [variants, setVariants] = useState<Variant[]>([]);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--background)" }}>
      {/* Sticky Premium Header */}
      <header className="header-glass">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", maxWidth: "960px", margin: "0 auto" }}>
          <div className="flex items-center gap-2" style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>
            <div className="glass" style={{ padding: "4px", display: "inline-flex", borderRadius: "6px", background: "var(--zinc-800)", borderColor: "var(--zinc-700)" }}>
              <Sparkles style={{ color: "var(--accent)" }} size={14} />
            </div>
            <span>Virality <span className="serif-italic" style={{ color: "var(--accent)" }}>Mapper</span></span>
            <span style={{ color: "var(--accent)", marginLeft: "-4px" }}>•</span>
          </div>

          <div className="flex items-center gap-4">
            <span style={{ color: "var(--zinc-400)", fontSize: "0.85rem", cursor: "pointer", fontWeight: 500, transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "white"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--zinc-400)"}>Sign In</span>
            <button className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: "0.8rem", borderRadius: "4px" }}>
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container flex-col items-center justify-center" style={{ maxWidth: "960px", margin: "0 auto", padding: "32px 20px 48px" }}>
        
        {/* Hero Banner */}
        <div className="text-center animate-fade-in" style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)", fontWeight: 800, marginBottom: "12px", lineHeight: 1.15, letterSpacing: "-0.03em" }}>
            Virality <span className="serif-italic" style={{ color: "var(--accent)" }}>Mapper</span>
          </h1>
          
          <p style={{ fontSize: "0.95rem", color: "var(--zinc-400)", maxWidth: "550px", margin: "0 auto 20px", lineHeight: 1.5 }}>
            Analyze top LinkedIn trends in real-time and generate highly optimized, viral posts designed to engage and convert.
          </p>

          {/* Minimalist Status Bar */}
          <div className="flex justify-center">
            <div className="status-bar">
              <span className="status-dot"></span>
              <span>Scanning 50+ LinkedIn Formats</span>
              <span style={{ color: "var(--zinc-700)" }}>•</span>
              <span>Tone Adaptive</span>
              <span style={{ color: "var(--zinc-700)" }}>•</span>
              <span>AI Verified</span>
            </div>
          </div>
        </div>

        {/* Form component section */}
        <div id="generator" style={{ scrollMarginTop: "80px", width: "100%" }}>
          <PostGeneratorForm onGenerate={(data) => setVariants(data)} />
        </div>
        
        {/* Results output section */}
        {variants.length > 0 && <ResultsDisplay variants={variants} />}
      </main>

      {/* Premium Footer */}
      <footer style={{ marginTop: "auto", borderTop: "1px solid var(--zinc-800)", background: "#050505" }}>
        <div className="container" style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", padding: "24px 20px", maxWidth: "960px", margin: "0 auto", textAlign: "center" }}>
          <div className="flex items-center gap-2" style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.02em" }}>
            <div className="glass" style={{ padding: "4px", display: "inline-flex", borderRadius: "4px", background: "var(--zinc-800)" }}>
              <Sparkles style={{ color: "var(--accent)" }} size={10} />
            </div>
            <span>Virality <span className="serif-italic" style={{ color: "var(--accent)" }}>Mapper</span></span>
          </div>
          <p style={{ color: "var(--zinc-500)", fontSize: "0.75rem" }}>
            © {new Date().getFullYear()} Virality Mapper. All rights reserved. High-fidelity AI LinkedIn content optimization.
          </p>
          <div className="flex gap-4" style={{ color: "var(--zinc-500)", fontSize: "0.75rem" }}>
            <span style={{ cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.color = "white"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--zinc-500)"}>Privacy</span>
            <span style={{ cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.color = "white"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--zinc-500)"}>Terms</span>
            <span style={{ cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.color = "white"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--zinc-500)"}>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
