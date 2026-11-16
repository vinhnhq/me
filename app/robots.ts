import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** /robots.txt: everything may be read; the PDF route is a copy of `/`, not a page of its own. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: `${SITE_URL}/sitemap.xml` };
}
