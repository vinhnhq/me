import type { MetadataRoute } from "next";

/** /manifest.webmanifest: the name, colours and icon a phone uses for "Add to Home Screen". */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vinh Nguyen — Senior Fullstack Engineer",
    short_name: "Vinh Nguyen",
    description: "Résumé and blog.",
    start_url: "/",
    display: "browser",
    background_color: "#fbfaf8",
    theme_color: "#800020",
    icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }],
  };
}
