import type { Metadata } from "next";
import { renderContent } from "@/lib/markdown";

export const metadata: Metadata = {
  title: "How I build with AI agents — Vinh Nguyen",
  description: "The workflow, guardrails and numbers behind K-Studio, built with Claude Code.",
};

export default async function AgentsPage() {
  const html = await renderContent("agents.md");
  return (
    <main className="page agents">
      <article dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
