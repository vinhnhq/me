import type { ReactNode } from "react";
import { SizeControl, ThemeControl } from "@/components/reader-controls";
import { type MenuLink, SiteMenu } from "@/components/site-menu";
import { StickyBar } from "@/components/sticky-bar";
import { listProjects } from "@/lib/markdown";

/**
 * The bar above every page: the page's links on the left; text size, theme
 * and the page's own action (the CV's "Save as PDF") on the right. The row is
 * sticky: scrolled, the theme and the action stay where they are, the rest
 * fades, and `StickyBar` puts a strip behind them and the name on the left.
 *
 * On a phone the row is only a menu button and the page's action; `SiteMenu`
 * holds the links and the settings, and the name lands beside the button.
 */
export async function SiteNav({ children, action }: { children: ReactNode; action?: ReactNode }) {
  const menu: MenuLink[] = [
    { href: "/", label: "Résumé" },
    { href: "/blog", label: "Blog", note: "Notes on how I work" },
    ...(await listProjects())
      .filter((p) => p.inMenu)
      .map((p) => ({ href: `/projects/${p.slug}`, label: p.title, note: "Case study" })),
  ];
  return (
    <>
      <nav className="actions no-print">
        {/* phones only: it stands in for the links and the settings */}
        <SiteMenu links={menu} />
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
