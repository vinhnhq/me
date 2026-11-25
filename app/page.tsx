import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { Support } from "@/components/support";
import { Tags } from "@/components/tags";
import { formatDay, listPosts } from "@/lib/markdown";
import { shareCard } from "@/lib/site";
import { HEADING, PAGE } from "@/lib/styles";

const TITLE = "Blog — Field notes and case studies by Vinh Nguyen";
const DESCRIPTION =
  "Field notes and case studies from shipping real products with React, Next.js and AI coding agents: what worked, what broke, and what I changed.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { type: "website", ...shareCard(TITLE, DESCRIPTION, "/") },
};

const INTRO =
  "Senior fullstack engineer in Ho Chi Minh City, building with React, Next.js, TypeScript and AI coding agents. Open to remote roles and contracts: here is my ";
const LINK = "touch-manipulation text-accent underline underline-offset-2";

export default async function BlogPage() {
  const posts = await listPosts();
  return (
    <main className={`${PAGE} blog`}>
      <SiteNav title="Vinh Nguyen">
        <Link href="/resume">Résumé</Link>
      </SiteNav>
      <h1 className={HEADING}>Vinh Nguyen</h1>
      <p className="mt-2 mb-3 text-[1.05rem] text-pretty">
        {INTRO}
        <Link className={LINK} href="/resume">
          résumé
        </Link>
        .
      </p>
      <p className="mt-0 mb-2 text-pretty text-muted">Field notes and case studies from shipping real products.</p>
      <ul className="mt-8 mb-0 list-none p-0">
        {posts.map((p) => (
          <li key={p.slug} className="m-0 border-t border-rule py-4 text-pretty">
            <h2 className="m-0 block text-balance normal-case tracking-normal [font:inherit] after:content-none">
              <Link
                className="inline-block touch-manipulation text-[1.05rem] font-semibold text-accent underline underline-offset-2 pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center"
                href={`/blog/${p.slug}`}
              >
                {p.title}
              </Link>
            </h2>
            <time className="block text-[0.85rem] text-muted" dateTime={p.date}>
              {formatDay(p.date)}
            </time>
            <p className="mt-1 mb-0 text-pretty text-muted">{p.description}</p>
            <Tags tags={p.tags} item="border-t border-rule py-4" />
          </li>
        ))}
      </ul>
      <Support />
    </main>
  );
}
