import { renderResumePdf } from "@/lib/pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request): Promise<Response> {
  const bytes = await renderResumePdf(`${new URL(req.url).origin}/resume`);
  return new Response(Buffer.from(bytes), {
    headers: {
      "content-type": "application/pdf",
      "x-robots-tag": "noindex, nofollow",
      "content-disposition": 'attachment; filename="vinh-nguyen-resume.pdf"',
      "cache-control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
