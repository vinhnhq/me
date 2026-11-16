import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { notFound } from "next/navigation";
import { Tags } from "@/components/tags";
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
      <SiteNav>
        <Link href="/">Résumé</Link>
        <Link href="/blog">Blog</Link>
      </SiteNav>
      <h1>{post.title}</h1>
      <p className="lede">
        <time dateTime={post.date}>{formatDay(post.date)}</time>
      </p>
      <Tags tags={post.tags} />
      {/* a case study: who did what, when, with what, and something to open */}
      {post.role && post.when && post.stack && (
        <dl className="facts">
          <div>
            <dt>My role</dt>
            <dd>{post.role}</dd>
          </div>
          <div>
            <dt>When</dt>
            <dd>{post.when}</dd>
          </div>
          <div>
            <dt>Built with</dt>
            <dd>{post.stack}</dd>
          </div>
        </dl>
      )}
      {post.link && (
        <p>
          <a className="button" href={post.link}>
            {post.linkLabel ?? "Open it"}
          </a>
        </p>
      )}
      <article dangerouslySetInnerHTML={{ __html: post.html }} />
    </main>
  );
}
