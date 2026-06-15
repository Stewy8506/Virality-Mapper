"use client";

import { ReactLenis } from "lenis/react";
import { ReactNode, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";

export default function LenisProvider({ children }: { children: ReactNode }) {
  const [shouldDisableSmoothScroll, setShouldDisableSmoothScroll] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    const updateScrollPreference = (matches: boolean) => {
      requestAnimationFrame(() => {
        setShouldDisableSmoothScroll(matches);
      });
    };

    updateScrollPreference(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      updateScrollPreference(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.2,
        smoothWheel: !shouldDisableSmoothScroll,
        wheelMultiplier: 1.0,
      }}
    >
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    </ReactLenis>
  );
}
