import type { Metadata, Viewport } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import { AppPreferences } from "@/components/app-preferences";
import { WaveFooter } from "@/components/wave-footer";
import { SITE_URL, X_HANDLE, shareCard } from "@/lib/site";
import "./globals.css";

// Manrope for reading, Geist Mono for dates, labels and code. Latin and Vietnamese:
// the site is in English, with a few Vietnamese names.
const manrope = Manrope({ variable: "--font-sans", subsets: ["latin", "vietnamese"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

const TITLE = "Vinh Nguyen — Senior Fullstack Engineer";
const DESCRIPTION =
  "Senior fullstack engineer with 12 years of React, Next.js and TypeScript. Freelance since 2025, shipping production apps with AI coding agents. Open to remote.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  // every page is his: LinkedIn and others read <meta name="author">
  authors: [{ name: "Vinh Nguyen", url: SITE_URL }],
  creator: "Vinh Nguyen",
  // every page sets its own canonical and share card; these are only the fallback
  openGraph: { type: "website", ...shareCard(TITLE, DESCRIPTION, "/") },
  twitter: { card: "summary_large_image", site: `@${X_HANDLE}`, creator: `@${X_HANDLE}` },
};

// The phone browser's toolbar takes the page's own ground (--bg in globals.css), light or dark.
export const viewport: Viewport = {
  // both schemes are supported: the browser paints its own canvas and controls to match, before the CSS arrives
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#111214" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Preferences' inline script sets data-color-scheme and data-size before React hydrates: that mismatch is expected
    <html lang="en" className={`${manrope.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        <AppPreferences>
          {children}
          <WaveFooter />
        </AppPreferences>
      </body>
    </html>
  );
}
