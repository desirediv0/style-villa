"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchApi } from "@/lib/utils";
import Reveal from "@/components/ui/Reveal";

const FALLBACK_POSTS = [
  {
    id: 1,
    title: "How to Style Handcrafted Jewellery for Every Occasion",
    slug: "style-handcrafted-jewellery",
    summary: "Discover tips and tricks for pairing artisan jewellery with both casual and formal outfits.",
    coverImage: "/founder-craft.png",
  },
  {
    id: 2,
    title: "The Art of Handmade Fashion",
    slug: "art-of-handmade-fashion",
    summary: "Explore the beauty of handcrafted fashion and why it matters in today's world.",
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
    <section className="py-12 md:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: Text Content */}
          <Reveal>
            <div className="max-w-lg">
              <span className="inline-block text-[10px] uppercase tracking-[0.3em] font-semibold mb-4" style={{ color: "#A458A6" }}>
                Our Journal
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-5 leading-[1.1]">
                Inside the journal
              </h2>
              <p className="text-sm sm:text-[15px] text-gray-500 leading-relaxed mb-8 max-w-md">
                Explore styling ideas, seasonal notes, and content-rich stories that bring our collections to life.
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-7 py-3 text-[11px] uppercase font-semibold tracking-[0.2em] text-white rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }}
              >
                Read More
              </Link>
            </div>
          </Reveal>

          {/* Right: Overlapping Images */}
          <Reveal delay={0.15}>
            <div className="relative h-[400px] sm:h-[480px] md:h-[520px]">
              {/* Back image - arched top */}
              <div className="absolute right-0 top-0 w-[55%] h-[85%] z-10">
                <div className="relative w-full h-full rounded-t-full overflow-hidden">
                  <Image
                    src={posts[0]?.coverImage || "/founder-craft.png"}
                    alt={posts[0]?.title || "Journal"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>

              {/* Front image - rectangular with overlap */}
              <div className="absolute left-0 bottom-0 w-[60%] h-[70%] z-20">
                <div className="relative w-full h-full rounded overflow-hidden shadow-2xl">
                  <Image
                    src={posts[1]?.coverImage || "/shop-banner.png"}
                    alt={posts[1]?.title || "Journal"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Subtle overlay card */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-white text-xs font-medium tracking-wide">
                      {posts[1]?.title || "Explore our latest stories"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative accent */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-20" style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }} />
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
