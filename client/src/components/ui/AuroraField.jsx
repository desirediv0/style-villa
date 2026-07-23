"use client";

import { cn } from "@/lib/utils";

/**
 * Ambient living background — a few softly-blurred colour orbs that drift
 * forever. Purely decorative (pointer-events-none, aria-hidden) and CSS-driven,
 * so it costs nothing at runtime and respects prefers-reduced-motion.
 *
 * variant: "light" (subtle, for ivory sections) | "dark" (richer, for noir).
 */
export default function AuroraField({ variant = "light", className }) {
  const isDark = variant === "dark";
  const a = isDark ? 0.4 : 0.16; // orchid alpha
  const b = isDark ? 0.34 : 0.14; // azure alpha

  const orbs = [
    {
      cls: "orb-1",
      style: {
        top: "-12%",
        left: "-8%",
        width: "42vw",
        height: "42vw",
        background: `radial-gradient(circle, rgba(169,88,164,${a}) 0%, transparent 68%)`,
      },
    },
    {
      cls: "orb-2",
      style: {
        bottom: "-18%",
        right: "-10%",
        width: "46vw",
        height: "46vw",
        background: `radial-gradient(circle, rgba(0,174,239,${b}) 0%, transparent 68%)`,
      },
    },
    {
      cls: "orb-3",
      style: {
        top: "30%",
        right: "22%",
        width: "26vw",
        height: "26vw",
        background: `radial-gradient(circle, rgba(226,174,223,${a * 0.7}) 0%, transparent 70%)`,
      },
    },
  ];

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      {orbs.map((o, i) => (
        <div
          key={i}
          className={cn("absolute rounded-full will-change-transform", o.cls)}
          style={{ ...o.style, filter: "blur(60px)" }}
        />
      ))}
    </div>
  );
}
