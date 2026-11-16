import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { Tags } from "@/components/tags";
import { formatDay, listPosts } from "@/lib/markdown";

export const metadata: Metadata = {
  title: "Blog — Vinh Nguyen",
  description: "Field notes and case studies from shipping real products: what worked, what broke, and what I changed.",
};

export default async function BlogPage() {
  const posts = await listPosts();
  return (
    <main className="page blog">
      <SiteNav>
        <Link href="/">Résumé</Link>
      </SiteNav>
      <h1>Blog</h1>
      <p className="lede">Field notes and case studies from shipping real products.</p>
      <ul className="posts">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`}>{p.title}</Link>
            <time dateTime={p.date}>{formatDay(p.date)}</time>
            <p>{p.description}</p>
            <Tags tags={p.tags} />
          </li>
        ))}
      </ul>
    </main>
  );
}
