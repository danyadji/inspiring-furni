import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getProductBySlug, getProducts } from "@/lib/products";
import ProductDetailView from "@/components/ProductDetailView";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 15;
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
    return {
      title: t("productNotFound"),
    };
  }

  const categoryName = product.categories[0]?.name || (locale === "en" ? "Teak Furniture" : "Furnitur Jati");

  return {
    title: `${product.name} | ${categoryName} | Inspiring Furni`,
    description: product.short_description || product.description.slice(0, 160),
    alternates: {
      canonical: `https://inspiringfurni.com/${locale}/produk/${slug}`,
      languages: {
        id: `https://inspiringfurni.com/id/produk/${slug}`,
        en: `https://inspiringfurni.com/en/produk/${slug}`,
        "x-default": `https://inspiringfurni.com/id/produk/${slug}`,
      },
    },
    openGraph: {
      title: `${product.name} | Inspiring Furni Jepara`,
      description: product.short_description,
      images: product.images[0]?.src ? [{ url: product.images[0].src }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await getProductBySlug(slug, locale);

  if (!product) {
    notFound();
  }

  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || "6289518906727";

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <ProductDetailView product={product} waNumber={waNumber} />
    </div>
  );
}

