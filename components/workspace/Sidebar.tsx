"use client";

import Link from "next/link";
import { Activity, ChevronRight, ChevronLeft, Plus, LayoutDashboard, Sliders, Search, Settings } from "lucide-react";
import React from "react";

interface UserPreferences {
  linkedinName: string;
  linkedinHeadline: string;
  linkedinAvatar: string;
}

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
  result: GenerationResult;
}

interface SidebarProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  activeTab: "workspace" | "new-publication" | "agents";
  setActiveTab: (tab: "workspace" | "new-publication" | "agents") => void;
  selectedArchiveId: string | null;
  setSelectedArchiveId: (id: string | null) => void;
  setResult: (result: GenerationResult | null) => void;
  archive: ArchivedPost[];
  archiveSearch: string;
  setArchiveSearch: (search: string) => void;
  activeAgentsCount: number;
  preferences: UserPreferences;
  setIsSettingsOpen: (open: boolean) => void;
}

export default function Sidebar({
  isSidebarCollapsed,
  toggleSidebar,
  isMobileOpen = false,
  onMobileClose,
  activeTab,
  setActiveTab,
  selectedArchiveId,
  setSelectedArchiveId,
  setResult,
  archive,
  archiveSearch,
  setArchiveSearch,
  activeAgentsCount,
  preferences,
  setIsSettingsOpen,
}: SidebarProps) {
  const navigate = (tab: "workspace" | "new-publication" | "agents") => {
    setActiveTab(tab);
    onMobileClose?.();
  };

  const filteredArchive = archive.filter(item =>
    item.appName.toLowerCase().includes(archiveSearch.toLowerCase()) ||
    item.description.toLowerCase().includes(archiveSearch.toLowerCase()) ||
    (item.result?.best?.content || "").toLowerCase().includes(archiveSearch.toLowerCase())
  );

  return (
    <aside className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`} role="navigation" aria-label="Workspace navigation">
      <div className="flex flex-col gap-6 flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Header & toggle menu */}
        <div className="flex items-center justify-between w-full sidebar-header-container">
          <Link href="/" className="brand-text" style={{ textDecoration: "none", cursor: "pointer" }}>
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-zinc-300" />
              <span className="font-semibold tracking-tight">Virality Mapper</span>
            </div>
          </Link>
          <button
            onClick={toggleSidebar}
            className="sidebar-toggle-btn"
            title={isSidebarCollapsed ? "Expand Sidebar (Ctrl + \\)" : "Collapse Sidebar (Ctrl + \\)"}
          >
            {isSidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* New publication trigger */}
        <button
          className="custom-btn custom-btn-accent w-full flex items-center gap-2 new-pub-btn"
          onClick={() => {
            setSelectedArchiveId(null);
            setResult(null);
            navigate("new-publication");
          }}
          style={{ padding: "12px 18px", fontSize: "0.82rem" }}
          title="Create New Publication"
        >
          <Plus size={15} />
          <span>New Publication</span>
        </button>

        {/* Main navigation links */}
        <nav>
          <div
            className={`nav-item ${activeTab === "workspace" && !selectedArchiveId ? "active" : ""}`}
            onClick={() => {
              setSelectedArchiveId(null);
              navigate("workspace");
            }}
            title="Workspace Control Hub"
          >
            <LayoutDashboard size={16} />
            <span>Workspace</span>
          </div>
          <div
            className={`nav-item ${activeTab === "agents" ? "active" : ""}`}
            onClick={() => navigate("agents")}
            title="Specialist Agents"
          >
            <Sliders size={16} />
            <span>Specialist Agents</span>
          </div>
        </nav>

        {/* Historical Saved Publications integrated */}
        <div className="flex flex-col gap-2 flex-1 overflow-hidden sidebar-archive-list" style={{ borderTop: "1px solid var(--border-muted)", paddingTop: "16px", minHeight: 0 }}>
          <div className="text-[10px] font-mono font-semibold uppercase text-zinc-500 tracking-wider mb-1 px-2 flex items-center justify-between">
            <span>Saved History</span>
            {archive.length > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold">{archive.length}</span>}
          </div>

          {/* Filter Search */}
          {archive.length > 0 && (
            <div className="relative px-2 mb-1 flex items-center">
              <Search size={12} className="absolute left-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter history..."
                value={archiveSearch}
                onChange={(e) => setArchiveSearch(e.target.value)}
                className="form-input text-xs w-full pl-7 py-1.5"
                style={{
                  borderRadius: "8px",
                  height: "28px",
                  background: "rgba(0, 0, 0, 0.15)",
                  border: "1px solid var(--border-muted)"
                }}
              />
            </div>
          )}

          {filteredArchive.length === 0 ? (
            <div className="text-[10px] text-zinc-500 italic px-2 py-3 leading-normal">
              {archive.length === 0 ? "No publications saved yet." : "No matching records found."}
            </div>
          ) : (
            <div className="flex flex-col overflow-y-auto pr-1 flex-1" style={{ minHeight: 0 }}>
              {filteredArchive.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedArchiveId(item.id);
                    setResult(item.result);
                    navigate("workspace");
                  }}
                  className={`sidebar-archive-item ${selectedArchiveId === item.id ? "active" : ""}`}
                >
                  <span className="archive-item-num">{String(idx + 1).padStart(2, "0")} /</span>
                  <span className="archive-item-name">{item.appName}</span>
                  <span className="archive-item-date">{item.timestamp.split(",")[0]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Info/Stats Widget merged above profile */}
      {!isSidebarCollapsed && (
        <div className="sidebar-footer-widget flex flex-col gap-1 font-mono text-[9px] text-zinc-500 px-3 py-2 mb-2 mt-auto" style={{ borderTop: "1px solid var(--border-muted)" }}>
          <div className="flex justify-between">
            <span>POOL:</span>
            <span className="text-zinc-400 font-bold">{activeAgentsCount} ACTIVE</span>
          </div>
          <div className="flex justify-between">
            <span>ENGINE:</span>
            <span className="text-zinc-400 font-bold">DEBATE SETTLE</span>
          </div>
        </div>
      )}

      {/* Profile Card & Settings trigger at the bottom of the sidebar */}
      {!isSidebarCollapsed ? (
        <div className="sidebar-profile">
          <div className="sidebar-profile-info cursor-pointer" onClick={() => setIsSettingsOpen(true)}>
            <div className="sidebar-profile-avatar">
              {preferences.linkedinAvatar || "💡"}
            </div>
            <div className="sidebar-profile-meta">
              <span className="sidebar-profile-name">
                {preferences.linkedinName || "AI Copywriter"}
              </span>
              <span className="sidebar-profile-headline">
                {preferences.linkedinHeadline || "Consensus strategist"}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="sidebar-profile-btn"
            title="Settings & Configurations"
          >
            <Settings size={15} className="transition-transform duration-300 hover:rotate-90" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="sidebar-profile-collapsed-btn"
          title="Settings & Configurations"
        >
          {preferences.linkedinAvatar || "💡"}
        </button>
      )}
    </aside>
  );
}
