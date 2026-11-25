import type { Metadata } from "next";
import Link from "next/link";
import { Markdown } from "@/components/markdown";
import { SiteNav } from "@/components/site-nav";
import { Support } from "@/components/support";
import { notFound } from "next/navigation";
import { Tags } from "@/components/tags";
import { formatDay, getPost, listPosts } from "@/lib/markdown";
import { SITE_URL, jsonLd, shareCard } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

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
      <SiteNav title={post.title}>
        <Link href="/resume">Résumé</Link>
        <Link href="/">Blog</Link>
      </SiteNav>
      <h1>{post.title}</h1>
      <p className="mt-0 mb-2 text-pretty text-muted">
        <time dateTime={post.date}>{formatDay(post.date)}</time>
      </p>
      <Tags tags={post.tags} className="mb-6" />
      {post.role && post.when && post.stack && (
        <dl className="my-6 grid gap-4 border-y border-rule py-4">
          <div>
            <dt className="text-[0.8rem] text-muted">My role</dt>
            <dd className="m-0">{post.role}</dd>
          </div>
          <div>
            <dt className="text-[0.8rem] text-muted">When</dt>
            <dd className="m-0">{post.when}</dd>
          </div>
          <div>
            <dt className="text-[0.8rem] text-muted">Built with</dt>
            <dd className="m-0">{post.stack}</dd>
          </div>
        </dl>
      )}
      {post.link && (
        <p className="my-6 text-pretty">
          <a
            className="inline-flex min-h-11 touch-manipulation items-center rounded-lg bg-accent px-[1.1rem] font-semibold text-bg no-underline"
            href={post.link}
          >
            {post.linkLabel ?? "Open it"}
          </a>
        </p>
      )}
      <article>
        <Markdown source={post.markdown} />
      </article>
      <Support />
    </main>
  );
}
