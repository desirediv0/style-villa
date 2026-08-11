"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/utils";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { IconArrowRight, IconArrowNarrowDown } from "@tabler/icons-react";
import { Truck, RefreshCw, ShieldCheck } from "lucide-react";
import FloatingElements from "@/components/ui/FloatingElements";

/* 3D is browser-only */
const HeroLightScene = dynamic(() => import("./HeroLightScene"), { ssr: false });

const FALLBACK_SLIDES = [
  {
    title: "Everyday Luxury, Beautifully Made",
    subtitle:
      "Premium imported bags, clothing and accessories — handpicked so every piece feels as good as it looks.",
    ctaLink: "/products",
    img: "/hero1.jpeg",
  },
  {
    title: "Carry Something Beautiful",
    subtitle:
      "Fresh arrivals every week, chosen by our stylists for the modern woman, man and youth.",
    ctaLink: "/products",
    img: "/hero2.jpeg",
  },
];

function bannerToSlide(b) {
  return {
    title: b.title || FALLBACK_SLIDES[0].title,
    subtitle: b.subtitle || FALLBACK_SLIDES[0].subtitle,
    ctaLink: b.link || "/products",
    img: b.desktopImage || b.mobileImage || FALLBACK_SLIDES[0].img,
  };
}

function splitTitle(title = "") {
  const words = title.trim().split(/\s+/);
  if (words.length < 3) return [title];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

const lineReveal = {
  hidden: { y: "115%" },
  visible: (i) => ({
    y: "0%",
    transition: { duration: 0.95, delay: 0.25 + i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const PERKS = [
  { icon: Truck, label: "Free shipping over ₹999" },
  { icon: RefreshCw, label: "Quality Assurance" },
  { icon: ShieldCheck, label: "100% authentic" },
];

export default function HeroSectionLight() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);
  const [quality, setQuality] = useState("high");

  const sectionRef = useRef(null);
  const scrollRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-28%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const artY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      scrollRef.current = v;
    });
    return () => unsub();
  }, [scrollYProgress]);

  useEffect(() => {
    const small = window.innerWidth < 768;
    const lowCore = (navigator.hardwareConcurrency || 8) <= 4;
    setQuality(small || lowCore ? "low" : "high");
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

  useEffect(() => {
    let alive = true;
    fetchApi("/public/banners")
      .then((res) => {
        const arr = res?.data?.banners;
        if (alive && Array.isArray(arr) && arr.length > 0) {
          setSlides(arr.map(bannerToSlide));
        }
      })
      .catch((err) => {
        console.warn("Banners API failed, using defaults:", err?.message);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [slides.length]);

  const active = slides[current] || slides[0];

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-gradient-to-b from-ivory-warm via-white to-ivory"
    >
      {/* soft ambient wash + floating marks (light) */}
      <div className="absolute inset-0 luxe-aurora-light" aria-hidden="true" />
      <FloatingElements tone="light" density="low" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        {/* 3D sits ABOVE the product image (so it's clearly visible) but BELOW
            the headline column (z-30), which keeps the copy perfectly legible. */}
        <div className="absolute inset-0 z-[15] pointer-events-none">
          {!reduceMotion && (
            <HeroLightScene scrollRef={scrollRef} pointerRef={pointerRef} quality={quality} />
          )}
        </div>
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center min-h-[calc(100svh-118px)] md:min-h-[calc(100vh-124px)] py-14 lg:py-0">

          {/* ── Copy ── */}
          <motion.div
            style={reduceMotion ? undefined : { y: copyY, opacity: copyOpacity }}
            className="relative z-30 lg:col-span-6 xl:col-span-5"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="block h-px w-9 bg-gradient-to-r from-plum to-azure" />
              <span className="luxe-eyebrow">New Season · Style Villa</span>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.h1
                key={current}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                className="font-display font-medium text-[2.5rem] leading-[1.06] sm:text-5xl md:text-6xl lg:text-[3.9rem] tracking-tight text-noir mb-6"
              >
                {splitTitle(active.title).map((line, i) => (
                  <span key={i} className="block overflow-hidden pb-1 -mb-1">
                    <motion.span custom={i} variants={lineReveal} className="block">
                      {i === 1 ? (
                        <em className="luxe-italic text-gradient">{line}</em>
                      ) : (
                        line
                      )}
                    </motion.span>
                  </span>
                ))}
              </motion.h1>
            </AnimatePresence>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="text-[15px] text-stone-dark font-light leading-relaxed max-w-md mb-9"
            >
              {active.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={() => router.push(active.ctaLink || "/products")}
                className="btn-luxe-gold active:scale-95"
              >
                Shop New Arrivals <IconArrowRight className="h-4 w-4" stroke={1.5} />
              </button>
              <Link href="/categories" className="btn-luxe-outline active:scale-95">
                Browse Collections
              </Link>
            </motion.div>

            {/* Perk strip — light and reassuring */}
            <motion.ul
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.85 }}
              className="mt-11 flex flex-wrap gap-x-7 gap-y-3"
            >
              {PERKS.map(({ icon: Icon, label }, i) => (
                <li key={label} className="flex items-center gap-2.5">
                  <Icon
                    className="h-4 w-4 text-plum bob-y"
                    strokeWidth={1.4}
                    style={{ animationDelay: `${i * 0.7}s` }}
                  />
                  <span className="text-[11px] uppercase tracking-[0.14em] text-stone-dark">
                    {label}
                  </span>
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* ── Fashion art: floating image card ── */}
          <motion.div
            style={reduceMotion ? undefined : { y: artY }}
            className="relative z-[5] lg:col-span-6 xl:col-span-7"
          >
            <div className="relative mx-auto w-full max-w-[560px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, scale: 0.96, y: 18 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.35 } }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="relative aspect-[4/5] sm:aspect-[5/6] overflow-hidden rounded-[2rem] shadow-[0_50px_90px_-45px_rgba(80,45,80,0.45)] bg-ivory-deep shine-auto"
                >
                  <Image
                    src={active.img || "/hero-desktop-1.png"}
                    alt={active.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/50 rounded-[2rem] pointer-events-none" />
                </motion.div>
              </AnimatePresence>

              {/* floating price/label chips */}
              <motion.div
                initial={{ opacity: 0, x: -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="absolute -left-3 sm:-left-8 top-[18%] bg-white/90 backdrop-blur-md border border-line rounded-2xl px-4 py-3 shadow-[0_18px_40px_-22px_rgba(80,45,80,0.4)] bob-y"
              >
                <p className="text-[9px] uppercase tracking-[0.25em] text-stone">Just In</p>
                <p className="font-display text-base text-noir leading-tight">Handbags</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 1.15 }}
                className="absolute -right-2 sm:-right-6 bottom-[14%] bg-white/90 backdrop-blur-md border border-line rounded-2xl px-4 py-3 shadow-[0_18px_40px_-22px_rgba(80,45,80,0.4)] bob-y"
                style={{ animationDelay: "1.4s" }}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2">
                    <span className="absolute inline-flex h-2 w-2 rounded-full bg-brand-success opacity-70 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-success" />
                  </span>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-stone-dark">
                    Free shipping
                  </p>
                </div>
                <p className="font-display text-base text-noir leading-tight mt-0.5">
                  On orders ₹999+
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* slide counter + scroll cue */}
        <div className="relative z-30 pb-7 flex items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="font-display text-base text-noir tabular-nums">
              {String(current + 1).padStart(2, "0")}
            </span>
            <span className="relative block h-px w-20 sm:w-32 bg-noir/12 overflow-hidden">
              <motion.span
                key={current}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-plum to-azure"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 6.5, ease: "linear" }}
              />
            </span>
            <span className="font-display text-sm text-stone tabular-nums">
              {String(slides.length).padStart(2, "0")}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-stone">
            <span className="text-[9px] uppercase tracking-[0.4em]">Scroll</span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <IconArrowNarrowDown className="h-4 w-4" stroke={1.5} />
            </motion.span>
          </div>
        </div>
      </div>
    </section>
  );
}
