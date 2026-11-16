"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { ThemeControl } from "@/components/reader-controls";

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * A slim bar that takes over at the top once the page's heading has scrolled
 * up to it: the name (a way home), the theme, and the page's own action.
 *
 * The hand-over is CONTINUOUS and tied to the scroll, the way tungv.com does
 * it. On the CV the big name is not swapped for a small one; it travels there,
 * in two legs, so that it never crosses the photo on its left:
 *
 *   leg 1, UP     scroll 0 → end          the name rides up with the page,
 *                                         shrinking to the bar's size; the bar
 *                                         fades in over the second half
 *   leg 2, LEFT   scroll end → end+slide  the name stays in the bar's row and
 *                                         slides left onto the bar's own name
 *
 * Only then do the two change places. `end` is the scroll at which the
 * heading's top meets the top of the bar's name.
 *
 * This component only MEASURES (end, slide, dx, scale → CSS variables on
 * <html>) and flips the discrete things (the bar usable from `end`, the names
 * swapped at `end + slide`). The per-frame motion is a CSS scroll-driven
 * animation (globals.css), which runs off the main thread, so it keeps up
 * during iOS momentum scrolling. Browsers without scroll timelines get the
 * same motion from a requestAnimationFrame loop here.
 */
export function StickyBar({ name, action }: { name: string; action?: ReactNode }) {
  const [stuck, setStuck] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const heading = document.querySelector<HTMLElement>("main h1");
    const barEl = bar.current;
    const slotEl = slot.current;
    if (!heading || !barEl || !slotEl) return;

    // the name travels only when the heading IS the name; "Blog" just scrolls under the bar
    const isName = heading.textContent?.trim() === name;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const native = CSS.supports("animation-timeline: scroll()");
    let end = 1;
    let slide = 1;
    let dx = 0;
    let scale = 1;
    let isStuck = false;
    let isSwapped = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const up = clamp(y / end);
      const left = clamp((y - end) / slide);
      const travels = isName && !still.matches;
      if (!native) {
        // scale and translate are separate properties: translate is in page pixels, unscaled
        heading.style.scale = travels ? String(1 + (scale - 1) * up) : "";
        // while it slides left it also moves DOWN the page by as much as the page
        // has scrolled since `end`: on screen, it stays in the bar's row
        heading.style.translate = travels ? `${dx * left}px ${slide * left}px` : "";
        barEl.style.opacity = String(still.matches ? Math.floor(up) : clamp((up - 0.5) / 0.5));
      }
      const stuckNow = up >= 1;
      if (stuckNow !== isStuck) {
        isStuck = stuckNow;
        setStuck(stuckNow);
      }
      // without a travelling name there is no second leg to wait for
      const swappedNow = travels ? left >= 1 : stuckNow;
      if (swappedNow !== isSwapped) {
        isSwapped = swappedNow;
        root.toggleAttribute("data-head-collapsed", swappedNow);
      }
    };

    const measure = () => {
      // where the heading really is, without the motion applied to it
      heading.style.animation = "none";
      heading.style.scale = "";
      heading.style.translate = "";
      const from = heading.getBoundingClientRect();
      const to = slotEl.getBoundingClientRect();
      heading.style.animation = "";
      end = Math.max(1, from.top + window.scrollY - to.top);
      dx = to.left - from.left;
      scale = to.width / from.width;
      // the further it has to go sideways, the longer the scroll it gets to do it in
      slide = Math.min(140, Math.max(40, Math.abs(dx) * 0.6));
      root.style.setProperty("--head-end", `${end}px`);
      root.style.setProperty("--head-end2", `${end + slide}px`);
      root.style.setProperty("--head-slide", `${slide}px`);
      root.style.setProperty("--head-dx", `${dx}px`);
      root.style.setProperty("--head-scale", String(scale));
      root.toggleAttribute("data-head-travels", isName && !still.matches);
      update();
    };

    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };

    measure(); // also right for a reload half way down
    document.fonts?.ready.then(measure);
    // a new text size, a rotated tablet, a resized window: the geometry changes
    const resized = new ResizeObserver(measure);
    resized.observe(document.body);
    still.addEventListener("change", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      resized.disconnect();
      still.removeEventListener("change", measure);
      window.removeEventListener("scroll", onScroll);
      heading.style.scale = "";
      heading.style.translate = "";
      for (const attr of ["data-head-collapsed", "data-head-travels"]) root.removeAttribute(attr);
    };
  }, [name]);

  return (
    <div ref={bar} className="sticky-bar no-print" data-stuck={stuck} inert={!stuck}>
      <div className="sticky-inner">
        <Link className="sticky-name" href="/">
          {/* the box the big name lands on: measured, so it hugs the text */}
          <span ref={slot}>{name}</span>
        </Link>
        <span className="controls">
          <ThemeControl />
          {action}
        </span>
      </div>
    </div>
  );
}
