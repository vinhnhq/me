import type { ReactNode } from "react";
import { SizeControl, ThemeControl } from "@/components/reader-controls";
import { type MenuLink, SiteMenu } from "@/components/site-menu";
import { StickyBar } from "@/components/sticky-bar";

export function SiteNav({ title, children, action }: {  title: string; children: ReactNode; action?: ReactNode }) {
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
        <SiteMenu links={menu} />
        <span className="links">{children}</span>
        <span className="controls">
          <SizeControl />
          <ThemeControl />
          {action}
        </span>
      </nav>
      <StickyBar title={title} />
      <span id="content" tabIndex={-1} />
    </>
  );
}
