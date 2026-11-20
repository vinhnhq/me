import type { ReactNode } from "react";
import { SizeControl, ThemeControl } from "@/components/reader-controls";
import { type MenuLink, SiteMenu } from "@/components/site-menu";
import { StickyBar } from "@/components/sticky-bar";

/**
 * The bar above every page: the page's links on the left; text size, theme
 * and the page's own action (the CV's "Save as PDF") on the right. The row is
 * sticky: scrolled, the theme and the action stay where they are, the rest
 * fades, and `StickyBar` puts a strip behind them and the page's title on the left.
 *
 * On a phone or tablet the row is only a menu button and the page's action;
 * `SiteMenu` holds the links and the settings. On a desk the menu button comes
 * in when the page is scrolled, in the place of the links.
 */
export function SiteNav({ title, children, action }: { /** the page's h1, word for word: the bar shows it once scrolled */ title: string; children: ReactNode; action?: ReactNode }) {
  // two places only: the blog at the root (case studies included), and the CV
  const menu: MenuLink[] = [
    { href: "/", label: "Blog", note: "Field notes and case studies" },
    { href: "/resume", label: "Résumé" },
  ];
  return (
    <>
      <a className="skip no-print" href="#content">
        Skip to content
      </a>
      <nav className="actions no-print" aria-label="Site">
        {/* phones and tablets: always; a desk: once scrolled, where the links were */}
        <SiteMenu links={menu} />
        <span className="links">{children}</span>
        <span className="controls">
          <SizeControl />
          <ThemeControl />
          {action}
        </span>
      </nav>
      <StickyBar title={title} />
      {/* where "Skip to content" lands: the page's own text starts right after this */}
      <span id="content" tabIndex={-1} />
    </>
  );
}
