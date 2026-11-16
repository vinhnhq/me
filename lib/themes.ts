/**
 * Reader settings kept in this browser: the theme and the text size.
 * The colours and sizes live in globals.css under `[data-theme]` / `[data-size]`.
 * With no theme chosen ("system") the page follows the device.
 */
export const THEMES = ["light", "dark"] as const;
export type ThemeId = (typeof THEMES)[number];
export const THEME_KEY = "theme";

export const SIZES = ["s", "m", "l"] as const;
export type SizeId = (typeof SIZES)[number];
export const SIZE_KEY = "size";

/** Runs in <head> before the first paint, so a stored choice never flashes in late. */
export const SETTINGS_BOOT = `try{var d=document.documentElement,t=localStorage.getItem(${JSON.stringify(
  THEME_KEY,
)}),s=localStorage.getItem(${JSON.stringify(SIZE_KEY)});if(${JSON.stringify(THEMES)}.indexOf(t)>-1)d.dataset.theme=t;if(${JSON.stringify(
  SIZES,
)}.indexOf(s)>-1)d.dataset.size=s}catch(e){}`;
