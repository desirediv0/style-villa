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
} from "@/components/ui/carousel";
import { IconArrowRight, IconArrowLeft } from "@tabler/icons-react";

const SECTION_METADATA = {
  featured: {
    bannerImage: "/featured_banner.png",
    tag: "Curated Luxury",
    title: "COLORFUL",
    subtitle: "HAND BAG",
    dateText: "Exquisite colorful handbags handcrafted for statement styling",
    linkUrl: "/products?search=featured"
  },
  latest: {
    bannerImage: "/latest_banner.png",
    tag: "Just Landed",
    title: "CHIC",
    subtitle: "HAND BAG",
    dateText: "Minimalist canvas and leather everyday handbags",
    linkUrl: "/products?search=latest"
  },
  bestseller: {
    bannerImage: "/bestseller_banner.png",
    tag: "Best Loved",
    title: "BLACK LEATHER",
    subtitle: "BAG",
    dateText: "Timeless classic black leather handbags with gold accents",
    linkUrl: "/products?search=bestseller"
  },
  trending: {
    bannerImage: "/trending_banner.png",
    tag: "Must Have",
    title: "RED LEATHER",
    subtitle: "BAG",
    dateText: "Bold red leather silhouettes to elevate your look",
    linkUrl: "/products?search=trending"
  },
  new: {
    bannerImage: "/new_banner.png",
    tag: "Just In",
    title: "LEATHER LUXURY",
    subtitle: "BAG",
    dateText: "Ultra-luxury designer collections with exquisite craftsmanship",
    linkUrl: "/products?search=new"
  }
};

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

  const renderSection = (key, sectionIndex) => {
    const sectionProducts = products[key];
    if (!loading && sectionProducts?.length === 0) return null;

    const dbSection = dbSections.find(
      (s) =>
          s.slug?.toLowerCase() === key.toLowerCase() ||
          s.slug?.toLowerCase().replace(/-/g, "") === key.toLowerCase()
    );

    const defaultBanner = SECTION_METADATA[key] || {
      bannerImage: "/placeholder.jpg",
      tag: "Collection",
      title: key.toUpperCase(),
      subtitle: "",
      dateText: "",
      linkUrl: `/products?search=${key}`
    };

    const banner = {
      ...defaultBanner,
      bannerImage: dbSection?.image || defaultBanner.bannerImage,
      tag: defaultBanner.tag,
      title: defaultBanner.title,
      subtitle: defaultBanner.subtitle,
      dateText: defaultBanner.dateText,
    };

    const isEven = ["featured", "bestseller", "new"].includes(key.toLowerCase());

    const BannerCard = () => (
      <div className="lg:col-span-4 relative overflow-hidden group min-h-[380px] lg:min-h-full bg-noir" data-cursor="Explore">
        <Image
          src={banner.bannerImage}
          alt={banner.title}
          fill
          className="object-cover transition-transform duration-1400 ease-luxe group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-noir/90 via-noir/30 to-noir/10" />
        <div className="absolute inset-3 border border-white/15 pointer-events-none" />

        <div className="relative z-10 h-full flex flex-col justify-between p-8">
          <div>
            <span className="inline-block text-[9px] uppercase tracking-[0.4em] font-medium px-4 py-2 text-gold-light border border-gold/40 bg-noir/30 backdrop-blur-sm">
              {banner.tag}
            </span>
          </div>

          <div className="text-white">
            <h3 className="font-display text-3xl md:text-4xl tracking-tight mb-2">
              {banner.title.charAt(0) + banner.title.slice(1).toLowerCase()}
              {banner.subtitle && (
                <em className="luxe-italic text-gradient-light block text-2xl md:text-3xl mt-1">
                  {banner.subtitle.charAt(0) + banner.subtitle.slice(1).toLowerCase()}
                </em>
              )}
            </h3>
            {banner.dateText && (
              <p className="text-xs text-white/60 leading-relaxed mb-7 font-light max-w-xs">{banner.dateText}</p>
            )}
            <Link href={banner.linkUrl} className="btn-luxe-white !px-6 !py-3">
              Explore More <IconArrowRight className="h-3.5 w-3.5" stroke={1.5} />
            </Link>
          </div>
        </div>
      </div>
    );

    return (
      <section className={`py-14 md:py-20 overflow-hidden ${sectionIndex % 2 === 1 ? "bg-ivory" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

              {isEven && <BannerCard />}

              {/* Products Slider & Title */}
              <div className="lg:col-span-8 flex flex-col justify-center min-w-0">
                <div className="flex items-end justify-between gap-4 mb-8">
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-sm text-gold-dark tracking-[0.2em] hidden sm:block">
                      {String(sectionIndex + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <span className="luxe-eyebrow block mb-2">{banner.tag}</span>
                      <h2 className="font-display text-3xl md:text-4xl tracking-tight text-noir">
                        {banner.title.charAt(0) + banner.title.slice(1).toLowerCase()}
                        {banner.subtitle && (
                          <em className="luxe-italic text-gradient ml-2.5">
                            {banner.subtitle.toLowerCase()}
                          </em>
                        )}
                      </h2>
                    </div>
                  </div>
                  <Link
                    href={banner.linkUrl}
                    className="luxe-link text-noir shrink-0 inline-flex items-center gap-2 group/link"
                  >
                    View All
                    <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" stroke={1.5} />
                  </Link>
                </div>

                <ProductCarousel products={sectionProducts || []} isLoading={loading} />
              </div>

              {!isEven && <BannerCard />}

            </div>
          </Reveal>
        </div>
      </section>
    );
  };

  const displaySections = dbSections.length > 0
    ? [...dbSections].sort((a, b) => a.displayOrder - b.displayOrder)
    : [
      { id: "featured", slug: "featured", name: "FEATURED COLLECTIONS", description: "Signature pieces, handpicked by our stylists for the season" },
      { id: "latest", slug: "latest", name: "LATEST ADDITIONS", description: "Freshly imported bags and clothing, new to the maison" },
      { id: "bestseller", slug: "bestseller", name: "BEST SELLERS", description: "The pieces our clients across India keep coming back for" },
      { id: "trending", slug: "trending", name: "TRENDING NOW", description: "The most wanted silhouettes and styles of the week" },
      { id: "new", slug: "new", name: "NEW ARRIVALS", description: "Fresh creations added to our curated collection" },
    ];

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
