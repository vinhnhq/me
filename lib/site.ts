export const SITE_URL = "https://vinhn.dev";

export const X_HANDLE = "vinhnhq";

export const KOFI_NAME = "vinhn";
export const KOFI_URL = `https://ko-fi.com/${KOFI_NAME}`;

export function shareCard(title: string, description: string, path: string) {
  return {
    title,
    description,
    url: path,
    siteName: "Vinh Nguyen",
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Vinh Nguyen, Senior Fullstack Engineer" }],
  };
}

export const jsonLd = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

export const absoluteLinks = (markdown: string) => markdown.replace(/\]\(\//g, `](${SITE_URL}/`);
