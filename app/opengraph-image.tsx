import { ImageResponse } from "next/og";

export const alt = "Virality Mapper - AI LinkedIn Copywriting Arena";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          backgroundImage: "radial-gradient(circle at 600px 315px, rgba(255, 255, 255, 0.04) 0%, transparent 60%), linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 240px 100%",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "80px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Logo Brand Tag matching current UI */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "50px",
            }}
          >
            {/* Logo stack */}
            <div style={{ display: "flex", position: "relative", width: "42px", height: "42px", marginRight: "16px" }}>
              {/* Third logo (bottom-most) */}
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", left: "8px", top: "8px", opacity: 0.25, color: "#ffffff" }}>
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2.5" fill="#09090b" />
                <line x1="20" y1="20" x2="27" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="20" x2="13" y2="27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="20" x2="13" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="20" cy="20" r="3.5" fill="currentColor" />
                <circle cx="27" cy="13" r="2.5" fill="currentColor" />
                <circle cx="13" cy="27" r="2.5" fill="currentColor" />
                <circle cx="13" cy="14" r="2.5" fill="currentColor" />
              </svg>
              {/* Second logo */}
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", left: "4px", top: "4px", opacity: 0.5, color: "#ffffff" }}>
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2.5" fill="#09090b" />
                <line x1="20" y1="20" x2="27" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="20" x2="13" y2="27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="20" x2="13" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="20" cy="20" r="3.5" fill="currentColor" />
                <circle cx="27" cy="13" r="2.5" fill="currentColor" />
                <circle cx="13" cy="27" r="2.5" fill="currentColor" />
                <circle cx="13" cy="14" r="2.5" fill="currentColor" />
              </svg>
              {/* First logo (top-most) */}
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", left: "0px", top: "0px", color: "#ffffff" }}>
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2.5" fill="#09090b" />
                <line x1="20" y1="20" x2="27" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="20" x2="13" y2="27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="20" x2="13" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="20" cy="20" r="3.5" fill="currentColor" />
                <circle cx="27" cy="13" r="2.5" fill="currentColor" />
                <circle cx="13" cy="27" r="2.5" fill="currentColor" />
                <circle cx="13" cy="14" r="2.5" fill="currentColor" />
              </svg>
            </div>
            <span
              style={{
                color: "#ffffff",
                fontSize: "24px",
                fontWeight: "700",
                letterSpacing: "3px",
              }}
            >
              VIRALITY MAPPER
            </span>
          </div>

          {/* Main Hook Title */}
          <div
            style={{
              fontSize: "68px",
              fontWeight: "900",
              color: "#ffffff",
              lineHeight: "1.1",
              letterSpacing: "-2px",
              marginBottom: "28px",
              display: "flex",
            }}
          >
            Settle the copy. Dominate the feed.
          </div>

          {/* Sub-Description matching current landing page */}
          <div
            style={{
              fontSize: "26px",
              color: "#a1a1aa",
              lineHeight: "1.5",
              maxWidth: "960px",
              display: "flex",
            }}
          >
            Stop guessing LinkedIn performance. Put specialist AI copywriters in a peer-critique debate arena, ground drafts against real-time feed trends, and output the survivor copy.
          </div>
        </div>

        {/* Feature Tags matching 4 modules with custom SVG icons (no font/emoji bugs) */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "28px 40px",
            color: "#ffffff",
            fontSize: "20px",
            fontWeight: "600",
            letterSpacing: "0.5px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="#f43f5e"
              style={{ marginRight: "10px" }}
            >
              <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2Z" />
            </svg>
            <span>AI Copywriter Debate</span>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="#10b981"
              style={{ marginRight: "10px" }}
            >
              <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2Z" />
            </svg>
            <span>Self-Improving RAG</span>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="#a855f7"
              style={{ marginRight: "10px" }}
            >
              <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2Z" />
            </svg>
            <span>Audience Testing</span>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="#3b82f6"
              style={{ marginRight: "10px" }}
            >
              <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2Z" />
            </svg>
            <span>LinkedIn Trend Grounding</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
