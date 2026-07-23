"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";

const Ambient3DScene = dynamic(() => import("./Ambient3DScene"), { ssr: false });

/**
 * Drop-in decorative 3D layer for light sections — soft pastel glossy shapes
 * that float and rotate forever, kept to the outer margins so they never
 * obscure content. Absolutely positioned + pointer-events-none, so place it
 * inside a `relative` section and keep your content above it (e.g. z-10).
 */
export default function Ambient3D({ className = "" }) {
  const reduceMotion = useReducedMotion();
  const pointerRef = useRef({ x: 0, y: 0 });
  const [quality, setQuality] = useState("high");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const small = window.innerWidth < 768;
    const lowCore = (navigator.hardwareConcurrency || 8) <= 4;
    setQuality(small || lowCore ? "low" : "high");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (e) => {
      pointerRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduceMotion]);

  if (reduceMotion || !mounted) return null;

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden="true"
    >
      <Ambient3DScene pointerRef={pointerRef} quality={quality} />
    </div>
  );
}
