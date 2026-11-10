import React from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getProductBySlug, getProducts, getRedirectForSlug } from "@/lib/products";
import {
  getSiteUrl,
  stripHtmlAndTruncate,
  buildCanonicalAndAlternates,
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
  sanitizePublicImage,
} from "@/lib/seo";
import ProductDetailView from "@/components/ProductDetailView";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getProducts();
  const paths: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const p of products) {
      paths.push({ locale, slug: p.slug });
    }
  }
  return paths;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const product = await getProductBySlug(slug, locale);

  if (!product) {
    const redirectSlug = getRedirectForSlug(slug);
    if (redirectSlug) {
      permanentRedirect(`/${locale}/produk/${redirectSlug}`);
    }
    return {
      title: { absolute: t("productNotFound") },
    };
  }

  const siteUrl = getSiteUrl();
  const pageTitle = product.seoTitle || `${product.name} | Inspiring Furni`;
  const rawDesc = product.seoDescription || product.short_description || product.description;
  const description = stripHtmlAndTruncate(rawDesc, 155);

  const alternates = buildCanonicalAndAlternates(`/produk/${slug}`, locale);

  const mainImage = product.images[0]?.src
    ? sanitizePublicImage(product.images[0].src, siteUrl)
    : `${siteUrl}/images/og-default.jpg`;

  return {
    title: { absolute: pageTitle },
    description,
    alternates,
    openGraph: {
      title: pageTitle,
      description,
      url: alternates.canonical,
      siteName: "Inspiring Furni",
      locale: locale === "en" ? "en_US" : "id_ID",
      type: "website",
      images: [
        {
          url: mainImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [mainImage],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug, locale),
    getProducts(locale),
  ]);

  if (!product) {
    const redirectSlug = getRedirectForSlug(slug);
    if (redirectSlug) {
      permanentRedirect(`/${locale}/produk/${redirectSlug}`);
    }
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "Metadata" });

  // Structured Data (JSON-LD)
  const productJsonLd = buildProductJsonLd(product, locale);

  const primaryCategory = product.categories[0];
  const breadcrumbItems = [
    { name: t("breadcrumbHome"), pathWithoutLocale: "/" },
    { name: t("breadcrumbCatalog"), pathWithoutLocale: "/produk" },
  ];

  if (primaryCategory && primaryCategory.slug) {
    breadcrumbItems.push({
      name: primaryCategory.name,
      pathWithoutLocale: `/kategori/${primaryCategory.slug}`,
    });
  }

  breadcrumbItems.push({
    name: product.name,
    pathWithoutLocale: `/produk/${product.slug}`,
  });

  const breadcrumbsJsonLd = buildBreadcrumbJsonLd(breadcrumbItems, locale);

  // Find related products: prioritize same category, then fallback to other products
  const productCategorySlugs = new Set(product.categories.map((c) => c.slug));
  const sameCategoryProducts = allProducts.filter(
    (p) => p.id !== product.id && p.categories.some((c) => productCategorySlugs.has(c.slug))
  );

  const otherProducts = allProducts.filter(
    (p) => p.id !== product.id && !sameCategoryProducts.some((sc) => sc.id === p.id)
  );

  const relatedProducts = [...sameCategoryProducts, ...otherProducts].slice(0, 4);
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || "6289518906727";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <ProductDetailView
          product={product}
          waNumber={waNumber}
          relatedProducts={relatedProducts}
        />
      </div>
    </>
  );
}
