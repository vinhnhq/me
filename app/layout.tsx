import type { Metadata } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import { WaveFooter } from "@/components/wave-footer";
import { SITE_URL } from "@/lib/site";
import { SETTINGS_BOOT } from "@/lib/themes";
import "./globals.css";

// Manrope for reading, Geist Mono for dates, labels and code. Latin and Vietnamese:
// the site is in English, with a few Vietnamese names.
const manrope = Manrope({ variable: "--font-sans", subsets: ["latin", "vietnamese"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Vinh Nguyen — Senior Fullstack Engineer",
  description:
    "12 years of React, Next.js and TypeScript. Freelance since 2025, building production apps with AI coding agents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // the boot script sets data-theme and data-size before React hydrates: that mismatch is expected
    <html lang="en" className={`${manrope.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SETTINGS_BOOT }} />
      </head>
      <body>
        {children}
        <WaveFooter />
      </body>
    </html>
  );
}
