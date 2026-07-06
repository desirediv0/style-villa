"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import BrandCarousel from "@/components/sections/BrandCarousel";
import { ProductCard } from "@/components/products/ProductCard";
import Reveal from "@/components/ui/Reveal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { IconArrowRight, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

const SECTION_METADATA = {
  featured: {
    bannerImage: "/featured_banner.png",
    tag: "CURATED STYLE",
    title: "FEATURED",
    subtitle: "COLLECTIONS",
    dateText: "Handpicked premium fashion pieces selected for your style",
    linkUrl: "/products?search=featured"
  },
  latest: {
    bannerImage: "/latest_banner.png",
    tag: "JUST LANDED",
    title: "LATEST",
    subtitle: "ADDITIONS",
    dateText: "Newly added premium fashion collections",
    linkUrl: "/products?search=latest"
  },
  bestseller: {
    bannerImage: "/bestseller_banner.png",
    tag: "BEST LOVED",
    title: "BEST",
    subtitle: "SELLERS",
    dateText: "Our most popular fashion picks loved by customers",
    linkUrl: "/products?search=bestseller"
  },
  trending: {
    bannerImage: "/trending_banner.png",
    tag: "MUST HAVE",
    title: "TRENDING",
    subtitle: "NOW",
    dateText: "The most loved styles and accessories this week",
    linkUrl: "/products?search=trending"
  },
  new: {
    bannerImage: "/new_banner.png",
    tag: "JUST IN",
    title: "NEW",
    subtitle: "ARRIVALS",
    dateText: "Fresh fashion pieces added to our collection",
    linkUrl: "/products?search=new"
  }
};

const ProductSkeleton = () => (
  <div className="bg-white overflow-hidden animate-pulse">
    <div className="aspect-[3/4] w-full bg-gray-100 rounded-lg" />
    <div className="pt-3 pb-1 space-y-2">
      <div className="h-2.5 w-14 bg-gray-200 rounded" />
      <div className="h-3.5 w-full bg-gray-200 rounded" />
      <div className="h-3.5 w-2/3 bg-gray-200 rounded" />
      <div className="h-4 w-16 bg-gray-200 rounded mt-2" />
    </div>
  </div>
);

