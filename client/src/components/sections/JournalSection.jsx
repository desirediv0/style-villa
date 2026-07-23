"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchApi } from "@/lib/utils";
import Reveal from "@/components/ui/Reveal";
import FloatingElements from "@/components/ui/FloatingElements";
import { ArrowRight } from "lucide-react";

const FALLBACK_POSTS = [
  {
    id: 1,
    title: "How to Style One Bag, Five Ways",
    slug: "style-one-bag-five-ways",
    summary: "From office hours to late dinners — the art of making a single beautiful bag work everywhere.",
    coverImage: "/founder-craft.png",
  },
  {
    id: 2,
    title: "The Quiet Luxury Wardrobe",
    slug: "quiet-luxury-wardrobe",
    summary: "Building a wardrobe of imported essentials that whisper, never shout.",
    coverImage: "/shop-banner.png",
  },
];

export default function JournalSection() {
  const [posts, setPosts] = useState(FALLBACK_POSTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetchApi("/content/blog?limit=2");
        const blogPosts = res?.data?.posts;
        if (Array.isArray(blogPosts) && blogPosts.length > 0) {
          setPosts(blogPosts.slice(0, 2));
        }
      } catch (err) {
        // keep fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <section className="relative py-16 md:py-24 bg-ivory overflow-hidden">
      <FloatingElements tone="light" density="low" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: Text Content */}
          <Reveal>
            <div className="max-w-lg">
              <span className="luxe-eyebrow block mb-5">Our Journal</span>
              <h2 className="font-display text-4xl sm:text-5xl md:text-[3.4rem] tracking-tight text-noir mb-6 leading-[1.05]">
                Notes from <br />
                <em className="luxe-italic text-gradient">the maison</em>
              </h2>
              <p className="text-sm sm:text-[15px] text-stone-dark leading-relaxed mb-10 max-w-md font-light">
                Styling ideas, seasonal notes and stories that bring our
                collections to life — written for people who dress with intent.
              </p>
              <Link href="/blog" className="btn-luxe">
                Read the Journal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Reveal>

          {/* Right: Overlapping Images */}
          <Reveal delay={0.15}>
            <div className="relative h-[400px] sm:h-[480px] md:h-[540px]" data-cursor="Read">
              {/* Back image — arched top */}
              <div className="absolute right-0 top-0 w-[55%] h-[85%] z-10">
                <div className="relative w-full h-full rounded-t-full overflow-hidden group">
                  <Image
                    src={posts[0]?.coverImage || "/founder-craft.png"}
                    alt={posts[0]?.title || "Journal"}
                    fill
                    className="object-cover transition-transform duration-1400 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-2 rounded-t-full border border-white/30 pointer-events-none" />
                </div>
              </div>

              {/* Front image — rectangular with overlap */}
              <div className="absolute left-0 bottom-0 w-[60%] h-[70%] z-20">
                <div className="relative w-full h-full overflow-hidden shadow-[0_40px_80px_-40px_rgba(13,11,12,0.5)] group shine-auto">
                  <Image
                    src={posts[1]?.coverImage || "/shop-banner.png"}
                    alt={posts[1]?.title || "Journal"}
                    fill
                    className="object-cover transition-transform duration-1400 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-noir/80 to-transparent">
                    <p className="text-[9px] uppercase tracking-[0.35em] text-gold-light mb-2">Latest Story</p>
                    <p className="font-display text-ivory text-base leading-snug">
                      {posts[1]?.title || "Explore our latest stories"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rotating accent seal */}
              <div className="absolute -bottom-6 right-[38%] w-28 h-28 z-30 hidden md:block" aria-hidden="true">
                <svg viewBox="0 0 100 100" className="w-full h-full rotate-slow">
                  <defs>
                    <path id="circlePath" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                  </defs>
                  <circle cx="50" cy="50" r="49" fill="#1D1024" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(226,174,223,0.6)" strokeWidth="0.5" />
                  <text fill="#E2AEDF" fontSize="8.5" letterSpacing="2.5">
                    <textPath href="#circlePath">STYLE VILLA · MAISON DE MODE ·</textPath>
                  </text>
                </svg>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
