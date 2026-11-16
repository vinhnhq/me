"use client";

import { useEffect, useState } from "react";
import { THEME_KEY, type ThemeId } from "@/lib/themes";

const systemTheme = (): ThemeId => (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

const icon = {
  viewBox: "0 0 24 24",
  width: 18,
  height: 18,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

/** One button: light ⇄ dark. The choice is kept in this browser only. */
export function ThemePicker() {
  // unknown until mounted: the server cannot see the browser's choice
  const [active, setActive] = useState<ThemeId | null>(null);

  useEffect(() => {
    setActive((document.documentElement.dataset.theme as ThemeId | undefined) ?? systemTheme());
  }, []);

  function toggle() {
    const next: ThemeId = (active ?? systemTheme()) === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    setActive(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // private mode: the theme still applies for this visit
    }
  }

  const dark = active === "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
    >
      {dark ? (
        <svg {...icon}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg {...icon}>
          <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
        </svg>
      )}
    </button>
  );
}
