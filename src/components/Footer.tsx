import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Nav");
  const tWa = useTranslations("WhatsApp");
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || "6289518906727";

  return (
    <footer className="bg-[var(--color-ink)] text-stone-300 mt-20 border-t border-[var(--color-ink)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Col 1: Identity */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 shrink-0 overflow-hidden rounded">
                <Image
                  src="/images/logo/logo.svg"
                  alt="Inspiring Furni Logo"
                  width={32}
                  height={32}
                  className="object-contain w-full h-full"
                />
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white uppercase font-[family-name:var(--font-dm-sans)]">
                Inspiring Furni
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm">
              {t("description")}
            </p>
            <div className="text-xs font-mono text-stone-400 pt-2 space-y-1">
              <p className="text-stone-300 uppercase tracking-wider">{t("locationTitle")}</p>
              <p>{t("locationValue")}</p>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-white">
              {t("navTitle")}
            </h3>
            <ul className="space-y-2 text-xs font-mono text-stone-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {tNav("home")}
                </Link>
              </li>
              <li>
                <Link href="/produk" className="hover:text-white transition-colors">
                  {tNav("products")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  {tNav("about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  {tNav("contact")}
                </Link>
              </li>
              <li>
                <Link href="/keranjang" className="hover:text-white transition-colors">
                  {tNav("cart")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Social & Consultation */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-white">
              {t("socialTitle")}
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              {t("socialDescription")}
            </p>

            <div className="flex items-center space-x-4 text-xs font-mono text-stone-300">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors underline underline-offset-4"
              >
                Instagram
              </a>
              <span>·</span>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors underline underline-offset-4"
              >
                TikTok
              </a>
              <span>·</span>
              <a
                href="https://shopee.co.id"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors underline underline-offset-4"
              >
                Shopee
              </a>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(tWa("inquiryGeneral"))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 bg-[var(--color-whatsapp)] text-[var(--color-ink)] font-bold text-xs uppercase tracking-wider hover:brightness-95 transition-all gap-2"
                aria-label={t("whatsappButton")}
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.203c.044.072.044.419-.1 1.024z" />
                </svg>
                {t("whatsappButton")}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-stone-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Inspiring Furni Jepara. {t("rights")}</p>
          <div className="flex space-x-6">
            <span>{t("privacy")}</span>
            <span>{t("terms")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
