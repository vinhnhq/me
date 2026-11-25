import type { ReactNode } from "react";
import { SizeControl, ThemeControl } from "@/components/reader-controls";
import { type MenuLink, SiteMenu } from "@/components/site-menu";
import { StickyBar } from "@/components/sticky-bar";
import { FOCUS_RING } from "@/lib/styles";

export function SiteNav({ title, children, action }: {  title: string; children: ReactNode; action?: ReactNode }) {
  const menu: MenuLink[] = [
    { href: "/", label: "Blog", note: "Field notes and case studies" },
    { href: "/resume", label: "Résumé" },
  ];
  return (
    <>
      <a
        className={`fixed top-2 left-2 z-30 inline-flex min-h-11 -translate-y-[200%] touch-manipulation items-center rounded-[999px] bg-fg px-[0.9rem] font-mono text-[0.85rem] text-bg no-underline focus-visible:translate-y-0 print:hidden ${FOCUS_RING}`}
        href="#content"
      >
        Skip to content
      </a>
      <nav
        className="actions sticky top-2 z-[11] mb-8 flex min-h-(--menu-size) items-center justify-between gap-x-4 gap-y-3 text-[0.9rem] pointer-coarse:min-h-[calc(2.75rem+8px)] print:hidden"
        aria-label="Site"
      >
        <SiteMenu links={menu} />
        <span className="links flex gap-5 narrow:hidden pointer-coarse:gap-2 [&_a]:touch-manipulation [&_a]:text-base [&_a]:font-medium [&_a]:text-muted [&_a]:no-underline [&_a:hover]:text-fg pointer-coarse:[&_a]:inline-flex pointer-coarse:[&_a]:min-h-11 pointer-coarse:[&_a]:items-center pointer-coarse:[&_a]:px-2">
          {children}
        </span>
        <span className="controls flex items-center gap-2 narrow:[&>.segmented]:hidden">
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
