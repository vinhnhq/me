import type { ReactNode } from "react";
import { ThemePicker } from "@/components/theme-picker";

/** The bar above every page: the theme dots on the left, the page's links on the right. */
export function SiteNav({ children }: { children: ReactNode }) {
  return (
    <nav className="actions no-print">
      <ThemePicker />
      <span className="links">{children}</span>
    </nav>
  );
}
