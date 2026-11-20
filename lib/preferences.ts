/**
 * The reader's two settings, kept in this browser: the colour scheme and the
 * text size. ui-sdk's preferences hold them: each one puts a `data-*`
 * attribute on <html> (before the first paint, from an inline script that
 * `Preferences` renders), saves the choice in localStorage and keeps every
 * control on the page, and every open tab, in step.
 *
 * The colours and sizes themselves are in globals.css, under
 * `[data-color-scheme]` and `[data-size]`. The storage keys are the ones the
 * site has always used, so a returning reader keeps their choice.
 */
import { createColorScheme, createLocalStorage, createPreference } from "@ui-sdk/core";

/** "system" (the default: follow the device), "light" or "dark", on `data-color-scheme`. */
export const colorScheme = createColorScheme({ global: true, storage: createLocalStorage("theme") });

export const SIZES = ["s", "m", "l"] as const;
export type SizeId = (typeof SIZES)[number];

/** Small, medium (the default) or large text, on `data-size`. */
export const textSize = createPreference({
  values: SIZES,
  defaultValue: "m",
  attribute: "data-size",
  global: true,
  storage: createLocalStorage("size"),
});
