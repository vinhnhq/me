/**
 * `GET /og.png` — the card a link to this site shows when it is pasted into
 * Facebook, LinkedIn, X, Zalo, Slack… 1200×630 (1.91:1, what they all expect).
 *
 * Vinh's choice: NOT the photo blown up to fill the card. A solid burgundy
 * ground, the photo small and round, and the words doing the work.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getResume } from "@/lib/markdown";

export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  const [r, photo] = await Promise.all([getResume(), readFile(path.join(process.cwd(), "public", "vinh-nguyen.jpg"))]);
  const [role, ...stack] = r.headline.split(" · ");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#800020",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* biome-ignore lint: an ImageResponse draws plain <img> */}
          <img
            src={`data:image/jpeg;base64,${photo.toString("base64")}`}
            width={120}
            height={120}
            alt=""
            style={{ borderRadius: 60, border: "4px solid rgba(255,255,255,0.85)" }}
          />
          <div style={{ display: "flex", fontSize: 30, opacity: 0.8 }}>vinhn.dev</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 700, letterSpacing: -3, lineHeight: 1.05 }}>{r.name}</div>
          <div style={{ display: "flex", fontSize: 44, marginTop: 18 }}>{role}</div>
          <div style={{ display: "flex", fontSize: 30, marginTop: 14, opacity: 0.8 }}>{stack.join(" · ")}</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, opacity: 0.8 }}>{r.location}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
