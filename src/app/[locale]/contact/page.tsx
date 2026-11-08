import React from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  getSiteUrl,
  stripHtmlAndTruncate,
  buildCanonicalAndAlternates,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import ContactForm from "@/components/ContactForm";

interface Props {
  params: Promise<{ locale: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const siteUrl = getSiteUrl();

  const title = t("contactTitle");
  const description = stripHtmlAndTruncate(t("contactDescription"), 155);
  const alternates = buildCanonicalAndAlternates("/contact", locale);
  const ogImage = `${siteUrl}/images/placeholder-product.svg`;

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
          url: ogImage,
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
      images: [ogImage],
    },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Contact" });
  const tMeta = await getTranslations({ locale, namespace: "Metadata" });
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || "6289518906727";
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "inspirigfurni.id@gmail.com";

  const breadcrumbsJsonLd = buildBreadcrumbJsonLd(
    [
      { name: tMeta("breadcrumbHome"), pathWithoutLocale: "/" },
      { name: t("title"), pathWithoutLocale: "/contact" },
    ],
    locale
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 pt-4">
          {/* Left: Contact Information & Workshop Details */}
          <div className="space-y-8 font-[family-name:var(--font-dm-sans)]">
            <div>
              <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--color-ink)] mb-3">
                {t("infoTitle")}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed font-[family-name:var(--font-dm-sans)]">
                {t("locationValue")}
              </p>
              <p className="text-xs sm:text-sm text-[var(--color-muted)] mt-1 font-[family-name:var(--font-dm-sans)]">
                {t("serviceValue")}
              </p>
            </div>

            <div className="space-y-4 pt-2 border-t border-[var(--color-line)]">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] block">
                  {t("waLabel")}
                </span>
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                    locale === "en"
                      ? "Hello Inspiring Furni, I would like to consult about furniture."
                      : "Halo Inspiring Furni, saya ingin konsultasi seputar furnitur kayu jati."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-1 text-xs sm:text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors"
                >
                  <svg className="w-4 h-4 text-[var(--color-whatsapp)] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.203c.044.072.044.419-.1 1.024z" />
                  </svg>
                  +{waNumber}
                </a>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] block">
                  {t("emailLabel")}
                </span>
                <a
                  href={`mailto:${contactEmail}`}
                  className="mt-1 text-xs sm:text-sm text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors inline-block font-[family-name:var(--font-dm-sans)]"
                >
                  {contactEmail}
                </a>
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
    </>
  );
}
