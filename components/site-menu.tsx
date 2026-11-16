"use client";

import Link from "next/link";
import { useState } from "react";
import { Drawer } from "vaul";
import { SizeControl, ThemeControl } from "@/components/reader-controls";

export type MenuLink = { readonly href: string; readonly label: string; readonly note?: string };

/** Two bars that cross into an X when `open`. */
function Bars({ open }: { open: boolean }) {
  return (
    <span className="bars" data-open={open} aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

/**
 * The phone's menu. Once the page is scrolled, the top row is the name with a
 * menu button on its left; the button opens a full-screen drawer with the
 * pages, "Save as PDF", the theme and the text size.
 *
 * The drawer is Vaul, the library under shadcn/ui's Drawer, used directly and
 * styled in globals.css: this site has no Tailwind for shadcn's own wrapper to
 * sit on. It brings the sheet that follows the finger, drag-down to close,
 * focus trapping, Escape, and the page behind made inert.
 */
export function SiteMenu({ links }: { links: readonly MenuLink[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    // autoFocus: Vaul leaves focus on the page behind unless asked; a keyboard would then tab out of sight
    <Drawer.Root open={open} onOpenChange={setOpen} autoFocus>
      <Drawer.Trigger asChild>
        <button type="button" className="menu-button" aria-label="Menu">
          <Bars open={false} />
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="menu-overlay" />
        {/* no description: the title says all there is to say */}
        <Drawer.Content className="menu" aria-describedby={undefined}>
          <Drawer.Handle className="menu-handle" />
          <div className="menu-top">
            {/* where the menu button was, so the thumb does not have to move to close */}
            <Drawer.Close asChild>
              <button type="button" className="menu-close" aria-label="Close menu">
                <Bars open />
              </button>
            </Drawer.Close>
            <Drawer.Title className="menu-title">Vinh Nguyen</Drawer.Title>
          </div>
          <nav className="menu-links" aria-label="Pages">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={close}>
                {l.label}
                {l.note && <span>{l.note}</span>}
              </Link>
            ))}
            {/* a plain link: this one is a file to download, not a page to route to */}
            <a href="/api/pdf" onClick={close}>
              Save as PDF
              <span>The résumé, 2 pages</span>
            </a>
          </nav>
          <div className="menu-settings">
            <div>
              <span>Theme</span>
              <ThemeControl />
            </div>
            <div>
              <span>Text size</span>
              <SizeControl />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
