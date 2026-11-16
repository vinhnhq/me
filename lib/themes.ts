/**
 * The page's themes. The colours live in globals.css under
 * `[data-theme="<id>"]`; `swatch` is only the dot in the picker.
 * With nothing chosen the page follows the system: paper, or night.
 */
export const THEMES = [
  { id: "paper", label: "Paper", swatch: "#b4432f" },
  { id: "slate", label: "Slate", swatch: "#2563eb" },
  { id: "sage", label: "Sage", swatch: "#2f7d57" },
  { id: "night", label: "Night", swatch: "#f08a72" },
  { id: "midnight", label: "Midnight", swatch: "#7cc4ff" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const THEME_KEY = "theme";

/** Runs in <head> before the first paint, so a chosen theme never flashes in late. */
export const THEME_BOOT = `try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t&&${JSON.stringify(
  THEMES.map((t) => t.id),
)}.indexOf(t)>-1)document.documentElement.dataset.theme=t}catch(e){}`;
