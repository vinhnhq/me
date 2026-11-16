import type { ReactNode } from "react";
import { SizeControl, ThemeControl } from "@/components/reader-controls";
import { StickyBar } from "@/components/sticky-bar";

/**
 * The bar above every page: the page's links on the left; text size, theme
 * and the page's own action (the CV's "Save as PDF") on the right. Once the
 * page's heading scrolls away, a sticky bar takes over (`StickyBar`).
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
      <StickyBar name="Vinh Nguyen" action={action} />
    </>
  );
}
