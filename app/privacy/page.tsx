import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Virality Mapper handles your data and API keys.",
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px", color: "var(--foreground)" }}>
      <Link href="/" style={{ fontSize: "0.875rem", color: "var(--zinc-400)" }}>← Back to home</Link>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "24px 0 16px" }}>Privacy Policy</h1>
      <p style={{ color: "var(--zinc-400)", lineHeight: 1.7, marginBottom: "24px" }}>
        Last updated: June 2026
      </p>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "12px" }}>API Keys</h2>
        <p style={{ color: "var(--zinc-300)", lineHeight: 1.7 }}>
          By default, API keys you enter in Settings are stored in your browser&apos;s localStorage on your device.
          They are sent to the server only when you initiate a generation request. For self-hosted deployments,
          you can configure keys as server environment variables so they never leave the server.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "12px" }}>Generated Content & Archive</h2>
        <p style={{ color: "var(--zinc-300)", lineHeight: 1.7 }}>
          All generated posts, critique logs, and performance metrics are stored locally in your browser.
          No content is uploaded to a central database unless you explicitly export it.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "12px" }}>Third-Party Services</h2>
        <p style={{ color: "var(--zinc-300)", lineHeight: 1.7 }}>
          When you configure LLM providers (OpenAI, Anthropic, Google, etc.), your prompts are sent directly to those
          providers using your API keys. Trend grounding may query search engines (Yahoo, DuckDuckGo) or SerpApi if configured.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "12px" }}>Contact</h2>
        <p style={{ color: "var(--zinc-300)", lineHeight: 1.7 }}>
          Questions? Reach out via the repository or project maintainer.
        </p>
      </section>
    </main>
  );
}
