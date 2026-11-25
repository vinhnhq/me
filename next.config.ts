import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "playwright-core"],
  outputFileTracingIncludes: {
    "/api/pdf": ["./node_modules/@sparticuz/chromium/bin/**", "./node_modules/playwright-core/**"],
  },
  async redirects() {
    return [
      { source: "/agents", destination: "/blog/how-i-build-with-ai-agents", permanent: true },
      { source: "/vinh-nguyen-resume.pdf", destination: "/api/pdf", permanent: false },
      { source: "/blog", destination: "/", permanent: false },
      { source: "/projects/k-studio", destination: "/blog/k-studio", permanent: true },
    ];
  },
  async rewrites() {
    return {
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
