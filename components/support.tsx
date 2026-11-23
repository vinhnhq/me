"use client";

import { useEffect, useRef, useState } from "react";
import { KOFI_URL } from "@/lib/site";

export function Support() {
  const end = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const mark = end.current;
    if (!mark) return;
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
