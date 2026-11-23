import { createColorScheme, createLocalStorage, createPreference } from "@ui-sdk/core";

export const colorScheme = createColorScheme({ global: true, storage: createLocalStorage("theme") });

export const SIZES = ["s", "m", "l"] as const;
export type SizeId = (typeof SIZES)[number];

export const textSize = createPreference({
  values: SIZES,
  defaultValue: "m",
  attribute: "data-size",
  global: true,
  storage: createLocalStorage("size"),
});
