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
 * On a phone there is no room for that: scrolled, the row keeps the name and a
 * menu button, and `SiteMenu` holds everything else.
 */
export async function SiteNav({ children, action }: { children: ReactNode; action?: ReactNode }) {
  const menu: MenuLink[] = [
    { href: "/", label: "Résumé" },
    { href: "/blog", label: "Blog", note: "Notes on how I work" },
    ...(await listProjects()).map((p) => ({ href: `/projects/${p.slug}`, label: p.title, note: "Case study" })),
  ];
  return (
    <>
      <nav className="actions no-print">
        <span className="links">{children}</span>
        <span className="controls">
          <SizeControl />
          <ThemeControl />
          {action}
          <SiteMenu links={menu} />
        </span>
      </nav>
      <StickyBar name="Vinh Nguyen" />
    </>
  );
}
