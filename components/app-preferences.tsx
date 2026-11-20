"use client";

import { Preferences } from "@ui-sdk/react/preferences";
import type { ReactNode } from "react";
import { colorScheme, textSize } from "@/lib/preferences";

/**
 * Applies the reader's saved colour scheme and text size to <html> as the page
 * loads. A client module, because preferences hold functions, which cannot be
 * passed down from a Server Component.
 */
export function AppPreferences({ children }: { children: ReactNode }) {
  return <Preferences preferences={[colorScheme, textSize]}>{children}</Preferences>;
}
