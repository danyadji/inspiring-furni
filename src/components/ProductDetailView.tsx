"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Product, ProductVariation } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { formatRupiah } from "@/components/ProductCard";

interface ProductDetailViewProps {
  product: Product;
  waNumber: string;
}

const COLOR_MAP: Record<string, string> = {
  natural: "#D2A679",
  "jati tua": "#6E4728",
  walnut: "#5C4033",
  "dark walnut": "#3D2B1F",
  "duco hitam": "#222222",
  "duco putih": "#F5F5F0",
  bleached: "#E6D7C3",
};

export default function ProductDetailView({
  product,
  waNumber,
}: ProductDetailViewProps) {
  const t = useTranslations("ProductDetail");
  const tWa = useTranslations("WhatsApp");
  const locale = useLocale();
  const { addItem } = useCart();

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const attr of product.attributes) {
      if (attr.options.length > 0 && attr.options[0]) {
        initial[attr.name.toLowerCase()] = attr.options[0];
      }
    }
    return initial;
  });

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>("deskripsi");
  const [currentUrl, setCurrentUrl] = useState<string>("");

  // Lightbox modal & Zoom state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const sliderTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingSliderRef = useRef(false);

  const dragStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number } | null>(null);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(1);
  const lastTapTimeRef = useRef<number>(0);
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleSliderScroll = () => {
    if (!sliderRef.current || isProgrammaticScrollRef.current) return;
    const { scrollLeft, clientWidth } = sliderRef.current;
    if (clientWidth > 0) {
      const newIndex = Math.round(scrollLeft / clientWidth);
      if (newIndex >= 0 && newIndex < product.images.length && newIndex !== activeImageIndex) {
        setActiveImageIndex(newIndex);
      }
    }
  };

  const scrollToImage = (index: number) => {
    if (!sliderRef.current) return;
    const clampedIndex = Math.max(0, Math.min(index, product.images.length - 1));
    isProgrammaticScrollRef.current = true;
    setActiveImageIndex(clampedIndex);
    const width = sliderRef.current.clientWidth;
    sliderRef.current.scrollTo({
      left: clampedIndex * width,
      behavior: "smooth",
    });
    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 400);
  };

  const handleSliderTouchStart = (e: React.TouchEvent) => {
    isDraggingSliderRef.current = false;
    if (e.touches.length === 1) {
      sliderTouchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleSliderTouchMove = (e: React.TouchEvent) => {
    if (sliderTouchStartRef.current && e.touches.length === 1) {
      const dx = Math.abs(e.touches[0].clientX - sliderTouchStartRef.current.x);
      const dy = Math.abs(e.touches[0].clientY - sliderTouchStartRef.current.y);
      if (dx > 10 || dy > 10) {
        isDraggingSliderRef.current = true;
      }
    }
  };

  const handleImageClick = (idx: number) => {
    if (isDraggingSliderRef.current) {
      isDraggingSliderRef.current = false;
      return;
    }
    openLightbox(idx);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const changeLightboxImage = (newIndex: number) => {
    const clamped = Math.max(0, Math.min(newIndex, product.images.length - 1));
    setLightboxIndex(clamped);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(Number((prev + 0.5).toFixed(2)), 4));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => {
      const next = Math.max(Number((prev - 0.5).toFixed(2)), 1);
      if (next === 1) {
        setPanOffset({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleToggleZoom = () => {
    if (zoomScale > 1) {
      handleResetZoom();
    } else {
      setZoomScale(2.5);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    if (!isLightboxOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft" && zoomScale === 1) {
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "ArrowRight" && zoomScale === 1) {
        setLightboxIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : prev));
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, zoomScale, product.images.length]);

  const handleLightboxTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      pinchStartDistRef.current = dist;
      pinchStartScaleRef.current = zoomScale;
      dragStartRef.current = null;
      swipeStartRef.current = null;
    } else if (e.touches.length === 1) {
      const t = e.touches[0];
      const now = Date.now();

      if (now - lastTapTimeRef.current < 300) {
        lastTapTimeRef.current = 0;
        handleToggleZoom();
        return;
      }
      lastTapTimeRef.current = now;

      if (zoomScale > 1) {
        setIsDragging(true);
        dragStartRef.current = {
          x: t.clientX,
          y: t.clientY,
          startPanX: panOffset.x,
          startPanY: panOffset.y,
        };
      } else {
        swipeStartRef.current = {
          x: t.clientX,
          y: t.clientY,
          time: now,
        };
      }
    }
  };

  const handleLightboxTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio = currentDist / pinchStartDistRef.current;
      const newScale = Math.min(Math.max(pinchStartScaleRef.current * ratio, 1), 4);
      setZoomScale(Number(newScale.toFixed(2)));
    } else if (e.touches.length === 1 && zoomScale > 1 && dragStartRef.current) {
      const t = e.touches[0];
      const dx = t.clientX - dragStartRef.current.x;
      const dy = t.clientY - dragStartRef.current.y;
      const maxPanX = (window.innerWidth * (zoomScale - 1)) / 2;
      const maxPanY = (window.innerHeight * (zoomScale - 1)) / 2;
      const nextX = Math.min(Math.max(dragStartRef.current.startPanX + dx, -maxPanX), maxPanX);
      const nextY = Math.min(Math.max(dragStartRef.current.startPanY + dy, -maxPanY), maxPanY);
      setPanOffset({ x: nextX, y: nextY });
    }
  };

  const handleLightboxTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      pinchStartDistRef.current = null;
      if (zoomScale <= 1.05) {
        setZoomScale(1);
        setPanOffset({ x: 0, y: 0 });
      }
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
      dragStartRef.current = null;

      if (zoomScale === 1 && swipeStartRef.current) {
        const changedTouch = e.changedTouches[0];
        const dx = changedTouch.clientX - swipeStartRef.current.x;
        const dy = changedTouch.clientY - swipeStartRef.current.y;
        const dt = Date.now() - swipeStartRef.current.time;
        if (dt < 400 && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0 && lightboxIndex < product.images.length - 1) {
            setLightboxIndex((prev) => prev + 1);
          } else if (dx > 0 && lightboxIndex > 0) {
            setLightboxIndex((prev) => prev - 1);
          }
        }
        swipeStartRef.current = null;
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale > 1) {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startPanX: panOffset.x,
        startPanY: panOffset.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragStartRef.current && zoomScale > 1) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const maxPanX = (window.innerWidth * (zoomScale - 1)) / 2;
      const maxPanY = (window.innerHeight * (zoomScale - 1)) / 2;
      const nextX = Math.min(Math.max(dragStartRef.current.startPanX + dx, -maxPanX), maxPanX);
      const nextY = Math.min(Math.max(dragStartRef.current.startPanY + dy, -maxPanY), maxPanY);
      setPanOffset({ x: nextX, y: nextY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setZoomScale((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 4));
    } else {
      setZoomScale((prev) => {
        const next = Math.max(Number((prev - 0.25).toFixed(2)), 1);
        if (next === 1) {
          setPanOffset({ x: 0, y: 0 });
        }
        return next;
      });
    }
  };

  // Match variation based on selected attributes
  const currentVariation: ProductVariation | undefined = useMemo(() => {
    return product.variations.find((v) => {
      return Object.entries(selectedAttributes).every(([key, value]) => {
        const vVal = v.attributes[key] || v.attributes[key.toLowerCase()];
        return vVal === value;
      });
    }) || product.variations[0];
  }, [product.variations, selectedAttributes]);

  const activePrice = currentVariation
    ? parseInt(currentVariation.price, 10)
    : parseInt(product.price, 10);

  const handleSelectAttribute = (attrName: string, option: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attrName.toLowerCase()]: option,
    }));
  };

  const handleAddToCart = () => {
    const variationId = currentVariation ? currentVariation.id : product.id;
    const firstImg = product.images[0]?.src || "/images/placeholder-product.svg";

    addItem(
      {
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        variationId,
        attributes: selectedAttributes,
        price: activePrice,
        imageSrc: firstImg,
      },
      quantity
    );
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  const variantSummary = Object.entries(selectedAttributes)
    .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
    .join(", ");

  const fallbackUrl = `https://inspiringfurni.com/${locale}/produk/${product.slug}`;
  const effectiveProductUrl = currentUrl || fallbackUrl;

  const waAskMessage = variantSummary
    ? tWa("inquiryProductWithVariant", {
        product: product.name,
        variant: variantSummary,
        url: effectiveProductUrl,
      })
    : tWa("inquiryProductStandard", {
        product: product.name,
        url: effectiveProductUrl,
      });

  const waAskUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waAskMessage)}`;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted)]">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">
              {t("breadcrumbHome")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/produk" className="hover:text-[var(--color-ink)] transition-colors">
              {t("breadcrumbProducts")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-[var(--color-ink)] font-semibold truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        {/* Left: Gallery Slider & Thumbnails */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square w-full bg-stone-100/60 border border-[var(--color-line)] overflow-hidden group select-none">
            {/* Horizontal Swipeable Slide Container */}
            <div
              ref={sliderRef}
              onScroll={handleSliderScroll}
              onTouchStart={handleSliderTouchStart}
              onTouchMove={handleSliderTouchMove}
              className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-x"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => handleImageClick(idx)}
                  className="min-w-full w-full h-full relative snap-center flex-shrink-0 cursor-zoom-in"
                  title="Perbesar foto"
                >
                  <Image
                    src={img.src}
                    alt={img.alt || `${product.name} ${idx + 1}`}
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover w-full h-full pointer-events-none"
                    draggable={false}
                  />
                </div>
              ))}
            </div>

            {/* Slider Navigation Arrows (Visible if multiple images exist) */}
            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToImage(activeImageIndex - 1);
                  }}
                  disabled={activeImageIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-transparent border-none text-[var(--color-ink)] hover:opacity-60 flex items-center justify-center transition-opacity cursor-pointer disabled:opacity-0 disabled:pointer-events-none drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)] z-10 p-0"
                  aria-label="Foto sebelumnya"
                >
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToImage(activeImageIndex + 1);
                  }}
                  disabled={activeImageIndex === product.images.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-transparent border-none text-[var(--color-ink)] hover:opacity-60 flex items-center justify-center transition-opacity cursor-pointer disabled:opacity-0 disabled:pointer-events-none drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)] z-10 p-0"
                  aria-label="Foto berikutnya"
                >
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Counter Badge */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/65 backdrop-blur-sm text-white text-[11px] font-mono tracking-wider pointer-events-none">
                  {activeImageIndex + 1} / {product.images.length}
                </div>
              </>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToImage(idx)}
                  className={`relative w-20 h-20 border overflow-hidden bg-stone-100/60 flex-shrink-0 transition-colors cursor-pointer ${
                    activeImageIndex === idx
                      ? "border-[var(--color-ink)] ring-1 ring-[var(--color-ink)]"
                      : "border-[var(--color-line)] hover:border-[var(--color-muted)]"
                  }`}
                  aria-label={`Thumbnail ${idx + 1}`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt || `Thumbnail ${product.name} ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Variant Selection */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--color-muted)]">
              {product.categories[0]?.name || t("defaultCategory")}
            </span>
            <h1 className="text-2xl sm:text-3xl font-light text-[var(--color-ink)] tracking-tight mt-1 font-[family-name:var(--font-dm-sans)]">
              {product.name}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed">
              {product.short_description}
            </p>
          </div>

          {/* Dynamic Price */}
          <div className="pt-2 pb-4 border-b border-[var(--color-line)]">
            <span className="text-xs font-mono text-[var(--color-muted)] block uppercase tracking-wider">
              {t("unitPrice")}
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-[var(--color-ink)] mt-1 block">
              {formatRupiah(activePrice)}
            </span>
            <span className="block text-[11px] font-mono text-[var(--color-muted)] mt-1">
              {t("shippingNote")}
            </span>
          </div>

          {/* Variant Selectors */}
          <div className="space-y-5">
            {product.attributes.map((attr) => {
              const attrKey = attr.name.toLowerCase();
              const selectedVal = selectedAttributes[attrKey] || attr.options[0];
              const isColor = attrKey.includes("warna") || attrKey.includes("color");

              return (
                <div key={attr.name} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="uppercase tracking-wider text-[var(--color-ink)]">
                      {attr.name}:
                    </span>
                    <span className="text-[var(--color-muted)]">{selectedVal}</span>
                  </div>

                  {isColor ? (
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {attr.options.map((opt) => {
                        const isSelected = selectedVal === opt;
                        const hex = COLOR_MAP[opt.toLowerCase()] || "#C19A6B";
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSelectAttribute(attr.name, opt)}
                            className={`min-h-[44px] px-3.5 py-1.5 flex items-center gap-2 border text-xs font-mono transition-all ${
                              isSelected
                                ? "border-[var(--color-ink)] bg-[var(--color-surface)] font-medium"
                                : "border-[var(--color-line)] bg-transparent hover:border-[var(--color-muted)]"
                            }`}
                            aria-label={opt}
                          >
                            <span
                              style={{ backgroundColor: hex }}
                              className="w-3.5 h-3.5 rounded-full border border-black/20"
                            />
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {attr.options.map((opt) => {
                        const isSelected = selectedVal === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSelectAttribute(attr.name, opt)}
                            className={`min-h-[44px] px-4 py-2 text-xs font-mono uppercase tracking-wider border transition-colors ${
                              isSelected
                                ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                                : "border-[var(--color-line)] bg-transparent text-[var(--color-ink)] hover:border-[var(--color-muted)]"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2 pt-2">
            <label htmlFor="product-quantity" className="block text-xs font-mono uppercase tracking-wider text-[var(--color-ink)]">
              {t("quantityLabel")}
            </label>
            <div className="flex items-center border border-[var(--color-line)] w-max">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                aria-label="Decrease quantity"
                className="w-11 h-11 flex items-center justify-center text-sm font-mono text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
              >
                -
              </button>
              <input
                id="product-quantity"
                type="number"
                min="1"
                max="99"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1) {
                    setQuantity(val);
                  }
                }}
                className="w-14 h-11 text-center font-mono text-sm border-x border-[var(--color-line)] bg-transparent text-[var(--color-ink)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                aria-label="Increase quantity"
                className="w-11 h-11 flex items-center justify-center text-sm font-mono text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full min-h-[48px] px-6 py-3 bg-[var(--color-ink)] text-white font-mono text-xs uppercase tracking-wider hover:bg-[var(--color-accent)] transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {t("addToCart")}
            </button>

            <a
              href={waAskUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] px-6 py-3 border border-[var(--color-ink)] text-[var(--color-ink)] font-mono text-xs uppercase tracking-wider hover:bg-stone-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              aria-label={t("askWhatsApp")}
            >
              <svg className="w-4 h-4 text-[var(--color-whatsapp)] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.203c.044.072.044.419-.1 1.024z" />
              </svg>
              {t("askWhatsApp")}
            </a>
          </div>

          {/* Accordion: Info, Estimasi, Packing, Garansi */}
          <div className="border-t border-[var(--color-line)] pt-4 divide-y divide-[var(--color-line)]">
            {/* Accordion Item: Deskripsi */}
            <div className="py-3">
              <button
                type="button"
                onClick={() => toggleAccordion("deskripsi")}
                className="w-full flex items-center justify-between text-left text-xs font-mono uppercase tracking-wider text-[var(--color-ink)] py-1"
                aria-expanded={openAccordion === "deskripsi"}
              >
                <span>{t("accordionDescription")}</span>
                <span>{openAccordion === "deskripsi" ? "−" : "+"}</span>
              </button>
              {openAccordion === "deskripsi" && (
                <div className="pt-2 text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed space-y-2">
                  <p>{product.description || product.short_description}</p>
                </div>
              )}
            </div>

            {/* Accordion Item: Estimasi */}
            <div className="py-3">
              <button
                type="button"
                onClick={() => toggleAccordion("estimasi")}
                className="w-full flex items-center justify-between text-left text-xs font-mono uppercase tracking-wider text-[var(--color-ink)] py-1"
                aria-expanded={openAccordion === "estimasi"}
              >
                <span>{t("accordionEstimasi")}</span>
                <span>{openAccordion === "estimasi" ? "−" : "+"}</span>
              </button>
              {openAccordion === "estimasi" && (
                <div className="pt-2 text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed">
                  <p>{t("accordionEstimasiContent")}</p>
                </div>
              )}
            </div>

            {/* Accordion Item: Packing */}
            <div className="py-3">
              <button
                type="button"
                onClick={() => toggleAccordion("packing")}
                className="w-full flex items-center justify-between text-left text-xs font-mono uppercase tracking-wider text-[var(--color-ink)] py-1"
                aria-expanded={openAccordion === "packing"}
              >
                <span>{t("accordionPacking")}</span>
                <span>{openAccordion === "packing" ? "−" : "+"}</span>
              </button>
              {openAccordion === "packing" && (
                <div className="pt-2 text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed">
                  <p>{t("accordionPackingContent")}</p>
                </div>
              )}
            </div>

            {/* Accordion Item: Garansi */}
            <div className="py-3">
              <button
                type="button"
                onClick={() => toggleAccordion("garansi")}
                className="w-full flex items-center justify-between text-left text-xs font-mono uppercase tracking-wider text-[var(--color-ink)] py-1"
                aria-expanded={openAccordion === "garansi"}
              >
                <span>{t("accordionGaransi")}</span>
                <span>{openAccordion === "garansi" ? "−" : "+"}</span>
              </button>
              {openAccordion === "garansi" && (
                <div className="pt-2 text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed">
                  <p>{t("accordionGaransiContent")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen Lightbox Modal with Zoom & Pan */}
      {isLightboxOpen && (
        <div
          data-allow-zoom="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none touch-none"
        >
          {/* Top Bar: Counter, Zoom Controls, Close Button */}
          <div className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-black/40">
            <div className="text-white/80 font-mono text-xs sm:text-sm tracking-wider">
              {lightboxIndex + 1} / {product.images.length}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 rounded-full px-2.5 py-1 backdrop-blur-sm">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomScale <= 1}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base font-mono"
                aria-label="Perkecil zoom"
              >
                −
              </button>

              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 py-0.5 text-xs font-mono text-white/90 hover:text-white"
                aria-label="Reset zoom"
              >
                {Math.round(zoomScale * 100)}%
              </button>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomScale >= 4}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base font-mono"
                aria-label="Perbesar zoom"
              >
                +
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={closeLightbox}
              className="w-11 h-11 flex items-center justify-center text-white/80 hover:text-white transition-opacity cursor-pointer"
              aria-label="Tutup tampilan penuh"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Center Image Viewport */}
          <div
            className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            onDoubleClick={handleToggleZoom}
            onTouchStart={handleLightboxTouchStart}
            onTouchMove={handleLightboxTouchMove}
            onTouchEnd={handleLightboxTouchEnd}
          >
            {/* Left Nav Arrow (Lightbox) - Pure arrow, no bg, no border */}
            {product.images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  changeLightboxImage(lightboxIndex - 1);
                }}
                disabled={lightboxIndex === 0}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-transparent border-none text-white/80 hover:text-white flex items-center justify-center transition-opacity cursor-pointer disabled:opacity-0 disabled:pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-20 p-0"
                aria-label="Foto sebelumnya"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Scalable & Draggable Image Canvas */}
            <div
              className="relative max-w-[94vw] max-h-[78vh] w-full h-full flex items-center justify-center"
              style={{
                transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoomScale})`,
                transition: isDragging ? "none" : "transform 0.15s ease-out",
                cursor: zoomScale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
              }}
            >
              <div className="relative w-full h-full max-w-[1100px] max-h-[78vh]">
                <Image
                  src={product.images[lightboxIndex]?.src || ""}
                  alt={product.images[lightboxIndex]?.alt || product.name}
                  fill
                  priority
                  sizes="100vw"
                  className="object-contain pointer-events-none select-none"
                  draggable={false}
                />
              </div>
            </div>

            {/* Right Nav Arrow (Lightbox) - Pure arrow, no bg, no border */}
            {product.images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  changeLightboxImage(lightboxIndex + 1);
                }}
                disabled={lightboxIndex === product.images.length - 1}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-transparent border-none text-white/80 hover:text-white flex items-center justify-center transition-opacity cursor-pointer disabled:opacity-0 disabled:pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-20 p-0"
                aria-label="Foto berikutnya"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Bottom Bar: Thumbnails & Helper Text */}
          <div className="relative z-30 px-4 sm:px-6 py-3 border-t border-white/10 bg-black/40 flex flex-col items-center gap-2">
            {product.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => changeLightboxImage(idx)}
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 overflow-hidden flex-shrink-0 transition-opacity cursor-pointer ${
                      lightboxIndex === idx
                        ? "border-2 border-white opacity-100"
                        : "border border-white/20 opacity-50 hover:opacity-80"
                    }`}
                    aria-label={`Lihat foto ${idx + 1}`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt || `Thumbnail ${idx + 1}`}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            <p className="text-[11px] font-mono text-white/50 tracking-wider">
              Ketuk 2x atau pinch untuk memperbesar
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
