"use client";

import React from "react";
import Reveal from "@/components/ui/Reveal";
import AuroraField from "@/components/ui/AuroraField";
import CountUp from "@/components/ui/CountUp";
import { motion } from "framer-motion";
import { Star, Users, Truck, Shield } from "lucide-react";

const BADGES = [
  {
    icon: Star,
    title: "Premium Quality",
    desc: "Curated fashion from top international brands",
  },
  {
    icon: Users,
    // rendered as a live count-up
    count: { value: 50, suffix: "K+" },
    title: "Happy Clients",
    desc: "Trusted by thousands across India",
  },
  {
    icon: Truck,
    title: "Express Shipping",
    desc: "Quick doorstep delivery nationwide",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    desc: "100% secure payment gateway",
  },
];

export default function TrustBadgesSection() {
  return (
    <section className="relative bg-ivory border-b border-line overflow-hidden">
      <AuroraField variant="light" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {BADGES.map(({ icon: Icon, title, desc, count }, idx) => (
            <Reveal key={idx} delay={idx * 0.08}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`flex flex-col items-center text-center group py-10 md:py-14 px-4 border-line ${
                  idx !== 0 ? "border-l" : ""
                } ${idx >= 2 ? "max-lg:border-t" : ""} ${idx === 2 ? "max-lg:border-l-0" : ""}`}
              >
                {/* Floating icon with a breathing glow ring */}
                <div className="relative mb-4 bob-y" style={{ animationDelay: `${idx * 0.5}s` }}>
                  <span className="absolute inset-0 -m-3 rounded-full bg-gold/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="absolute inset-0 -m-2 rounded-full border border-gold/25 glow-pulse" />
                  <Icon
                    className="relative w-6 h-6 text-gold-dark transition-colors duration-500 group-hover:text-plum"
                    strokeWidth={1.2}
                  />
                </div>

                {count ? (
                  <h3 className="font-display text-2xl md:text-[1.7rem] text-noir mb-0.5 leading-none">
                    <CountUp value={count.value} suffix={count.suffix} />
                  </h3>
                ) : null}
                <h3 className={`font-display text-noir ${count ? "text-sm md:text-base text-stone-dark" : "text-base mb-1.5"}`}>
                  {title}
                </h3>
                <p className="text-[11px] uppercase tracking-[0.12em] text-stone leading-relaxed max-w-[190px] mt-1.5">
                  {desc}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
