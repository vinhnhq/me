"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { ThemeControl } from "@/components/reader-controls";

/**
 * A slim bar that slides in at the top once the page's heading has scrolled
 * away: the name (a way home), the theme, and the page's own action.
 * Hidden, it is out of reach of the keyboard and of screen readers too.
 */
export function StickyBar({ name, action }: { name: string; action?: ReactNode }) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const heading = document.querySelector("main h1");
    if (!heading) return;
    // "gone" means under the bar, not merely off the top edge
    const watcher = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting && entry.boundingClientRect.top < 0), {
      rootMargin: "-56px 0px 0px 0px",
    });
    watcher.observe(heading);
    return () => watcher.disconnect();
  }, []);

  return (
    <div className="sticky-bar no-print" data-stuck={stuck} inert={!stuck}>
      <div className="sticky-inner">
        <Link className="sticky-name" href="/">
          {name}
        </Link>
        <span className="controls">
          <ThemeControl />
          {action}
        </span>
      </div>
    </div>
  );
}
