/**
 * Light and dark. The colours live in globals.css under `[data-theme]`.
 * With nothing chosen the page follows the system.
 */
export const THEMES = ["light", "dark"] as const;

export type ThemeId = (typeof THEMES)[number];

export const THEME_KEY = "theme";

/** Runs in <head> before the first paint, so a chosen theme never flashes in late. */
export const THEME_BOOT = `try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(${JSON.stringify(
  THEMES,
)}.indexOf(t)>-1)document.documentElement.dataset.theme=t}catch(e){}`;
