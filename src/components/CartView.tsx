"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { useCart } from "@/context/CartContext";
import { formatRupiah } from "@/components/ProductCard";

interface CartViewProps {
  waNumber: string;
}

export default function CartView({ waNumber }: CartViewProps) {
  const t = useTranslations("Cart");
  const tWa = useTranslations("WhatsApp");
  const locale = useLocale();

  const { items, updateQuantity, removeItem, clearCart, subtotal, isLoaded } = useCart();

  // Contact inputs
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Shipping inputs
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerPostcode, setCustomerPostcode] = useState("");

  // Anti-spam honeypot
  const [botField, setBotField] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    whatsappUrl: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openWhatsAppUrl = (url: string) => {
    const isMobile =
      typeof window !== "undefined" &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = url;
    } else {
      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (!win || win.closed || typeof win.closed === "undefined") {
        window.location.href = url;
      }
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage(t("errorName"));
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMessage(t("errorPhone"));
      return;
    }

    if (!customerEmail.trim()) {
      setErrorMessage(t("errorEmail"));
      return;
    }

    if (!customerAddress.trim()) {
      setErrorMessage(t("errorAddress"));
      return;
    }

    if (!customerCity.trim()) {
      setErrorMessage(t("errorCity"));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          customerAddress: customerAddress.trim(),
          customerCity: customerCity.trim(),
          customerPostcode: customerPostcode.trim(),
          website: botField,
          locale,
          items: items.map((item) => ({
            productId: item.productId,
            productSlug: item.productSlug,
            productName: item.productName,
            variationId: item.variationId,
            attributes: item.attributes,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.whatsappUrl) {
        setOrderResult({
          orderId: data.orderId,
          whatsappUrl: data.whatsappUrl,
        });
        clearCart();
        openWhatsAppUrl(data.whatsappUrl);
      } else {
        // Fallback message composition if server fails
        const fallbackItems = items
          .map(
            (it, idx) =>
              `${idx + 1}. ${it.productName} (${Object.values(it.attributes).join(", ")}) x ${it.quantity} = ${formatRupiah(it.price * it.quantity)}`
          )
          .join("\n");

        const fallbackText = `${tWa("orderHeaderFallback")}${fallbackItems}\n\n${tWa(
          "subtotalLabel",
          { amount: formatRupiah(subtotal) }
        )}\n\n${tWa("contactHeader")}\n${tWa("nameLabel", { name: customerName.trim() })}\n${tWa("phoneLabel", { phone: customerPhone.trim() })}\n${tWa("emailLabel", { email: customerEmail.trim() })}\n${tWa("addressLabel", {
          address: customerAddress.trim(),
        })}\n${tWa("cityLabel", { city: customerCity.trim() })}\n${tWa("postalCodeLabel", { postcode: customerPostcode.trim() })}\n\n${tWa("closing")}`;

        const fallbackUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(fallbackText)}`;

        setOrderResult({
          orderId: "WA-Direct",
          whatsappUrl: fallbackUrl,
        });
        clearCart();
        openWhatsAppUrl(fallbackUrl);
      }
    } catch {
      const fallbackText = `${tWa("orderHeaderFallback")}${items
        .map(
          (it, idx) =>
            `${idx + 1}. ${it.productName} x ${it.quantity} = ${formatRupiah(it.price * it.quantity)}`
        )
        .join("\n")}\n\n${tWa("subtotalLabel", { amount: formatRupiah(subtotal) })}\n\n${tWa("contactHeader")}\n${tWa(
        "nameLabel",
        { name: customerName.trim() }
      )}\n${tWa("phoneLabel", { phone: customerPhone.trim() })}\n${tWa("emailLabel", { email: customerEmail.trim() })}\n${tWa("addressLabel", { address: customerAddress.trim() })}\n${tWa("cityLabel", { city: customerCity.trim() })}\n${tWa("postalCodeLabel", { postcode: customerPostcode.trim() })}\n\n${tWa("closing")}`;

      const fallbackUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(fallbackText)}`;

      setOrderResult({
        orderId: "WA-Direct",
        whatsappUrl: fallbackUrl,
      });
      clearCart();
      openWhatsAppUrl(fallbackUrl);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="py-20 text-center">
        <p className="text-[var(--color-muted)] text-xs font-mono">{t("loading")}</p>
      </div>
    );
  }

  if (items.length === 0 && !orderResult) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-line)] p-10 sm:p-16 text-center max-w-xl mx-auto my-8 space-y-4">
        <div className="w-14 h-14 rounded-full bg-[var(--color-paper)] flex items-center justify-center mx-auto text-[var(--color-muted)] border border-[var(--color-line)]">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h2 className="text-base font-medium text-[var(--color-ink)] font-[family-name:var(--font-dm-sans)]">
          {t("emptyMessage")}
        </h2>
        <div className="pt-2">
          <Link
            href="/produk"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 text-xs font-mono uppercase tracking-wider bg-[var(--color-ink)] text-white hover:bg-[var(--color-accent)] transition-colors"
          >
            {t("browseCatalog")} &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-[family-name:var(--font-dm-sans)]">
      {/* Order Success Notice */}
      {orderResult && (
        <div
          role="status"
          className="p-6 bg-[var(--color-ink)] text-white border border-[var(--color-ink)] space-y-3"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[var(--color-whatsapp)] flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="font-mono text-sm uppercase tracking-wider font-bold">
              {t("orderSuccessTitle", { orderId: orderResult.orderId })}
            </h3>
          </div>
          <p className="text-xs font-[family-name:var(--font-dm-sans)] text-stone-300 leading-relaxed">
            {t("orderSuccessDesc")}
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => openWhatsAppUrl(orderResult.whatsappUrl)}
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 bg-[var(--color-whatsapp)] text-[var(--color-ink)] font-bold text-xs uppercase tracking-wider hover:brightness-95 transition-all cursor-pointer"
            >
              {t("orderReopen", { orderId: orderResult.orderId })}
            </button>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Contact and Shipping Details Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleCheckout} className="space-y-8">
              {/* Section 1: Contact Information */}
              <div className="border border-[var(--color-line)] bg-[var(--color-paper)] p-6 sm:p-8 space-y-5">
                <div className="border-b border-[var(--color-line)] pb-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
                    Langkah 1
                  </span>
                  <h2 className="text-base font-semibold text-[var(--color-ink)] font-[family-name:var(--font-dm-sans)] mt-0.5">
                    {t("contactSectionTitle")}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="checkout-email"
                      className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink)] mb-1.5"
                    >
                      {t("emailLabel")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder={t("emailPlaceholder")}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-[family-name:var(--font-dm-sans)] bg-[var(--color-paper)] border border-[var(--color-line)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-name"
                      className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink)] mb-1.5"
                    >
                      {t("nameLabel")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="checkout-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t("namePlaceholder")}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-[family-name:var(--font-dm-sans)] bg-[var(--color-paper)] border border-[var(--color-line)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-phone"
                      className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink)] mb-1.5"
                    >
                      {t("phoneLabel")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder={t("phonePlaceholder")}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-[family-name:var(--font-dm-sans)] bg-[var(--color-paper)] border border-[var(--color-line)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Shipping Address */}
              <div className="border border-[var(--color-line)] bg-[var(--color-paper)] p-6 sm:p-8 space-y-5">
                <div className="border-b border-[var(--color-line)] pb-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
                    Langkah 2
                  </span>
                  <h2 className="text-base font-semibold text-[var(--color-ink)] font-[family-name:var(--font-dm-sans)] mt-0.5">
                    {t("shippingSectionTitle")}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="checkout-address"
                      className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink)] mb-1.5"
                    >
                      {t("streetAddressLabel")} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="checkout-address"
                      required
                      rows={3}
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder={t("streetAddressPlaceholder")}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-[family-name:var(--font-dm-sans)] bg-[var(--color-paper)] border border-[var(--color-line)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="checkout-city"
                        className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink)] mb-1.5"
                      >
                        {t("cityLabel")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="checkout-city"
                        type="text"
                        required
                        value={customerCity}
                        onChange={(e) => setCustomerCity(e.target.value)}
                        placeholder={t("cityPlaceholder")}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-[family-name:var(--font-dm-sans)] bg-[var(--color-paper)] border border-[var(--color-line)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-postcode"
                        className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink)] mb-1.5"
                      >
                        {t("postalCodeLabel")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="checkout-postcode"
                        type="text"
                        required
                        value={customerPostcode}
                        onChange={(e) => setCustomerPostcode(e.target.value)}
                        placeholder={t("postalCodePlaceholder")}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-[family-name:var(--font-dm-sans)] bg-[var(--color-paper)] border border-[var(--color-line)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Anti-spam bot honeypot (hidden from human users) */}
              <div style={{ display: "none" }} aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={botField}
                  onChange={(e) => setBotField(e.target.value)}
                />
              </div>

              {errorMessage && (
                <div role="alert" className="p-3 bg-red-50 text-red-700 text-xs font-[family-name:var(--font-dm-sans)] border border-red-200">
                  {errorMessage}
                </div>
              )}

              {/* Order via WhatsApp Submit Button */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center min-h-[52px] px-6 py-3.5 bg-[var(--color-ink)] text-white hover:bg-stone-800 font-semibold text-xs sm:text-sm uppercase tracking-wider transition-colors gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-dm-sans)] shadow-sm"
                >
                  {isSubmitting ? (
                    <span>{t("preparing")}</span>
                  ) : (
                    <>
                      <svg className="w-5 h-5 flex-shrink-0 text-[var(--color-whatsapp)]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.203c.044.072.044.419-.1 1.024z" />
                      </svg>
                      <span>{t("orderViaWa")}</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] font-[family-name:var(--font-dm-sans)] text-[var(--color-muted)] text-center leading-normal">
                  {t("shippingNote")}
                </p>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary & Item Review */}
          <div className="lg:col-span-5">
            <div className="border border-[var(--color-line)] bg-[var(--color-surface)] p-6 sm:p-8 space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-line)]">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-ink)] font-[family-name:var(--font-dm-sans)]">
                  {t("orderSummaryTitle")} ({items.length})
                </h2>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-mono text-[var(--color-muted)] hover:text-red-700 underline py-1"
                >
                  {t("clearCart")}
                </button>
              </div>

              {/* Items in Cart */}
              <div className="divide-y divide-[var(--color-line)] max-h-[360px] overflow-y-auto pr-1">
                {items.map((item) => {
                  const variantText = Object.entries(item.attributes)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" · ");

                  return (
                    <div
                      key={`${item.productId}-${item.variationId}`}
                      className="py-4 flex gap-3.5 items-start justify-between"
                    >
                      <div className="flex gap-3 items-start">
                        <div className="relative w-16 h-20 bg-[var(--color-paper)] border border-[var(--color-line)] overflow-hidden flex-shrink-0">
                          <Image
                            src={item.imageSrc || "/images/placeholder-product.svg"}
                            alt={item.productName}
                            fill
                            sizes="64px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-xs sm:text-sm text-[var(--color-ink)] leading-snug truncate">
                            <Link
                              href={`/produk/${item.productSlug}`}
                              className="hover:text-[var(--color-accent)]"
                            >
                              {item.productName}
                            </Link>
                          </h3>
                          <p className="text-[11px] font-mono text-[var(--color-muted)] mt-0.5">
                            {variantText || "Standard"}
                          </p>
                          <p className="text-xs font-mono font-medium text-[var(--color-ink)] mt-1">
                            {formatRupiah(item.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="flex items-center border border-[var(--color-line)] bg-[var(--color-paper)]">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.productId, item.variationId, item.quantity - 1)
                            }
                            aria-label={t("decrease")}
                            className="w-7 h-7 flex items-center justify-center text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-7 text-center text-xs font-mono text-[var(--color-ink)]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.productId, item.variationId, item.quantity + 1)
                            }
                            aria-label={t("increase")}
                            className="w-7 h-7 flex items-center justify-center text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <span className="block text-xs font-mono font-medium text-[var(--color-ink)]">
                          {formatRupiah(item.price * item.quantity)}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.variationId)}
                          className="text-[11px] font-mono text-[var(--color-muted)] hover:text-red-700 underline cursor-pointer"
                        >
                          {t("remove")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cost Breakdown */}
              <div className="pt-4 border-t border-[var(--color-line)] space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[var(--color-muted)]">
                  <span>{t("subtotalShort")}</span>
                  <span className="font-bold text-[var(--color-ink)]">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-muted)]">
                  <span>{t("shippingShort")}</span>
                  <span>{t("shippingDiscuss")}</span>
                </div>
                <div className="pt-3 border-t border-[var(--color-line)] flex justify-between items-baseline">
                  <span className="font-bold text-sm text-[var(--color-ink)]">{t("totalTemporary")}</span>
                  <span className="text-lg font-bold text-[var(--color-ink)] font-mono">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/produk"
                  className="inline-flex items-center text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                >
                  &larr; {t("continueShopping")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
