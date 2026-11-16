"use client";

import { useEffect, useRef, useState } from "react";

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * The ground and the title of the bar the page's top row becomes once it is
 * scrolled: the row itself (`.actions`, theme and "Save as PDF") is sticky and
 * simply stays; this draws the strip behind it and holds, on its left, the
 * page's OWN title: "Vinh Nguyen" on the CV, "Blog" on the blog, a post's
 * title on the post. Pressing it goes back to the top of the page.
 *
 * The hand-over is CONTINUOUS and tied to the scroll, the way tungv.com does
 * it. The page's big title is not swapped for a small one; it travels there,
 * in two legs (on the CV, so that it never crosses the photo on its left):
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
 * <html>) and flips the discrete things on <html>: `data-head-stuck` from
 * `end` (what has faded out of the top row is then out of reach too), and
 * `data-head-collapsed` at `end + slide` (the names swap). The per-frame motion is a CSS scroll-driven
 * animation (globals.css), which runs off the main thread, so it keeps up
 * during iOS momentum scrolling. Browsers without scroll timelines get the
 * same motion from a requestAnimationFrame loop here.
 */
export function StickyBar() {
  const bar = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLSpanElement>(null);
  // the page's own heading, read once it is on screen
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle(document.querySelector("main h1")?.textContent?.trim() ?? "");
  }, []);

  useEffect(() => {
    if (!title) return;
    const root = document.documentElement;
    const heading = document.querySelector<HTMLElement>("main h1");
    const barEl = bar.current;
    const slotEl = slot.current;
    if (!heading || !barEl || !slotEl) return;

    // Two ways for the big title to become the bar's:
    //  "land"  one line, and the bar can show all of it: it shrinks and travels
    //          until it sits exactly on the bar's title, then they swap.
    //  "fade"  it wraps (a long post title on a phone) or the bar must cut it
    //          short: one cannot land on the other, so it shrinks towards the
    //          bar and fades out over the last stretch as the bar's fades in.
    let mode: "land" | "fade" = "land";
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
      const moving = !still.matches;
      const travels = moving && mode === "land";
      const fades = moving && mode === "fade";
      if (!native) {
        // scale and translate are separate properties: translate is in page pixels, unscaled
        const late = clamp((up - 0.6) / 0.4); // the last stretch, where a fading title hands over
        heading.style.scale = moving ? String(1 + (scale - 1) * up) : "";
        // while it slides left it also moves DOWN the page by as much as the page
        // has scrolled since `end`: on screen, it stays in the bar's row
        heading.style.translate = travels ? `${dx * left}px ${slide * left}px` : fades ? `${dx * up}px 0px` : "";
        heading.style.opacity = fades ? String(1 - late) : "";
        slotEl.parentElement!.style.opacity = fades ? String(late) : "";
        barEl.style.opacity = String(still.matches ? Math.floor(up) : clamp((up - 0.5) / 0.5));
      }
      const stuckNow = up >= 1;
      if (stuckNow !== isStuck) {
        isStuck = stuckNow;
        root.toggleAttribute("data-head-stuck", stuckNow);
      }
      // without a travelling title there is no second leg to wait for
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
      const type = getComputedStyle(heading);
      const oneLine = from.height < parseFloat(type.lineHeight) * 1.5;
      mode = oneLine && slotEl.scrollWidth <= slotEl.clientWidth + 1 ? "land" : "fade";
      heading.style.animation = "";
      end = Math.max(1, from.top + window.scrollY - to.top);
      if (mode === "land") {
        dx = to.left - from.left;
        scale = to.width / from.width;
        // the further it has to go sideways, the longer the scroll it gets to do it in;
        // nothing to slide (a centred name under a centred bar title): no second leg
        slide = Math.abs(dx) < 2 ? 1 : Math.min(140, Math.max(40, Math.abs(dx) * 0.6));
      } else {
        // down to the bar's type size, and across so the shrunken block is centred on the bar's title
        scale = parseFloat(getComputedStyle(slotEl).fontSize) / parseFloat(type.fontSize);
        dx = to.left + to.width / 2 - (from.left + (from.width * scale) / 2);
        slide = 1;
      }
      root.style.setProperty("--head-end", `${end}px`);
      root.style.setProperty("--head-end2", `${end + slide}px`);
      root.style.setProperty("--head-slide", `${slide}px`);
      root.style.setProperty("--head-dx", `${dx}px`);
      root.style.setProperty("--head-scale", String(scale));
      root.toggleAttribute("data-head-travels", mode === "land" && !still.matches);
      root.toggleAttribute("data-head-fades", mode === "fade" && !still.matches);
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
      heading.style.opacity = "";
      for (const attr of ["data-head-stuck", "data-head-collapsed", "data-head-travels", "data-head-fades"]) root.removeAttribute(attr);
    };
  }, [title]);

  return (
    <div ref={bar} className="sticky-bar no-print">
      <div className="sticky-inner">
        <a
          className="sticky-name"
          href="#top"
          aria-label={`${title}: back to the top`}
          onClick={(e) => {
            e.preventDefault();
            const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
          }}
        >
          {/* the box the big title lands on: measured, so it hugs the text */}
          <span ref={slot}>{title}</span>
        </a>
      </div>
    </div>
  );
}
