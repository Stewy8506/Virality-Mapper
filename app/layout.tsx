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
  title: "Virality Mapper | Premium AI LinkedIn Ghostwriter",
  description: "Analyze top LinkedIn trends in real-time and generate highly optimized, high-impact post variants with advanced AI critiques.",
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
