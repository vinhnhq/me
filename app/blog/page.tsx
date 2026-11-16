import type { Metadata } from "next";
import Link from "next/link";
import { formatDay, listPosts } from "@/lib/markdown";

export const metadata: Metadata = {
  title: "Blog — Vinh Nguyen",
  description: "Notes on how I work: building production software with AI coding agents.",
};

export default async function BlogPage() {
  const posts = await listPosts();
  return (
    <main className="page blog">
      <nav className="actions">
        <Link href="/">Résumé</Link>
      </nav>
      <h1>Blog</h1>
      <p className="lede">Notes on how I work.</p>
      <ul className="posts">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`}>{p.title}</Link>
            <time dateTime={p.date}>{formatDay(p.date)}</time>
            <p>{p.description}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
