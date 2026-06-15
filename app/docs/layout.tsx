"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X, 
  Terminal, 
  BookOpen, 
  Cpu, 
  Mail, 
  ShieldAlert, 
  Home, 
  RefreshCw,
  Search,
  Hash,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarLink {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  links: SidebarLink[];
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

  const navigation: NavGroup[] = [
    {
      title: "Getting Started",
      links: [
        { title: "About Developer", href: "/docs/about-developer", icon: <Terminal size={13} /> },
        { title: "About Platform", href: "/docs/about", icon: <BookOpen size={13} /> },
        { title: "Contact Developer", href: "/docs/contact", icon: <Mail size={13} /> },
      ],
    },
    {
      title: "Core Architecture",
      links: [
        { title: "Agent Debate Arena", href: "/docs/methodology", icon: <Cpu size={13} /> },
        { title: "RAG & Feedback Loops", href: "/docs/rag-feedback", icon: <RefreshCw size={13} /> },
      ],
    },
    {
      title: "Operations",
      links: [
        { title: "Self-Hosting & API", href: "/docs/self-hosting", icon: <ShieldAlert size={13} /> },
        { title: "Data Handling & Security", href: "/docs/data-handling", icon: <ShieldAlert size={13} /> },
      ],
    },
    {
      title: "Legal & Policies",
      links: [
        { title: "Privacy Policy", href: "/docs/privacy-policy", icon: <ShieldAlert size={13} /> },
        { title: "Terms of Service", href: "/docs/terms", icon: <ShieldAlert size={13} /> },
      ],
    },
  ];

  // Extract page headings dynamically on path change to build Table of Contents (TOC)
  useEffect(() => {
    // Small delay to allow page content DOM hydration
    const timer = setTimeout(() => {
      const elements = Array.from(document.querySelectorAll(".docs-article h2, .docs-article h3"));
      const extracted = elements.map((el) => {
        let id = el.id;
        if (!id) {
          // Generate a clean slug id from header text
          id = el.textContent
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") || "";
          el.id = id;
        }
        return {
          id,
          text: el.textContent || "",
          level: el.tagName === "H2" ? 2 : 3,
        };
      });
      setHeadings(extracted);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Flattened navigation links to search and resolve prev/next targets
  const allLinks = navigation.reduce<SidebarLink[]>((acc, group) => [...acc, ...group.links], []);

  // Filtered Navigation based on search query
  const filteredNavigation = navigation.map((group) => {
    const matchedLinks = group.links.filter((link) =>
      link.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...group, links: matchedLinks };
  }).filter((group) => group.links.length > 0);

  // Retrieve current active link info
  const activeIndex = allLinks.findIndex((l) => l.href === pathname);
  const activeLink = allLinks[activeIndex];
  const activeTitle = activeLink ? activeLink.title : "Documentation";

  // Resolve Prev/Next page links
  const prevLink = activeIndex > 0 ? allLinks[activeIndex - 1] : null;
  const nextLink = activeIndex < allLinks.length - 1 ? allLinks[activeIndex + 1] : null;

  return (
    <div className="docs-layout-container font-sans">
      {/* Mobile Top Header */}
      <header className="docs-mobile-header">
        <Link href="/" className="docs-mobile-brand">
          VM // DOCS
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--zinc-400)", fontWeight: 600 }}>{activeTitle}</span>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ padding: "8px", margin: "0 -8px", color: "var(--zinc-400)", backgroundColor: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Toggle Navigation Menu"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Column 1: Left Navigation Sidebar */}
      <aside className={`docs-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="docs-sidebar-header">
          <Link href="/" className="docs-brand-link">
            <span>// VIRALITY MAPPER</span>
          </Link>
        </div>

        {/* Local Search input */}
        <div className="docs-search-container">
          <Search size={14} className="docs-search-icon" />
          <input
            type="text"
            placeholder="Filter guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="docs-search-input"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--zinc-500)",
                fontSize: "12px",
                display: "flex",
                alignItems: "center"
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        <nav className="docs-sidebar-nav">
          {filteredNavigation.length === 0 ? (
            <div style={{ fontSize: "0.8rem", color: "var(--zinc-500)", padding: "12px 8px" }}>
              No guides match "{searchQuery}"
            </div>
          ) : (
            filteredNavigation.map((group) => (
              <div key={group.title} className="docs-nav-group">
                <span className="docs-nav-group-title">{group.title}</span>
                {group.links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`docs-nav-link ${isActive ? "active" : ""}`}
                    >
                      {link.icon}
                      <span>{link.title}</span>
                    </Link>
                  );
                })}
              </div>
            ))
          )}
        </nav>

        {/* Sidebar Footer links */}
        <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-muted)", paddingTop: "16px" }}>
          <Link 
            href="/workspace" 
            className="docs-nav-link"
            style={{ fontSize: "0.8rem", color: "var(--zinc-400)", display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}
          >
            <Terminal size={12} />
            <span>Launch Workspace</span>
          </Link>
          <Link 
            href="/" 
            className="docs-nav-link"
            style={{ fontSize: "0.8rem", color: "var(--zinc-500)", display: "flex", gap: "8px", alignItems: "center" }}
          >
            <Home size={12} />
            <span>Back to landing page</span>
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 140,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Column 2: Center Article Content */}
      <main className="docs-main-wrapper">
        <div className="docs-content" style={{ display: "flex", gap: "48px", alignItems: "flex-start", maxWidth: "1200px" }}>
          {/* Main Article Body */}
          <div style={{ flexGrow: 1, minWidth: 0, maxWidth: "760px" }}>
            {/* Breadcrumbs */}
            <div 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px", 
                fontSize: "0.75rem", 
                fontFamily: "var(--font-mono)", 
                color: "var(--zinc-500)", 
                marginBottom: "32px" 
              }}
            >
              <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>HOME</Link>
              <span>/</span>
              <span style={{ color: "var(--zinc-400)" }}>DOCS</span>
              <span>/</span>
              <span style={{ color: "var(--accent)" }}>{activeTitle.toUpperCase()}</span>
            </div>

            <article className="docs-article">
              {children}
            </article>

            {/* Previous / Next Article Navigation Footer */}
            {(prevLink || nextLink) && (
              <div className="docs-page-nav">
                {prevLink ? (
                  <Link href={prevLink.href} className="docs-page-nav-link">
                    <span className="docs-page-nav-label">Previous</span>
                    <span className="docs-page-nav-title">
                      <ArrowLeft size={13} />
                      <span>{prevLink.title}</span>
                    </span>
                  </Link>
                ) : (
                  <span />
                )}

                {nextLink ? (
                  <Link href={nextLink.href} className="docs-page-nav-link" style={{ textAlign: "right", alignItems: "flex-end" }}>
                    <span className="docs-page-nav-label">Next Guide</span>
                    <span className="docs-page-nav-title">
                      <span>{nextLink.title}</span>
                      <ArrowRight size={13} />
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
              </div>
            )}
          </div>

          {/* Column 3: Right Table of Contents (TOC) */}
          {headings.length > 0 && (
            <aside className="docs-toc-sidebar">
              <span className="docs-toc-title">On This Page</span>
              <ul className="docs-toc-list">
                {headings.map((heading) => (
                  <li 
                    key={heading.id} 
                    className="docs-toc-item"
                    style={{ paddingLeft: heading.level === 3 ? "12px" : "0px" }}
                  >
                    <a href={`#${heading.id}`} className="docs-toc-link">
                      {heading.level === 3 && (
                        <Hash size={10} className="text-zinc-600 inline mr-1" />
                      )}
                      <span>
                        {heading.level === 3 && heading.text.trim().startsWith("#")
                          ? heading.text.trim().replace(/^#\s*/, "")
                          : heading.text}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
