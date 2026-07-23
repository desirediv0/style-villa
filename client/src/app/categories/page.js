"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi, sortCategories } from "@/lib/utils";
import { AlertCircle, ArrowRight, Sparkles, ArrowUpRight } from "lucide-react";

const getImageUrl = (image) => {
  if (!image) return "/placeholder.jpg";
  if (image.startsWith("http")) return image;
  return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

const CategoryCard = ({ category, index }) => {
  const productCount = category._count?.products || 0;

  return (
    <Link href={`/category/${category.slug}`} className="group block" data-cursor="View">
      <div className="relative bg-noir overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_35px_70px_-35px_rgba(13,11,12,0.6)] h-full">
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          {category.image ? (
            <Image
              src={getImageUrl(category.image)}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-1200 ease-luxe group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-ivory-deep">
              <span className="font-display italic text-[6rem] text-noir/10 select-none">
                {category.name?.charAt(0)?.toUpperCase() || "S"}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-noir/85 via-noir/20 to-transparent" />
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
            <h3 className="font-display text-xl md:text-2xl text-ivory leading-tight line-clamp-1">
              {category.name}
            </h3>
            <span className="mt-3 block h-px w-0 bg-gold group-hover:w-14 transition-all duration-700" />
          </div>
        </div>
      </div>
    </Link>
  );
};

const CategoryCardSkeleton = () => (
  <div className="overflow-hidden animate-pulse">
    <div className="aspect-[3/4] w-full bg-ivory-deep" />
  </div>
);

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApi("/public/categories")
      .then((res) => setCategories(sortCategories(res.data?.categories || [])))
      .catch((err) => setError(err.message || "Failed to load categories"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* Editorial noir hero */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-ivory luxe-aurora-light border-b border-line">
        <span
          className="pointer-events-none select-none absolute -bottom-10 left-1/2 -translate-x-1/2 font-display italic whitespace-nowrap text-[9rem] leading-none text-hollow-dark opacity-25 hidden lg:block"
          aria-hidden="true"
        >
          Collections
        </span>
        <div className="relative z-10 max-w-7xl mx-auto px-5 text-center">
          <div className="flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.3em] text-stone mb-7">
            <Link href="/" className="hover:text-plum transition-colors">Home</Link>
            <span className="text-plum">·</span>
            <span className="text-noir">Collections</span>
          </div>
          <span className="luxe-eyebrow block mb-5">
            {categories.length > 0 ? `${categories.length} Curated Collections` : "Curated For You"}
          </span>
          <h1 className="font-display text-4xl md:text-6xl text-noir mb-6 tracking-tight">
            The <em className="luxe-italic text-gradient">Collections</em>
          </h1>
          <span className="mx-auto block h-px w-24 bg-gradient-to-r from-transparent via-plum to-transparent mb-6" />
          <p className="text-stone-dark max-w-lg mx-auto text-sm md:text-base font-light leading-relaxed">
            Handpicked edits — from clothing and bags to footwear and accessories.
          </p>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto px-5 mt-8">
          <div className="bg-ivory border border-brand-error/30 p-5 flex items-start gap-3">
            <AlertCircle className="text-brand-error flex-shrink-0 w-5 h-5 mt-0.5" />
            <div>
              <h3 className="font-display text-lg text-noir mb-1">Error Loading Collections</h3>
              <p className="text-stone-dark text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-5 py-14 md:py-20">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <CategoryCardSkeleton key={i} />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-24 bg-ivory border border-line">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center border border-line bg-white">
              <Sparkles className="w-7 h-7 text-gold-dark" strokeWidth={1.2} />
            </div>
            <h2 className="font-display text-3xl text-noir mb-3">No Collections Yet</h2>
            <p className="text-stone-dark mb-10 max-w-sm mx-auto text-sm font-light">Collections will appear here once added from the admin panel.</p>
            <Link href="/products" className="btn-luxe">
              Browse All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {categories.map((cat, i) => <CategoryCard key={cat.id} category={cat} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
