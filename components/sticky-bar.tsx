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
 * it. On the CV the big name is not swapped for a small one: it shrinks and
 * slides sideways as the page moves, and arrives exactly on the bar's own name
 * at the moment the bar is fully there. Only then do the two change places.
 *
 *   progress 0 → 1   = scroll 0 → the point where the heading's top meets the
 *                      top of the bar's name ("end")
 *   the heading       translateX(dx · p) scale(1 + (scale − 1) · p), from its top-left
 *   the bar           fades in over the last 40% of the way
 *
 * This component only MEASURES (end, dx, scale → CSS variables on <html>) and
 * flips the two discrete things at the end (who is visible, whether the bar
 * can be used). The per-frame motion is a CSS scroll-driven animation
 * (globals.css), which runs off the main thread, so it keeps up during iOS
 * momentum scrolling. Browsers without scroll timelines get the same motion
 * from a requestAnimationFrame loop here.
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
    let dx = 0;
    let scale = 1;
    let isStuck = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      const p = clamp(window.scrollY / end);
      const travels = isName && !still.matches;
      if (!native) {
        heading.style.transform = travels ? `translateX(${dx * p}px) scale(${1 + (scale - 1) * p})` : "";
        barEl.style.opacity = String(still.matches ? Math.floor(p) : clamp((p - 0.6) / 0.4));
      }
      const done = p >= 1;
      if (done !== isStuck) {
        isStuck = done;
        setStuck(done);
        root.toggleAttribute("data-head-collapsed", done);
      }
    };

    const measure = () => {
      // where the heading really is, without the motion applied to it
      heading.style.animation = "none";
      heading.style.transform = "";
      const from = heading.getBoundingClientRect();
      const to = slotEl.getBoundingClientRect();
      heading.style.animation = "";
      end = Math.max(1, from.top + window.scrollY - to.top);
      dx = to.left - from.left;
      scale = to.width / from.width;
      root.style.setProperty("--head-end", `${end}px`);
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
      heading.style.transform = "";
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
