"use client";

import React from "react";
import Reveal from "@/components/ui/Reveal";
import { Star, Users, Truck, Shield } from "lucide-react";

const BADGES = [
  {
    icon: Star,
    title: "Premium Quality",
    desc: "Curated fashion from top international brands",
  },
  {
    icon: Users,
    title: "50K+ Happy Clients",
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
    <section className="bg-ivory border-b border-line luxe-aurora-light">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {BADGES.map(({ icon: Icon, title, desc }, idx) => (
            <Reveal key={idx} delay={idx * 0.08}>
              <div
                className={`flex flex-col items-center text-center group py-10 md:py-12 px-4 border-line ${
                  idx !== 0 ? "border-l" : ""
                } ${idx >= 2 ? "max-lg:border-t" : ""} ${idx === 2 ? "max-lg:border-l-0" : ""}`}
              >
                <Icon
                  className="w-6 h-6 text-gold-dark mb-4 transition-transform duration-500 group-hover:-translate-y-1"
                  strokeWidth={1.2}
                />
                <h3 className="font-display text-base text-noir mb-1.5">{title}</h3>
                <p className="text-[11px] uppercase tracking-[0.12em] text-stone leading-relaxed max-w-[190px]">
                  {desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
