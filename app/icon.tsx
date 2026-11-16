import { ImageResponse } from "next/og";

// The tab icon: the initials, light on dark. Drawn at build time.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111214",
          color: "#fff",
          fontSize: 19,
          fontWeight: 600,
          letterSpacing: -0.5,
        }}
      >
        VN
      </div>
    ),
    size,
  );
}
