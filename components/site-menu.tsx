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
 * The sheet does not slide in from anywhere: it fades in over the page. Its
 * close button is large and sits in the top right corner, but it does not
 * simply appear there. It starts exactly on the menu button (same place, same
 * size) and travels to the corner, growing, while its two bars cross into an
 * X; closing sends it back and uncrosses them. So the eye follows ONE button
 * from where the thumb pressed to where it will press next.
 *
 * A native <dialog> opened with showModal(): the browser traps focus, closes
 * on Escape and makes the page inert. (Vaul, shadcn's drawer, was tried: on
 * iOS it pins <body> with `position: fixed` to lock scrolling, which zeroes
 * `scrollY`, and this page's header is driven by `scrollY`, so opening the
 * menu threw the header back to its top-of-page state.)
 */
export function SiteMenu({ links }: { links: readonly MenuLink[] }) {
  const sheet = useRef<HTMLDialogElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  const leaving = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [open, setOpen] = useState(false);

  function show(e: MouseEvent<HTMLButtonElement>) {
    const d = sheet.current;
    if (!d) return;
    clearTimeout(leaving.current);
    const from = e.currentTarget.getBoundingClientRect();
    // the links keep the page's own left edge: where the BARS start (the button's
    // round area is invisible and reaches further left than what is drawn)
    const bars = e.currentTarget.querySelector(".bars")?.getBoundingClientRect() ?? from;
    d.style.setProperty("--menu-x", `${bars.left}px`);
    d.showModal();
    // The close button starts ON the menu button: measure how far its corner is
    // from there and how much bigger it is, and hand that to the CSS as its
    // "closed" pose. No transition while it is being put there.
    const c = closer.current;
    if (c) {
      c.style.transition = "none";
      for (const [k, v] of [["--from-x", "0px"], ["--from-y", "0px"], ["--from-scale", "1"]]) c.style.setProperty(k, v);
      const to = c.getBoundingClientRect();
      c.style.setProperty("--from-x", `${from.left + from.width / 2 - (to.left + to.width / 2)}px`);
      c.style.setProperty("--from-y", `${from.top + from.height / 2 - (to.top + to.height / 2)}px`);
      c.style.setProperty("--from-scale", String(from.width / to.width));
      void c.offsetWidth; // the pose is applied before transitions are switched back on
      c.style.transition = "";
    }
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
        <button ref={closer} type="button" className="menu-close" aria-label="Close menu" onClick={hide}>
          <Bars open={open} />
        </button>
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
