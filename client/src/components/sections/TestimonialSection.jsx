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
    <div className="group relative bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
      <div className="absolute top-6 right-8 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-500">
        <Quote className="w-12 h-12 text-[#D4AF37]" />
      </div>

      {/* Rating */}
      <div className="flex gap-1 mb-4 relative z-10">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`h-4 w-4 ${
              s <= t.rating
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-100 text-gray-100"
            }`}
          />
        ))}
      </div>

      {/* Text */}
      {t.text && (
        <p className="text-gray-600 leading-relaxed italic mb-6 relative z-10 flex-1">
          &quot;{t.text}&quot;
        </p>
      )}

      {/* Screenshot image (WhatsApp chat etc.) */}
      {t.image && (
        <div className="relative mb-4 rounded-xl overflow-hidden border border-gray-100 z-10">
          <Image
            src={t.image}
            alt={`${t.name} review screenshot`}
            width={400}
            height={300}
            className="w-full h-auto object-cover max-h-[200px]"
          />
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-50 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-[#D4AF37]">
            {t.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-gray-900 leading-none text-sm">{t.name}</p>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]/10" />
          </div>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            {[t.role, t.city].filter(Boolean).join(" · ")}
          </p>
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
  const cloned = [
    ...testimonials.slice(-visibleCount),
    ...testimonials,
    ...testimonials.slice(0, visibleCount),
  ];
  const offset = visibleCount;
  const [trackIndex, setTrackIndex] = useState(offset);

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
    setTrackIndex((prev) => {
      if (prev <= offset - 1) return offset + total - 1;
      if (prev >= offset + total) return offset;
      return prev;
    });
  };

  useEffect(() => {
    if (isPaused || total < 2) return;
    autoScrollRef.current = setInterval(() => goTo(1), 4500);
    return () => clearInterval(autoScrollRef.current);
  }, [isPaused, goTo, total]);

  const dotIndex = ((trackIndex - offset) % total + total) % total;

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

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
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
                  key={`${t.id || t.name}-${i}`}
                  style={{ width: `${100 / cloned.length}%` }}
                  className="px-2 md:px-3"
                >
                  <TestimonialCard t={t} />
                </div>
              ))}
            </div>
          </div>

          {/* Dots + Arrows */}
          {total > 1 && (
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
