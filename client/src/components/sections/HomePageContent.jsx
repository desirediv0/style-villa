"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/utils";
import Link from "next/link";
import BrandCarousel from "@/components/sections/BrandCarousel";
import { ProductCard } from "@/components/products/ProductCard";
import Reveal from "@/components/ui/Reveal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { IconArrowRight, IconArrowLeft } from "@tabler/icons-react";

const ProductSkeleton = () => (
  <div className="bg-white overflow-hidden animate-pulse">
    <div className="aspect-[3/4] w-full bg-ivory-deep" />
    <div className="pt-3 pb-1 space-y-2">
      <div className="h-2.5 w-14 bg-ivory-deep" />
      <div className="h-3.5 w-full bg-ivory-deep" />
      <div className="h-3.5 w-2/3 bg-ivory-deep" />
      <div className="h-4 w-16 bg-ivory-deep mt-2" />
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
    }, 4500);
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
        <CarouselContent className="-ml-5">
          {products.map((product, index) => (
            <CarouselItem
              key={product.id || product.slug || index}
              className="pl-5 basis-1/2 md:basis-1/3 lg:basis-1/4"
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
          aria-label="Previous products"
          className="absolute left-0 top-[38%] -translate-y-1/2 -translate-x-3 w-11 h-11 bg-noir/90 backdrop-blur-sm text-ivory flex items-center justify-center hover:bg-gold hover:text-white transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 z-10"
        >
          <IconArrowLeft className="h-4 w-4" stroke={1.5} />
        </button>
      )}
      {canScrollNext && (
        <button
          onClick={() => api?.scrollNext()}
          aria-label="Next products"
          className="absolute right-0 top-[38%] -translate-y-1/2 translate-x-3 w-11 h-11 bg-noir/90 backdrop-blur-sm text-ivory flex items-center justify-center hover:bg-gold hover:text-white transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 z-10"
        >
          <IconArrowRight className="h-4 w-4" stroke={1.5} />
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

        const displaySections = fetchedSections.length > 0 ? fetchedSections : [];

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

  const renderSection = (key, sectionIndex) => {
    const sectionProducts = products[key];
    if (!loading && sectionProducts?.length === 0) return null;

    const dbSection = dbSections.find(
      (s) =>
          s.slug?.toLowerCase() === key.toLowerCase() ||
          s.slug?.toLowerCase().replace(/-/g, "") === key.toLowerCase()
    );

    if (!dbSection) return null;

    const sectionTitle = dbSection.name || key.toUpperCase();
    const sectionDesc = dbSection.description || "";
    const linkUrl = `/products?search=${key}`;

    return (
      <section className={`py-14 md:py-20 overflow-hidden ${sectionIndex % 2 === 1 ? "bg-ivory" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Reveal>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-end justify-between gap-4 mb-8">
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-sm text-gold-dark tracking-[0.2em] hidden sm:block">
                    {String(sectionIndex + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <span className="luxe-eyebrow block mb-2">{sectionTitle}</span>
                    <h2 className="font-display text-3xl md:text-4xl tracking-tight text-noir">
                      {sectionTitle.charAt(0) + sectionTitle.slice(1).toLowerCase()}
                      {sectionDesc && (
                        <em className="luxe-italic text-gradient ml-2.5">
                          {sectionDesc.toLowerCase()}
                        </em>
                      )}
                    </h2>
                  </div>
                </div>
                <Link
                  href={linkUrl}
                  className="luxe-link text-noir shrink-0 inline-flex items-center gap-2 group/link"
                >
                  View All
                  <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" stroke={1.5} />
                </Link>
              </div>

              <ProductCarousel products={sectionProducts || []} isLoading={loading} />
            </div>
          </Reveal>
        </div>
      </section>
    );
  };

  const displaySections = dbSections.length > 0
    ? [...dbSections].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];

  return (
    <>
      {displaySections.map((sec, idx) => {
        const key = sec.slug?.toLowerCase();
        if (!products[key]) return null;

        return (
          <div key={sec.id || key}>
            {renderSection(key, idx)}
            {idx === 0 && <BrandCarousel tag="HOT" title="Trending Brands" />}
            {idx === 3 && <BrandCarousel tag="NEW" title="New in Store" />}
          </div>
        );
      })}
    </>
  );
}
