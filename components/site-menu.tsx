"use client";

import Link from "next/link";
import { type CSSProperties, type MouseEvent, useRef, useState } from "react";
import { SizeControl, ThemeControl } from "@/components/reader-controls";

export type MenuLink = { readonly href: string; readonly label: string; readonly note?: string };

function Bars({ open }: { open: boolean }) {
  return (
    <span className="bars" data-open={open} aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

const LEAVE_MS = 240;

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
    const bars = e.currentTarget.querySelector(".bars")?.getBoundingClientRect() ?? from;
    d.style.setProperty("--menu-x", `${bars.left}px`);
    d.showModal();
    const c = closer.current;
    if (c) {
      c.style.transition = "none";
      for (const [k, v] of [["--from-x", "0px"], ["--from-y", "0px"], ["--from-scale", "1"]]) c.style.setProperty(k, v);
      const to = c.getBoundingClientRect();
      c.style.setProperty("--from-x", `${from.left + from.width / 2 - (to.left + to.width / 2)}px`);
      c.style.setProperty("--from-y", `${from.top + from.height / 2 - (to.top + to.height / 2)}px`);
      c.style.setProperty("--from-scale", String(from.width / to.width));
      void c.offsetWidth;
      c.style.transition = "";
    }
    requestAnimationFrame(() => setOpen(true));
  }

  function hide() {
    setOpen(false);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    leaving.current = setTimeout(() => sheet.current?.close(), still ? 0 : LEAVE_MS);
  }

  return (
    <>
      <button type="button" className="menu-button" aria-label="Menu" aria-haspopup="dialog" onClick={show}>
        <Bars open={open} />
      </button>
      <dialog
        ref={sheet}
        className="menu"
        aria-label="Menu"
        data-open={open}
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
          {/* react-doctor-disable-next-line react-doctor/nextjs-no-a-element */}
          <a href="/api/pdf" rel="nofollow" onClick={hide} style={{ "--i": links.length } as CSSProperties}>
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
