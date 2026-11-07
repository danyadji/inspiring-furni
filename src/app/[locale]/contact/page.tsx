import React from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ContactForm from "@/components/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("contactTitle"),
    description: t("contactDescription"),
    alternates: {
      canonical: `https://inspiringfurni.com/${locale}/contact`,
      languages: {
        id: "https://inspiringfurni.com/id/contact",
        en: "https://inspiringfurni.com/en/contact",
        "x-default": "https://inspiringfurni.com/id/contact",
      },
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Contact" });
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || "6289518906727";
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "inspirigfurni.id@gmail.com";

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 sm:py-20 space-y-12 font-[family-name:var(--font-dm-sans)]">
      <div className="max-w-3xl">
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-muted)]">
          {t("badge")}
        </span>
        <h1 className="text-3xl sm:text-5xl font-light text-[var(--color-ink)] tracking-tight mt-1 font-[family-name:var(--font-dm-sans)]">
          {t("title")}
        </h1>
        <p className="mt-4 text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed font-[family-name:var(--font-dm-sans)]">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
        {/* Left: Contact Info */}
        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] p-6 sm:p-8 border border-[var(--color-line)] space-y-5">
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--color-ink)]">
              {t("infoTitle")}
            </h2>

            <div className="space-y-4 text-xs font-[family-name:var(--font-dm-sans)]">
              <div>
                <span className="block text-[var(--color-muted)] text-[11px] font-mono uppercase tracking-wider">{t("waLabel")}</span>
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-ink)] font-bold text-sm sm:text-base hover:underline mt-0.5 block font-mono"
                >
                  +{waNumber}
                </a>
              </div>

              <div>
                <span className="block text-[var(--color-muted)] text-[11px] font-mono uppercase tracking-wider">{t("emailLabel")}</span>
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-[var(--color-ink)] font-bold text-sm sm:text-base hover:underline mt-0.5 block font-mono break-all"
                >
                  {contactEmail}
                </a>
              </div>

              <div>
                <span className="block text-[var(--color-muted)] text-[11px] font-mono uppercase tracking-wider">{t("locationLabel")}</span>
                <p className="text-[var(--color-ink)] mt-0.5 text-xs sm:text-sm font-[family-name:var(--font-dm-sans)]">
                  {t("locationValue")}
                </p>
              </div>

              <div>
                <span className="block text-[var(--color-muted)] text-[11px] font-mono uppercase tracking-wider">{t("serviceLabel")}</span>
                <p className="text-[var(--color-muted)] mt-0.5 leading-relaxed text-xs sm:text-sm font-[family-name:var(--font-dm-sans)]">
                  {t("serviceValue")}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 border border-[var(--color-line)] text-xs font-[family-name:var(--font-dm-sans)] text-[var(--color-muted)] space-y-1">
            <p className="text-[var(--color-ink)] font-semibold text-[11px] font-mono uppercase tracking-wider">{t("cargoShippingTitle")}</p>
            <p className="leading-relaxed text-xs sm:text-sm font-[family-name:var(--font-dm-sans)]">
              {t("cargoShippingDesc")}
            </p>
          </div>
        </div>

        {/* Right: Quick Form that opens WhatsApp */}
        <div className="border border-[var(--color-line)] p-6 sm:p-8 bg-[var(--color-paper)]">
          <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--color-ink)] mb-1">
            {t("formTitle")}
          </h2>
          <p className="text-xs text-[var(--color-muted)] mb-6 font-[family-name:var(--font-dm-sans)]">
            {t("formDescription")}
          </p>

          <ContactForm waNumber={waNumber} />
        </div>
      </div>
    </div>
  );
}

