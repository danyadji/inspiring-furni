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
  const secondImage = product.images[1];

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
    <article className="group flex flex-col bg-[var(--color-paper)]">
      <Link
        href={`/produk/${product.slug}`}
        className="block relative aspect-[4/5] bg-[var(--color-surface)] overflow-hidden"
        aria-label={`Lihat detail produk ${product.name}`}
      >
        <Image
          src={firstImage.src}
          alt={firstImage.alt || product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          className={`object-contain p-6 transition-all duration-300 group-hover:scale-[1.03] ${
            secondImage ? "group-hover:opacity-0" : ""
          }`}
        />
        {secondImage && (
          <Image
            src={secondImage.src}
            alt={secondImage.alt || `${product.name} alternate view`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        )}
      </Link>

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

          <h3 className="text-sm font-medium text-[var(--color-ink)] leading-snug group-hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-dm-sans)]">
            <Link href={`/produk/${product.slug}`}>
              {product.name}
            </Link>
          </h3>

          <p className="mt-1 text-[11px] font-mono text-[var(--color-muted)] truncate">
            {specSummary}
          </p>
        </div>

        <div className="mt-2 pt-2 border-t border-[var(--color-line)] flex items-baseline justify-between">
          <span className="text-xs sm:text-[13px] font-mono font-medium text-[var(--color-ink)]">
            {priceLabel}
          </span>
          <span className="text-[11px] font-mono text-[var(--color-accent)] uppercase tracking-wider group-hover:underline">
            {t("detail")} &rarr;
          </span>
        </div>
      </div>
    </article>
  );
}
