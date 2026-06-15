import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import LenisProvider from "@/components/LenisProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://virality-booster.vercel.app"),
  title: {
    default: "Virality Mapper | Premium AI LinkedIn Ghostwriter",
    template: "%s | Virality Mapper",
  },
  description: "Analyze top LinkedIn trends in real-time and generate highly optimized, high-impact post variants with advanced AI critiques.",
  keywords: [
    "LinkedIn AI writer",
    "AI copywriting",
    "multi-agent copywriting",
    "LinkedIn ghostwriter",
    "viral post generator",
    "neuromarketing hooks",
    "content optimizer"
  ],
  authors: [{ name: "Anuvab Das" }],
  creator: "anv.dev",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://virality-booster.vercel.app",
    title: "Virality Mapper | Premium AI LinkedIn Ghostwriter",
    description: "Analyze top LinkedIn trends in real-time and generate highly optimized, high-impact post variants with advanced AI critiques.",
    siteName: "Virality Mapper",
  },
  twitter: {
    card: "summary_large_image",
    title: "Virality Mapper | AI LinkedIn Copywriting Arena",
    description: "Generate peer-critiqued post variants grounded in live search trends.",
    creator: "@viralitymapper",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem("theme") || "obsidian";
                  document.documentElement.setAttribute("data-theme", theme);
                  
                  const font = localStorage.getItem("font") || "geist";
                  document.documentElement.setAttribute("data-font", font);

                  if (font === "fira") {
                    const link = document.createElement("link");
                    link.rel = "stylesheet";
                    link.href = "https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&display=swap";
                    document.head.appendChild(link);
                  } else if (font === "custom") {
                    const storedConfig = localStorage.getItem("vm_master_config");
                    if (storedConfig) {
                      const parsed = JSON.parse(storedConfig);
                      if (parsed && parsed.preferences && parsed.preferences.customFontUrl) {
                        const link = document.createElement("link");
                        link.rel = "stylesheet";
                        link.href = parsed.preferences.customFontUrl;
                        document.head.appendChild(link);
                        
                        if (parsed.preferences.customFontFamily) {
                          document.documentElement.style.setProperty("--font-custom-family", parsed.preferences.customFontFamily);
                        }
                      }
                    }
                  }

                  const customCss = localStorage.getItem("custom_css");
                  if (customCss) {
                    const style = document.createElement("style");
                    style.id = "custom-css-overrides";
                    style.innerHTML = customCss;
                    document.head.appendChild(style);
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body>
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
