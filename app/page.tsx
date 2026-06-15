import LandingPageClient from "@/components/landing/LandingPageClient";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Virality Mapper",
  operatingSystem: "All",
  applicationCategory: "BusinessApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description: "Stop guessing LinkedIn performance. Put specialist AI copywriters in a peer-critique debate arena, ground drafts against live search trends, and output the survivor copy.",
  featureList: [
    "3-Agent Copywriting debate panel",
    "Bidirectional peer review critique arena",
    "Live search trend grounding with scraper fallbacks",
    "Simulated Focus Group target audience persona testing",
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How is Virality Mapper different from ChatGPT?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Instead of a single AI pass, Virality Mapper runs three specialist copywriters through a bidirectional critique arena, then synthesizes the best elements into one post grounded in live LinkedIn search trends.",
      },
    },
    {
      "@type": "Question",
      name: "Where are my API keys stored?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "API keys are stored locally in your browser. For hosted deployments, keys can be configured server-side via environment variables so they never leave the server.",
      },
    },
    {
      "@type": "Question",
      name: "Does it post to LinkedIn automatically?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Virality Mapper generates and scores copy. You review the output and publish manually to LinkedIn.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <LandingPageClient />
    </>
  );
}
