"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi, sortCategories } from "@/lib/utils";
import { AlertCircle, ArrowRight, Sparkles, ChevronRight, ShoppingBag } from "lucide-react";
import { getPharmaIcon } from "@/lib/pharma-icons";

const getImageUrl = (image) => {
  if (!image) return "/placeholder.jpg";
  if (image.startsWith("http")) return image;
  return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

const CategoryCard = ({ category }) => {
  const { Icon, color } = getPharmaIcon(category.name, category.slug);
  const productCount = category._count?.products || 0;

  return (
    <Link href={`/category/${category.slug}`} className="group block">
      <div className="relative bg-white rounded-[24px] overflow-hidden border border-gray-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 h-full flex flex-col">
        <div className="relative h-52 w-full overflow-hidden" style={{ background: `linear-gradient(160deg, ${color}0A, ${color}03)` }}>
          {category.image ? (
            <Image src={getImageUrl(category.image)} alt={category.name} fill className="object-contain p-6 transition-transform duration-700 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)` }}>
                <Icon size={36} style={{ color }} className="opacity-70" />
              </div>
            </div>
          )}
          {productCount > 0 && (
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg border border-white/20 backdrop-blur-md" style={{ background: `linear-gradient(135deg, ${color}E6, ${color}CC)`, color: "white" }}>
              {productCount} items
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-[15px] font-bold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-[#A458A6] transition-colors">{category.name}</h3>
          <p className="text-gray-400 text-xs mb-4 line-clamp-2 flex-1 leading-relaxed">{category.description || "Explore our premium collection"}</p>
          <div className="flex items-center gap-2 text-xs font-bold text-[#A458A6] group-hover:gap-3 transition-all duration-300 mt-auto pt-3 border-t border-gray-50">
            Shop Now <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

const CategoryCardSkeleton = () => (
  <div className="bg-white rounded-[24px] overflow-hidden animate-pulse border border-gray-100">
    <div className="h-52 w-full bg-gray-100" />
    <div className="p-5">
      <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-3" />
      <div className="h-3 bg-gray-100 rounded-full w-full mb-2" />
      <div className="h-3 bg-gray-100 rounded-full w-5/6 mb-4" />
      <div className="h-3 bg-gray-100 rounded-full w-1/4 pt-3 border-t border-gray-50" />
    </div>
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

      {/* Hero — dark premium with gradient glow */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gray-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px] opacity-30" style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-5 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold mb-6 bg-white/10 text-white/80 border border-white/10">
            <ShoppingBag className="h-3 w-3" />
            {categories.length > 0 ? `${categories.length}+ Collections` : "Curated For You"}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
            Shop by Category
          </h1>
          <p className="text-white/40 max-w-lg mx-auto text-sm md:text-base">
            Discover our handpicked collections — from clothing and bags to footwear and accessories.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-white/30 mt-6">
            <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/60">Categories</span>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto px-5 mt-6">
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 w-5 h-5 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Error Loading Categories</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-5 -mt-6 relative z-20 pb-16 md:pb-24">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <CategoryCardSkeleton key={i} />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-5 rounded-3xl flex items-center justify-center bg-gray-50 border border-gray-100">
              <Sparkles className="w-8 h-8 text-gray-300" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">No Categories Yet</h2>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto text-sm">Collections will appear here once added from the admin panel.</p>
            <Link href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white text-sm font-bold transition-all hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }}>
              Browse All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {categories.map((cat) => <CategoryCard key={cat.id} category={cat} />)}
          </div>
        )}
      </div>
    </div>
  );
}