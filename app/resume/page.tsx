import type { Metadata } from "next";
import Link from "next/link";
import { ResumeBody } from "@/components/resume-body";
import { ResumeHeader } from "@/components/resume-header";
import { SiteNav } from "@/components/site-nav";
import { getResume } from "@/lib/markdown";
import { jsonLd, SITE_URL, shareCard, X_HANDLE } from "@/lib/site";
import { FOCUS_RING, PAGE } from "@/lib/styles";

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
    <main className={`${PAGE} resume`} data-resume>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD from our own data, with "<" escaped by jsonLd() */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(person) }} />
      <SiteNav
        title={resume.name}
        action={
          // react-doctor-disable-next-line react-doctor/nextjs-no-a-element
          <a
            className={`pill inline-flex h-[calc(1.75rem+8px)] touch-manipulation items-center rounded-[999px] border border-rule bg-bg px-[0.9rem] font-mono text-[0.78rem] whitespace-nowrap text-fg no-underline [-webkit-tap-highlight-color:transparent] hover:border-muted pointer-coarse:h-[calc(var(--spacing-touch)+8px)] ${FOCUS_RING}`}
            href="/api/pdf"
            rel="nofollow"
            aria-label="Save as PDF"
          >
            <span className="phone:hidden">Save as&nbsp;</span>PDF
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
