import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { getProject, listProjects } from "@/lib/markdown";

type Props = { params: Promise<{ slug: string }> };

// Only the projects on disk exist; anything else is a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return {};
  return { title: `${project.title} — Vinh Nguyen`, description: project.summary };
}

export default async function ProjectPage({ params }: Props) {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  return (
    <main className="page project">
      <SiteNav>
        <Link href="/">Résumé</Link>
        <Link href="/blog">Blog</Link>
      </SiteNav>
      <p className="eyebrow">Case study</p>
      <h1>{project.title}</h1>
      <p className="lede">{project.summary}</p>
      <dl className="facts">
        <div>
          <dt>My role</dt>
          <dd>{project.role}</dd>
        </div>
        <div>
          <dt>When</dt>
          <dd>{project.when}</dd>
        </div>
        <div>
          <dt>Built with</dt>
          <dd>{project.stack}</dd>
        </div>
      </dl>
      {project.link && (
        <p>
          <a className="button" href={project.link}>
            {project.linkLabel ?? "Open it"}
          </a>
        </p>
      )}
      <article dangerouslySetInnerHTML={{ __html: project.html }} />
    </main>
  );
}
