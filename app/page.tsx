import Link from "next/link";
import { ResumeBody } from "@/components/resume-body";
import { ResumeHeader } from "@/components/resume-header";
import { SiteNav } from "@/components/site-nav";
import { getResume } from "@/lib/markdown";

export default async function ResumePage() {
  const resume = await getResume();
  return (
    <main className="page resume" data-resume>
      <SiteNav
        action={
          <a className="pill" href="/api/pdf" aria-label="Save as PDF">
            {/* the narrowest phones keep only the last word, so the row still fits */}
            <span className="pill-wide">Save as&nbsp;</span>PDF
          </a>
        }
      >
        <Link href="/blog">Blog</Link>
      </SiteNav>
      <ResumeHeader resume={resume} />
      <ResumeBody sections={resume.sections} />
    </main>
  );
}
