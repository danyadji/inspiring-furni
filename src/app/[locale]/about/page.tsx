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
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 sm:py-20 space-y-14 font-[family-name:var(--font-dm-sans)]">
      <div className="max-w-3xl">
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-muted)]">
          {t("badge")}
        </span>
        <h1 className="text-3xl sm:text-5xl font-light text-[var(--color-ink)] tracking-tight mt-1 font-[family-name:var(--font-dm-sans)]">
          {t("title")}
        </h1>
        <p className="mt-4 text-sm sm:text-base text-[var(--color-muted)] leading-relaxed font-[family-name:var(--font-dm-sans)]">
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
      <div className="max-w-3xl space-y-10 text-[var(--color-ink)] leading-relaxed text-sm sm:text-base font-[family-name:var(--font-dm-sans)]">
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-light tracking-tight text-[var(--color-ink)] font-[family-name:var(--font-dm-sans)]">
            {t("sectionWhyTitle")}
          </h2>
          <p className="text-[var(--color-muted)] leading-relaxed font-[family-name:var(--font-dm-sans)]">
            {t("sectionWhyP1")}
          </p>
          <p className="text-[var(--color-muted)] leading-relaxed font-[family-name:var(--font-dm-sans)]">
            {t("sectionWhyP2")}
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-light tracking-tight text-[var(--color-ink)] font-[family-name:var(--font-dm-sans)]">
            {t("sectionDirectTitle")}
          </h2>
          <p className="text-[var(--color-muted)] leading-relaxed font-[family-name:var(--font-dm-sans)]">
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
          <h3 className="text-lg font-light text-[var(--color-ink)] font-[family-name:var(--font-dm-sans)]">{t("ctaTitle")}</h3>
          <p className="text-xs sm:text-sm text-[var(--color-muted)] font-[family-name:var(--font-dm-sans)]">{t("ctaDescription")}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <a
            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(tWa("inquiryAbout"))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-6 text-xs font-mono uppercase tracking-wider bg-[var(--color-ink)] text-white hover:bg-stone-800 transition-colors gap-2"
          >
            <svg className="w-4 h-4 text-[var(--color-whatsapp)] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.203c.044.072.044.419-.1 1.024z" />
            </svg>
            {t("ctaWhatsApp")}
          </a>
          <Link
            href="/produk"
            className="w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-6 text-xs font-mono uppercase tracking-wider border border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-surface)] transition-colors"
          >
            {t("ctaProducts")} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

