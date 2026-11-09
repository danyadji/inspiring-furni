import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing, Locale } from "@/i18n/routing";
import { getSiteUrl, buildCanonicalAndAlternates } from "@/lib/seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { CartProvider } from "@/context/CartContext";
import "../globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const siteUrl = getSiteUrl();
  const alternates = buildCanonicalAndAlternates("/", locale);
  const ogImage = `${siteUrl}/images/placeholder-product.svg`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("homeTitle"),
      template: "%s | Inspiring Furni",
    },
    description: t("homeDescription"),
    alternates,
    openGraph: {
      title: t("homeTitle"),
      description: t("homeDescription"),
      url: alternates.canonical,
      siteName: "Inspiring Furni",
      locale: locale === "en" ? "en_US" : "id_ID",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Inspiring Furni Jepara",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("homeTitle"),
      description: t("homeDescription"),
      images: [ogImage],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${dmSans.variable} ${dmMono.variable} antialiased min-h-screen flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[var(--color-ink)] selection:text-white`}
      >
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <FloatingWhatsApp />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

