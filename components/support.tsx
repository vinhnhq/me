"use client";

import Script from "next/script";
import { KOFI_NAME } from "@/lib/site";

declare global {
  interface Window {
    kofiWidgetOverlay?: { draw: (name: string, options: Record<string, string>) => void };
  }
}

/**
 * Ko-fi's own floating button ("Support me", bottom left), on the blog list
 * and on each post; never on the CV. Vinh chose the widget over a plain link
 * (2026-11-18). Its script is loaded when the browser is idle, after the page
 * itself, so it does not slow the first paint.
 */
export function Support() {
  return (
    <Script
      src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
      strategy="lazyOnload"
      onReady={() => {
        // client-side navigation mounts this again: draw the button only once
        if (document.querySelector('[id^="kofi-widget-overlay"]')) return;
        window.kofiWidgetOverlay?.draw(KOFI_NAME, {
          type: "floating-chat",
          "floating-chat.donateButton.text": "Support me",
          "floating-chat.donateButton.background-color": "#800020",
          "floating-chat.donateButton.text-color": "#fff",
        });
      }}
    />
  );
}
