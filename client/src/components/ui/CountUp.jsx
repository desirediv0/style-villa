"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Counts from 0 → `value` the first time it scrolls into view.
 * Format-agnostic: pass prefix/suffix and decimals.
 */
export default function CountUp({ value, prefix = "", suffix = "", decimals = 0, className }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 20, mass: 0.8 });

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  useEffect(() => {
    if (reduce) {
      if (ref.current) {
        ref.current.textContent = `${prefix}${value.toLocaleString("en-IN")}${suffix}`;
      }
      return;
    }
    return spring.on("change", (v) => {
      if (ref.current) {
        const n = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-IN");
        ref.current.textContent = `${prefix}${n}${suffix}`;
      }
    });
  }, [spring, prefix, suffix, decimals, reduce, value]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
