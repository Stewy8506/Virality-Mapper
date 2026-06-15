"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Monitor, BookOpen, Home, Smartphone, Lock } from "lucide-react";

export default function MobileBlocker({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Landing page ("/") and docs ("/docs", "/docs/...") are allowed on mobile.
  // All other pages (like "/workspace", "/privacy") show the mobile blocker.
  const isBlocked = pathname !== "/" && !pathname.startsWith("/docs");

  // If path is not blocked, render the page content immediately.
  if (!isBlocked) {
    return <>{children}</>;
  }

  return (
    <div className={`mobile-blocker-root ${isBlocked ? "is-blocked" : ""}`}>
      {/* 
        We keep children in the DOM during SSR and client initial mount.
        CSS media queries hide children on viewports <= 767px when .is-blocked is active.
        This prevents hydration mismatch and ensures immediate blocking without visual flashes.
      */}
      <div className="mobile-blocker-page-content">
        {children}
      </div>

      <div className="mobile-blocker-overlay">
        <div className="mobile-blocker-bg-ambient" />
        
        <motion.div 
          className="mobile-blocker-card"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mobile-blocker-accent-glow" />
          
          {/* Animated Graphic Stack */}
          <div className="mobile-blocker-graphic">
            <motion.div
              className="graphic-desktop"
              animate={{ 
                y: [0, -4, 4, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Monitor size={54} className="icon-desktop" />
            </motion.div>
            
            <motion.div 
              className="graphic-phone"
              animate={{ 
                x: [0, 2, -2, 0],
                y: [0, 4, -4, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <Smartphone size={32} className="icon-phone" />
              <div className="phone-lock-badge">
                <Lock size={10} />
              </div>
            </motion.div>
          </div>

          <div className="mobile-blocker-badge">
            <span className="badge-pulse" />
            <span>DESKTOP ENGINE REQUIRED</span>
          </div>

          <h1 className="mobile-blocker-title">Coming Soon on Mobile</h1>
          
          <p className="mobile-blocker-text">
            The Vantage AI workspace utilizes multi-agent consensus panels and real-time scrapers designed for desktop viewports. Mobile support is currently under development.
          </p>

          <div className="mobile-blocker-specs">
            <div className="spec-item">
              <span className="spec-label">Min Width</span>
              <span className="spec-value">768px</span>
            </div>
            <div className="spec-divider" />
            <div className="spec-item">
              <span className="spec-label">Optimal</span>
              <span className="spec-value">1280px+</span>
            </div>
          </div>

          <div className="mobile-blocker-divider" />

          <div className="mobile-blocker-actions">
            <Link href="/" className="btn-blocker btn-primary">
              <Home size={16} />
              <span>Return to Home</span>
            </Link>
            
            <Link href="/docs/about" className="btn-blocker btn-secondary">
              <BookOpen size={16} />
              <span>Explore Guides</span>
            </Link>
          </div>
        </motion.div>

        <footer className="mobile-blocker-footer">
          <span>VM // Desktop Environment v1.0.4</span>
        </footer>
      </div>
    </div>
  );
}
