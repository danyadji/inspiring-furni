"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/routing";
import { useCart } from "@/context/CartContext";

export default function FloatingWhatsApp() {
  const tWa = useTranslations("WhatsApp");
  const pathname = usePathname();
  const { isDrawerOpen } = useCart();
  const [mounted, setMounted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  // Hide when cart drawer is open or when completing order on /keranjang
  if (isDrawerOpen || pathname === "/keranjang") {
    return null;
  }

  // On product detail pages (/produk/[slug]), on mobile the sticky action bar handles WA inquiry specifically for that product
  const isProductDetailPage = pathname.startsWith("/produk/") && pathname !== "/produk";

  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || "6289518906727";
  const defaultMessage = tWa("inquiryGeneral");
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <aside
      aria-label="Kontak WhatsApp Mengambang"
      className={`fixed z-30 transition-all duration-300 ${
        isProductDetailPage
          ? "hidden md:flex bottom-8 right-8"
          : "flex bottom-6 right-5 sm:bottom-8 sm:right-8"
      } items-center gap-3`}
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Floating callout badge on desktop */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-line)] shadow-lg px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wide relative">
          <span className="w-2 h-2 rounded-full bg-[var(--color-whatsapp)] animate-pulse" />
          <span>{tWa("floatingTooltip")}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-[var(--color-muted)] hover:text-[var(--color-ink)] ml-1 text-xs cursor-pointer"
            aria-label="Tutup pesan"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Circular WhatsApp Floating Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-[var(--color-whatsapp)] text-white rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_22px_rgba(37,211,102,0.55)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        aria-label="Chat WhatsApp Inspiring Furni"
        title={tWa("floatingTooltip")}
      >
        <svg
          className="w-7 h-7 text-white fill-current transition-transform duration-200 group-hover:scale-110"
          viewBox="0 0 24 24"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.203c.044.072.044.419-.1 1.024z" />
        </svg>
      </a>
    </aside>
  );
}

