"use client";

import { type ReactNode, useEffect, useState } from "react";
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
  onChange: (id: T) => void;
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
          onClick={() => onChange(o.id)}
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

function store(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // private mode: the choice still applies for this visit
  }
}

/** Text size and theme. Both are kept in this browser only. */
export function ReaderControls() {
  const [theme, setTheme] = useState<ThemeChoice | null>(null);
  const [size, setSize] = useState<SizeId | null>(null);

  useEffect(() => {
    const d = document.documentElement.dataset;
    setTheme((d.theme as ThemeId | undefined) ?? "system");
    setSize((d.size as SizeId | undefined) ?? "m");
  }, []);

  function chooseTheme(id: ThemeChoice) {
    if (id === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = id;
    store(THEME_KEY, id === "system" ? null : id);
    setTheme(id);
  }

  function chooseSize(id: SizeId) {
    document.documentElement.dataset.size = id;
    store(SIZE_KEY, id);
    setSize(id);
  }

  return (
    <>
      <Segmented label="Text size" options={SIZE_OPTIONS} value={size} onChange={chooseSize} />
      <Segmented label="Theme" options={THEME_OPTIONS} value={theme} onChange={chooseTheme} />
    </>
  );
}
