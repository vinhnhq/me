"use client";

import { useEffect, useState } from "react";
import { THEME_KEY, THEMES, type ThemeId } from "@/lib/themes";

const systemTheme = (): ThemeId => (window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "paper");

/** A row of colour dots. The choice is kept in this browser only. */
export function ThemePicker() {
  // unknown until mounted: the server cannot see the browser's choice
  const [active, setActive] = useState<ThemeId | null>(null);

  useEffect(() => {
    setActive((document.documentElement.dataset.theme as ThemeId | undefined) ?? systemTheme());
  }, []);

  function choose(id: ThemeId) {
    document.documentElement.dataset.theme = id;
    setActive(id);
    try {
      localStorage.setItem(THEME_KEY, id);
    } catch {
      // private mode: the theme still applies for this visit
    }
  }

  return (
    <div className="themes" role="group" aria-label="Theme">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          className="theme-dot"
          data-swatch={t.id}
          aria-label={`${t.label} theme`}
          aria-pressed={active === t.id}
          title={t.label}
          onClick={() => choose(t.id)}
        />
      ))}
    </div>
  );
}
