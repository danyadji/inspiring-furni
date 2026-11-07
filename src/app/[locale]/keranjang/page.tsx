import React from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import CartView from "@/components/CartView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("cartTitle"),
    description: t("cartDescription"),
    alternates: {
      canonical: `https://inspiringfurni.com/${locale}/keranjang`,
      languages: {
        id: "https://inspiringfurni.com/id/keranjang",
        en: "https://inspiringfurni.com/en/keranjang",
        "x-default": "https://inspiringfurni.com/id/keranjang",
      },
    },
  };
}

export default async function KeranjangPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Cart" });
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || "6289518906727";

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
      <div className="mb-8">
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-muted)]">
          {t("cartPageBadge")}
        </span>
        <h1 className="text-2xl sm:text-3xl font-light text-[var(--color-ink)] tracking-tight mt-1 font-[family-name:var(--font-dm-sans)]">
          {t("cartPageTitle")}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[var(--color-muted)]">
          {t("cartPageDescription")}
        </p>
      </div>

      <CartView waNumber={waNumber} />
    </div>
  );
}

