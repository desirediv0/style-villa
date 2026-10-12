"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Full-screen viewer for the product gallery. `urls` are already resolved image URLs.
export default function ProductLightbox({ urls, index, alt, onIndexChange, onClose }) {
  const count = urls.length;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && count > 1) onIndexChange((index - 1 + count) % count);
      else if (e.key === "ArrowRight" && count > 1) onIndexChange((index + 1) % count);
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [index, count, onClose, onIndexChange]);

  const step = (e, delta) => {
    e.stopPropagation();
    onIndexChange((index + delta + count) % count);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Product image viewer"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        aria-label="Close"
      >
        <X className="h-5 w-5 text-white" />
      </button>

      {count > 1 && (
        <button
          type="button"
          onClick={(e) => step(e, -1)}
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
      )}

      <div className="relative w-[92vw] h-[86vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <Image src={urls[index]} alt={alt} fill className="object-contain" sizes="92vw" priority />
      </div>

      {count > 1 && (
        <button
          type="button"
          onClick={(e) => step(e, 1)}
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
      )}

      {count > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs tracking-[0.2em]">
          {index + 1} / {count}
        </div>
      )}
    </div>
  );
}
