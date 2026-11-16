import type { ReactNode } from "react";
import { ReaderControls } from "@/components/reader-controls";

/**
 * The bar above every page: the page's links on the left; text size, theme
 * and the page's own action (the CV's "Save as PDF") on the right.
 */
export function SiteNav({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <nav className="actions no-print">
      <span className="links">{children}</span>
      <span className="controls">
        <ReaderControls />
        {action}
      </span>
    </nav>
  );
}
