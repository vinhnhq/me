import { ImageResponse } from "next/og";

// The home-screen icon: the initials, light on dark. Drawn at build time.
export const size = { width: 180, height: 180 };
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
          fontSize: 104,
          fontWeight: 600,
          letterSpacing: -3,
        }}
      >
        VN
      </div>
    ),
    size,
  );
}
