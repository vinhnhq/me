import type { Metadata, Viewport } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import { AppPreferences } from "@/components/app-preferences";
import { WaveFooter } from "@/components/wave-footer";
import { SITE_URL, X_HANDLE, shareCard } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({ variable: "--font-sans", subsets: ["latin", "vietnamese"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

const TITLE = "Vinh Nguyen — Senior Fullstack Engineer";
const DESCRIPTION =
  "Senior fullstack engineer with 12 years of React, Next.js and TypeScript. Freelance since 2025, shipping production apps with AI coding agents. Open to remote.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  authors: [{ name: "Vinh Nguyen", url: SITE_URL }],
  creator: "Vinh Nguyen",
  openGraph: { type: "website", ...shareCard(TITLE, DESCRIPTION, "/") },
  twitter: { card: "summary_large_image", site: `@${X_HANDLE}`, creator: `@${X_HANDLE}` },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#111214" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
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
