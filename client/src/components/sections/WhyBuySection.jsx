"use client";

import Link from "next/link";
import Image from "next/image";
import { Truck, RotateCcw, CreditCard, ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import AuroraField from "@/components/ui/AuroraField";
import Magnetic from "@/components/ui/Magnetic";

export const WhyBuySection = () => {
  return (
    <section className="relative py-16 md:py-24 bg-ivory overflow-hidden">
      <AuroraField variant="light" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">

        {/* Full Width Cinematic Banner */}
        <Reveal>
          <div className="relative overflow-hidden group luxe-grain shine-auto" data-cursor="Shop">
            <div className="relative h-[380px] md:h-[460px]">
              <Image
                src="/deals-hero.png"
                alt="Premium Fashion"
                fill
                className="object-cover transition-transform duration-1600 ease-luxe group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-noir/95 via-noir/60 to-noir/10" />
              <div className="absolute inset-4 border border-white/15 pointer-events-none" />
            </div>
            <div className="absolute inset-0 flex items-center">
              <div className="p-8 md:p-14 lg:p-20 max-w-2xl relative z-10">
                <span className="luxe-eyebrow-dark mb-5 block">
                  The Final Word
                </span>
                <h2 className="font-display text-3xl md:text-5xl text-ivory leading-[1.08] mb-6 tracking-tight">
                  Dress like it&apos;s <br />
                  <em className="luxe-italic text-gradient-light">an occasion.</em>
                </h2>
                <p className="text-sm md:text-[15px] text-white/60 leading-relaxed mb-9 max-w-md font-light">
                  Style is about being yourself, deliberately. Explore a
                  collection that balances comfort with quiet luxury.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Magnetic>
                    <Link href="/products" className="btn-luxe-gold">
                      Shop the Collection <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Magnetic>
                  <Link href="/products?search=new" className="btn-luxe-white">
                    New Arrivals
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Service strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-line border-t-0 bg-white">
          {[
            { icon: Truck, title: "Express Shipping", desc: "Quick doorstep delivery across India and worldwide." },
            { icon: RotateCcw, title: "Easy Returns", desc: "Hassle-free returns within 7 days of delivery." },
            { icon: CreditCard, title: "Secure Payments", desc: "100% secure gateway with every payment option." },
          ].map(({ icon: Icon, title, desc }, idx) => (
            <Reveal key={title} delay={idx * 0.08}>
              <div className={`p-8 flex items-start gap-5 h-full group border-line ${idx !== 0 ? "sm:border-l" : ""} ${idx !== 0 ? "max-sm:border-t" : ""}`}>
                <Icon className="w-6 h-6 text-gold-dark flex-shrink-0 bob-y group-hover:text-plum transition-colors duration-500" strokeWidth={1.2} style={{ animationDelay: `${idx * 0.6}s` }} />
                <div>
                  <h4 className="font-display text-lg text-noir mb-1.5">{title}</h4>
                  <p className="text-xs text-stone-dark leading-relaxed tracking-wide">{desc}</p>
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
