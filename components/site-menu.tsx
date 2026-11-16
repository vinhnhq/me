"use client";

import Link from "next/link";
import { type CSSProperties, type MouseEvent, useRef, useState } from "react";
import { SizeControl, ThemeControl } from "@/components/reader-controls";

export type MenuLink = { readonly href: string; readonly label: string; readonly note?: string };

/** Two bars that cross into an X when `open`, and uncross when not: a CSS transition, both ways. */
function Bars({ open }: { open: boolean }) {
  return (
    <span className="bars" data-open={open} aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

/** how long the menu takes to fade away; the dialog is closed when it has */
const LEAVE_MS = 240;

/**
 * The phone's menu: a full-screen sheet with the pages, "Save as PDF", the
 * theme and the text size, behind a menu button at the left of the top row.
 *
 * The sheet does not slide in from anywhere. Its own top row is laid exactly
 * over the page's (the close button on the menu button, to the pixel, wherever
 * the page is scrolled), and the sheet fades in around it while the two bars
 * cross into an X. So what the eye follows is ONE button turning, in place,
 * and the page giving way to the menu under it; closing runs it backwards.
 *
 * A native <dialog> opened with showModal(): the browser traps focus, closes
 * on Escape and makes the page inert. (Vaul, shadcn's drawer, was tried: on
 * iOS it pins <body> with `position: fixed` to lock scrolling, which zeroes
 * `scrollY`, and this page's header is driven by `scrollY`, so opening the
 * menu threw the header back to its top-of-page state.)
 */
export function SiteMenu({ links }: { links: readonly MenuLink[] }) {
  const sheet = useRef<HTMLDialogElement>(null);
  const leaving = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [open, setOpen] = useState(false);

  function show(e: MouseEvent<HTMLButtonElement>) {
    const d = sheet.current;
    if (!d) return;
    clearTimeout(leaving.current);
    // the close button goes exactly where this button is right now
    const at = e.currentTarget.getBoundingClientRect();
    d.style.setProperty("--menu-y", `${at.top}px`);
    d.style.setProperty("--menu-x", `${at.left}px`);
    d.showModal();
    // one frame later, so the sheet is painted in its "closed" look first and the change is a transition
    requestAnimationFrame(() => setOpen(true));
  }

  function hide() {
    setOpen(false);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    leaving.current = setTimeout(() => sheet.current?.close(), still ? 0 : LEAVE_MS);
  }

  return (
    <>
      {/* It and the sheet's close button are in the same spot and turn together. */}
      <button type="button" className="menu-button" aria-label="Menu" aria-haspopup="dialog" onClick={show}>
        <Bars open={open} />
      </button>
      <dialog
        ref={sheet}
        className="menu"
        aria-label="Menu"
        data-open={open}
        // Escape: leave the same way as the button, not in one frame
        onCancel={(e) => {
          e.preventDefault();
          hide();
        }}
      >
        <div className="menu-top">
          <button type="button" className="menu-close" aria-label="Close menu" onClick={hide}>
            <Bars open={open} />
          </button>
          <span className="menu-title">Vinh Nguyen</span>
        </div>
        <nav className="menu-links" aria-label="Pages">
          {links.map((l, i) => (
            <Link key={l.href} href={l.href} onClick={hide} style={{ "--i": i } as CSSProperties}>
              {l.label}
              {l.note && <span>{l.note}</span>}
            </Link>
          ))}
          {/* a plain link: this one is a file to download, not a page to route to */}
          <a href="/api/pdf" onClick={hide} style={{ "--i": links.length } as CSSProperties}>
            Save as PDF
            <span>The résumé, 2 pages</span>
          </a>
        </nav>
        <div className="menu-settings" style={{ "--i": links.length + 1 } as CSSProperties}>
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
