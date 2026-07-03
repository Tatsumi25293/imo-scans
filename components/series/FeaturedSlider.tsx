"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeaturedSliderProps {
  featured: any[];
}

export function FeaturedSlider({ featured }: FeaturedSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(true);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isRtl, setIsRtl] = useState(true); // default to true for Arabic site

  useEffect(() => {
    if (typeof document !== "undefined") {
      setIsRtl(document.dir === "rtl");
    }
  }, []);

  // Check scroll position to show/hide arrows
  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      
      // In RTL layouts, scrollLeft can be negative or positive depending on browser.
      // We check if we are near the boundaries.
      const isRTL = isRtl || window.getComputedStyle(sliderRef.current).direction === "rtl";
      
      if (isRTL) {
        // RTL boundaries
        const absScrollLeft = Math.abs(scrollLeft);
        setShowLeftArrow(absScrollLeft < scrollWidth - clientWidth - 10);
        setShowRightArrow(absScrollLeft > 10);
      } else {
        // LTR boundaries
        setShowLeftArrow(scrollLeft > 10);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      }
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      checkScroll();
      slider.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      
      // Initial check after rendering
      const timer = setTimeout(checkScroll, 100);
      
      return () => {
        slider.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
        clearTimeout(timer);
      };
    }
  }, [featured]);

  const handleScroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { clientWidth } = sliderRef.current;
      const scrollAmount = clientWidth * 0.85; // Scroll about 85% of view width
      
      // Scroll direction: in RTL, scrolling left is positive or negative.
      // Next.js client scrollBy handles RTL smoothly if we check direction.
      const isRTL = document.dir === "rtl" || window.getComputedStyle(sliderRef.current).direction === "rtl";
      
      let amount = direction === "left" ? -scrollAmount : scrollAmount;
      if (isRTL) {
        // Reverse scroll amount in RTL
        amount = direction === "left" ? scrollAmount : -scrollAmount;
      }

      sliderRef.current.scrollBy({
        left: amount,
        behavior: "smooth",
      });
    }
  };

  // Helper to get status badge text and styling
  const getStatusBadge = (series: any, index: number) => {
    // Top 3 series get "رائج 🔥" (orange) as requested, others get "جديد 👋" (cyan)
    if (index < 3) {
      return (
        <div className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#f59e0b] text-black text-[11px] font-black uppercase mb-3 shadow-lg select-none">
          <span>رائج 🔥</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#06b6d4] text-white text-[11px] font-black uppercase mb-3 shadow-lg select-none">
        <span>جديد 👋</span>
      </div>
    );
  };

  if (!featured || featured.length === 0) return null;

  return (
    <div className="relative w-full group/slider">
      {/* Slider Container */}
      <div
        ref={sliderRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 md:gap-6 pb-6 px-4 md:px-0 scroll-smooth w-full"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {featured.map((series, index) => (
          <Link
            key={series.id}
            href={`/series/${series.slug}`}
            className="group relative aspect-[3/4] w-[82vw] sm:w-[48vw] md:w-[calc(33.333%-16px)] shrink-0 snap-center md:snap-start rounded-[32px] overflow-hidden block shadow-[0_15px_35px_rgba(0,0,0,0.5)] border border-[var(--border-color)] hover:translate-y-[-4px] transition-all duration-300"
          >
            {/* Background Image */}
            <Image
              src={series.cover_image_url || "/placeholder.png"}
              alt={series.title}
              fill
              className="object-cover transition-transform duration-750 group-hover:scale-102"
              priority={index < 3}
              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-300 group-hover:via-black/50" />

            {/* Top Left Badge (Type) */}
            <div className="absolute top-5 left-5 z-10 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/10 select-none">
              {series.type === "manhwa" ? "مانهوا" : series.type === "manga" ? "مانجا" : "مانها"}
            </div>

            {/* Center/Bottom Overlay (Azora Style) */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-end p-6 pb-8 text-center">
              
              {/* Status Badge */}
              {getStatusBadge(series, index)}

              {/* Title */}
              <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-black mb-3 leading-tight drop-shadow-md text-glow line-clamp-2 max-w-xs">
                {series.title}
              </h3>

              {/* Genres List */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-full">
                {series.genres?.slice(0, 3).map((g: any) => (
                  <span
                    key={g.id}
                    className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold text-gray-200 border border-white/5 select-none"
                  >
                    {g.name}
                  </span>
                ))}
                {(!series.genres || series.genres.length === 0) && (
                  <span className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold text-gray-200 border border-white/5 select-none">
                    أخرى
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* PC Navigation Buttons */}
      {featured.length > 3 && (
        <>
          {/* Right Arrow (RTL: Scroll Back, LTR: Scroll Forward) */}
          <button
            onClick={() => handleScroll("right")}
            className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-xl hover:bg-black/60 active:scale-95 transition-all cursor-pointer ${
              isRtl ? "-left-6" : "-right-6"
            } opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300`}
            aria-label="Next featured"
          >
            {isRtl ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
          </button>

          {/* Left Arrow (RTL: Scroll Forward, LTR: Scroll Back) */}
          <button
            onClick={() => handleScroll("left")}
            className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-xl hover:bg-black/60 active:scale-95 transition-all cursor-pointer ${
              isRtl ? "-right-6" : "-left-6"
            } opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300`}
            aria-label="Previous featured"
          >
            {isRtl ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
          </button>
        </>
      )}
    </div>
  );
}
