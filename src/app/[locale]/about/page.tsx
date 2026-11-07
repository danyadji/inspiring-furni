import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("aboutTitle"),
    description: t("aboutDescription"),
    alternates: {
      canonical: `https://inspiringfurni.com/${locale}/about`,
      languages: {
        id: "https://inspiringfurni.com/id/about",
        en: "https://inspiringfurni.com/en/about",
        "x-default": "https://inspiringfurni.com/id/about",
      },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "About" });
  const tWa = await getTranslations({ locale, namespace: "WhatsApp" });
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || "6289518906727";

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 sm:py-20 space-y-14">
      <div className="max-w-3xl">
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-muted)]">
          {t("badge")}
        </span>
        <h1 className="text-3xl sm:text-5xl font-light text-[var(--color-ink)] tracking-tight mt-1 font-[family-name:var(--font-dm-sans)]">
          {t("title")}
        </h1>
        <p className="mt-4 text-sm sm:text-base text-[var(--color-muted)] leading-relaxed">
          {t("description")}
        </p>
      </div>

      {/* Visual Banner */}
      <div className="relative aspect-[21/9] w-full bg-[var(--color-surface)] border border-[var(--color-line)] overflow-hidden flex items-center justify-center p-8">
        <Image
          src="/images/placeholder-product.svg"
          alt="Workshop Inspiring Furni Jepara"
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-contain p-8 opacity-40"
        />
      </div>

      {/* Story Sections */}
      <div className="max-w-3xl space-y-10 text-[var(--color-ink)] leading-relaxed text-sm sm:text-base">
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-light tracking-tight text-[var(--color-ink)]">
            {t("sectionWhyTitle")}
          </h2>
          <p className="text-[var(--color-muted)] leading-relaxed">
            {t("sectionWhyP1")}
          </p>
          <p className="text-[var(--color-muted)] leading-relaxed">
            {t("sectionWhyP2")}
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-light tracking-tight text-[var(--color-ink)]">
            {t("sectionDirectTitle")}
          </h2>
          <p className="text-[var(--color-muted)] leading-relaxed">
            {t("sectionDirectP")}
          </p>
        </div>

        {/* Workshop details */}
        <div className="bg-[var(--color-surface)] p-6 sm:p-8 border border-[var(--color-line)] space-y-4">
          <h3 className="text-sm font-mono uppercase tracking-wider text-[var(--color-ink)]">
            {t("infoTitle")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="block text-[var(--color-muted)] uppercase">{t("infoAddressLabel")}</span>
              <span className="text-[var(--color-ink)] mt-0.5 block">{t("infoAddress")}</span>
            </div>
            <div>
              <span className="block text-[var(--color-muted)] uppercase">{t("infoCategoryLabel")}</span>
              <span className="text-[var(--color-ink)] mt-0.5 block">{t("infoCategory")}</span>
            </div>
            <div>
              <span className="block text-[var(--color-muted)] uppercase">{t("infoShippingLabel")}</span>
              <span className="text-[var(--color-ink)] mt-0.5 block">{t("infoShipping")}</span>
            </div>
            <div>
              <span className="block text-[var(--color-muted)] uppercase">{t("infoConsultLabel")}</span>
              <span className="text-[var(--color-ink)] mt-0.5 block">{t("infoConsult")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-8 border-t border-[var(--color-line)] flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-light text-[var(--color-ink)]">{t("ctaTitle")}</h3>
          <p className="text-xs sm:text-sm text-[var(--color-muted)]">{t("ctaDescription")}</p>
        </div>
        <div className="flex gap-4">
          <a
            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(tWa("inquiryAbout"))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center min-h-[48px] px-6 text-xs font-mono uppercase tracking-wider bg-[var(--color-whatsapp)] text-[var(--color-ink)] font-bold hover:brightness-95 transition-all gap-2"
          >
            {t("ctaWhatsApp")}
          </a>
          <Link
            href="/produk"
            className="inline-flex items-center justify-center min-h-[48px] px-6 text-xs font-mono uppercase tracking-wider border border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-surface)] transition-colors"
          >
            {t("ctaProducts")} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

