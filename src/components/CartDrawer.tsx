"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useCart } from "@/context/CartContext";
import { formatRupiah } from "@/components/ProductCard";

export default function CartDrawer() {
  const t = useTranslations("Cart");
  const router = useRouter();

  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    totalCount,
    isDrawerOpen,
    closeDrawer,
  } = useCart();

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const handleProceedToCheckout = () => {
    closeDrawer();
    router.push("/keranjang");
  };

  if (!isDrawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[var(--color-paper)] border-l border-[var(--color-line)] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-[var(--color-line)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium text-[var(--color-ink)] font-[family-name:var(--font-dm-sans)]">
                {t("title")}
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 bg-[var(--color-surface)] border border-[var(--color-line)] text-[var(--color-muted)]">
                {totalCount}
              </span>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              className="w-10 h-10 flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
              aria-label={t("close")}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drawer Body */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-[var(--color-surface)] border border-[var(--color-line)] flex items-center justify-center text-[var(--color-muted)]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-xs font-[family-name:var(--font-dm-sans)] text-[var(--color-muted)]">
                {t("emptyMessage")}
              </p>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  router.push("/produk");
                }}
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 text-xs font-mono uppercase tracking-wider bg-[var(--color-ink)] text-white hover:bg-[var(--color-accent)] transition-colors cursor-pointer"
              >
                {t("browseCatalog")} &rarr;
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[var(--color-line)]">
                {items.map((item) => {
                  const attrText = Object.entries(item.attributes)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" · ");

                  return (
                    <div
                      key={`${item.productId}-${item.variationId}`}
                      className="py-4 flex gap-4 items-start"
                    >
                      <div className="relative w-18 h-22 flex-shrink-0 bg-[var(--color-surface)] border border-[var(--color-line)] overflow-hidden">
                        <Image
                          src={item.imageSrc || "/images/placeholder-product.svg"}
                          alt={item.productName}
                          fill
                          className="object-contain p-1"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-[var(--color-ink)] truncate font-[family-name:var(--font-dm-sans)]">
                          {item.productName}
                        </h3>
                        {attrText && (
                          <p className="text-[11px] font-[family-name:var(--font-dm-sans)] text-[var(--color-muted)] mt-0.5">
                            {attrText}
                          </p>
                        )}
                        <p className="text-xs font-mono font-medium text-[var(--color-ink)] mt-1">
                          {formatRupiah(item.price)}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-[var(--color-line)]">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.productId, item.variationId, item.quantity - 1)
                              }
                              className="w-8 h-8 flex items-center justify-center text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                              aria-label={t("decrease")}
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-mono text-[var(--color-ink)]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.productId, item.variationId, item.quantity + 1)
                              }
                              className="w-8 h-8 flex items-center justify-center text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                              aria-label={t("increase")}
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.productId, item.variationId)}
                            className="min-h-[44px] px-2 text-[11px] font-[family-name:var(--font-dm-sans)] text-[var(--color-muted)] hover:text-red-700 transition-colors cursor-pointer"
                          >
                            {t("remove")}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary & Action Buttons */}
              <div className="border-t border-[var(--color-line)] bg-[var(--color-surface)] p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-wider text-[var(--color-muted)] font-[family-name:var(--font-dm-sans)] font-medium">
                      {t("subtotalLabel")}
                    </span>
                    <span className="text-sm font-mono font-bold text-[var(--color-ink)]">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-[var(--color-line)]">
                    <span className="text-xs uppercase tracking-wider text-[var(--color-ink)] font-[family-name:var(--font-dm-sans)] font-bold">
                      {t("totalLabel")}
                    </span>
                    <span className="text-base font-mono font-bold text-[var(--color-ink)]">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[var(--color-muted)] font-[family-name:var(--font-dm-sans)] leading-relaxed">
                  {t("shippingNote")}
                </p>

                {/* Two Action Buttons: Bayar & Lanjut Belanja */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    className="w-full min-h-[48px] px-4 py-3 bg-[var(--color-ink)] text-white hover:bg-stone-800 font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer font-[family-name:var(--font-dm-sans)]"
                  >
                    <span>{t("payButton")}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="w-full min-h-[48px] px-4 py-3 border border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink)] hover:border-[var(--color-ink)] font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center cursor-pointer font-[family-name:var(--font-dm-sans)]"
                  >
                    {t("continueShoppingDrawer")}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
