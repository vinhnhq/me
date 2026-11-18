import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { Support } from "@/components/support";
import { notFound } from "next/navigation";
import { Tags } from "@/components/tags";
import { formatDay, getPost, listPosts } from "@/lib/markdown";
import { SITE_URL, jsonLd, shareCard } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

// Only the posts on disk exist; anything else is a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  const title = `${post.title} — Vinh Nguyen`;
  const path = `/blog/${post.slug}`;
  return {
    title,
    description: post.description,
    alternates: { canonical: path },
    openGraph: { type: "article", publishedTime: post.date, authors: ["Vinh Nguyen"], tags: [...post.tags], ...shareCard(title, post.description, path) },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const author = { "@type": "Person", name: "Vinh Nguyen", url: SITE_URL };
  const article = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    keywords: post.tags.join(", "),
    url: `${SITE_URL}/blog/${post.slug}`,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    image: `${SITE_URL}/vinh-nguyen.jpg`,
    author,
    publisher: author,
  };
  return (
    <main className="page post">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(article) }} />
      <SiteNav>
        <Link href="/resume">Résumé</Link>
        <Link href="/">Blog</Link>
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
      <Support />
    </main>
  );
}
