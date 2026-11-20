/**
 * `GET /og-photo.png` — the share card for LINKEDIN only: the photo, round, on
 * the burgundy ground, and no words.
 *
 * LinkedIn shows a link as a small thumbnail with the page's title beside it,
 * so words inside the image are specks there, and say what the title already
 * says. Its crawler (LinkedInBot) asks for `/og.png` like everyone else and is
 * handed this one instead, by a rewrite in `next.config.ts`.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const dynamic = "force-static";

// read once, when the module loads, not inside the handler
const photoFile = readFile(path.join(process.cwd(), "public", "vinh-nguyen.jpg"));

export async function GET(): Promise<Response> {
  const photo = await photoFile;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#800020" }}>
        {/* biome-ignore lint: an ImageResponse draws plain <img> */}
        <img
          src={`data:image/jpeg;base64,${photo.toString("base64")}`}
          width={440}
          height={440}
          alt=""
          style={{ borderRadius: 220, border: "10px solid rgba(255,255,255,0.9)" }}
        />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
