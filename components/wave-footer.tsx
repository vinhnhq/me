import type { CSSProperties } from "react";

/**
 * The page's last few centimetres: thin sine lines that fade in, swell and
 * slide into place as the reader reaches the bottom, all crossing at the
 * centre once they settle. (The idea is from tungv.com; this is our own build.)
 *
 * No script. Each line is a coloured strip seen through an SVG mask of one
 * sine period, repeated sideways; the motion is a CSS scroll-driven animation
 * (`.waves` in globals.css). Browsers without it, and readers who ask for
 * reduced motion, get the settled lines.
 */
const HEIGHT = 120;

type Line = {
  /** one period, in px */
  readonly tile: number;
  /** peak height in px; negative starts downwards */
  readonly amp: number;
  /** how far it slides in from, in px */
  readonly shift: number;
  readonly color: string;
};

const LINES: readonly Line[] = [
  { tile: 1400, amp: 22, shift: 520, color: "var(--accent)" },
  { tile: 1100, amp: -30, shift: -380, color: "oklch(0.7 0.14 240)" },
  { tile: 1750, amp: 36, shift: 300, color: "oklch(0.66 0.19 300)" },
  { tile: 950, amp: -16, shift: -640, color: "oklch(0.76 0.14 75)" },
  { tile: 2100, amp: 28, shift: 760, color: "oklch(0.72 0.11 185)" },
];

/** One sine period as an SVG mask; it crosses the middle line at its centre. */
function mask({ tile, amp }: Line): string {
  const steps = 64;
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const x = (tile * i) / steps;
    const y = HEIGHT / 2 - amp * Math.sin((2 * Math.PI * i) / steps);
    return `${x.toFixed(1)} ${y.toFixed(2)}`;
  });
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tile} ${HEIGHT}" preserveAspectRatio="none">` +
    `<path d="M${points.join(" L")}" fill="none" stroke="#000" stroke-width="1.25" vector-effect="non-scaling-stroke"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function WaveFooter() {
  return (
    <div className="waves no-print" aria-hidden="true">
      <div className="waves-band" style={{ height: HEIGHT }}>
        {LINES.map((line) => {
          const image = mask(line);
          return (
            <span
              key={line.tile}
              className="wave"
              style={
                {
                  backgroundColor: line.color,
                  maskImage: image,
                  WebkitMaskImage: image,
                  "--tile": `${line.tile}px`,
                  "--shift": `${line.shift}px`,
                } as CSSProperties
              }
            />
          );
        })}
      </div>
    </div>
  );
}
