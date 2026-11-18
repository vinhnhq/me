import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { Support } from "@/components/support";
import { Tags } from "@/components/tags";
import { formatDay, listPosts } from "@/lib/markdown";
import { shareCard } from "@/lib/site";

const TITLE = "Blog — Field notes and case studies by Vinh Nguyen";
const DESCRIPTION =
  "Field notes and case studies from shipping real products with React, Next.js and AI coding agents: what worked, what broke, and what I changed.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { type: "website", ...shareCard(TITLE, DESCRIPTION, "/") },
};

export default async function BlogPage() {
  const posts = await listPosts();
  return (
    <main className="page blog">
      <SiteNav>
        <Link href="/resume">Résumé</Link>
      </SiteNav>
      <h1>Vinh Nguyen</h1>
      <p className="intro">
        Senior fullstack engineer in Ho Chi Minh City, building with React, Next.js, TypeScript and AI coding agents.
        Open to remote roles and contracts: here is my <Link href="/resume">résumé</Link>.
      </p>
      <p className="lede">Field notes and case studies from shipping real products.</p>
      <ul className="posts">
        {posts.map((p) => (
          <li key={p.slug}>
            <h2>
              <Link href={`/blog/${p.slug}`}>{p.title}</Link>
            </h2>
            <time dateTime={p.date}>{formatDay(p.date)}</time>
            <p>{p.description}</p>
            <Tags tags={p.tags} />
          </li>
        ))}
      </ul>
      <Support />
    </main>
  );
}
