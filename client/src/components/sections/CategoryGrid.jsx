"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi, sortCategories } from "@/lib/utils";
import Reveal from "@/components/ui/Reveal";
import { ArrowRight } from "lucide-react";
import { getPharmaIcon } from "@/lib/pharma-icons";

const CIRCLE_COLORS = [
  { bg: "#e0f2fe", icon: "#0284c7" },
  { bg: "#dcfce7", icon: "#16a34a" },
  { bg: "#fef3c7", icon: "#d97706" },
  { bg: "#fce7f3", icon: "#db2777" },
  { bg: "#ede9fe", icon: "#7c3aed" },
  { bg: "#ffe4e6", icon: "#e11d48" },
  { bg: "#f0fdf4", icon: "#15803d" },
  { bg: "#eff6ff", icon: "#2563eb" },
];

const CategoryCard = ({ category, index }) => {
  const { Icon } = getPharmaIcon(category.name, category.slug);
  const productCount = category._count?.products || 0;
  const colors = CIRCLE_COLORS[index % CIRCLE_COLORS.length];

  return (
    <div className="flex flex-col items-center group cursor-pointer shrink-0 w-[100px] sm:w-[120px]">
      <div
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
        style={{ background: colors.bg }}
      >
        {category.image ? (
          <div className="relative w-12 h-12 sm:w-14 sm:h-14">
            <Image
              src={category.image}
              alt={category.name || "Category"}
              fill
              sizes="56px"
              className="object-contain"
              loading="lazy"
            />
          </div>
        ) : (
          <Icon
            size={32}
            strokeWidth={1.5}
            style={{ color: colors.icon }}
            className="transition-transform duration-300 group-hover:scale-110"
          />
        )}
      </div>
      <h3 className="mt-3 text-xs sm:text-sm font-medium text-gray-800 text-center leading-tight">
        {category.name}
      </h3>
      <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
        {productCount > 0 ? `${productCount} items` : "Explore"}
      </p>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="flex gap-6 overflow-hidden">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex flex-col items-center shrink-0">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 animate-pulse" />
        <div className="mt-3 w-14 h-3 bg-gray-100 animate-pulse rounded" />
        <div className="mt-1 w-10 h-2 bg-gray-100 animate-pulse rounded" />
      </div>
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
      <section className="py-12 md:py-16 bg-white">
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
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-5">
        <Reveal>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Shop by Categories
            </h2>
            <Link
              href="/categories"
              className="text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1 shrink-0"
            >
              View All Categories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Reveal>

        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-5 px-5 sm:mx-0 sm:px-0">
          {categories.map((category, index) => (
            <Reveal key={category.id} delay={(index % 6) * 0.05}>
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
