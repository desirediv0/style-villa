"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle2 } from "lucide-react";
import { fetchApi } from "@/lib/utils";

const FALLBACK_TESTIMONIALS = [
  {
    name: "Anita Sen",
    role: "Collector",
    city: "Delhi",
    text: "Exquisite pieces that are perfect for every occasion. Every detail is perfect, and it came in a beautiful package. Style Villa is my go-to for unique accessories.",
    rating: 5,
    image: null,
  },
  {
    name: "Rohan Iyer",
    role: "Regular Buyer",
    city: "Mumbai",
    text: "The quality is stunning. The details are fine and the finish is excellent. A true masterpiece that I proudly wear everywhere.",
    rating: 5,
    image: null,
  },
  {
    name: "Priya Nair",
    role: "Loyal Client",
    city: "Kochi",
    text: "Beautifully curated pieces that got me so many compliments. The support is extremely friendly and helpful. Highly recommend!",
    rating: 5,
    image: null,
  },
  {
    name: "Sunita Mehta",
    role: "Collector",
    city: "Pune",
    text: "I absolutely adore the collections from Style Villa. They feel premium and carry a distinct style that stands out from typical mass-produced products.",
    rating: 5,
    image: null,
  },
  {
    name: "Kavitha Reddy",
    role: "Gifting Client",
    city: "Hyderabad",
    text: "Ordered customized sets as gifts for my sisters. The packaging was incredibly elegant and they arrived on time. Highly recommend!",
    rating: 5,
    image: null,
  },
];

function TestimonialCard({ t }) {
  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 h-full flex flex-col overflow-hidden">
      {/* Screenshot image (WhatsApp chat etc.) — top of card */}
      {t.image && (
        <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden">
          <Image
            src={t.image}
            alt={`${t.name || "Customer"} review screenshot`}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-5 md:p-6 flex flex-col flex-1">
        {/* Rating */}
        <div className="flex gap-0.5 mb-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`h-4 w-4 ${
                s <= (t.rating || 5)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Text */}
        {t.text && (
          <p className="text-gray-600 text-sm leading-relaxed italic mb-4 flex-1">
            &quot;{t.text}&quot;
          </p>
        )}

        {/* Author */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-auto">
          <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-[#D4AF37]">
              {t.name
                ? t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                : "★"}
            </span>
          </div>
          <div className="min-w-0">
            {t.name && (
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-gray-900 leading-none text-sm">{t.name}</p>
                <CheckCircle2 className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]/10" />
              </div>
            )}
            {[t.role, t.city].filter(Boolean).length > 0 && (
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                {[t.role, t.city].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState(FALLBACK_TESTIMONIALS);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const autoScrollRef = useRef(null);

  useEffect(() => {
    const update = () => {
      setVisibleCount(window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    fetchApi("/public/testimonials")
      .then((res) => {
        const arr = res?.data?.testimonials;
        if (Array.isArray(arr) && arr.length > 0) {
          setTestimonials(arr);
        }
      })
      .catch(() => {});
  }, []);

  const total = testimonials.length;
  const useCarousel = total > visibleCount;

  const cloned = useCarousel
    ? [...testimonials.slice(-visibleCount), ...testimonials, ...testimonials.slice(0, visibleCount)]
    : testimonials;
  const offset = useCarousel ? visibleCount : 0;

  const goTo = useCallback(
    (direction) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setTrackIndex((prev) => prev + direction);
    },
    [isTransitioning]
  );

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (!useCarousel) return;
    setTrackIndex((prev) => {
      if (prev <= offset - 1) return offset + total - 1;
      if (prev >= offset + total) return offset;
      return prev;
    });
  };

  useEffect(() => {
    if (isPaused || total < 2 || !useCarousel) return;
    autoScrollRef.current = setInterval(() => goTo(1), 4500);
    return () => clearInterval(autoScrollRef.current);
  }, [isPaused, goTo, total, useCarousel]);

  const dotIndex = useCarousel
    ? ((trackIndex - offset) % total + total) % total
    : trackIndex;

  if (total === 0) return null;

  return (
    <section className="bg-white py-16 md:py-24 relative overflow-hidden">
      {/* Subtle grid bg */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.15]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4AF37]/10 rounded-full text-[#D4AF37] text-[11px] font-semibold uppercase tracking-wider mb-5">
            Testimonials
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight">
            What Our Clients Say
          </h2>
          <p className="text-gray-500 mt-4 max-w-md mx-auto text-base leading-relaxed">
            Real reviews from real customers. See why thousands trust Style Villa.
          </p>
        </div>

        {/* Carousel / Grid */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {useCarousel ? (
            <div className="overflow-hidden py-2">
              <div
                className="flex transition-transform duration-500"
                style={{
                  transform: `translateX(-${(trackIndex * 100) / cloned.length}%)`,
                  transition: isTransitioning
                    ? "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
                    : "none",
                  width: `${(cloned.length / visibleCount) * 100}%`,
                }}
                onTransitionEnd={handleTransitionEnd}
              >
                {cloned.map((t, i) => (
                  <div
                    key={`${t.id || t.name || i}-${i}`}
                    style={{ width: `${100 / cloned.length}%` }}
                    className="px-2 md:px-3"
                  >
                    <TestimonialCard t={t} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`grid gap-4 md:gap-6 ${total === 1 ? "max-w-md mx-auto" : total === 2 ? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
              {testimonials.map((t, i) => (
                <TestimonialCard key={t.id || t.name || i} t={t} />
              ))}
            </div>
          )}

          {/* Dots + Arrows */}
          {useCarousel && total > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (isTransitioning) return;
                      setIsTransitioning(true);
                      setTrackIndex(offset + i);
                    }}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      i === dotIndex
                        ? "w-8 bg-[#D4AF37]"
                        : "w-2 bg-gray-200 hover:bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => goTo(-1)}
                  disabled={isTransitioning}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => goTo(1)}
                  disabled={isTransitioning}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
