"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi, sortCategories } from "@/lib/utils";
import Reveal from "@/components/ui/Reveal";
import AuroraField from "@/components/ui/AuroraField";
import FloatingElements from "@/components/ui/FloatingElements";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const CategoryCard = ({ category, index }) => {
  const productCount = category._count?.products || 0;

  return (
    <div
      className="group relative w-[240px] sm:w-[280px] md:w-[320px] shrink-0 overflow-hidden bg-noir"
      data-cursor="View"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name || "Category"}
            fill
            sizes="(max-width: 768px) 60vw, 320px"
            className="object-cover transition-transform duration-1200 ease-luxe group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-ivory-deep">
            <span className="font-display italic text-[7rem] text-noir/10 select-none">
              {category.name?.charAt(0)?.toUpperCase() || "S"}
            </span>
          </div>
        )}

        {/* Noir veil */}
        <div className="absolute inset-0 bg-gradient-to-t from-noir/85 via-noir/20 to-transparent transition-opacity duration-700" />

        {/* Hairline inset frame on hover */}
        <div className="absolute inset-3 border border-white/0 group-hover:border-white/25 transition-all duration-700 pointer-events-none" />

        {/* Index */}
        <span className="absolute top-5 left-5 font-display text-sm text-white/60 tracking-[0.2em]">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Arrow chip */}
        <span className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center border border-white/25 text-ivory opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 bg-noir/30 backdrop-blur-sm">
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
        </span>

        {/* Copy */}
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
          <p className="text-[9px] uppercase tracking-[0.35em] text-azure-light mb-2">
            {productCount > 0 ? `${productCount} pieces` : "Explore"}
          </p>
          <h3 className="font-display text-2xl md:text-[1.7rem] text-ivory leading-tight">
            {category.name}
          </h3>
          <span className="mt-4 block h-px w-0 bg-gold group-hover:w-16 transition-all duration-700" />
        </div>
      </div>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="flex gap-5 overflow-hidden">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="w-[240px] sm:w-[280px] md:w-[320px] shrink-0 aspect-[3/4] bg-ivory-deep animate-pulse"
      />
    ))}
  </div>
);

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchApi("/public/categories");
        if (response.success && response.data?.categories) {
          setCategories(sortCategories(response.data.categories));
        } else {
          setError(response.message || "Failed to fetch categories");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5">
          <SkeletonLoader />
        </div>
      </section>
    );
  }

  if (error || !categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="relative py-16 md:py-24 bg-white overflow-hidden">
      <AuroraField variant="light" />
      <FloatingElements tone="light" density="low" />
      <div className="relative z-10 max-w-7xl mx-auto px-5">
        <Reveal>
          <div className="flex items-end justify-between gap-6 mb-10 md:mb-14">
            <div>
              <span className="luxe-eyebrow block mb-4">The Collections</span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-noir tracking-tight">
                Shop by <em className="luxe-italic text-gradient">Category</em>
              </h2>
            </div>
            <Link
              href="/categories"
              className="luxe-link text-noir shrink-0 hidden sm:inline-flex items-center gap-2 group"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        <div className="flex gap-5 md:gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-5 px-5 snap-x snap-mandatory">
          {categories.map((category, index) => (
            <Reveal key={category.id} delay={Math.min(index, 5) * 0.08} className="snap-start">
              <Link href={`/category/${category.slug}`} className="block">
                <CategoryCard category={category} index={index} />
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-2 sm:hidden text-center">
          <Link href="/categories" className="luxe-link text-noir inline-flex items-center gap-2">
            View All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
