import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The PDF route: Chromium and its driver are loaded at run time, never bundled.
  serverExternalPackages: ["@sparticuz/chromium", "playwright-core"],
  outputFileTracingIncludes: {
    "/api/pdf": [
      "./node_modules/@sparticuz/chromium/bin/**",
      // tracing follows imports, not file reads: playwright-core reads its own
      // browsers.json at load, and without this the function 500s on Vercel
      "./node_modules/playwright-core/**",
    ],
  },
  async redirects() {
    return [
      // addresses that were public before the blog and the server-drawn PDF
      { source: "/agents", destination: "/blog/how-i-build-with-ai-agents", permanent: true },
      { source: "/vinh-nguyen-resume.pdf", destination: "/api/pdf", permanent: false },
      // case studies are blog posts now
      { source: "/projects/k-studio", destination: "/blog/k-studio", permanent: true },
    ];
  },
  async rewrites() {
    return {
      // LinkedIn shows a share card as a small thumbnail beside the title: its
      // crawler gets the photo-only card (app/og-photo.png) in place of /og.png.
      beforeFiles: [
        {
          source: "/og.png",
          has: [{ type: "header", key: "user-agent", value: ".*LinkedInBot.*" }],
          destination: "/og-photo.png",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
