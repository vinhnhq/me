"use client";

import { useEffect, useRef, useState } from "react";
import { KOFI_URL } from "@/lib/site";

/**
 * The Ko-fi button: one small round cup in the bottom right corner of the blog
 * list and of each post, never on the CV. It is NOT always there: it comes in
 * only when the reader reaches the end of the page (this component sits at the
 * end of the page's text and watches its own place), and leaves when they
 * scroll back up. Ko-fi's own floating widget was tried and dropped the same
 * day (2026-11-18): Vinh found it too big and annoying, always on screen.
 */
export function Support() {
  const end = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const mark = end.current;
    if (!mark) return;
    // on screen, or already scrolled past: either way the reader has reached the end
    const seen = new IntersectionObserver(([e]) => setShown(e.isIntersecting || e.boundingClientRect.top < 0));
    seen.observe(mark);
    return () => seen.disconnect();
  }, []);

  return (
    <>
      <span ref={end} aria-hidden="true" />
      <a
        className="kofi no-print"
        href={KOFI_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Buy me a coffee on Ko-fi"
        title="Buy me a coffee"
        data-shown={shown}
        // out of sight is out of reach too, for Tab and for a screen reader
        inert={!shown}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" />
          <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" />
          <path d="M8 2.5v2.5M12 2.5v2.5" />
        </svg>
      </a>
    </>
  );
}
