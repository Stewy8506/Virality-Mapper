"use client";

import { Sparkles, TrendingUp, ArrowRight, Eye, Heart, MessageSquare } from "lucide-react";
import React, { useState } from "react";

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
    scores?: Record<string, number>;
    score?: number;
    critique: string;
  };
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

interface PerformanceAnalyticsProps {
  selectedItem: ArchivedPost;
  editingPerformanceId: string | null;
  setEditingPerformanceId: (id: string | null) => void;
  impressions: number;
  setImpressions: (val: number) => void;
  likes: number;
  setLikes: (val: number) => void;
  comments: number;
  setComments: (val: number) => void;
  handleSavePerformance: (id: string, perfData: { impressions: number; likes: number; comments: number }) => void;
  handleDeleteArchive: (id: string) => void;
  setEditorFormData: (data: {
    appName: string;
    description: string;
    targetAudience: string;
    tone: string;
    hookArchetype: string;
  }) => void;
  setSelectedArchiveId: (id: string | null) => void;
  setResult: (res: GenerationResult | null) => void;
  setActiveTab: (tab: "workspace" | "new-publication" | "agents") => void;
}

export default function PerformanceAnalytics({
  selectedItem,
  editingPerformanceId,
  setEditingPerformanceId,
  impressions,
  setImpressions,
  likes,
  setLikes,
  comments,
  setComments,
  handleSavePerformance,
  handleDeleteArchive,
  setEditorFormData,
  setSelectedArchiveId,
  setResult,
  setActiveTab,
}: PerformanceAnalyticsProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const descriptionText = selectedItem.description || "";
  const isLongDescription = descriptionText.length > 220;

  const getHookArchetypeLabel = (styleSlug: string) => {
    switch (styleSlug) {
      case "organic": return "Organic / Default";
      case "contrarian": return "Contrarian Interrupt (Shock & Debunk)";
      case "vulnerable": return "Vulnerable Disclosure (Failure & Trust)";
      case "value-stash": return "High-Value Stash (Resources & Curation)";
      case "threat-fear": return "Threat & Fear (Risks & Heuristics)";
      default: return styleSlug || "Organic / Default";
    }
  };

  return (
    <div className="analytics-outer-panel font-sans">
      <div className="analytics-header">
        <div className="analytics-title">
          <span>//  Original Prompt Context</span>
        </div>
      </div>

      <div className="typographic-form" style={{ borderTop: "none", marginBottom: 0 }}>
        {/* Row 1 */}
        <div className="form-row">
          <div className="row-num">01 /</div>
          <div className="row-content">
            <span className="row-label">We are building (App / Project Name)</span>
            <div className="minimal-input">{selectedItem.appName}</div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="form-row">
          <div className="row-num">02 /</div>
          <div className="row-content">
            <span className="row-label">What does it do? (Features & Problems Solved)</span>
            <div className="minimal-input" style={{ whiteSpace: "pre-wrap", minHeight: "auto", lineHeight: 1.5 }}>
              {isLongDescription && !isDescriptionExpanded ? (
                <>
                  {descriptionText.slice(0, 220)}...{" "}
                  <button
                    onClick={() => setIsDescriptionExpanded(true)}
                    className="action-pill-btn ml-2"
                    style={{ padding: "2px 8px", fontSize: "0.65rem" }}
                  >
                    Expand
                  </button>
                </>
              ) : (
                <>
                  {descriptionText}{" "}
                  {isLongDescription && (
                    <button
                      onClick={() => setIsDescriptionExpanded(false)}
                      className="action-pill-btn ml-2"
                      style={{ padding: "2px 8px", fontSize: "0.65rem" }}
                    >
                      Collapse
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Row 3 & 4 Grid */}
        <div className="form-row grid-2">
          <div style={{ display: "flex", gap: "24px", alignItems: "start" }}>
            <div className="row-num">03 /</div>
            <div className="row-content">
              <span className="row-label">Target Audience</span>
              <div className="minimal-input">{selectedItem.targetAudience || "General Professionals"}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "24px", alignItems: "start" }}>
            <div className="row-num">04 /</div>
            <div className="row-content">
              <span className="row-label">Writing Tone</span>
              <div className="minimal-input">{selectedItem.tone || "General"}</div>
            </div>
          </div>
        </div>

        {/* Row 5 */}
        <div className="form-row">
          <div className="row-num">05 /</div>
          <div className="row-content">
            <span className="row-label">Hook Archetype</span>
            <div className="minimal-input">{getHookArchetypeLabel(selectedItem.result?.best?.style)}</div>
          </div>
        </div>

        {/* Action Button styled like the new debate button */}
        <button
          onClick={() => {
            setEditorFormData({
              appName: selectedItem.appName,
              description: selectedItem.description,
              targetAudience: selectedItem.targetAudience,
              tone: selectedItem.tone,
              hookArchetype: selectedItem.result?.best?.style || "organic",
            });
            setSelectedArchiveId(null);
            setResult(null);
            setActiveTab("new-publication");
          }}
          className="minimal-submit-btn"
        >
          <span>Clone parameters to Editor</span>
          <ArrowRight size={18} />
        </button>
      </div>

      <div className="feedback-loop-section">
        <div className="feedback-loop-header">
          <div className="feedback-loop-title">
            <TrendingUp size={14} className="text-zinc-400 animate-pulse" />
            <span>Self-Published Analytics (Feedback Loop)</span>
          </div>
          {selectedItem.performance && editingPerformanceId !== selectedItem.id && (
            <button
              onClick={() => {
                setEditingPerformanceId(selectedItem.id);
                setImpressions(selectedItem.performance!.impressions);
                setLikes(selectedItem.performance!.likes);
                setComments(selectedItem.performance!.comments);
              }}
              className="action-pill-btn"
            >
              Edit Metrics
            </button>
          )}
        </div>

        {editingPerformanceId === selectedItem.id ? (
          <div className="flex flex-col gap-4 p-5 rounded-xl border border-zinc-800/60" style={{ background: "var(--background)", borderColor: "var(--border-muted)" }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-wider">Impressions</span>
                <input
                  type="number"
                  className="form-input text-xs h-9 px-3"
                  value={impressions}
                  onChange={(e) => setImpressions(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-wider">Likes</span>
                <input
                  type="number"
                  className="form-input text-xs h-9 px-3"
                  value={likes}
                  onChange={(e) => setLikes(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-wider">Comments</span>
                <input
                  type="number"
                  className="form-input text-xs h-9 px-3"
                  value={comments}
                  onChange={(e) => setComments(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  handleSavePerformance(selectedItem.id, { impressions, likes, comments });
                  setEditingPerformanceId(null);
                }}
                className="custom-btn custom-btn-accent text-[11px] h-8 px-4 flex items-center justify-center cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={() => setEditingPerformanceId(null)}
                className="custom-btn custom-btn-secondary text-[11px] h-8 px-4 flex items-center justify-center cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : selectedItem.performance ? (
          <div>
            <div className="kpi-stats-grid">
              <div className="kpi-stat-card">
                <span className="kpi-stat-number">{selectedItem.performance.impressions.toLocaleString()}</span>
                <span className="kpi-stat-label">
                  <Eye size={12} className="text-zinc-500" />
                  Impressions
                </span>
              </div>
              <div className="kpi-stat-card">
                <span className="kpi-stat-number">{selectedItem.performance.likes.toLocaleString()}</span>
                <span className="kpi-stat-label">
                  <Heart size={12} className="text-zinc-500" />
                  Likes
                </span>
              </div>
              <div className="kpi-stat-card">
                <span className="kpi-stat-number">{selectedItem.performance.comments.toLocaleString()}</span>
                <span className="kpi-stat-label">
                  <MessageSquare size={12} className="text-zinc-500" />
                  Comments
                </span>
              </div>
            </div>

            <div className="kpi-actions-container">
              <button
                onClick={() => handleDeleteArchive(selectedItem.id)}
                className="action-pill-btn action-pill-btn-danger"
              >
                Delete Publication
              </button>
            </div>
          </div>
        ) : (
          <div className="analytics-empty-state">
            <span className="analytics-empty-text font-mono italic">
              No performance metrics recorded for this publication yet. Record them once published to feed the self-improving RAG database.
            </span>
            <div className="analytics-empty-actions">
              <button
                onClick={() => {
                  setEditingPerformanceId(selectedItem.id);
                  setImpressions(0);
                  setLikes(0);
                  setComments(0);
                }}
                className="action-pill-btn"
              >
                + Record Actual Metrics
              </button>
              <button
                onClick={() => handleDeleteArchive(selectedItem.id)}
                className="action-pill-btn action-pill-btn-danger"
              >
                Delete Publication
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

