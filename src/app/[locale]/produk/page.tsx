import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProducts, getCategories } from "@/lib/products";
import ProductCatalogList from "@/components/ProductCatalogList";

export const revalidate = 15;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("catalogTitle"),
    description: t("catalogDescription"),
    alternates: {
      canonical: `https://inspiringfurni.com/${locale}/produk`,
      languages: {
        id: "https://inspiringfurni.com/id/produk",
        en: "https://inspiringfurni.com/en/produk",
        "x-default": "https://inspiringfurni.com/id/produk",
      },
    },
  };
}

export default async function ProdukPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Catalog" });
  const [products, categories] = await Promise.all([
    getProducts(locale),
    getCategories(locale),
  ]);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
      <div className="mb-10 max-w-2xl">
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-muted)]">
          {t("badge")}
        </span>
        <h1 className="text-2xl sm:text-4xl font-light text-[var(--color-ink)] tracking-tight mt-1 font-[family-name:var(--font-dm-sans)]">
          {t("title")}
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed">
          {t("description")}
        </p>
      </div>

      <Suspense fallback={<div className="py-12 text-center text-xs font-mono text-[var(--color-muted)]">Memuat katalog...</div>}>
        <ProductCatalogList products={products} categories={categories} />
      </Suspense>
    </div>
  );
}

