"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ThemeControl } from "@/components/reader-controls";

/** Collapse going down, expand coming back, and NOT at the same point: one
 *  threshold would fire a transition per pixel under a resting finger. */
const HYSTERESIS = 32;

/**
 * A slim bar that takes over at the top once the page's heading has scrolled
 * away: the name (a way home), the theme, and the page's own action.
 *
 * The hand-over is K-Studio's collapsing page head (`collapsing-page-head.tsx`
 * there): a DISCRETE flip at a scroll threshold, drawn by the browser as a
 * view transition. On the CV the big name and the bar's name share one
 * `view-transition-name`, so the name itself shrinks and travels into the
 * bar. A per-frame scroll effect would stall during iOS momentum scrolling;
 * a snapshot morph does not need the main thread.
 *
 * Hidden, the bar is out of reach of the keyboard and of screen readers.
 */
export function StickyBar({ name, action }: { name: string; action?: ReactNode }) {
  const [stuck, setStuck] = useState(false);
  const isStuck = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    const heading = document.querySelector<HTMLElement>("main h1");
    if (!heading) return;
    // the name travels only when the heading IS the name; "Blog" must not turn into it
    const morph = heading.textContent?.trim() === name;

    const flip = (next: boolean) => {
      const apply = () => {
        setStuck(next);
        // the heading keeps its box (no jump in the page) but hands its place to the bar
        root.toggleAttribute("data-head-collapsed", next);
      };
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // no API, or less motion asked for: swap outright; only the morph is lost
      if (still || !document.startViewTransition) return apply();
      root.classList.add("head-transition");
      root.classList.toggle("head-morph", morph);
      // flushSync: the DOM must change INSIDE the callback, or the "after" snapshot shows no change
      const transition = document.startViewTransition(() => flushSync(apply));
      // a transition skipped by a newer one rejects its promises; the page is right either way
      transition.ready.catch(() => {});
      transition.finished.catch(() => {}).finally(() => root.classList.remove("head-transition", "head-morph"));
    };

    const onScroll = () => {
      // The flip happens as the heading reaches the top edge, while it is still on
      // screen: the bar lands exactly over it, and the name is seen to shrink into
      // place. Read live, so a text-size change is followed.
      const collapseAt = heading.getBoundingClientRect().top + window.scrollY - 12;
      const y = window.scrollY;
      if (!isStuck.current && y > collapseAt) {
        isStuck.current = true;
        flip(true);
      } else if (isStuck.current && y < collapseAt - HYSTERESIS) {
        isStuck.current = false;
        flip(false);
      }
    };

    onScroll(); // a reload half way down starts collapsed
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      root.removeAttribute("data-head-collapsed");
    };
  }, [name]);

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
