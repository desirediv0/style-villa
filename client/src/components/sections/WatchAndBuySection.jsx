"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { fetchApi } from "@/lib/utils";
import Ambient3D from "@/components/ui/Ambient3D";
import {
  VolumeX,
  Volume2,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";

function getProductImageUrl(product) {
  if (!product) return null;
  if (product.image) return product.image;
  if (product.primaryImage) return product.primaryImage;
  if (product.images && product.images.length > 0) {
    const img = product.images[0];
    if (typeof img === "string") return img;
    if (img?.url) return img.url;
  }
  return null;
}

const ReelSkeleton = () => (
  <div className="flex-shrink-0 w-[160px] sm:w-[180px] animate-pulse">
    <div className="aspect-[9/14] bg-ivory-deep" />
    <div className="mt-3 space-y-2">
      <div className="h-3 w-3/4 bg-ivory-deep" />
      <div className="h-3 w-1/2 bg-ivory-deep" />
    </div>
  </div>
);

function ReelCard({ reel, onClick }) {
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (videoRef.current) {
          if (entry.isIntersecting) {
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const product = reel.products?.[0];

  return (
    <div
      ref={cardRef}
      className="flex-shrink-0 w-[160px] sm:w-[180px] cursor-pointer group/card"
      onClick={() => onClick(reel)}
      data-cursor="Play"
    >
      <div className="relative aspect-[9/14] overflow-hidden bg-noir-soft border border-white/10 group-hover/card:border-gold/50 transition-colors duration-500">
        {reel.videoUrl ? (
          <video
            ref={videoRef}
            src={reel.videoUrl}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
            muted
            loop
            playsInline
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <Play className="h-12 w-12 text-white/30" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

        {/* Play indicator */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border border-gold/70 bg-noir/50 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 group-hover/card:scale-110">
              <Play className="h-5 w-5 text-gold-light ml-0.5" fill="currentColor" />
            </div>
          </div>
        )}

        {/* Mute indicator */}
        <div className="absolute top-3 right-3">
          <div className="w-7 h-7 rounded-full bg-noir/40 backdrop-blur-sm flex items-center justify-center">
            <VolumeX className="h-3.5 w-3.5 text-white/80" />
          </div>
        </div>

        {/* Reel badge */}
        <div className="absolute top-3 left-3">
          <div className="px-2.5 py-1 bg-noir/40 backdrop-blur-sm border border-gold/40">
            <span className="text-[8px] uppercase tracking-[0.25em] text-gold-light font-medium">Reel</span>
          </div>
        </div>
      </div>

      {product && (
        <div className="mt-3 px-1">
          <div className="flex gap-2.5 items-start">
            {getProductImageUrl(product) && (
              <div className="w-11 h-11 overflow-hidden flex-shrink-0 border border-line">
                <img
                  src={getProductImageUrl(product)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-[12px] font-medium text-noir truncate leading-tight">
                {product.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                {product.salePrice ? (
                  <>
                    <span className="text-[12px] font-semibold text-plum">
                      ₹{Number(product.salePrice).toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] line-through text-stone">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </span>
                  </>
                ) : (
                  <span className="text-[12px] font-semibold text-plum">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReelViewer({ reels, currentIndex, onClose, onNavigate }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const currentReel = reels[currentIndex];
  const product = currentReel?.products?.[0];

  useEffect(() => {
    setIsMuted(false);
    setIsPlaying(false);
  }, [currentIndex]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = false;
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
    setIsMuted(false);
  }, [currentIndex]);

  const handleVideoClick = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight" && currentIndex < reels.length - 1) onNavigate(currentIndex + 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentIndex, reels.length, onClose, onNavigate]);

  const touchStartRef = useRef(null);
  const handleTouchStart = (e) => { touchStartRef.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (diff > 50 && currentIndex < reels.length - 1) onNavigate(currentIndex + 1);
    else if (diff < -50 && currentIndex > 0) onNavigate(currentIndex - 1);
    touchStartRef.current = null;
  };

  if (!currentReel) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center">
      <button onClick={onClose} className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
        <X className="h-5 w-5 text-white" />
      </button>

      {currentIndex > 0 && (
        <button onClick={() => onNavigate(currentIndex - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
      )}

      {currentIndex < reels.length - 1 && (
        <button onClick={() => onNavigate(currentIndex + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
      )}

      <div
        className="relative w-full max-w-[420px] h-full max-h-[100vh] flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative flex-1 bg-black cursor-pointer rounded-3xl overflow-hidden" onClick={handleVideoClick}>
          <video ref={videoRef} src={currentReel.videoUrl} className="w-full h-full object-contain" loop playsInline />

          <button onClick={toggleMute} className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors">
            {isMuted ? <VolumeX className="h-5 w-5 text-white" /> : <Volume2 className="h-5 w-5 text-white" />}
          </button>

          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">
                <Play className="h-7 w-7 text-gray-900 ml-1" fill="currentColor" />
              </div>
            </div>
          )}

          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
            <span className="text-white text-xs font-medium">{currentIndex + 1} / {reels.length}</span>
          </div>
        </div>

        {product && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-5 pb-8 rounded-b-3xl">
            <div className="flex items-end gap-3">
              {getProductImageUrl(product) && (
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/20 shadow-lg">
                  <img src={getProductImageUrl(product)} alt={product.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-sm font-semibold truncate">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {product.salePrice ? (
                    <>
                      <span className="text-white text-base font-bold">₹{Number(product.salePrice).toLocaleString("en-IN")}</span>
                      <span className="text-white/50 text-xs line-through">₹{Number(product.price).toLocaleString("en-IN")}</span>
                      <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-semibold">
                        {Math.round(((product.price - product.salePrice) / product.price) * 100)}% off
                      </span>
                    </>
                  ) : (
                    <span className="text-white text-base font-bold">₹{Number(product.price).toLocaleString("en-IN")}</span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); window.location.href = `/product/${product.slug || product.id}`; }}
                className="flex-shrink-0 flex items-center gap-2 bg-white text-gray-900 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">View</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WatchAndBuySection() {
  const [reels, setReels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const scrollRef = useRef(null);
  const autoScrollRef = useRef(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const data = await fetchApi("/api/public/video-reels");
        setReels(data?.data?.reels || []);
      } catch (error) {
        console.error("Failed to fetch video reels:", error);
        setReels([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReels();
  }, []);

  useEffect(() => {
    if (reels.length === 0 || !scrollRef.current) return;
    const container = scrollRef.current;
    let animationId;
    let speed = 0.5;
    const autoScroll = () => {
      if (!isPausedRef.current && container) {
        container.scrollLeft += speed;
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll) container.scrollLeft = 0;
      }
      animationId = requestAnimationFrame(autoScroll);
    };
    animationId = requestAnimationFrame(autoScroll);
    return () => { if (animationId) cancelAnimationFrame(animationId); };
  }, [reels]);

  const handleMouseEnter = () => { isPausedRef.current = true; };
  const handleMouseLeave = () => { isPausedRef.current = false; };
  const handleTouchStart = () => { isPausedRef.current = true; };
  const handleTouchEnd = () => { setTimeout(() => { isPausedRef.current = false; }, 2000); };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth / 2;
      scrollRef.current.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
    }
  };

  const openViewer = useCallback((reel) => {
    const index = reels.findIndex((r) => r.id === reel.id);
    setViewerIndex(index >= 0 ? index : 0);
    setViewerOpen(true);
    document.body.style.overflow = "hidden";
  }, [reels]);

  const closeViewer = useCallback(() => {
    setViewerOpen(false);
    document.body.style.overflow = "";
  }, []);

  const navigateViewer = useCallback((index) => { setViewerIndex(index); }, []);

  useEffect(() => {
    if (viewerOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [viewerOpen]);

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-ivory luxe-aurora-light border-y border-line">
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <span className="luxe-eyebrow block mb-3">Le Cinéma</span>
            <h2 className="font-display text-3xl md:text-4xl tracking-tight text-noir">Watch &amp; Buy</h2>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => <ReelSkeleton key={i} />)}
          </div>
        </div>
      </section>
    );
  }

  if (reels.length === 0) return null;

  return (
    <>
      <section className="relative py-16 md:py-24 bg-ivory overflow-hidden luxe-aurora-light border-y border-line">
        {/* floating 3D accents drifting behind the reels */}
        <Ambient3D />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="luxe-eyebrow block mb-3">Le Cinéma</span>
              <h2 className="font-display text-3xl md:text-5xl tracking-tight text-noir">
                Watch <em className="luxe-italic text-gradient">&amp; Buy</em>
              </h2>
              <p className="text-sm text-stone-dark mt-3 font-light tracking-wide">Tap to watch — shop the look straight from the reel</p>
            </div>
            <a
              href="https://www.instagram.com/stylevillaofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-medium text-stone-dark hover:text-plum transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              <span>@stylevillaofficial</span>
            </a>
          </div>

          {/* Reels Carousel */}
          <div className="relative group" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll reels left"
              className="absolute left-0 top-[30%] -translate-y-1/2 z-10 w-11 h-11 bg-white border border-line shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:border-plum hover:text-plum text-noir"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div
              ref={scrollRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollBehavior: "auto" }}
            >
              {reels.map((reel) => (
                <ReelCard key={reel.id} reel={reel} onClick={openViewer} />
              ))}
            </div>

            <button
              onClick={() => scroll("right")}
              aria-label="Scroll reels right"
              className="absolute right-0 top-[30%] -translate-y-1/2 z-10 w-11 h-11 bg-white border border-line shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:border-plum hover:text-plum text-noir"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {viewerOpen && (
        <ReelViewer reels={reels} currentIndex={viewerIndex} onClose={closeViewer} onNavigate={navigateViewer} />
      )}
    </>
  );
}