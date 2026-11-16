"use client";

import Link from "next/link";
import { useRef } from "react";
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
 * The phone's menu. Once the page is scrolled, the top row has room for the
 * name and one button only, so everything else moves behind that button: a
 * full-screen sheet with the pages, "Save as PDF", the theme and the text size.
 *
 * A native <dialog> opened with showModal(): the browser traps focus in it,
 * closes it on Escape and makes the page behind it inert, with no code here.
 */
export function SiteMenu({ links }: { links: readonly MenuLink[] }) {
  const sheet = useRef<HTMLDialogElement>(null);
  const close = () => sheet.current?.close();

  return (
    <>
      <button type="button" className="menu-button" aria-label="Menu" aria-haspopup="dialog" onClick={() => sheet.current?.showModal()}>
        <Bars open={false} />
      </button>
      <dialog ref={sheet} className="menu" aria-label="Menu">
        <div className="menu-top">
          <span className="sticky-name">Vinh Nguyen</span>
          {/* where the menu button was, so the thumb does not have to move to close */}
          <button type="button" className="menu-close" aria-label="Close menu" onClick={close}>
            <Bars open />
          </button>
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
      </dialog>
    </>
  );
}
