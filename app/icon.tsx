import { ImageResponse } from "next/og";

// The tab icon: the initials on a burgundy disc, which shows on light and dark tab bars alike
// (the corners stay clear). Drawn at build time.
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
          background: "#800020",
          borderRadius: "50%",
          color: "#fff",
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: -0.3,
        }}
      >
        VN
      </div>
    ),
    size,
  );
}
