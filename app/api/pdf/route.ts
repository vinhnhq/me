/**
 * `GET /api/pdf` — the résumé as a PDF, drawn on the server from the live
 * page (`lib/pdf.ts`). There is no stored file to re-export after an edit.
 *
 * The CDN keeps the answer, so Chromium runs about once per deployment and
 * then once a day; a new deployment starts with an empty cache.
 */
import { renderResumePdf } from "@/lib/pdf";

// Chromium needs Node and a little time: a cold start draws in a few seconds
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request): Promise<Response> {
  const bytes = await renderResumePdf(new URL(req.url).origin);
  return new Response(Buffer.from(bytes), {
    headers: {
      "content-type": "application/pdf",
      // a copy of `/`, not a page of its own: crawlers are told not to list it (robots.txt
      // also disallows /api/, and the links to it are rel="nofollow")
      "x-robots-tag": "noindex, nofollow",
      "content-disposition": 'attachment; filename="vinh-nguyen-resume.pdf"',
      "cache-control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
