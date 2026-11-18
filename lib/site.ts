/** The public address. Links printed in the PDF are made absolute against it. */
export const SITE_URL = "https://vinhn.dev";

/**
 * Vinh's X handle. It is NOT shown on the résumé (his choice, 2026-11-17): it only
 * attributes shared links (`twitter:site` / `twitter:creator`) and ties the
 * site to the account in the structured data (`sameAs`).
 */
export const X_HANDLE = "vinhnhq";

/** Vinh's Ko-fi page: its floating "Support me" button on the blog list and on each post. Never on the CV. */
export const KOFI_NAME = "vinhn";
export const KOFI_URL = `https://ko-fi.com/${KOFI_NAME}`;

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
    // drawn by app/og.png/route.tsx: 1.91:1, the shape every platform expects
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Vinh Nguyen, Senior Fullstack Engineer" }],
  };
}

/** JSON-LD for a `<script type="application/ld+json">`: "<" is escaped so no text can close the tag. */
export const jsonLd = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

/** Markdown links written for the site ("/blog/x") made absolute, for a reader that is not on the site. */
export const absoluteLinks = (markdown: string) => markdown.replace(/\]\(\//g, `](${SITE_URL}/`);
