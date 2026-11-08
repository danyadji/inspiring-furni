import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { getCategoryBySlug, getCategories, getProductsByCategory } from "@/lib/products";
import {
  getSiteUrl,
  stripHtmlAndTruncate,
  buildCanonicalAndAlternates,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import ProductCard from "@/components/ProductCard";
import CategorySlider from "@/components/CategorySlider";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = await getCategories();
  const paths: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const cat of categories) {
      if (cat.slug && cat.slug !== "tanpa-kategori") {
        paths.push({ locale, slug: cat.slug });
      }
    }
  }
  return paths;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const category = await getCategoryBySlug(slug, locale);

  if (!category) {
    return {
      title: { absolute: t("categoryNotFound") },
    };
  }

  const siteUrl = getSiteUrl();
  const title = category.seoTitle || t("categoryTitle", { categoryName: category.name });
  const rawDesc =
    category.seoDescription ||
    category.description ||
    t("categoryDefaultDesc", { categoryName: category.name });
  const description = stripHtmlAndTruncate(rawDesc, 155);

  const alternates = buildCanonicalAndAlternates(`/kategori/${slug}`, locale);
  const imageUrl = category.image || `${siteUrl}/images/placeholder-product.svg`;

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
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: category.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [category, products, allCategories] = await Promise.all([
    getCategoryBySlug(slug, locale),
    getProductsByCategory(slug, locale),
    getCategories(locale),
  ]);

  if (!category) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "Metadata" });
  const tCat = await getTranslations({ locale, namespace: "Catalog" });

  const breadcrumbsJsonLd = buildBreadcrumbJsonLd(
    [
      { name: t("breadcrumbHome"), pathWithoutLocale: "/" },
      { name: t("breadcrumbCatalog"), pathWithoutLocale: "/produk" },
      { name: category.name, pathWithoutLocale: `/kategori/${category.slug}` },
    ],
    locale
  );

  const siteUrl = getSiteUrl();
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description || t("categoryDefaultDesc", { categoryName: category.name }),
    url: `${siteUrl}/${locale}/kategori/${category.slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${siteUrl}/${locale}/produk/${p.slug}`,
        name: p.name,
      })),
    },
  };

  const otherCategories = allCategories.filter(
    (c) => c.slug !== "tanpa-kategori" && c.slug !== category.slug
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8 sm:py-14 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs font-mono text-[var(--color-muted)]">
          <ol className="flex items-center gap-2 flex-wrap">
            <li>
              <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">
                {t("breadcrumbHome")}
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/produk" className="hover:text-[var(--color-ink)] transition-colors">
                {t("breadcrumbCatalog")}
              </Link>
            </li>
            <li>/</li>
            <li className="text-[var(--color-ink)] font-semibold" aria-current="page">
              {category.name}
            </li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-muted)]">
            {t("breadcrumbCategories")}
          </span>
          <h1 className="text-3xl sm:text-4xl font-light text-[var(--color-ink)] tracking-tight font-[family-name:var(--font-dm-sans)]">
            {category.name}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed font-[family-name:var(--font-dm-sans)]">
            {category.description ||
              t("categoryDefaultDesc", { categoryName: category.name })}
          </p>
        </div>

        {/* Product Grid in this Category */}
        {products.length > 0 ? (
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-line)] mb-6">
              <span className="text-xs font-mono text-[var(--color-muted)]">
                {products.length} {locale === "en" ? "Items" : "Produk Tersedia"}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="py-16 text-center space-y-4 border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] p-8">
            <p className="text-sm font-mono text-[var(--color-muted)]">
              {locale === "en"
                ? "No products currently available in this category."
                : "Belum ada produk untuk kategori ini."}
            </p>
            <Link
              href="/produk"
              className="inline-flex items-center justify-center min-h-[44px] px-6 text-xs font-mono uppercase tracking-wider bg-[var(--color-ink)] text-white hover:bg-[var(--color-accent)] transition-colors"
            >
              {tCat("viewAll")}
            </Link>
          </div>
        )}

        {/* Browse Other Categories Slider */}
        {otherCategories.length > 0 && (
          <div className="pt-8 border-t border-[var(--color-line)] space-y-4">
            <h2 className="text-lg font-light text-[var(--color-ink)] font-[family-name:var(--font-dm-sans)]">
              {locale === "en" ? "Explore Other Collections" : "Jelajahi Kategori Lainnya"}
            </h2>
            <CategorySlider categories={otherCategories} />
          </div>
        )}
      </div>
    </>
  );
}
