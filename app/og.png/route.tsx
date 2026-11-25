import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getResume } from "@/lib/markdown";

export const dynamic = "force-static";

const photoFile = readFile(path.join(process.cwd(), "public", "vinh-nguyen.jpg"));

export async function GET(): Promise<Response> {
  const [r, photo] = await Promise.all([getResume(), photoFile]);
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
          padding: "64px 72px",
          background: "#800020",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          {/* biome-ignore lint: an ImageResponse draws plain <img> */}
          <img
            src={`data:image/jpeg;base64,${photo.toString("base64")}`}
            width={170}
            height={170}
            alt=""
            style={{ borderRadius: 85, border: "5px solid rgba(255,255,255,0.9)" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 112, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>{r.name}</div>
            <div style={{ display: "flex", fontSize: 50, marginTop: 14 }}>{role}</div>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 40, opacity: 0.85 }}>{[...stack, "Open to remote"].join(" · ")}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", padding: "20px 44px", borderRadius: 60, background: "#fff", color: "#800020", fontSize: 44, fontWeight: 700 }}>
            Read my résumé
          </div>
          <div style={{ display: "flex", fontSize: 44 }}>vinhn.dev</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
