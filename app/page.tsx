import { renderContent } from "@/lib/markdown";

export default async function ResumePage() {
  const html = await renderContent("resume.md");
  return (
    <main className="page resume">
      <nav className="actions no-print">
        <a href="/agents">How I build with agents</a>
        <a href="/vinh-nguyen-resume.pdf" download>
          Download PDF
        </a>
      </nav>
      <article dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