function ProductCarousel({ products, isLoading }) {
  const [api, setApi] = useState(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    api.on("select", onSelect);
    onSelect();
    return () => api.off("select", onSelect);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [api]);

  if (!isLoading && products.length === 0) return null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="relative group/carousel">
      <Carousel
        setApi={setApi}
        opts={{ align: "start", loop: false, slidesToScroll: 1 }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {products.map((product, index) => (
            <CarouselItem
              key={product.id || product.slug || index}
              className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Navigation Arrows */}
      {canScrollPrev && (
        <button
          onClick={() => api?.scrollPrev()}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-black hover:border-gray-400 transition-all opacity-0 group-hover/carousel:opacity-100 shadow-sm z-10"
        >
          <IconChevronLeft className="h-5 w-5" stroke={1.5} />
        </button>
      )}
      {canScrollNext && (
        <button
          onClick={() => api?.scrollNext()}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-black hover:border-gray-400 transition-all opacity-0 group-hover/carousel:opacity-100 shadow-sm z-10"
        >
          <IconChevronRight className="h-5 w-5" stroke={1.5} />
        </button>
      )}
    </div>
  );
}

export default function HomePageContent() {
  const [loading, setLoading] = useState(true);
  const [dbSections, setDbSections] = useState([]);
  const [products, setProducts] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        let fetchedSections = [];
        try {
          const sectionRes = await fetchApi("/public/product-sections");
          if (sectionRes?.data?.sections) {
            fetchedSections = sectionRes.data.sections;
            setDbSections(fetchedSections);
          }
        } catch (sectionErr) {
          console.error("Error fetching db sections:", sectionErr);
        }

        const displaySections = fetchedSections.length > 0 ? fetchedSections : [
          { slug: "featured" },
          { slug: "latest" },
          { slug: "bestseller" },
          { slug: "trending" },
          { slug: "new" },
        ];

        const dynamicEndpoints = displaySections.map(sec => ({
          key: sec.slug?.toLowerCase(),
          url: `/public/products/type/${sec.slug?.toLowerCase()}?limit=12`
        }));

        const results = await Promise.allSettled(
          dynamicEndpoints.map(({ url }) => fetchApi(url))
        );

        const updated = {};
        results.forEach((result, index) => {
          const key = dynamicEndpoints[index].key;
          if (result.status === "fulfilled") {
            updated[key] = result.value?.data?.products || [];
          }
        });
        setProducts(updated);
      } catch (err) {
        console.error("Error fetching home products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const renderSection = (key) => {
    const sectionProducts = products[key];
    if (!loading && sectionProducts?.length === 0) return null;

    const dbSection = dbSections.find(
      (s) =>
        s.slug?.toLowerCase() === key.toLowerCase() ||
        s.slug?.toLowerCase().replace(/-/g, "") === key.toLowerCase()
    );

    const defaultBanner = SECTION_METADATA[key] || {
      bannerImage: "/placeholder.jpg",
      tag: "COLLECTION",
      title: key.toUpperCase(),
      subtitle: "",
      dateText: "",
      linkUrl: `/products?search=${key}`
    };

    let titleParts = dbSection?.name ? dbSection.name.split(" ") : [];

    const banner = {
      ...defaultBanner,
      bannerImage: dbSection?.image || defaultBanner.bannerImage,
      tag: defaultBanner.tag,
      title: titleParts.length > 0 ? titleParts[0].toUpperCase() : defaultBanner.title,
      subtitle: titleParts.length > 1 ? titleParts.slice(1).join(" ").toUpperCase() : defaultBanner.subtitle,
      dateText: dbSection?.description || defaultBanner.dateText,
    };

    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Reveal>
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-medium block mb-2" style={{ color: "#A458A6" }}>
                  {banner.tag}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                  {banner.title?.toLowerCase()}
                  {banner.subtitle && (
                    <span className="font-light text-gray-400 ml-2">{banner.subtitle?.toLowerCase()}</span>
                  )}
                </h2>
                {banner.dateText && (
                  <p className="text-sm text-gray-500 mt-2 max-w-md">{banner.dateText}</p>
                )}
              </div>
              <Link
                href={banner.linkUrl}
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-medium text-gray-900 hover:text-[#A458A6] transition-colors group/link w-fit"
              >
                View All
                <IconArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" stroke={1.5} />
              </Link>
            </div>

            {/* Products */}
            <ProductCarousel products={sectionProducts || []} isLoading={loading} />
          </Reveal>
        </div>
      </section>
    );
  };

  const displaySections = dbSections.length > 0
    ? [...dbSections].sort((a, b) => a.displayOrder - b.displayOrder)
    : [
        { id: "featured", slug: "featured", name: "FEATURED COLLECTIONS", description: "Handpicked premium fashion pieces selected for your style" },
        { id: "latest", slug: "latest", name: "LATEST ADDITIONS", description: "Newly added premium fashion collections" },
        { id: "bestseller", slug: "bestseller", name: "BEST SELLERS", description: "Our most popular fashion picks loved by customers" },
        { id: "trending", slug: "trending", name: "TRENDING NOW", description: "The most loved styles and accessories this week" },
        { id: "new", slug: "new", name: "NEW ARRIVALS", description: "Fresh fashion pieces added to our collection" },
      ];

  return (
    <>
      {displaySections.map((sec, idx) => {
        const key = sec.slug?.toLowerCase();
        if (!products[key]) return null;

        return (
          <div key={sec.id || key}>
            {renderSection(key)}
            {idx === 0 && <BrandCarousel tag="HOT" title="TRENDING BRANDS" />}
            {idx === 3 && <BrandCarousel tag="NEW" title="NEW IN STORE" />}
          </div>
        );
      })}
    </>
  );
}