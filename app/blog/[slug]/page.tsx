import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDay, getPost, listPosts } from "@/lib/markdown";

type Props = { params: Promise<{ slug: string }> };

// Only the posts on disk exist; anything else is a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return { title: `${post.title} — Vinh Nguyen`, description: post.description };
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return (
    <main className="page post">
      <nav className="actions">
        <Link href="/">Résumé</Link>
        <Link href="/blog">Blog</Link>
      </nav>
      <h1>{post.title}</h1>
      <p className="lede">
        <time dateTime={post.date}>{formatDay(post.date)}</time>
      </p>
      <article dangerouslySetInnerHTML={{ __html: post.html }} />
    </main>
  );
}
