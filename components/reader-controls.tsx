"use client";

import { type ReactNode, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { SIZE_KEY, type SizeId, THEME_KEY, type ThemeId } from "@/lib/themes";

type Option<T extends string> = { readonly id: T; readonly label: string; readonly icon: ReactNode };

/** A pill of round buttons, one of them filled: the chosen one. */
function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly Option<T>[];
  /** null until mounted: the server cannot see the browser's choice */
  value: T | null;
  /** the pressed button comes along: the theme change grows out of it */
  onChange: (id: T, from: HTMLElement) => void;
}) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          aria-label={o.label}
          title={o.label}
          onClick={(e) => onChange(o.id, e.currentTarget)}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}

const svg = {
  viewBox: "0 0 24 24",
  width: 16,
  height: 16,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

type ThemeChoice = ThemeId | "system";

const THEME_OPTIONS: readonly Option<ThemeChoice>[] = [
  {
    id: "light",
    label: "Light theme",
    icon: (
      <svg {...svg}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    ),
  },
  {
    id: "dark",
    label: "Dark theme",
    icon: (
      <svg {...svg}>
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
      </svg>
    ),
  },
  {
    id: "system",
    label: "Follow the device",
    icon: (
      <svg {...svg}>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </svg>
    ),
  },
];

const letter = (px: number) => (
  <span className="size-letter" aria-hidden="true" style={{ fontSize: px }}>
    A
  </span>
);

const SIZE_OPTIONS: readonly Option<SizeId>[] = [
  { id: "s", label: "Small text", icon: letter(12) },
  { id: "m", label: "Medium text", icon: letter(14) },
  { id: "l", label: "Large text", icon: letter(16) },
];

const systemTheme = (): ThemeId => (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

function store(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // private mode: the choice still applies for this visit
  }
}

/*
  The choices live on <html> (data-theme, data-size), not in React state: the
  page shows these controls twice (the top bar and the sticky bar), and both
  must show the same thing. A change is announced with an event; every control
  re-reads <html>.
*/
const CHANGED = "reader-settings";
const announce = () => window.dispatchEvent(new Event(CHANGED));

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGED, onChange);
  return () => window.removeEventListener(CHANGED, onChange);
}
const readTheme = (): ThemeChoice => (document.documentElement.dataset.theme as ThemeId | undefined) ?? "system";
const readSize = (): SizeId => (document.documentElement.dataset.size as SizeId | undefined) ?? "m";
// the server cannot see the browser's choice: nothing is marked until hydration
const unknown = () => null;

/** Light / dark / follow the device. Kept in this browser only. */
export function ThemeControl() {
  const theme = useSyncExternalStore(subscribe, readTheme, unknown);

  function chooseTheme(id: ThemeChoice, from: HTMLElement) {
    const root = document.documentElement;
    const apply = () => {
      if (id === "system") delete root.dataset.theme;
      else root.dataset.theme = id;
      store(THEME_KEY, id === "system" ? null : id);
      announce();
    };

    // Circular reveal: the new theme opens as a circle growing from the pressed
    // button. Skipped when nothing would change colour (light → "device" on a
    // light device), for reduced motion, and where View Transitions are missing.
    const isDark = (theme: string | undefined) => (theme ?? systemTheme()) === "dark";
    const changes = isDark(root.dataset.theme) !== isDark(id === "system" ? undefined : id);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!changes || still || !document.startViewTransition) return apply();

    const box = from.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    // far enough to reach the farthest corner of the screen
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add("theme-transition");
    const transition = document.startViewTransition(() => flushSync(apply));
    transition.ready
      .then(() =>
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 380, easing: "cubic-bezier(0.32, 0, 0.15, 1)", pseudoElement: "::view-transition-new(root)" },
        ),
      )
      .catch(() => {});
    transition.finished.finally(() => root.classList.remove("theme-transition"));
  }

  return <Segmented label="Theme" options={THEME_OPTIONS} value={theme} onChange={chooseTheme} />;
}

/** Small / medium / large text. Kept in this browser only. */
export function SizeControl() {
  const size = useSyncExternalStore(subscribe, readSize, unknown);

  function chooseSize(id: SizeId) {
    document.documentElement.dataset.size = id;
    store(SIZE_KEY, id);
    announce();
  }

  return <Segmented label="Text size" options={SIZE_OPTIONS} value={size} onChange={chooseSize} />;
}
