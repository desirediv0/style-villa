"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { fetchApi } from "@/lib/utils";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import Magnetic from "@/components/ui/Magnetic";
import FloatingElements from "@/components/ui/FloatingElements";

const WHATSAPP_NUMBER = "918796449692";

const FALLBACK_CATEGORIES = [
  { name: "Clothing", slug: "clothing" },
  { name: "Handbags", slug: "handbags" },
  { name: "Footwear", slug: "footwear" },
  { name: "Accessories", slug: "accessories" },
  { name: "Jewellery", slug: "jewellery" },
  { name: "Watches", slug: "watches" },
];

export function FeaturedCategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi("/public/categories")
      .then((res) => setCategories((res.data?.categories || []).slice(0, 12)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const displayCats = categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  return (
    <section className="py-16 md:py-24 bg-ivory">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <span className="luxe-eyebrow block mb-4">Fashion Collections</span>
          <h2 className="font-display text-3xl md:text-5xl text-noir mb-4 tracking-tight">
            Explore Our <em className="luxe-italic text-gradient">Collections</em>
          </h2>
          <p className="text-sm text-stone-dark max-w-xl mx-auto font-light">
            Discover our range of premium imported fashion — clothing, handbags, footwear and accessories.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-white animate-pulse border border-line" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {displayCats.map((cat) => (
              <Link
                key={cat.id || cat.slug}
                href={cat.slug ? `/category/${cat.slug}` : "/products"}
                className="group flex flex-col items-center gap-3 p-6 bg-white border border-line transition-all duration-500 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_24px_50px_-30px_rgba(13,11,12,0.35)] text-center"
              >
                <div className="w-14 h-14 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-110">
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} width={56} height={56} className="w-11 h-11 object-contain" />
                  ) : (
                    <Sparkles size={22} className="text-gold-dark" strokeWidth={1.2} />
                  )}
                </div>
                <span className="text-[11px] uppercase tracking-[0.15em] font-medium leading-tight line-clamp-2 text-noir/70 group-hover:text-gold-dark transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/categories" className="luxe-link text-noir inline-flex items-center gap-2 group">
            View All Collections
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* Animated counter for the stats row */
function Counter({ value, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const spring = useSpring(0, { stiffness: 55, damping: 20 });
  const display = useTransform(spring, (v) => `${Math.round(v).toLocaleString("en-IN")}${suffix}`);

  useEffect(() => {
    if (inView) spring.set(value);
  }, [inView, spring, value]);

  return (
    <span ref={ref}>
      <motion.span>{display}</motion.span>
    </span>
  );
}

export function ColdChainBanner() {
  const reasons = [
    "Premium imported fashion from trusted global ateliers",
    "Every piece handpicked by our in-house stylists",
    "Quality you can feel — style you will live in",
    "Express shipping & effortless 7-day returns",
  ];

  const stats = [
    { value: 50000, suffix: "+", label: "Happy Clients" },
    { value: 1200, suffix: "+", label: "Curated Pieces" },
    { value: 4.9, suffix: "/5", label: "Client Rating", fixed: true },
  ];

  return (
    <section className="relative py-16 md:py-24 bg-white overflow-hidden">
      <FloatingElements tone="light" density="low" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: Image */}
          <Reveal>
            <div className="relative" data-cursor="Our Story">
              <div className="relative overflow-hidden aspect-[4/5] group shine-auto">
                <Image
                  src="/founder-craft.png"
                  alt="Style Villa Craftsmanship"
                  fill
                  className="object-cover transition-transform duration-1400 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/50 to-transparent" />
                <div className="absolute inset-4 border border-white/25 pointer-events-none" />
              </div>

              {/* Floating rating badge — gently drifts with a live pulse */}
              <div className="absolute -bottom-7 -right-3 md:right-8 bg-noir text-ivory p-6 shadow-[0_30px_60px_-30px_rgba(13,11,12,0.7)] border border-gold/30 bob-y">
                <span className="absolute top-3 right-3 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-70 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-success" />
                </span>
                <span className="font-display text-3xl block leading-tight text-gold-light">4.9<span className="text-lg text-white/50">/5</span></span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-white/50">Client Rating</span>
              </div>
            </div>
          </Reveal>

          {/* Right: Content */}
          <Reveal delay={0.2}>
            <div>
              <span className="luxe-eyebrow block mb-5">The Style Villa Promise</span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-[3.4rem] tracking-tight text-noir mb-7 leading-[1.06]">
                Why fashion lovers <br className="hidden md:block" />
                choose <em className="luxe-italic text-gradient">the maison</em>
              </h2>
              <p className="text-[15px] text-stone-dark leading-relaxed mb-9 max-w-lg font-light">
                We don&apos;t just sell fashion — we curate it. Every bag and every
                garment in our collection is chosen by hand, so what reaches you
                is only what we would wear ourselves.
              </p>

              {/* Reasons List */}
              <div className="space-y-4 mb-10">
                {reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <span className="w-6 h-6 border border-gold/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-gold-dark" strokeWidth={2.5} />
                    </span>
                    <span className="text-sm text-noir/70 leading-relaxed tracking-wide">{reason}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 py-8 border-y border-line mb-10">
                {stats.map(({ value, suffix, label, fixed }) => (
                  <div key={label}>
                    <span className="font-display text-2xl md:text-4xl text-noir block">
                      {fixed ? <>4.9<span className="text-gold-dark">/5</span></> : <Counter value={value} suffix={suffix} />}
                    </span>
                    <span className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-stone mt-1 block">{label}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-4">
                <Magnetic>
                  <Link href="/products" className="btn-luxe">
                    Explore Collection <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Magnetic>
                <Link href="/about" className="btn-luxe-outline">
                  Our Story
                </Link>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}

export function WhatsAppSticky() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello%2C%20I%20want%20to%20know%20more%20about%20your%20products.`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-green-500/40"
      style={{ background: "#25D366" }}
      aria-label="Chat with us on WhatsApp"
    >
      <img src="/whatsapp.png" alt="WhatsApp" className="w-8 h-8 object-contain" />
    </a>
  );
}
