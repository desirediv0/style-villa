"use client";

import { cn } from "@/lib/utils";

/**
 * Elegant floating decorative marks — sparkles, thin rings, dots and diamonds
 * in the brand palette that drift and twinkle forever. Purely decorative
 * (pointer-events-none, aria-hidden), CSS-driven, reduced-motion aware.
 *
 * Positions are a fixed set (no Math.random) so SSR and client markup match.
 * tone: "light" (for ivory/white sections) | "dark" (for noir sections).
 * density: "low" | "normal" — how many marks to render.
 */

// type: dot | ring | star | plus | diamond
// pos in %, size in px, d = float dur, t = twinkle dur, delay, o1/o2 = opacity range
const MARKS = [
  { type: "star", top: 12, left: 8, size: 16, d: 10, t: 6, delay: 0, o1: 0.15, o2: 0.7, c: "gold" },
  { type: "ring", top: 24, left: 90, size: 26, d: 13, t: 8, delay: 1.2, o1: 0.1, o2: 0.4, c: "azure" },
  { type: "dot", top: 70, left: 6, size: 6, d: 8, t: 5, delay: 0.6, o1: 0.2, o2: 0.8, c: "orchid" },
  { type: "plus", top: 82, left: 82, size: 16, d: 11, t: 7, delay: 2.1, o1: 0.12, o2: 0.55, c: "gold" },
  { type: "diamond", top: 44, left: 95, size: 14, d: 12, t: 6.5, delay: 0.3, o1: 0.1, o2: 0.45, c: "orchid" },
  { type: "star", top: 60, left: 48, size: 11, d: 9, t: 5.5, delay: 1.7, o1: 0.1, o2: 0.5, c: "azure" },
  { type: "dot", top: 16, left: 40, size: 4, d: 7.5, t: 4.5, delay: 2.6, o1: 0.15, o2: 0.7, c: "gold" },
  { type: "ring", top: 88, left: 30, size: 18, d: 14, t: 9, delay: 0.9, o1: 0.08, o2: 0.35, c: "orchid" },
  { type: "star", top: 34, left: 22, size: 12, d: 10.5, t: 6, delay: 3.2, o1: 0.1, o2: 0.55, c: "gold" },
  { type: "dot", top: 50, left: 74, size: 5, d: 8.5, t: 5, delay: 1.1, o1: 0.2, o2: 0.75, c: "azure" },
  { type: "plus", top: 8, left: 66, size: 13, d: 11.5, t: 7.5, delay: 2.4, o1: 0.1, o2: 0.45, c: "orchid" },
  { type: "diamond", top: 76, left: 58, size: 12, d: 12.5, t: 6, delay: 0.4, o1: 0.1, o2: 0.4, c: "azure" },
  { type: "dot", top: 30, left: 60, size: 4, d: 9, t: 4.8, delay: 3.6, o1: 0.15, o2: 0.65, c: "gold" },
  { type: "star", top: 92, left: 12, size: 14, d: 13.5, t: 8, delay: 1.5, o1: 0.12, o2: 0.5, c: "orchid" },
];

const COLOR = {
  light: { gold: "#B98BB6", azure: "#3FA9D6", orchid: "#A958A4" },
  dark: { gold: "#E2AEDF", azure: "#6FD1F8", orchid: "#C285BE" },
};

function Mark({ m, tone }) {
  const color = COLOR[tone][m.c];
  const rot = m.type === "diamond" ? 45 : 0;
  const style = {
    top: `${m.top}%`,
    left: `${m.left}%`,
    width: m.size,
    height: m.size,
    color,
    "--d": `${m.d}s`,
    "--t": `${m.t}s`,
    "--delay": `${m.delay}s`,
    "--o1": m.o1,
    "--o2": m.o2,
    "--r": `${rot}deg`,
  };

  let inner = null;
  if (m.type === "dot") {
    inner = <span className="block w-full h-full rounded-full" style={{ background: color }} />;
  } else if (m.type === "ring") {
    inner = <span className="block w-full h-full rounded-full border" style={{ borderColor: color }} />;
  } else if (m.type === "diamond") {
    inner = <span className="block w-full h-full border" style={{ borderColor: color }} />;
  } else if (m.type === "plus") {
    inner = (
      <span className="relative block w-full h-full">
        <span className="absolute top-1/2 left-0 w-full -translate-y-1/2" style={{ height: 1, background: color }} />
        <span className="absolute left-1/2 top-0 h-full -translate-x-1/2" style={{ width: 1, background: color }} />
      </span>
    );
  } else {
    // star / sparkle
    inner = (
      <span
        className="block leading-none"
        style={{ fontSize: m.size, color }}
      >
        ✦
      </span>
    );
  }

  return (
    <span className="float-mark absolute flex items-center justify-center" style={style}>
      {inner}
    </span>
  );
}

export default function FloatingElements({ tone = "light", density = "normal", className }) {
  const marks = density === "low" ? MARKS.filter((_, i) => i % 2 === 0) : MARKS;
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      {marks.map((m, i) => (
        <Mark key={i} m={m} tone={tone} />
      ))}
    </div>
  );
}
