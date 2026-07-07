"use client";

import Link from "next/link";
import Image from "next/image";
import { Truck, RotateCcw, CreditCard, ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export const WhyBuySection = () => {
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Full Width Hero Banner */}
        <Reveal>
          <div className="relative overflow-hidden rounded mb-8 group">
            <div className="relative h-[300px] md:h-[400px]">
              <Image
                src="/deals-hero.png"
                alt="Premium Fashion"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent" />
            </div>
            <div className="absolute inset-0 flex items-center">
              <div className="p-8 md:p-14 lg:p-20 max-w-2xl">
                <span className="text-[10px] uppercase tracking-[0.3em] font-medium mb-4 block text-white/60">
                  Limited Time Offer
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-5 tracking-tight">
                  Elevate your wardrobe with{" "}
                  <span className="bg-gradient-to-r from-[#A458A6] to-[#14A8E6] bg-clip-text text-transparent">premium fashion.</span>
                </h2>
                <p className="text-sm md:text-base text-white/70 leading-relaxed mb-8 max-w-md">
                  Style is more about being yourself. Discover our curated collection that balances comfort with luxury.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-[11px] uppercase tracking-[0.2em] font-semibold rounded-full transition-all hover:shadow-lg hover:shadow-purple-500/30"
                    style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }}
                  >
                    Shop the Collection <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/products?search=new"
                    className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-[11px] uppercase tracking-[0.2em] font-semibold rounded-full border border-white/30 hover:bg-white/10 transition-colors"
                  >
                    New Arrivals
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Feature Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { icon: Truck, title: "Fast Shipping", desc: "Quick doorstep delivery across India and worldwide.", color: "#A458A6" },
            { icon: RotateCcw, title: "Easy Returns", desc: "Hassle-free returns within 7 days of delivery.", color: "#14A8E6" },
            { icon: CreditCard, title: "Secure Payments", desc: "100% secure payment gateway with multiple options.", color: "#A458A6" },
          ].map(({ icon: Icon, title, desc, color }, idx) => (
            <Reveal key={title} delay={idx * 0.1}>
              <div className="p-6 bg-white border border-gray-100 rounded-2xl flex items-start gap-4 transition-all hover:shadow-xl hover:shadow-gray-100 hover:border-gray-200 group h-full">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${color}10` }}>
                  <Icon className="w-6 h-6 stroke-[1.5]" style={{ color }} />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-1">{title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyBuySection;