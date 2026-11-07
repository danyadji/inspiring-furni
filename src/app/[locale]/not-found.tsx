import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] border border-[var(--color-line)] flex items-center justify-center mx-auto text-[var(--color-ink)] font-mono font-bold text-xl">
        404
      </div>
      <h1 className="text-2xl sm:text-3xl font-light text-[var(--color-ink)] tracking-tight font-[family-name:var(--font-dm-sans)]">
        {t("title")}
      </h1>
      <p className="text-[var(--color-muted)] text-xs sm:text-sm leading-relaxed max-w-md mx-auto font-mono">
        {t("description")}
      </p>
      <div className="flex justify-center gap-4 pt-2">
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-[44px] px-6 text-xs font-mono uppercase tracking-wider bg-[var(--color-ink)] text-white hover:bg-[var(--color-accent)] transition-colors"
        >
          {t("backHome")}
        </Link>
        <Link
          href="/produk"
          className="inline-flex items-center justify-center min-h-[44px] px-6 text-xs font-mono uppercase tracking-wider border border-[var(--color-line)] text-[var(--color-ink)] hover:border-[var(--color-muted)] transition-colors"
        >
          {t("openCatalog")}
        </Link>
      </div>
    </div>
  );
}

