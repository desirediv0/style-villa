"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, ArrowRight, ArrowUpRight } from "lucide-react";
import { fetchApi } from "@/lib/utils";
import FloatingElements from "@/components/ui/FloatingElements";

const WHATSAPP_NUMBER = "918796449692";

export const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchApi("/public/categories")
      .then((res) => setCategories((res.data?.categories || []).slice(0, 6)))
      .catch(console.error);
  }, []);

  const shopLinks = categories.length > 0
    ? categories.map((c) => ({ label: c.name, href: `/category/${c.slug}` }))
    : [
      { label: "Clothing", href: "/products" },
      { label: "Handbags", href: "/products" },
      { label: "Footwear", href: "/products" },
      { label: "Accessories", href: "/products" },
    ];

  const handleConcierge = (e) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `Hello Style Villa — I'd love to hear about new arrivals and private offers.${email ? ` My email: ${email}` : ""}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank", "noopener,noreferrer");
  };

  return (
    <footer className="relative bg-noir text-ivory overflow-hidden luxe-grain luxe-aurora">
      <FloatingElements tone="dark" />
      {/* Concierge band */}
      <div className="relative z-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 py-14 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="luxe-eyebrow-dark block mb-4">The Private List</span>
              <h3 className="font-display text-3xl md:text-4xl font-medium leading-tight">
                First to know. <span className="luxe-italic text-gradient-light">Always.</span>
              </h3>
              <p className="text-sm text-white/50 mt-3 max-w-md leading-relaxed">
                New drops, private offers and styling notes from the maison — straight to you, before anyone else.
              </p>
            </div>
            <form onSubmit={handleConcierge} className="flex flex-col sm:flex-row gap-4 lg:justify-end">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 sm:max-w-xs px-0 py-4 bg-transparent border-b border-white/25 text-sm text-ivory placeholder:text-white/35 focus:outline-none focus:border-gold-light transition-colors"
              />
              <button type="submit" className="btn-luxe-gold whitespace-nowrap">
                Join via WhatsApp <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 pt-14 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 lg:gap-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/logo.png"
                alt="Style Villa"
                width={110}
                height={40}
                className="h-11 w-auto brightness-0 invert opacity-90"
              />
            </Link>
            <p className="text-sm text-white/45 leading-relaxed mb-6 max-w-[260px]">
              A curated maison of premium imported fashion — bags, clothing, footwear &amp; accessories.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/stylevillaofficial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 flex items-center justify-center border border-white/15 text-white/50 hover:border-gold hover:text-gold-light transition-all duration-300"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/stylevillafamily"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 flex items-center justify-center border border-white/15 text-white/50 hover:border-gold hover:text-gold-light transition-all duration-300"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 flex items-center justify-center border border-white/15 text-white/50 hover:border-gold hover:text-gold-light transition-all duration-300"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.35em] mb-5 text-gold font-medium">Discover</h4>
            <ul className="space-y-3">
              {[
                { label: "New Arrivals", href: "/products?search=new" },
                { label: "Best Sellers", href: "/products?search=bestseller" },
                { label: "Trending Now", href: "/products?search=trending" },
                { label: "Sale", href: "/products?search=sale" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-white/50 hover:text-gold-light transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-gold" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.35em] mb-5 text-gold font-medium">Collections</h4>
            <ul className="space-y-3">
              {shopLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/50 hover:text-gold-light transition-colors flex items-center gap-1.5 group capitalize"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-gold" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.35em] mb-5 text-gold font-medium">Client Care</h4>
            <ul className="space-y-3">
              {[
                { label: "Shipping Policy", href: "/shipping-policy" },
                { label: "Return Policy", href: "/return-policy" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms & Conditions", href: "/terms" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-white/50 hover:text-gold-light transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-gold" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.35em] mb-5 text-gold font-medium">Concierge</h4>
            <div className="space-y-4">
              <a href="tel:+918796449692" className="flex items-center gap-3 text-sm text-white/50 hover:text-gold-light transition-colors group">
                <Phone className="h-4 w-4 text-gold/60 flex-shrink-0" strokeWidth={1.5} />
                <span>+91 87964 49692</span>
              </a>
              <a href="mailto:stylevilla@gmail.com" className="flex items-center gap-3 text-sm text-white/50 hover:text-gold-light transition-colors group">
                <Mail className="h-4 w-4 text-gold/60 flex-shrink-0" strokeWidth={1.5} />
                <span className="break-all text-xs">stylevilla@gmail.com</span>
              </a>
              <a
                href="https://maps.app.goo.gl/MTy3mYLeAXTr7jxP"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-white/50 hover:text-gold-light transition-colors group"
              >
                <MapPin className="h-4 w-4 text-gold/60 flex-shrink-0" strokeWidth={1.5} />
                <span className="flex items-center gap-1">
                  View on Maps <ArrowUpRight className="h-3 w-3" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Ghost wordmark */}
      <div className="relative z-0 select-none pointer-events-none overflow-hidden" aria-hidden="true">
        <p className="font-display text-center whitespace-nowrap text-[19vw] leading-[0.78] text-hollow tracking-tight opacity-30 translate-y-[12%]">
          Style Villa
        </p>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-[9px] tracking-[0.3em] uppercase text-white/35 font-medium">
              &copy; {new Date().getFullYear()} Style Villa — All rights reserved
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-white/35 uppercase tracking-[0.2em] font-medium mr-2">We Accept</span>
              {["VISA", "MC", "UPI", "RUPAY"].map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 border border-white/15 text-[9px] text-white/50 tracking-[0.15em] font-semibold"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
