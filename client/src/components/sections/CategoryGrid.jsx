"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi, sortCategories } from "@/lib/utils";
import Reveal from "@/components/ui/Reveal";
import { ArrowRight } from "lucide-react";
import { getPharmaIcon } from "@/lib/pharma-icons";

const CATEGORY_GRADIENTS = [
  "linear-gradient(145deg, #f8f4ff 0%, #ede4ff 100%)",
  "linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)",
  "linear-gradient(145deg, #fdf4ff 0%, #fae8ff 100%)",
  "linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)",
  "linear-gradient(145deg, #fff7ed 0%, #fed7aa 100%)",
  "linear-gradient(145deg, #fefce8 0%, #fef08a 100%)",
];

const CategoryCard = ({ category, index }) => {
  const { Icon, color } = getPharmaIcon(category.name, category.slug);
  const productCount = category._count?.products || 0;
  const gradient = CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length];

  return (
    <div className="group cursor-pointer">
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-[20px] border border-gray-100/80 group-hover:border-gray-200 transition-all duration-500 ease-out group-hover:shadow-xl group-hover:shadow-gray-200/50 group-hover:-translate-y-1">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name || "Category"}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: gradient }}>
            {/* Large centered icon */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: `${color}12` }}>
                <Icon size={44} strokeWidth={1.5} style={{ color }} className="opacity-70 group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>

            {/* Category name inside card */}
            <h3 className="text-base font-semibold text-gray-700 tracking-wide">{category.name}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {productCount > 0 ? `${productCount} Items` : "Explore"}
            </p>
          </div>
        )}

        {/* Hover overlay for image cards */}
        {category.image && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}

        {/* Floating badge for image cards */}
        {category.image && productCount > 0 && (
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-bold bg-white/95 backdrop-blur-sm shadow-sm text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
            {productCount} items
          </div>
        )}

        {/* Bottom label for image cards */}
        {category.image && (
          <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
            <span className="text-[10px] uppercase tracking-[0.25em] text-white font-medium flex items-center gap-2">
              View Collection <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="w-full aspect-[3/4] bg-gray-100 animate-pulse rounded-[20px]" />
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
      <section className="relative py-16 md:py-20 overflow-hidden border-b border-gray-100 bg-white">
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
    <section className="relative py-16 md:py-20 overflow-hidden border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-5">
        <Reveal>
          <div className="text-center mb-14">
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold block mb-3" style={{ color: "#A458A6" }}>
              Browse Our Range
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Shop by Category
            </h2>
            <p className="mt-4 text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
              Explore our curated collection of premium fashion, designed for every style and occasion.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
          {categories.map((category, index) => (
            <Reveal key={category.id} delay={(index % 4) * 0.08}>
              <Link href={`/category/${category.slug}`} className="block">
                <CategoryCard category={category} index={index} />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
