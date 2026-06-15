"use client";

import React from "react";

interface DebateTimelineProps {
  activeStep: number;
}

export default function DebateTimeline({ activeStep }: DebateTimelineProps) {
  return (
    <div className="w-full mb-6">
      <div className="horizontal-timeline">
        <div className="horizontal-timeline-line" />

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
  );
}
