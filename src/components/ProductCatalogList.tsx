"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Product, Category } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

interface ProductCatalogListProps {
  products: Product[];
  categories: Category[];
}

export default function ProductCatalogList({
  products,
  categories,
}: ProductCatalogListProps) {
  const t = useTranslations("Catalog");
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "all"
  );

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === "all" ||
        product.categories.some((cat) => cat.slug === selectedCategory);

      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Controls: Search and Category Filter */}
      <div className="border-b border-[var(--color-line)] pb-6 space-y-5">
        {/* Search Input */}
        <div className="max-w-md">
          <label
            htmlFor="catalog-search"
            className="block text-[11px] font-mono text-[var(--color-muted)] uppercase tracking-wider mb-1.5"
          >
            {t("searchLabel")}
          </label>
          <div className="relative">
            <input
              id="catalog-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full px-3.5 py-2.5 text-xs font-mono bg-transparent border border-[var(--color-line)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-[11px] font-mono text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                aria-label={t("reset")}
              >
                {t("reset")}
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div>
          <span className="block text-[11px] font-mono text-[var(--color-muted)] uppercase tracking-wider mb-2">
            {t("categoryLabel")}
          </span>
          <div
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
            role="group"
            aria-label={t("categoryLabel")}
          >
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`min-h-[40px] px-4 py-1.5 text-xs font-mono uppercase tracking-wider border whitespace-nowrap transition-colors ${
                selectedCategory === "all"
                  ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)]"
                  : "bg-transparent text-[var(--color-ink)] border-[var(--color-line)] hover:border-[var(--color-muted)]"
              }`}
            >
              {t("allCategories")} ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) =>
                p.categories.some((c) => c.slug === cat.slug)
              ).length;
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`min-h-[40px] px-4 py-1.5 text-xs font-mono uppercase tracking-wider border whitespace-nowrap transition-colors ${
                    isSelected
                      ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)]"
                      : "bg-transparent text-[var(--color-ink)] border-[var(--color-line)] hover:border-[var(--color-muted)]"
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="border border-[var(--color-line)] bg-[var(--color-surface)] p-12 text-center max-w-lg mx-auto space-y-3">
          <h3 className="text-sm font-medium text-[var(--color-ink)] font-[family-name:var(--font-dm-sans)]">
            {t("emptyTitle")}
          </h3>
          <p className="text-xs font-mono text-[var(--color-muted)]">
            {t("emptyDescription")}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-2 text-xs font-mono uppercase tracking-wider bg-[var(--color-ink)] text-white hover:bg-[var(--color-accent)] transition-colors"
            >
              {t("resetFilter")} &rarr;
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
