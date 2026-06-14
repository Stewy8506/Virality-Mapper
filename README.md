# Virality Mapper - 3-Agent LinkedIn Debate Arena 🚀

An advanced, premium multi-agent LinkedIn post workspace inspired by collaborative human brainstorming. Instead of using pre-defined static personas with a simple single-pass Judge, the system runs **three specialist copywriting agents** concurrently, exposes their drafts to a **bidirectional peer review critique arena**, refines the posts using peer feedback, and synthesizes the absolute best possible viral outcome grounded by **real-time LinkedIn search trends**.

---

## 🏗️ System Architecture & Debate Flow

The core of Virality Mapper is its multi-phase consensus and debate architecture, which mimics a high-performance marketing brainstorm:

```mermaid
graph TD
    A[User Inputs appName, description, tone] --> B[Dynamic Topic Analyzer]
    B -->|Extracts 2-3 Broad Niche Topics| C[Parallel Regional Scraper]
    C -->|Targeting India site:linkedin.com &kl=in-en| D[Live Trends Context]
    
    D --> E[Phase 1: Concurrent Drafting]
    E --> E1[Agent Alpha: Hook & Structure]
    E --> E2[Agent Beta: Analytical & Metrics]
    E --> E3[Agent Gamma: Narrative & Story]
    
    E1 & E2 & E3 --> F[Phase 2: Bidirectional Peer Critique Arena]
    
    F -->|1 -> 2| F12[Alpha critiques Beta]
    F -->|2 -> 1| F21[Beta critiques Alpha]
    F -->|2 -> 3| F23[Beta critiques Gamma]
    F -->|3 -> 2| F32[Gamma critiques Beta]
    F -->|1 -> 3| F13[Alpha critiques Gamma]
    F -->|3 -> 1| F31[Gamma critiques Alpha]
    
    F12 & F21 & F23 & F32 & F13 & F31 --> G[Phase 3: Concurrent Refinement]
    G --> G1[Agent Alpha rewrites post using Beta/Gamma critiques]
    G --> G2[Agent Beta rewrites post using Alpha/Gamma critiques]
    G --> G3[Agent Gamma rewrites post using Alpha/Beta critiques]
    
    G1 & G2 & G3 --> H[Phase 4: Consensus Settle Panel]
    H --> I[Synthesized Ultimate Post & Rationale]
```

### Phase 1: Real-Time Trend Grounding & Drafting
- **Dynamic Topic Analyzer**: Automatically parses user inputs (`appName`, `description`, `targetAudience`) using an LLM model before running search queries. It extracts 2-3 broader, high-volume industry keywords/niche topics, ensuring that brand-new projects still find highly relevant, active post contexts.
- **Parallel Regional Scraper**: Triggers concurrent DuckDuckGo searches for each extracted topic, restricting results to English posts from India (`&kl=in-en` parameter with `site:linkedin.com`) to ground draft copy in localized professional trends.
- **Drafting**: The live search trends are aggregated, deduplicated, and injected into the copywriters' environment. The three specialist agents generate their initial drafts concurrently:
  - **Agent Alpha (Hook & Structure)**: Specializes in scroll-stopping pattern-interrupt hooks, crisp visual breaks, and maximized CTR.
  - **Agent Beta (Analytical & Metrics)**: Focuses on checklists, bold numbers, clear business metrics, and raw value.
  - **Agent Gamma (Narrative & Story)**: Employs the hero's journey, lessons learned, and brand vulnerability.

### Phase 2: Bidirectional Peer Critique Arena
Rather than selecting a draft immediately, the three agents enter a bidirectional critique loop where each agent acts as a reviewer for both of their peers:
1. **Agent Alpha** evaluates and critiques **Agent Beta** (1 → 2) and **Agent Gamma** (1 → 3).
2. **Agent Beta** evaluates and critiques **Agent Alpha** (2 → 1) and **Agent Gamma** (2 → 3).
3. **Agent Gamma** evaluates and critiques **Agent Alpha** (3 → 1) and **Agent Beta** (3 → 2).

Each review scores the draft out of 100 and outlines structural, metric-based, or storytelling critiques.

### Phase 3: Refinement Cycle
Each agent receives the evaluations from their two peers and refines their original post to implement suggested updates, outputting their revised post alongside a change log argument explaining their edits.

### Phase 4: Consensus Settle Panel
The 3 refined drafts, their critique histories, and self-change arguments are consolidated in a final consensus call. The panel acts as a master editor, combining the best pattern-interrupt hooks, metric sections, and narrative sequences into a single copy-ready post.

---

## ✨ Key Features

- **Live Trend Grounding**: Automatically extracts real-time professional hooks and trending structures from LinkedIn posts via parallel regional scrapers (targeted to India).
- **Dynamic Model Selection**: Connect credentials and dynamically retrieve active model lists from various providers.
- **Persistent Post Archive**: Saves all generated runs locally inside your browser's `localStorage`. Review previous generations, browse drafts and peer review ratings, or delete old entries in a clean split-pane history viewer.
- **Stable Tab State Memory**: Navigating between Workspace, Settings, and Agents tabs keeps the generation state, stream readers, and typewriter animations running smoothly in the background without unmounting.
- **Live System Activity logs & Stopwatch**: Exposes an interactive Stopwatch elapsed timer and a dark monospace logs feed. Tracks scraper actions, prompt details, api query durations, quota limits, and automatic exponential backoff retries.
- **Debate Customization**: Configure custom prompts, temperature values, models, and endpoints for each of the three copywriting agents individually.
- **Diverse LLM Providers**: Support for Google Gemini, OpenAI, Anthropic, OpenRouter, local models (Ollama, LM Studio), and custom API proxies.
- **In-App Credentials Manager**: Store API keys securely in `localStorage` (never shared with a backend or database).
- **Interactive Timeline Logs**: Toggle tabs to explore the inner mechanics of the debate: initial drafts, bidirectional critique score sheets, refined drafts, and consolidated outputs.
- **Vercel-Inspired Minimalist UI**: Typographic dark theme focusing on precise whitespace, clean monospace grids, and micro-interactions.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), React, Lucide Icons, Vanilla CSS (Geist typographic style system)
- **Backend**: Next.js API Routes, dynamic LLM proxy integrations (`@google/genai`, `@anthropic-ai/sdk`, `openai`)

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation & Run

1. **Clone the repository and install dependencies**:
   ```bash
   cd Virality-Mapper
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open the workspace**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧠 How to Use the App

1. **Configure Credentials**: 
   Go to the **Settings** tab in the sidebar and enter your API keys (Gemini, OpenAI, etc.). Use the **Test** button to verify the connection is successful.
2. **Customize Agents**: 
   Go to the **Agent Playground** tab to configure your 3 debate agents. Adjust their temperature values, assign different provider endpoints, or modify their system prompt guidelines.
3. **Draft & Trigger Arena**: 
   Go to the **Workspace** tab, input your project details (name, description, target audience, writing tone), and click **Run 3-Agent Debate Arena**.
4. **Inspect the Arena**: 
   Watch the live debate flow compile. Once complete, copy the finalized Consolidated Master Post, and browse through the **Debate Arena Logs** tab panels to see exactly how your post was argued and refined!
