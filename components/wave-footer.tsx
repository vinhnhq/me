import type { CSSProperties } from "react";

const HEIGHT = 120;

type Line = {
  readonly tile: number;
  readonly amp: number;
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
