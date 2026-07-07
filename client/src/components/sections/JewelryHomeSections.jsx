"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/utils";
import { Sparkles, Users, Truck, Globe, Zap, Star, ArrowRight, Check } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

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
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium block mb-3" style={{ color: "#A458A6" }}>
            Fashion Collections
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Explore Our Collections
          </h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Discover our range of premium imported fashion, clothing, handbags, footwear and accessories.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {displayCats.map((cat) => (
              <Link
                key={cat.id || cat.slug}
                href={cat.slug ? `/category/${cat.slug}` : "/products"}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-gray-200 text-center"
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-110 bg-gray-50">
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} width={56} height={56} className="w-10 h-10 object-contain" />
                  ) : (
                    <Sparkles size={24} className="text-gray-400" />
                  )}
                </div>
                <span className="text-[12px] font-semibold leading-tight line-clamp-2 text-gray-700 group-hover:text-[#A458A6] transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-medium text-gray-900 hover:text-[#A458A6] transition-colors group"
          >
            View All Collections
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ColdChainBanner() {


  const reasons = [
    "Premium imported fashion from top brands",
    "Handpicked collections by style experts",
    "Quality you can trust, style you'll love",
    "Fast shipping & easy returns",
  ];

  return (
    <section className="py-12 md:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">



        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Image */}
          <Reveal>
            <div className="relative">
              <div className="relative rounded overflow-hidden aspect-[4/5] group">
                <Image
                  src="/founder-craft.png"
                  alt="Style Villa Craftsmanship"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-4 md:right-8 bg-white rounded-2xl p-5 shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }}>
                    <Star className="w-6 h-6 text-white" fill="currentColor" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-gray-900 block leading-tight">4.9/5</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">Customer Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right: Content */}
          <Reveal delay={0.2}>
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-medium block mb-4" style={{ color: "#A458A6" }}>
                The Style Villa Promise
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
                Why Fashion Lovers{" "}
                <span className="bg-gradient-to-r from-[#A458A6] to-[#14A8E6] bg-clip-text text-transparent">
                  Choose Style Villa
                </span>
              </h2>
              <p className="text-base text-gray-500 leading-relaxed mb-8 max-w-lg">
                We don't just sell fashion — we curate experiences. Every piece in our collection is handpicked to ensure you get the best quality and style.
              </p>

              {/* Reasons List */}
              <div className="space-y-4 mb-10">
                {reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }}>
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-gray-600 leading-relaxed">{reason}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-[11px] uppercase tracking-[0.2em] font-semibold rounded-full transition-all hover:shadow-lg hover:shadow-purple-500/25"
                  style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }}
                >
                  Explore Collection <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-gray-700 text-[11px] uppercase tracking-[0.2em] font-semibold rounded-full border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
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