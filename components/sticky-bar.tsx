"use client";

import { useEffect, useRef } from "react";

const clamp = (n: number) => Math.min(1, Math.max(0, n));

export function StickyBar({ title }: { title: string }) {
  const bar = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!title) return;
    const root = document.documentElement;
    const heading = document.querySelector<HTMLElement>("main h1");
    const barEl = bar.current;
    const slotEl = slot.current;
    if (!heading || !barEl || !slotEl) return;

    let mode: "land" | "fade" = "land";
    let legs: 1 | 2 = 1;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const native = CSS.supports("animation-timeline: scroll()");
    let end = 1;
    let slide = 1;
    let dx = 0;
    let scale = 1;
    let isStuck = false;
    let isSwapped = false;
    let frame = 0;
    const nameEl = slotEl.parentElement!;
    const menuButton = document.querySelector<HTMLElement>(".actions > .menu-button");
    const wide = window.matchMedia("(min-width: 60.01rem)");
    const reach = () => {
      nameEl.inert = !isStuck;
      if (menuButton) menuButton.inert = wide.matches && !isStuck;
    };

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const up = clamp(y / end);
      const left = clamp((y - end) / slide);
      const moving = !still.matches;
      const travels = moving && mode === "land" && legs === 2;
      const direct = moving && mode === "land" && legs === 1;
      const fades = moving && mode === "fade";
      if (!native) {
        const late = clamp((up - 0.6) / 0.4);
        heading.style.scale = moving ? String(1 + (scale - 1) * up) : "";
        heading.style.translate = travels ? `${dx * left}px ${slide * left}px` : fades || direct ? `${dx * up}px 0px` : "";
        heading.style.opacity = fades ? String(1 - late) : "";
        slotEl.parentElement!.style.opacity = fades ? String(late) : "";
        barEl.style.opacity = String(still.matches ? Math.floor(up) : clamp((up - 0.5) / 0.5));
      }
      const stuckNow = up >= 1;
      if (stuckNow !== isStuck) {
        isStuck = stuckNow;
        root.toggleAttribute("data-head-stuck", stuckNow);
        reach();
      }
      const swappedNow = travels ? left >= 1 : stuckNow;
      if (swappedNow !== isSwapped) {
        isSwapped = swappedNow;
        root.toggleAttribute("data-head-collapsed", swappedNow);
      }
    };

    const measure = () => {
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
        legs = dx < -2 ? 2 : 1;
        slide = legs === 2 ? Math.min(140, Math.max(40, Math.abs(dx) * 0.6)) : 1;
      } else {
        scale = parseFloat(getComputedStyle(slotEl).fontSize) / parseFloat(type.fontSize);
        dx = to.left + to.width / 2 - (from.left + (from.width * scale) / 2);
        slide = 1;
      }
      root.style.setProperty("--head-end", `${end}px`);
      root.style.setProperty("--head-end2", `${end + slide}px`);
      root.style.setProperty("--head-slide", `${slide}px`);
      root.style.setProperty("--head-dx", `${dx}px`);
      root.style.setProperty("--head-scale", String(scale));
      root.toggleAttribute("data-head-travels", mode === "land" && legs === 2 && !still.matches);
      root.toggleAttribute("data-head-direct", mode === "land" && legs === 1 && !still.matches);
      root.toggleAttribute("data-head-fades", mode === "fade" && !still.matches);
      update();
      reach();
    };

    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };

    measure();
    document.fonts?.ready.then(measure);
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
      nameEl.inert = false;
      if (menuButton) menuButton.inert = false;
      for (const attr of ["data-head-stuck", "data-head-collapsed", "data-head-travels", "data-head-direct", "data-head-fades"]) root.removeAttribute(attr);
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
          <span ref={slot}>{title}</span>
        </a>
      </div>
    </div>
  );
}
