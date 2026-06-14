export interface ViralPost {
  id: string;
  title: string;
  niche: string;
  tags: string[];
  metrics: {
    likes: number;
    comments: number;
    reposts: number;
  };
  content: string;
  structure: {
    hook: string;
    body: string;
    cta: string;
    metaphor: string;
  };
}

export const VIRAL_POSTS_DB: ViralPost[] = [
  {
    id: "saas-bootstrapping-decay",
    title: "LinkShelf Urgency & Decay Launch",
    niche: "SaaS & Bootstrapping",
    tags: ["saas", "bootstrapping", "productivity", "development", "local-first"],
    metrics: { likes: 1420, comments: 284, reposts: 98 },
    structure: {
      hook: "Mid-thought pattern-interrupt exposing a common pain point: information accumulation debt.",
      body: "Contrast of traditional 'hope-driven development' with a forced-action local-first solution. Uses concrete metric proof (M3 Max, 12ms UI paint, 0ms egress).",
      cta: "Low-friction request to drop a comment to receive a DM with documentation.",
      metaphor: "Information as a perishable asset."
    },
    content: `We stopped relying on hope-driven development to manage our research archives.

Most apps let saved links rot in a black hole.

So we built LinkShelf to treat information as a perishable asset that forces synthesis.

[Insert 5-sec GIF: A link card shifts from vibrant green to desaturated red over 7 days of inactivity, visually signaling urgency]

We replaced accumulation with forced-action decay to eliminate cognitive technical debt.

Here is what we measured on an M3 Max:

⚡ 12ms UI paint: We offloaded decay-curve calculations to Riverpod streams for zero-jank interaction.
🛡️ 0ms egress: We kept the engine local-first, ensuring 1.2M SQLite entries never touch a third-party cloud.

We are opening the repo to a few more hands.

Drop a comment and we will DM you the docs.

Hot take: Relying on cloud tools for sensitive IP visualization is an unacceptable security gamble. Agree or disagree?`
  },
  {
    id: "tech-design-systems",
    title: "The Silent Death of UI Design Systems",
    niche: "Design & Frontend Development",
    tags: ["design", "frontend", "uiux", "webdev", "tailwind", "framer"],
    metrics: { likes: 2105, comments: 342, reposts: 180 },
    structure: {
      hook: "Aggressive, counter-intuitive opening challenging a standard industry practice.",
      body: "Chronological breakdown of design debt and standard template bloat. Lists performance stats on web rendering and component bloat.",
      cta: "Asking readers to leave a comment for a copy of the design system architecture blueprint.",
      metaphor: "Component libraries as digital plaque."
    },
    content: `Your design system is slowly killing your product velocity.

We started with 12 simple button variants.

Three years later, we have 450+ styled components, 18 conflicting typography tokens, and a bundle size that takes 4.2 seconds to parse on mobile.

We didn't build a design system. We built a digital graveyard.

[Insert 5-sec GIF: A clean UI screen rendering instantly vs a bloated framework lagging on button clicks]

So we rebuilt our frontend library from scratch. We stripped the UI down to 8 primitive tokens and enforced a strict single-in, single-out rule.

Here is the technical reality of the migration:

🎨 80% bundle reduction: Dropped custom CSS payload from 320kb to 64kb.
🚀 0.1s Time-to-Interactive: Eliminated runtime Tailwind parser calculations.
🎨 Absolute consistency: Forced dev teams to write zero utility-class overrides.

We documented the exact system architecture we used to align 40+ developers.

Comment "CLEAN" below and we will send you the PDF architecture guide.

Hot take: Most startups don't need a custom design system—they need a single page of strict CSS variables. Agree or disagree?`
  },
  {
    id: "solopreneur-database-local",
    title: "Why We Ditched Cloud Databases for Local SQLite",
    niche: "Software Architecture & Database",
    tags: ["database", "sqlite", "local-first", "backend", "architecture", "postgres"],
    metrics: { likes: 3840, comments: 612, reposts: 412 },
    structure: {
      hook: "Direct financial/operational punch revealing a major infrastructure migration.",
      body: "Compares high AWS RDS bills and latency to a local-first SQLite architecture. Gives hard performance metrics.",
      cta: "Drop a comment to receive our local-first syncing script repo.",
      metaphor: "Cloud architecture as a high-tax state."
    },
    content: `We deleted our cloud database cluster and saved $1,200/month.

No Postgres. No Redis cluster. No complex serverless connection pooling.

We migrated the entire application to local-first SQLite databases running directly in the browser and syncing via CRDTs.

[Insert 5-sec GIF: Network tab showing zero database query latency vs traditional 180ms roundtrip delay]

Most SaaS applications query the database on every user interaction.

We decided to keep the data 1mm away from the user's cursor.

Here is the telemetry data from our production release:

⚡ 0.8ms DB queries: Reads and writes happen in local memory, eliminating network hops.
🔋 Offline capability: The entire app works on a flight at 35,000 feet, syncing seamlessly upon landing.
💸 Zero server scaling limits: Our server infrastructure costs are now flat at $40/month.

We are sharing the synchronization scripts we wrote to handle automatic merge conflicts.

Comment "SYNC" and we will DM you the GitHub repository.

Hot take: 90% of user data does not need to live in a centralized cloud database. Agree or disagree?`
  },
  {
    id: "ai-prompt-engineering",
    title: "AI Prompting is a Leaky Abstraction",
    niche: "AI Development",
    tags: ["ai", "prompting", "llm", "software-engineering", "anthropic", "openai"],
    metrics: { likes: 1890, comments: 245, reposts: 130 },
    structure: {
      hook: "Philosophical but technical challenge to a trending tech job category.",
      body: "Details the shift from 'wishful thinking' prompting to deterministic pipeline programming with structural checks.",
      cta: "Comment to get a copy of our TS agent pipeline library.",
      metaphor: "Prompt engineering as shouting at computers."
    },
    content: `Prompt engineering is a temporary band-aid on a structural software engineering problem.

We spent months writing 2,000-word system instructions, hoping our LLM would output valid JSON.

It worked 95% of the time. The other 5% it broke our production parser.

So we replaced "polite instructions" with strict schema validation and multi-agent debate pipelines.

[Insert 5-sec GIF: Interactive dashboard showing agent outputs being parsed, validated, and self-corrected]

We stopped treating LLMs like human copywriters and started treating them like deterministic state machines.

Here is the architecture we built:

🛡️ 100% JSON compliance: Integrated Zod schemas directly inside the API gateway for auto-reject.
🧠 3-Agent Arena: Expose drafts to peer feedback to correct tone before execution.
📉 40% Token savings: Shrunk instructions by delegating tasks to single-purpose subagents.

We wrote a lightweight TypeScript library to manage this multi-agent consensus workflow.

If you want the source code, comment "ARENA" and we will DM you the link.

Hot take: If your system architecture relies on the LLM being 'polite' or 'understanding' context, it is broken. Agree or disagree?`
  },
  {
    id: "career-engineering-efficiency",
    title: "Stop Attending Status Update Meetings",
    niche: "Engineering Leadership",
    tags: ["management", "productivity", "remote", "engineering", "careers", "culture"],
    metrics: { likes: 5120, comments: 812, reposts: 670 },
    structure: {
      hook: "Relatable workplace policy challenge designed to trigger strong opinions.",
      body: "Contrasts calendar sync meetings with asynchronous text-based summaries. Measures time savings and dev focus.",
      cta: "Comment below to receive our team's async status markdown template.",
      metaphor: "Meetings as productivity tax."
    },
    content: `We cancelled every daily status update meeting.

We didn't replace them with Slack standups.

We built a simple dashboard that parses commit logs and updates team progress asynchronously.

[Insert 5-sec GIF: Calendar transforming from blocked red meetings to wide-open blue focus blocks]

Status update meetings do not exist to coordinate work.

They exist to reassure managers who don't read the code.

Here is what happened to our engineering velocity:

⏰ 18 hours returned: Every engineer gained nearly a full day of uninterrupted focus time per week.
🚀 3.2x Deploy frequency: Developers ship code when it's ready, rather than waiting for morning sign-offs.
🔋 Improved morale: Engineers feel trusted, and manager anxiety is resolved by commit telemetry.

We open-sourced our Slack/GitHub sync script that compiles these async digests automatically.

Comment "FOCUS" and we will send you the repository guide.

Hot take: If you need a daily call to know what your developers are doing, you have a hiring or trust problem. Agree or disagree?`
  }
];

export function findRelevantViralPosts(topics: string[]): ViralPost[] {
  if (!topics || topics.length === 0) {
    return VIRAL_POSTS_DB.slice(0, 3);
  }

  // Basic keyword relevance matching
  const scored = VIRAL_POSTS_DB.map(post => {
    let score = 0;
    const postText = (post.title + " " + post.niche + " " + post.tags.join(" ") + " " + post.content).toLowerCase();
    
    topics.forEach(topic => {
      const cleanTopic = topic.toLowerCase().trim();
      if (postText.includes(cleanTopic)) {
        score += 3;
      }
      // Check partial matches
      const words = cleanTopic.split(/\s+/);
      words.forEach(word => {
        if (word.length > 3 && postText.includes(word)) {
          score += 1;
        }
      });
    });
    
    return { post, score };
  });

  // Sort by score desc, then by likes count
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.post.metrics.likes - a.post.metrics.likes;
  });

  return scored.slice(0, 3).map(item => item.post);
}
