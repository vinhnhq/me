import type { MetadataRoute } from "next";
import { listPosts } from "@/lib/markdown";
import { SITE_URL } from "@/lib/site";

/** /sitemap.xml: the blog (the root), the CV, and every post on disk. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPosts();
  return [
    { url: SITE_URL },
    { url: `${SITE_URL}/resume` },
    ...posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.date })),
  ];
}
