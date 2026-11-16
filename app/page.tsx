import Link from "next/link";
import { renderContent } from "@/lib/markdown";

export default async function ResumePage() {
  const html = await renderContent("resume.md");
  return (
    <main className="page resume" data-resume>
      <nav className="actions no-print">
        <Link href="/blog">Blog</Link>
        <a href="/api/pdf">Download PDF</a>
      </nav>
      {/* eslint-disable-next-line @next/next/no-img-element -- one small local file; the PDF prints it as is */}
      <img className="photo" src="/vinh-nguyen.jpg" alt="Vinh Nguyen" width={112} height={112} />
      <article dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
