/** The public address. Links printed in the PDF are made absolute against it. */
export const SITE_URL = "https://vinhn.dev";

/**
 * What a link to a page shows when it is pasted into LinkedIn, Zalo, Slack…
 * A page's `openGraph` REPLACES the layout's (Next does not merge them), so
 * every page builds its own from this.
 */
export function shareCard(title: string, description: string, path: string) {
  return {
    title,
    description,
    url: path,
    siteName: "Vinh Nguyen",
    locale: "en_US",
    images: [{ url: "/vinh-nguyen.jpg", width: 448, height: 448, alt: "Vinh Nguyen" }],
  };
}
