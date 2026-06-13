"use client";

import { Copy, TrendingUp, CheckCircle2, Award, Zap } from "lucide-react";
import { useState } from "react";

interface Variant {
  id: number;
  style: string;
  content: string;
  score: number;
  critique: string;
}

export default function ResultsDisplay({ variants }: { variants: Variant[] }) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = async (id: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const getCardStyleClass = (style: string) => {
    const lowercase = style.toLowerCase();
    if (lowercase.includes("story")) return "card-story";
    if (lowercase.includes("value") || lowercase.includes("metric") || lowercase.includes("data")) return "card-metrics";
    if (lowercase.includes("contrarian") || lowercase.includes("take") || lowercase.includes("hot")) return "card-contrarian";
    return "card-standard";
  };

  const getBadgeStyleClass = (style: string) => {
    const lowercase = style.toLowerCase();
    if (lowercase.includes("story")) return "badge-story";
    if (lowercase.includes("value") || lowercase.includes("metric") || lowercase.includes("data")) return "badge-metrics";
    if (lowercase.includes("contrarian") || lowercase.includes("take") || lowercase.includes("hot")) return "badge-contrarian";
    return "badge-standard";
  };

  if (!variants || variants.length === 0) return null;

  return (
    <div className="flex-col gap-4 mt-8 animate-fade-in" style={{ width: "100%", maxWidth: "680px", margin: "32px auto 0" }}>
      
      <div className="flex justify-center items-center gap-2 mb-4">
        <div className="glass" style={{ padding: "4px", display: "inline-flex", background: "var(--zinc-800)", borderRadius: "4px" }}>
          <Zap style={{ color: "var(--accent)" }} size={14} />
        </div>
        <h2 className="text-center" style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Generated Post Variants
        </h2>
      </div>

      <div className="grid">
        {variants.map((variant, index) => {
          const cardClass = getCardStyleClass(variant.style);
          const badgeClass = getBadgeStyleClass(variant.style);
          const varId = variant.id || index;

          return (
            <div 
              key={varId} 
              className={`glass p-6 ${cardClass}`} 
              style={{ 
                animationDelay: `${index * 0.1}s`,
                position: "relative"
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <span className={`badge ${badgeClass}`}>
                  <span className="badge-dot"></span>
                  {variant.style}
                </span>
                <div className="flex items-center gap-1.5" style={{ color: "var(--zinc-400)", fontWeight: 600, fontSize: "0.8rem" }}>
                  <TrendingUp size={14} style={{ color: "var(--accent)" }} />
                  <span>Score: {variant.score}/100</span>
                </div>
              </div>

              {/* Text Area styling to look like a clean editor panel */}
              <div 
                className="mb-4 p-4" 
                style={{ 
                  background: "#060608", 
                  border: "1px solid var(--zinc-800)",
                  borderRadius: "6px", 
                  whiteSpace: "pre-wrap",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                  color: "#d4d4d8",
                  boxShadow: "inset 0 1px 4px rgba(0,0,0,0.4)"
                }}
              >
                {variant.content}
              </div>

              {/* Critique Block with elegant serif italic style */}
              <div 
                className="mb-4" 
                style={{ 
                  fontSize: "0.85rem", 
                  color: "var(--zinc-400)", 
                  borderLeft: "2px solid var(--zinc-800)", 
                  paddingLeft: "12px",
                  lineHeight: 1.45
                }}
              >
                <div className="flex items-center gap-1.5 mb-1" style={{ color: "var(--zinc-500)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.02em", textTransform: "uppercase" }}>
                  <Award size={10} style={{ color: "var(--accent)" }} />
                  <span>AI Critique</span>
                </div>
                <p className="serif-italic" style={{ fontStyle: "italic" }}>
                  {variant.critique}
                </p>
              </div>

              <button 
                className="btn btn-secondary" 
                style={{ width: "100%", borderRadius: "6px", padding: "8px 16px", height: "36px", fontSize: "0.8rem" }}
                onClick={() => copyToClipboard(varId, variant.content)}
              >
                {copiedId === varId ? (
                  <>
                    <CheckCircle2 size={14} style={{ color: "var(--accent)" }} />
                    <span style={{ fontWeight: 700, color: "var(--accent)" }}>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Content</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
