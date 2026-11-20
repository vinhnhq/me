"use client";

import type { ColorSchemeValue } from "@ui-sdk/core";
import { usePreference } from "@ui-sdk/react/preferences";
import { SegmentedControl, SegmentedControlItem } from "@ui-sdk/react/segmented-control";
import { type ReactNode, useRef, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { type SizeId, colorScheme, textSize } from "@/lib/preferences";

type Option<T extends string> = { readonly id: T; readonly label: string; readonly icon: ReactNode };

// The server cannot see the browser's choice, so nothing is marked until the page has hydrated.
const noop = () => () => {};
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

/**
 * A pill of round buttons, one of them filled: the chosen one. ui-sdk's
 * segmented control is a radio group: one Tab stop, arrow keys move the choice.
 */
function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly Option<T>[];
  value: T;
  /** the chosen button comes along: the theme change grows out of it */
  onChange: (id: T, from: HTMLElement | null) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  return (
    <SegmentedControl<T>
      ref={root}
      className="segmented"
      aria-label={label}
      value={hydrated ? value : null}
      onValueChange={(next) => {
        if (next) onChange(next, root.current?.querySelector<HTMLElement>(`[data-option="${next}"]`) ?? null);
      }}
    >
      {options.map((o) => (
        <SegmentedControlItem key={o.id} value={o.id} data-option={o.id} aria-label={o.label} title={o.label}>
          {o.icon}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
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

const THEME_OPTIONS: readonly Option<ColorSchemeValue>[] = [
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

/** Light / dark / follow the device. Kept in this browser only. */
export function ThemeControl() {
  const scheme = usePreference(colorScheme);

  function chooseTheme(id: ColorSchemeValue, from: HTMLElement | null) {
    const apply = () => colorScheme.set(id, { reason: "item-press" });

    // Circular reveal: the new theme opens as a circle growing from the chosen
    // button. Skipped when nothing would change colour (light to "device" on a
    // light device), for reduced motion, and where View Transitions are missing.
    const next = id === "system" ? scheme.system : id;
    const changes = next !== scheme.resolved;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!changes || still || !from || !document.startViewTransition) return void apply();

    const root = document.documentElement;
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

  return <Segmented label="Theme" options={THEME_OPTIONS} value={scheme.value} onChange={chooseTheme} />;
}

/** Small / medium / large text. Kept in this browser only. */
export function SizeControl() {
  const size = usePreference(textSize);
  return <Segmented label="Text size" options={SIZE_OPTIONS} value={size.value} onChange={(id) => textSize.set(id, { reason: "item-press" })} />;
}
