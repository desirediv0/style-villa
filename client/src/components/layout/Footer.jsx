"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Send, MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { fetchApi } from "@/lib/utils";

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

  return (
    <footer className="bg-gray-50 border-t border-gray-100">

      {/* Newsletter */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-5 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <span className="text-[10px] uppercase tracking-[0.3em] font-semibold block mb-2" style={{ color: "#A458A6" }}>
                Stay Updated
              </span>
              <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                New arrivals, exclusive offers & style tips.
              </p>
            </div>
            <form className="flex w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 md:w-72 h-12 px-5 text-sm bg-gray-50 border border-gray-200 rounded-l-full focus:outline-none focus:border-[#A458A6] transition-colors placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="h-12 px-6 text-white text-[11px] uppercase tracking-[0.15em] font-bold rounded-r-full transition-all hover:shadow-lg hover:shadow-purple-500/25 flex items-center gap-2 flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }}
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Subscribe</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-5 pt-12 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <Link href="/" className="inline-block mb-4">
              <Image src="/logo.png" alt="Style Villa" width={110} height={40} className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-[260px]">
              Premium imported fashion — clothing, bags, footwear & accessories.
            </p>
            <div className="flex gap-2">
              <a href="https://www.instagram.com/stylevillaofficial" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-[#A458A6] hover:text-white transition-all duration-300">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="https://www.facebook.com/stylevillafamily" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="https://wa.me/918796449692" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-green-500 hover:text-white transition-all duration-300">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] mb-4 text-gray-900 font-bold">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: "New Arrivals", href: "/products?search=new" },
                { label: "Best Sellers", href: "/products?search=bestseller" },
                { label: "Trending Now", href: "/products?search=trending" },
                { label: "Sale", href: "/products?search=sale" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-[#A458A6] transition-colors flex items-center gap-1.5 group">
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] mb-4 text-gray-900 font-bold">Shop</h4>
            <ul className="space-y-2.5">
              {shopLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-[#A458A6] transition-colors flex items-center gap-1.5 group capitalize">
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] mb-4 text-gray-900 font-bold">Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Shipping Policy", href: "/shipping-policy" },
                { label: "Return Policy", href: "/return-policy" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms & Conditions", href: "/terms" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-[#A458A6] transition-colors flex items-center gap-1.5 group">
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] mb-4 text-gray-900 font-bold">Contact</h4>
            <div className="space-y-3">
              <a href="tel:+918796449692" className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#A458A6] transition-colors group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 group-hover:bg-purple-50 transition-colors flex-shrink-0">
                  <Phone className="h-3.5 w-3.5 text-gray-400 group-hover:text-[#A458A6]" />
                </div>
                <span>+91 87964 49692</span>
              </a>
              <a href="mailto:stylevillabypoojakhan@gmail.com" className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#A458A6] transition-colors group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 group-hover:bg-purple-50 transition-colors flex-shrink-0">
                  <Mail className="h-3.5 w-3.5 text-gray-400 group-hover:text-[#A458A6]" />
                </div>
                <span className="break-all text-xs">stylevillabypoojakhan@gmail.com</span>
              </a>
              <a href="https://maps.app.goo.gl/MTy3mYLeAXTr7jxP" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#A458A6] transition-colors group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 group-hover:bg-purple-50 transition-colors flex-shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 group-hover:text-[#A458A6]" />
                </div>
                <span>View on Maps</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-[10px] tracking-[0.15em] uppercase text-gray-400 font-medium">
              &copy; {new Date().getFullYear()} Style Villa. All rights reserved.
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium mr-1">We Accept</span>
              {["VISA", "MC", "UPI", "RUPAY"].map((item) => (
                <span key={item} className="px-2 py-0.5 border border-gray-200 rounded text-[9px] text-gray-500 tracking-wider bg-gray-50 font-bold">
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