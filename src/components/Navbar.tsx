"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { useCart } from "@/context/CartContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("Nav");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { totalCount, isLoaded, openDrawer } = useCart();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/produk", label: t("products") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 border-b border-[var(--color-line)] ${
        isScrolled
          ? "bg-[var(--color-paper)]/95 backdrop-blur-md shadow-xs"
          : "bg-[var(--color-paper)]"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Logo / Brand */}
          <Link
            href="/"
            className="flex flex-col group py-1"
            aria-label="Inspiring Furni Home"
          >
            <span className="text-lg sm:text-xl font-bold tracking-tight text-[var(--color-ink)] uppercase font-[family-name:var(--font-dm-sans)]">
              Inspiring Furni
            </span>
            <span className="text-[11px] font-mono tracking-widest text-[var(--color-muted)] uppercase">
              {t("brandSubtitle")}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-9" aria-label="Navigasi Utama">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-wide transition-colors py-2 relative ${
                    isActive
                      ? "text-[var(--color-ink)] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[var(--color-ink)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Language Switcher + Cart + Mobile Menu Toggle */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Language Switcher (Always visible on mobile & desktop) */}
            <LanguageSwitcher />

            {/* Cart Button */}
            <button
              type="button"
              onClick={openDrawer}
              className="relative inline-flex items-center justify-center min-h-[44px] px-2 sm:px-3.5 py-2 text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors focus-visible:outline-none"
              aria-label={t("openCart", { count: isLoaded ? totalCount : 0 })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
              <span className="ml-2 text-xs font-mono uppercase tracking-wider hidden sm:inline">
                {t("cart")}
              </span>
              {isLoaded && totalCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-mono font-medium leading-none text-white bg-[var(--color-ink)] rounded-full">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? t("closeMenu") : t("toggleMenu")}
              className="md:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-2 text-[var(--color-ink)] focus-visible:outline-none"
            >
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="md:hidden border-t border-[var(--color-line)] bg-[var(--color-paper)] px-6 pt-3 pb-6 space-y-2 shadow-md"
        >
          <nav aria-label="Navigasi Menu Mobile" className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-3 text-base min-h-[44px] flex items-center transition-colors ${
                    isActive
                      ? "text-[var(--color-ink)] font-semibold border-l-2 border-[var(--color-ink)] pl-3 bg-[var(--color-surface)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
