import Link from "next/link";
import { ResumeHeader } from "@/components/resume-header";
import { SiteNav } from "@/components/site-nav";
import { getResume } from "@/lib/markdown";

export default async function ResumePage() {
  const resume = await getResume();
  return (
    <main className="page resume" data-resume>
      <SiteNav>
        <Link href="/blog">Blog</Link>
        <a href="/api/pdf">Download PDF</a>
      </SiteNav>
      <ResumeHeader resume={resume} />
      <article dangerouslySetInnerHTML={{ __html: resume.bodyHtml }} />
    </main>
  );
}
