import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProducts, getCategories } from "@/lib/products";
import {
  getSiteUrl,
  stripHtmlAndTruncate,
  buildCanonicalAndAlternates,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import ProductCatalogList from "@/components/ProductCatalogList";

interface Props {
  params: Promise<{ locale: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const siteUrl = getSiteUrl();

  const title = t("catalogTitle");
  const description = stripHtmlAndTruncate(t("catalogDescription"), 155);
  const alternates = buildCanonicalAndAlternates("/produk", locale);
  const heroImage = `${siteUrl}/images/og-default.jpg`;

  return {
    title: { absolute: title },
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: "Inspiring Furni",
      locale: locale === "en" ? "en_US" : "id_ID",
      type: "website",
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [heroImage],
    },
  };
}

export default async function ProdukPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Catalog" });
  const tMeta = await getTranslations({ locale, namespace: "Metadata" });
  const [products, categories] = await Promise.all([
    getProducts(locale),
    getCategories(locale),
  ]);

  const breadcrumbsJsonLd = buildBreadcrumbJsonLd(
    [
      { name: tMeta("breadcrumbHome"), pathWithoutLocale: "/" },
      { name: tMeta("breadcrumbCatalog"), pathWithoutLocale: "/produk" },
    ],
    locale
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

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
    </>
  );
}
