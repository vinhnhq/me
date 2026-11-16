import type { ReactNode } from "react";
import { SizeControl, ThemeControl } from "@/components/reader-controls";
import { StickyBar } from "@/components/sticky-bar";

/**
 * The bar above every page: the page's links on the left; text size, theme
 * and the page's own action (the CV's "Save as PDF") on the right. The row is
 * sticky: scrolled, the theme and the action stay where they are, the rest
 * fades, and `StickyBar` puts a strip behind them and the name on the left.
 */
export function SiteNav({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <>
      <nav className="actions no-print">
        <span className="links">{children}</span>
        <span className="controls">
          <SizeControl />
          <ThemeControl />
          {action}
        </span>
      </nav>
      <StickyBar name="Vinh Nguyen" />
    </>
  );
}
