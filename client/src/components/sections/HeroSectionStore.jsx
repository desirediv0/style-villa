"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
import { IconArrowRight, IconArrowNarrowDown, IconDoorEnter } from "@tabler/icons-react";

/* 3D scene is browser-only */
const HeroStoreScene = dynamic(() => import("./HeroStoreScene"), { ssr: false });

const FALLBACK = {
  title: "Step Inside the Maison",
  subtitle:
    "Walk our virtual boutique — a curated gallery of premium imported bags, clothing and accessories, lit and waiting for you.",
  ctaLink: "/products",
};

function bannerToCopy(banner) {
  return {
    title: banner.title || FALLBACK.title,
    subtitle: banner.subtitle || FALLBACK.subtitle,
    ctaLink: banner.link || "/products",
  };
}

function splitTitle(title = "") {
  const words = title.trim().split(/\s+/);
  if (words.length < 3) return [title];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

const lineReveal = {
  hidden: { y: "115%", rotate: 2 },
  visible: (i) => ({
    y: "0%",
    rotate: 0,
    transition: { duration: 1, delay: 0.35 + i * 0.14, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HeroSectionStore() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [copy, setCopy] = useState(FALLBACK);
  const [quality, setQuality] = useState("high");

  const sectionRef = useRef(null);
  const scrollRef = useRef(0); // 0→1 fed to the walk (no re-render)
  const pointerRef = useRef({ x: 0, y: 0 });

  /* Tall track (250vh) so the "walk in" has runway before the page continues */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /* Copy 1 ("welcome / step inside") lives near the entrance, fades as you enter */
  const introY = useTransform(scrollYProgress, [0, 0.32], ["0%", "-30%"]);
  const introOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0]);
  const introBlur = useTransform(scrollYProgress, [0, 0.25], [0, 8]);
  const introFilter = useTransform(introBlur, (b) => `blur(${b}px)`);

  /* Copy 2 ("you're inside") fades in deep in the aisle */
  const insideOpacity = useTransform(scrollYProgress, [0.55, 0.72, 0.9, 1], [0, 1, 1, 0]);
  const insideY = useTransform(scrollYProgress, [0.55, 0.75], ["24px", "0px"]);

  /* Scroll cue + counter fade out once you're moving */
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

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
          setCopy(bannerToCopy(arr[0]));
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    /* Tall section drives the walk; the visual is a pinned full-screen layer */
    <section ref={sectionRef} className="relative w-full h-[250vh] bg-noir text-ivory">
      <div className="sticky top-0 h-[100svh] md:h-screen w-full overflow-hidden">
        {/* Branded warm gradient behind canvas — never a blank void */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(1200px 600px at 50% 120%, rgba(169,88,164,0.22), transparent 60%), radial-gradient(900px 500px at 50% -10%, rgba(0,174,239,0.12), transparent 60%), linear-gradient(180deg, #160B1C 0%, #0F0714 100%)",
          }}
          aria-hidden="true"
        />

        {/* 3D boutique */}
        <div className="absolute inset-0 z-0">
          {!reduceMotion && (
            <HeroStoreScene scrollRef={scrollRef} pointerRef={pointerRef} quality={quality} />
          )}
        </div>

        {/* Grain + threshold frame */}
        <div className="absolute inset-0 z-[1] pointer-events-none luxe-grain" aria-hidden="true" />
        <div
          className="absolute inset-3 md:inset-5 border border-white/12 pointer-events-none z-[2] hidden sm:block"
          aria-hidden="true"
        />

        {/* Vertical side label */}
        <div
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 hidden xl:block pointer-events-none"
          aria-hidden="true"
        >
          <span className="block text-[9px] uppercase tracking-[0.6em] text-white/35 [writing-mode:vertical-rl]">
            The Style Villa Boutique — Est. MMXXV
          </span>
        </div>

        {/* ── Intro copy (at the entrance) ── */}
        <motion.div
          style={
            reduceMotion ? undefined : { y: introY, opacity: introOpacity, filter: introFilter }
          }
          className="absolute inset-0 z-10 flex items-center pointer-events-none"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 w-full">
            <div className="max-w-2xl pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="flex items-center gap-4 mb-6"
              >
                <span className="block h-px w-10 bg-gradient-to-r from-gold to-azure" />
                <span className="luxe-eyebrow-dark">The Style Villa Boutique</span>
              </motion.div>

              <h1 className="font-display font-medium text-[2.6rem] leading-[1.04] sm:text-6xl md:text-7xl lg:text-[5rem] tracking-tight mb-6 text-ivory drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
                {splitTitle(copy.title).map((line, i) => (
                  <span key={i} className="block overflow-hidden pb-1 -mb-1">
                    <motion.span custom={i} variants={lineReveal} initial="hidden" animate="visible" className="block">
                      {i === 1 ? (
                        <em className="luxe-italic text-gradient-light">{line}</em>
                      ) : (
                        line
                      )}
                    </motion.span>
                  </span>
                ))}
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.75 }}
                className="text-sm sm:text-[15px] text-white/70 font-light leading-relaxed tracking-wide mb-10 max-w-md"
              >
                {copy.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="flex flex-wrap gap-4"
              >
                <button
                  onClick={() => router.push(copy.ctaLink || "/products")}
                  className="btn-luxe-gold active:scale-95"
                >
                  Enter the Boutique <IconDoorEnter className="h-4 w-4" stroke={1.5} />
                </button>
                <Link href="/categories" className="btn-luxe-white active:scale-95">
                  Browse Collections
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ── Inside copy (deep in the aisle) ── */}
        <motion.div
          style={reduceMotion ? { opacity: 0 } : { opacity: insideOpacity, y: insideY }}
          className="absolute inset-0 z-10 flex items-end justify-center pb-24 md:pb-28 pointer-events-none"
        >
          <div className="text-center px-6">
            <span className="luxe-eyebrow-dark block mb-4">Now Showing</span>
            <p className="font-display text-3xl md:text-5xl text-ivory tracking-tight">
              This Season&apos;s <em className="luxe-italic text-gradient-light">Arrivals</em>
            </p>
            <Link
              href="/products"
              className="pointer-events-auto mt-7 inline-flex btn-luxe-gold active:scale-95"
            >
              Shop the Floor <IconArrowRight className="h-4 w-4" stroke={1.5} />
            </Link>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          style={reduceMotion ? undefined : { opacity: cueOpacity }}
          className="absolute bottom-0 left-0 right-0 z-20"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 pb-7 md:pb-9 flex items-end justify-between gap-6">
            <span className="text-[9px] uppercase tracking-[0.4em] text-white/45">
              Style Villa — Maison de Mode
            </span>
            <div className="flex items-center gap-3 text-white/55">
              <span className="text-[9px] uppercase tracking-[0.4em]">Scroll to enter</span>
              <motion.span
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <IconArrowNarrowDown className="h-4 w-4" stroke={1.5} />
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* Fade into the page below */}
        <div className="absolute bottom-0 left-0 right-0 h-28 z-[5] bg-gradient-to-t from-noir to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
