"use client";

import React, { useState } from "react";
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
    title: "50K+ Happy Customers",
    desc: "Trusted by thousands across India",
  },
  {
    icon: Truck,
    title: "Fast Shipping",
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
    <section className="py-12 md:py-16 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {BADGES.map(({ icon: Icon, title, desc }, idx) => (
            <Reveal key={idx} delay={idx * 0.1}>
              <div className="flex flex-col items-center text-center group">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-[#A458A6] stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[180px]">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}