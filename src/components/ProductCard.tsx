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

const COLOR_MAP: Record<string, string> = {
  natural: "#D2A679",
  "jati tua": "#6E4728",
  walnut: "#5C4033",
  "dark walnut": "#3D2B1F",
  "duco hitam": "#222222",
  "duco putih": "#F5F5F0",
  bleached: "#E6D7C3",
};

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const t = useTranslations("ProductCard");
  const firstImage = product.images[0] || {
    src: "/images/placeholder-product.svg",
    alt: product.name,
  };

  const colorAttr = product.attributes.find((a) => {
    const n = a.name.toLowerCase();
    return n.includes("warna") || n.includes("color");
  });
  const colorOptions = colorAttr ? colorAttr.options : [];

  const sizeAttr = product.attributes.find((a) => {
    const n = a.name.toLowerCase();
    return n.includes("ukuran") || n.includes("size");
  });
  const sizeOption = sizeAttr ? sizeAttr.options[0] : null;

  const specSummary = sizeOption
    ? `${sizeOption} · ${t("specDefault")}`
    : t("specDefault");

  const hasMultipleVariations = product.variations && product.variations.length > 1;
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
            {/* Color swatches */}
            {colorOptions.length > 0 && (
              <div className="flex items-center gap-1.5 mb-2" aria-label="Color options">
                {colorOptions.slice(0, 4).map((c) => {
                  const hex = COLOR_MAP[c.toLowerCase()] || "#C19A6B";
                  return (
                    <span
                      key={c}
                      title={c}
                      style={{ backgroundColor: hex }}
                      className="w-3 h-3 rounded-full border border-black/15 shadow-2xs inline-block"
                    />
                  );
                })}
                {colorOptions.length > 4 && (
                  <span className="text-[10px] font-mono text-[var(--color-muted)]">
                    +{colorOptions.length - 4}
                  </span>
                )}
              </div>
            )}

            <h3 className="text-sm sm:text-base font-medium text-[var(--color-ink)] leading-snug group-hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-dm-sans)]">
              {product.name}
            </h3>

            <p className="mt-1 text-[11px] font-mono text-[var(--color-muted)] truncate">
              {specSummary}
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-[var(--color-line)] flex items-baseline justify-between">
            <span className="text-xs sm:text-[13px] font-mono font-medium text-[var(--color-ink)]">
              {priceLabel}
            </span>
            <span className="text-[11px] font-mono text-[var(--color-accent)] uppercase tracking-wider group-hover:underline flex items-center gap-1">
              {t("detail")} &rarr;
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
