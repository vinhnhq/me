import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vinh Nguyen — Senior Fullstack Engineer",
  description:
    "12 years of React, Next.js and TypeScript. Freelance since 2025, building production apps with AI coding agents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
