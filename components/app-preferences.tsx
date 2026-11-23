"use client";

import { Preferences } from "@ui-sdk/react/preferences";
import type { ReactNode } from "react";
import { colorScheme, textSize } from "@/lib/preferences";

export function AppPreferences({ children }: { children: ReactNode }) {
  return <Preferences preferences={[colorScheme, textSize]}>{children}</Preferences>;
}
