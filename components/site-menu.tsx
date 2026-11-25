"use client";

import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@ui-sdk/react/dialog";
import Link from "next/link";
import { type CSSProperties, useRef, useState } from "react";
import { SizeControl, ThemeControl } from "@/components/reader-controls";

export type MenuLink = { readonly href: string; readonly label: string; readonly note?: string };

function Bars() {
  return (
    <span className="bars" aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

export function SiteMenu({ links }: { links: readonly MenuLink[] }) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [from, setFrom] = useState<CSSProperties>({});

  function measure() {
    const button = trigger.current;
    if (!button) return;
    const box = button.getBoundingClientRect();
    const bars = button.querySelector(".bars")?.getBoundingClientRect() ?? box;
    setFrom({
      "--menu-x": `${bars.left}px`,
      "--from-cx": `${box.left + box.width / 2}px`,
      "--from-cy": `${box.top + box.height / 2}px`,
    } as CSSProperties);
  }

  return (
    <Dialog onOpenChange={(open) => open && measure()}>
      <DialogTrigger ref={trigger} className="menu-button" aria-label="Menu">
        <Bars />
      </DialogTrigger>
      <DialogContent className="menu" aria-label="Menu" style={from}>
        <DialogClose className="menu-close" aria-label="Close menu">
          <Bars />
        </DialogClose>
        <nav className="menu-links" aria-label="Pages">
          {links.map((l, i) => (
            <DialogClose
              key={l.href}
              render={({ type: _, ...props }) => <Link {...props} href={l.href} />}
              style={{ "--i": i } as CSSProperties}
            >
              {l.label}
              {l.note && <span>{l.note}</span>}
            </DialogClose>
          ))}
          <DialogClose
            // react-doctor-disable-next-line react-doctor/nextjs-no-a-element
            render={({ type: _, ...props }) => <a {...props} href="/api/pdf" rel="nofollow" />}
            style={{ "--i": links.length } as CSSProperties}
          >
            Save as PDF
            <span>The résumé, 2 pages</span>
          </DialogClose>
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
      </DialogContent>
    </Dialog>
  );
}
