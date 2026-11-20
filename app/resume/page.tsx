import type { Metadata } from "next";
import Link from "next/link";
import { ResumeBody } from "@/components/resume-body";
import { ResumeHeader } from "@/components/resume-header";
import { SiteNav } from "@/components/site-nav";
import { getResume } from "@/lib/markdown";
import { SITE_URL, X_HANDLE, jsonLd, shareCard } from "@/lib/site";

const TITLE = "Vinh Nguyen — Senior Fullstack Engineer";
const DESCRIPTION =
  "Senior fullstack engineer with 12 years of React, Next.js and TypeScript. Freelance since 2025, shipping production apps with AI coding agents. Open to remote.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/resume" },
  openGraph: { type: "profile", firstName: "Vinh", lastName: "Nguyen", ...shareCard(TITLE, DESCRIPTION, "/resume") },
};

export default async function ResumePage() {
  const resume = await getResume();
  // The same facts as the page, as data: for search engines and AI agents (schema.org).
  const person = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${SITE_URL}/resume`,
    mainEntity: {
      "@type": "Person",
      name: resume.name,
      jobTitle: resume.headline.split(" · ")[0],
      description: resume.headline,
      url: SITE_URL,
      image: `${SITE_URL}/vinh-nguyen.jpg`,
      email: `mailto:${resume.email}`,
      address: { "@type": "PostalAddress", addressLocality: "Ho Chi Minh City", addressCountry: "VN" },
      sameAs: [`https://github.com/${resume.github}`, `https://x.com/${X_HANDLE}`],
    },
  };
  return (
    <main className="page resume" data-resume>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(person) }} />
      <SiteNav
        title={resume.name}
        action={
          <a className="pill" href="/api/pdf" rel="nofollow" aria-label="Save as PDF">
            {/* the narrowest phones keep only the last word, so the row still fits */}
            <span className="pill-wide">Save as&nbsp;</span>PDF
          </a>
        }
      >
        <Link href="/">Blog</Link>
      </SiteNav>
      <ResumeHeader resume={resume} />
      <ResumeBody sections={resume.sections} />
    </main>
  );
}
