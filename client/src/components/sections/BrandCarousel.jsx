"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

import { fetchApi } from "@/lib/utils";
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

export default function BrandCarousel({ tag, title }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const res = await fetchApi(`/public/brands-by-tag?tag=${tag}`);
        setBrands(res.data.brands || []);
        setError(null);
      } catch (err) {
        setError("Failed to load brands");
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, [tag]);

  if (loading) {
    return <div className="py-8 text-center text-brand-paragraph">Loading {title}...</div>;
  }
  if (error) {
    return <div className="py-8 text-center text-brand-error">{error}</div>;
  }
  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 border-b border-brand-border bg-brand-section">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal className="text-center mb-10">
          <span className="luxe-eyebrow block mb-3">Curated For You</span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-heading">{title}</h2>
        </Reveal>
        <Carousel opts={{ align: "start", loop: true }}>
          <CarouselContent>
            {brands.map((brand) => (
              <CarouselItem
                key={brand.id}
                className="basis-1/3 md:basis-1/4 lg:basis-[14.28%] p-4"
              >
                <Link
                  href={`/brand/${brand.slug}`}
                  className="block group text-center"
                >
                  <div className="relative h-20 md:h-40 w-20 md:w-40 mx-auto mb-3 bg-white border border-brand-border rounded-2xl group-hover:border-brand-purple/50 flex items-center justify-center p-2 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-brand-purple/10">
                    <Image
                      width={120}
                      height={120}
                      src={
                        brand.image?.startsWith("http")
                          ? brand.image
                          : `https://desirediv-storage.blr1.digitaloceanspaces.com/${brand.image}`
                      }
                      alt={brand.name}
                      className="object-contain h-20 w-20 md:h-40 md:w-40 group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="text-sm md:text-base font-semibold mt-2 text-brand-heading group-hover:text-brand-purple transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
                    {brand.name}
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-3 md:-left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white border-brand-border text-gray-700 shadow-sm hover:bg-brand-purple hover:text-white hover:border-brand-purple" />
          <CarouselNext className="-right-1 md:right-0 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white border-brand-border text-gray-700 shadow-sm hover:bg-brand-purple hover:text-white hover:border-brand-purple" />
        </Carousel>
      </div>
    </section>
  );
}
