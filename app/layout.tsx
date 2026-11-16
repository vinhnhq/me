import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import { THEME_BOOT } from "@/lib/themes";
import "./globals.css";

// Geist, Vercel's own face. Latin only: the site is in English.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Vinh Nguyen — Senior Fullstack Engineer",
  description:
    "12 years of React, Next.js and TypeScript. Freelance since 2025, building production apps with AI coding agents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // the boot script sets data-theme before React hydrates: that mismatch is expected
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
