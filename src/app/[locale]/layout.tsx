import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing, Locale } from "@/i18n/routing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import "../globals.css";

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

  return {
    metadataBase: new URL("https://inspiringfurni.com"),
    title: {
      default: t("homeTitle"),
      template: "%s | Inspiring Furni",
    },
    description: t("homeDescription"),
    alternates: {
      canonical: `https://inspiringfurni.com/${locale}`,
      languages: {
        id: "https://inspiringfurni.com/id",
        en: "https://inspiringfurni.com/en",
        "x-default": "https://inspiringfurni.com/id",
      },
    },
    openGraph: {
      title: t("homeTitle"),
      description: t("homeDescription"),
      url: `https://inspiringfurni.com/${locale}`,
      siteName: "Inspiring Furni",
      locale: locale === "en" ? "en_US" : "id_ID",
      type: "website",
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
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

