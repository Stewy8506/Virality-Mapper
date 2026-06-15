"use client";

import { Cpu } from "lucide-react";

interface Persona {
  name: string;
  avatar: string;
  feedback: string;
  scrollStopping: number;
  engagement: number;
  virality: number;
}

interface FocusGroupSimulatorViewProps {
  personas: Persona[];
}

function ScoreProgressBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="minimal-score-bar-group">
      <div className="score-bar-label">
        <span>{label}</span>
        <span>{score}/100</span>
      </div>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function FocusGroupSimulatorView({ personas }: FocusGroupSimulatorViewProps) {
  if (!personas || personas.length === 0) return null;

  return (
    <div className="flex flex-col gap-6" style={{ marginTop: "24px" }}>
      <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "14px" }}>
        <Cpu size={18} className="text-zinc-200" />
        <h3 style={{ fontSize: "1.5rem", fontWeight: 400 }} className="text-white">AI Target Audience Focus Group (A/B Test Simulation)</h3>
      </div>

      <div className="focus-group-list max-w-4xl mx-auto w-full">
        {personas.map((persona, idx) => {
          const avgScore = Math.round((persona.scrollStopping + persona.engagement + persona.virality) / 3);
          return (
            <div key={idx} className="focus-group-row">
              <div className="row-num">{String(idx + 1).padStart(2, "0")} /</div>
              <div className="focus-group-main">
                <div className="focus-group-header">
                  <div className="persona-info-group">
                    <div className="persona-avatar">
                      {persona.avatar || "👤"}
                    </div>
                    <span className="persona-name">{persona.name}</span>
                  </div>
                  <span className="persona-overall-score">OVERALL SCORE: {avgScore}/100</span>
                </div>

                <p className="persona-feedback">
                  &ldquo;{persona.feedback}&rdquo;
                </p>

                <div className="persona-metric-bars">
                  <ScoreProgressBar label="Scroll Stopping" score={persona.scrollStopping} />
                  <ScoreProgressBar label="Likelihood to Comment" score={persona.engagement} />
                  <ScoreProgressBar label="Virality (Share Rate)" score={persona.virality} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
