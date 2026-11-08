"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Product } from "@/lib/products";
import { formatRupiah } from "@/lib/format";

export { formatRupiah };

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const t = useTranslations("ProductCard");
  const firstImage = product.images[0] || {
    src: "/images/placeholder-product.svg",
    alt: product.name,
  };

  const sizeAttr = product.attributes.find((a) => {
    const n = a.name.toLowerCase();
    return n.includes("ukuran") || n.includes("size");
  });
  const sizeOption = sizeAttr ? sizeAttr.options[0] : null;

  const specSummary = sizeOption
    ? `${sizeOption} · ${t("specDefault")}`
    : t("specDefault");

  const hasMultipleVariations = product.variations && product.variations.length > 1;
  const currentPriceNum = parseFloat(String(product.price).replace(/[^0-9.-]+/g, "")) || 0;
  const regularPriceNum = parseFloat(String(product.regular_price || "").replace(/[^0-9.-]+/g, "")) || 0;
  const isOnSale = Boolean(
    (product.on_sale && regularPriceNum > currentPriceNum) ||
      (regularPriceNum > currentPriceNum && regularPriceNum > 0)
  );

  const priceLabel = hasMultipleVariations
    ? t("priceStarting", { price: formatRupiah(product.price) })
    : formatRupiah(product.price);

  return (
    <article className="group flex flex-col bg-[var(--color-paper)] h-full">
      <Link
        href={`/produk/${product.slug}`}
        className="flex flex-col h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)]"
        aria-label={`Lihat detail produk ${product.name}`}
      >
        {/* Product Image: Full frame, no crop, no swap on hover */}
        <div className="relative aspect-square w-full overflow-hidden bg-stone-100/60">
          {isOnSale && (
            <span className="absolute top-2.5 left-2.5 z-10 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-red-700 text-white font-medium shadow-sm">
              {t("saleBadge")}
            </span>
          )}
          <Image
            src={firstImage.src}
            alt={firstImage.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>

        {/* Product Info */}
        <div className="pt-3 pb-2 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-medium text-[var(--color-ink)] leading-snug font-[family-name:var(--font-dm-sans)]">
              {product.name}
            </h3>

            <p className="mt-1 text-[11px] font-mono text-[var(--color-muted)] truncate">
              {specSummary}
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-[var(--color-line)] flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xs sm:text-[13px] font-mono font-medium text-[var(--color-ink)]">
                {priceLabel}
              </span>
              {isOnSale && (
                <span className="text-[11px] font-mono text-[var(--color-muted)] line-through decoration-stone-400">
                  {formatRupiah(regularPriceNum)}
                </span>
              )}
            </div>
            <span className="text-[11px] font-mono text-[var(--color-accent)] uppercase tracking-wider group-hover:underline flex items-center gap-1 shrink-0">
              {t("detail")} &rarr;
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
