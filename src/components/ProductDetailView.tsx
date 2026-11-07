"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
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

  const waAskMessage = variantSummary
    ? tWa("inquiryProductWithVariant", { product: product.name, variant: variantSummary })
    : tWa("inquiryProductStandard", { product: product.name });

  const waAskUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waAskMessage)}`;

  const activeImage = product.images[activeImageIndex] || {
    src: "/images/placeholder-product.svg",
    alt: product.name,
  };

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
        {/* Left: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square w-full bg-stone-100/60 border border-[var(--color-line)] overflow-hidden">
            <Image
              src={activeImage.src}
              alt={activeImage.alt || product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover w-full h-full"
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
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
    </div>
  );
}
