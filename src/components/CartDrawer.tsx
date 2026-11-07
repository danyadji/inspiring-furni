"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { useCart } from "@/context/CartContext";
import { formatRupiah } from "@/components/ProductCard";

export default function CartDrawer() {
  const t = useTranslations("Cart");
  const tWa = useTranslations("WhatsApp");
  const locale = useLocale();

  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    totalCount,
    isDrawerOpen,
    closeDrawer,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage(t("errorName"));
      return;
    }

    if (!customerAddress.trim()) {
      setErrorMessage(t("errorAddress"));
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerAddress: customerAddress.trim(),
        locale,
        items: items.map((item) => ({
          productId: item.productId,
          productSlug: item.productSlug,
          productName: item.productName,
          variationId: item.variationId,
          attributes: item.attributes,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.whatsappUrl) {
        throw new Error(data.error || "Order processing error");
      }

      window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      closeDrawer();
    } catch {
      // Fallback: If recording fails, still generate localized WhatsApp link
      const fallbackItems = items
        .map(
          (item, idx) =>
            `${idx + 1}. ${item.productName} (${Object.values(item.attributes).join(", ")}) x ${item.quantity} = ${formatRupiah(
              item.price * item.quantity
            )}`
        )
        .join("\n");

      const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || "6289518906727";
      const fallbackText = `${tWa("orderHeaderFallback")}${fallbackItems}\n\n${tWa(
        "subtotalLabel",
        { amount: formatRupiah(subtotal) }
      )}\n${tWa("nameLabel", { name: customerName })}\n${tWa("addressLabel", {
        address: customerAddress,
      })}\n\n${tWa("closing")}`;

      const fallbackUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(fallbackText)}`;
      window.open(fallbackUrl, "_blank", "noopener,noreferrer");
      closeDrawer();
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="w-screen max-w-md bg-[var(--color-paper)] border-l border-[var(--color-line)] shadow-xl flex flex-col font-[family-name:var(--font-dm-sans)]">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[var(--color-line)] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-medium text-[var(--color-ink)] font-[family-name:var(--font-dm-sans)]">
                {t("title")}
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--color-surface)] text-[var(--color-muted)]">
                {totalCount}
              </span>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
              aria-label={t("close")}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-muted)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-sm text-[var(--color-muted)] font-[family-name:var(--font-dm-sans)]">
                {t("emptyMessage")}
              </p>
              <Link
                href="/produk"
                onClick={closeDrawer}
                className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 text-xs font-mono uppercase tracking-wider bg-[var(--color-ink)] text-white hover:bg-[var(--color-accent)] transition-colors"
              >
                {t("browseCatalog")} &rarr;
              </Link>
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

              {/* Summary & Checkout Form */}
              <div className="border-t border-[var(--color-line)] bg-[var(--color-surface)] p-6 space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-wider text-[var(--color-muted)] font-[family-name:var(--font-dm-sans)] font-medium">
                    {t("subtotalLabel")}
                  </span>
                  <span className="text-base font-mono font-bold text-[var(--color-ink)]">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-muted)] font-[family-name:var(--font-dm-sans)] leading-relaxed">
                  {t("shippingNote")}
                </p>

                {errorMessage && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 border border-red-200 font-[family-name:var(--font-dm-sans)]">
                    {errorMessage}
                  </p>
                )}

                <form onSubmit={handleCheckout} className="space-y-3 pt-1">
                  <div>
                    <label htmlFor="drawer-name" className="block text-[11px] uppercase tracking-wider font-mono text-[var(--color-ink)] mb-1">
                      {t("nameLabel")}
                    </label>
                    <input
                      id="drawer-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t("namePlaceholder")}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink)] font-[family-name:var(--font-dm-sans)] focus:outline-none focus:border-[var(--color-ink)]"
                    />
                  </div>

                  <div>
                    <label htmlFor="drawer-address" className="block text-[11px] uppercase tracking-wider font-mono text-[var(--color-ink)] mb-1">
                      {t("addressLabel")}
                    </label>
                    <input
                      id="drawer-address"
                      type="text"
                      required
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder={t("addressPlaceholder")}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink)] font-[family-name:var(--font-dm-sans)] focus:outline-none focus:border-[var(--color-ink)]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[48px] px-4 py-3 bg-[var(--color-ink)] text-white hover:bg-stone-800 font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-dm-sans)]"
                  >
                    <svg className="w-5 h-5 flex-shrink-0 text-[var(--color-whatsapp)]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.203c.044.072.044.419-.1 1.024z" />
                    </svg>
                    {isSubmitting ? t("preparing") : t("checkoutButton")}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
