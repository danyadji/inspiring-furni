"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Category } from "@/lib/products";

interface CategorySliderProps {
  categories: Category[];
  badgeText?: string;
  titleText?: string;
  viewAllText?: string;
  exploreText?: string;
}

export default function CategorySlider({
  categories,
  badgeText,
  titleText,
  viewAllText,
  exploreText = "Jelajahi",
}: CategorySliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-8">
      {/* Header with Title and Mobile Navigation (if titleText provided) */}
      {titleText && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-10 border-b border-[var(--color-line)] pb-4 gap-4">
          <div className="max-w-2xl">
            {badgeText && (
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-muted)] block">
                {badgeText}
              </span>
            )}
            <h2 className="text-2xl sm:text-4xl font-light text-[var(--color-ink)] tracking-tight mt-1 font-[family-name:var(--font-dm-sans)]">
              {titleText}
            </h2>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-5">
            {/* Mobile and Tablet Scroll Buttons (hidden on desktop grid) */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                className="w-8 h-8 rounded-full border border-[var(--color-line)] flex items-center justify-center text-[var(--color-ink)] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[var(--color-ink)] transition-colors cursor-pointer bg-[var(--color-paper)]"
                aria-label="Geser kategori ke kiri"
              >
                &larr;
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                className="w-8 h-8 rounded-full border border-[var(--color-line)] flex items-center justify-center text-[var(--color-ink)] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[var(--color-ink)] transition-colors cursor-pointer bg-[var(--color-paper)]"
                aria-label="Geser kategori ke kanan"
              >
                &rarr;
              </button>
            </div>

            {viewAllText && (
              <Link
                href="/produk"
                className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:underline inline-flex items-center gap-1 transition-colors"
              >
                {viewAllText} &rarr;
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Cards Container: Horizontal scroll-snap on mobile/tablet, 5-col grid on desktop */}
      <div
        ref={scrollRef}
        className="flex lg:grid lg:grid-cols-5 gap-4 sm:gap-6 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none pb-2 -mx-4 px-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/kategori/${cat.slug}`}
            className="group relative flex flex-col shrink-0 w-[68vw] xs:w-[220px] sm:w-[260px] lg:w-auto snap-start bg-[var(--color-paper)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)]"
            aria-label={cat.name}
          >
            <div className="relative aspect-[4/5] sm:aspect-square w-full overflow-hidden bg-stone-100 border border-[var(--color-line)]">
              <Image
                src={cat.image || "/images/placeholder-product.svg"}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 70vw, (max-width: 1024px) 30vw, 20vw"
                className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity group-hover:opacity-90" />
              <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-4 text-white">
                <h3 className="text-sm sm:text-base font-medium tracking-tight font-[family-name:var(--font-dm-sans)] leading-snug">
                  {cat.name}
                </h3>
                <span className="mt-1 text-[11px] font-mono uppercase tracking-wider text-stone-300 inline-flex items-center gap-1 group-hover:text-white transition-colors">
                  {exploreText} &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
