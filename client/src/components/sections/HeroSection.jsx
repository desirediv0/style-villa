"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

function normalizeSlide(slide) {
  return {
    img: slide.img || slide.desktopImage || "",
    smimg: slide.smimg || slide.mobileImage || slide.desktopImage || slide.img || "",
    title: slide.title || slide.headline || "",
    subtitle: slide.subtitle || slide.subheadline || "",
    ctaLink: slide.ctaLink || slide.link || "/products",
  };
}

function bannerToSlide(banner) {
  return normalizeSlide({
    img: banner.desktopImage || "",
    smimg: banner.mobileImage || banner.desktopImage || "",
    title: banner.title || "",
    subtitle: banner.subtitle || "",
    ctaLink: banner.link || "/products",
  });
}

const FALLBACK_SLIDES = [
  {
    img: "/hero-desktop-1.png",
    smimg: "/hero-mobile.png",
    title: "New Season Collection",
    subtitle: "Discover premium fashion that defines your style. Explore our curated collection of clothing, handbags, footwear and accessories.",
    ctaLink: "/products",
  },
  {
    img: "/hero-desktop-2.png",
    smimg: "/hero-mobile.png",
    title: "Elevate Your Wardrobe",
    subtitle: "Handpicked imported fashion pieces designed for the modern woman, man and youth. Make every moment unforgettable.",
    ctaLink: "/products",
  },
];

export default function HeroSection() {
  const [api, setApi] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetchApi("/public/banners");
        const bannersArray = response?.data?.banners;
        if (Array.isArray(bannersArray) && bannersArray.length > 0) {
          setSlides(bannersArray.map(bannerToSlide));
        } else {
          setSlides(FALLBACK_SLIDES);
        }
      } catch (err) {
        console.error("Error fetching banners:", err);
        setSlides(FALLBACK_SLIDES);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (!api || !autoplay) return;
    const interval = setInterval(() => api.scrollNext(), 6000);
    return () => clearInterval(interval);
  }, [api, autoplay]);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrentSlide(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => api.off("select", onSelect);
  }, [api]);

  const handleSlideClick = (ctaLink) => router.push(ctaLink || "/products");

  if (isLoading) {
    return (
      <div className="relative w-full h-[60vh] md:h-[80vh] bg-brand-section animate-pulse flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin" />
      </div>
    );
  }

  if (slides.length === 0) return null;

  return (
    <div className="w-full relative overflow-hidden bg-white">
      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: "start" }}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="p-0">
              <div
                className="relative w-full h-[65vh] sm:h-[75vh] md:h-[85vh] overflow-hidden cursor-pointer"
                onClick={() => handleSlideClick(slide.ctaLink)}
              >
                <Image
                  src={isMobile ? slide.smimg : slide.img}
                  alt={slide.title || `Slide ${index + 1}`}
                  fill
                  className="object-cover object-center hero-kenburns"
                  priority={index === 0}
                  sizes="100vw"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 flex items-center" style={{ background: "linear-gradient(90deg, rgba(26,26,26,0.65) 0%, rgba(26,26,26,0.3) 50%, rgba(26,26,26,0) 80%)" }}>
                  <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 w-full">
                    <div className="max-w-xl text-white">
                      <span className="block text-[10px] sm:text-[11px] uppercase tracking-[0.4em] text-brand-blue mb-5 animate-fade-in font-medium">
                        Style Villa — Premium Fashion
                      </span>

                      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-5 text-white animate-fade-in">
                        {slide.title}
                      </h1>

                      <p className="text-sm sm:text-[15px] text-white/85 font-light leading-relaxed tracking-wide mb-9 max-w-md animate-fade-in-delayed">
                        {slide.subtitle}
                      </p>

                      <div className="animate-fade-in-delayed flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSlideClick(slide.ctaLink);
                          }}
                          className="btn-luxe-white active:scale-95"
                        >
                          Shop Now
                        </button>
                        <Link href="/categories" className="btn-luxe-white active:scale-95 !bg-white/10 !border-white/50">
                          Explore Collections
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="absolute left-6 top-1/2 -translate-y-1/2 hidden md:flex
                                     h-12 w-12 z-30 rounded-full
                                     bg-white/15 hover:bg-white/30 border border-white/30 hover:border-white
                                     text-white backdrop-blur-sm transition-all" />
        <CarouselNext className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex
                                   h-12 w-12 z-30 rounded-full
                                   bg-white/15 hover:bg-white/30 border border-white/30 hover:border-white
                                   text-white backdrop-blur-sm transition-all" />

        {/* Slide indicators */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-px transition-all duration-500 rounded-full ${index === currentSlide
                ? "w-10 bg-white"
                : "w-5 bg-white/40 hover:bg-white/80"
                }`}
              style={{ height: index === currentSlide ? "3px" : "2px" }}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}
