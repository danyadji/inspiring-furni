import React from "react";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export const revalidate = 15;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Home" });
  const tWa = await getTranslations({ locale, namespace: "WhatsApp" });

  const products = await getProducts(locale);

  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || "6289518906727";

  // Terlaris: 4 products
  const bestSellers = products.slice(0, 4);

  // Produk Baru: 4 products (or next 4)
  const newProducts = products.length > 4 ? products.slice(4, 8) : products.slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-28">
      {/* 3. HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center bg-[var(--color-ink)] text-white overflow-hidden">
        {/* Background Image with dark overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/placeholder-product.svg"
            alt="Workshop Inspiring Furni Jepara"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 text-center pt-28 sm:pt-36 pb-20 sm:pb-24">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight max-w-4xl mx-auto leading-tight font-[family-name:var(--font-dm-sans)]">
            {t("heroTitle1")} <br className="hidden sm:inline" />
            <span className="font-normal">{t("heroTitle2")}</span>
          </h1>
          <p className="mt-5 text-xs sm:text-sm md:text-base font-mono text-stone-300 max-w-2xl mx-auto leading-relaxed font-[family-name:var(--font-dm-mono)]">
            {t("heroDescription")}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/produk"
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-8 text-xs font-mono uppercase tracking-wider bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-[var(--color-surface)] transition-colors"
            >
              {t("heroCtaCatalog")} &rarr;
            </Link>
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(tWa("inquiryHero"))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-8 text-xs font-mono uppercase tracking-wider bg-transparent border border-white text-white hover:bg-white/10 transition-colors gap-2"
            >
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.203c.044.072.044.419-.1 1.024z" />
              </svg>
              {t("heroCtaWhatsApp")}
            </a>
          </div>
        </div>
      </section>

      {/* SECTION "TERLARIS" */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 border-b border-[var(--color-line)] pb-4 gap-4">
          <div className="max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-muted)] block">
              {t("bestSellersBadge")}
            </span>
            <h2 className="text-2xl sm:text-4xl font-light text-[var(--color-ink)] tracking-tight mt-1 font-[family-name:var(--font-dm-sans)]">
              {t("bestSellersTitle")}
            </h2>
          </div>
          <Link
            href="/produk"
            className="text-xs font-mono text-[var(--color-ink)] hover:text-[var(--color-accent)] uppercase tracking-wider hover:underline shrink-0"
          >
            {t("viewAll")} &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. BANNER PROYEK ATAU GROSIR */}
      <section className="bg-[var(--color-ink)] text-white py-16 sm:py-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-stone-400">
                {t("wholesaleBadge")}
              </span>
              <h2 className="text-2xl sm:text-4xl font-light tracking-tight leading-snug font-[family-name:var(--font-dm-sans)]">
                {t("wholesaleTitle")}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed font-[family-name:var(--font-dm-sans)]">
                {t("wholesaleDescription")}
              </p>
            </div>

            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(tWa("inquiryWholesale"))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-8 text-xs font-mono uppercase tracking-wider bg-white text-[var(--color-ink)] font-semibold hover:bg-stone-100 transition-colors gap-2"
              >
                <svg className="w-4 h-4 flex-shrink-0 text-[var(--color-whatsapp)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.203c.044.072.044.419-.1 1.024z" />
                </svg>
                {t("wholesaleCta")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECTION "PRODUK BARU" */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 border-b border-[var(--color-line)] pb-4 gap-4">
          <div className="max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-muted)] block">
              {t("newProductsBadge")}
            </span>
            <h2 className="text-2xl sm:text-4xl font-light text-[var(--color-ink)] tracking-tight mt-1 font-[family-name:var(--font-dm-sans)]">
              {t("newProductsTitle")}
            </h2>
          </div>
          <Link
            href="/produk"
            className="text-xs font-mono text-[var(--color-ink)] hover:text-[var(--color-accent)] uppercase tracking-wider hover:underline shrink-0"
          >
            {t("viewAll")} &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {newProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 9. BANNER EDITORIAL */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pb-10">
        <div className="border border-[var(--color-line)] bg-[var(--color-surface)] p-8 sm:p-14">
          <div className="max-w-2xl space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-muted)]">
              {t("editorialBadge")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-[var(--color-ink)] tracking-tight">
              {t("editorialTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed">
              {t("editorialDescription")}
            </p>
            <div className="pt-3">
              <Link
                href="/about"
                className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:underline"
              >
                {t("editorialCta")} &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

