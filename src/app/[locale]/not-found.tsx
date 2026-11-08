import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const quickCategories = [
  { name: "Ruang Makan", slug: "ruang-makan" },
  { name: "Ruang Tamu", slug: "ruang-tamu" },
  { name: "Kamar Tidur", slug: "kamar-tidur" },
  { name: "Pintu & Jendela", slug: "pintu-jendela" },
];

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center space-y-8">
      <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] border border-[var(--color-line)] flex items-center justify-center mx-auto text-[var(--color-ink)] font-mono font-bold text-xl shadow-sm">
        404
      </div>

      <div className="space-y-3">
        <h1 className="text-2xl sm:text-4xl font-light text-[var(--color-ink)] tracking-tight font-[family-name:var(--font-dm-sans)]">
          {t("title")}
        </h1>
        <p className="text-[var(--color-muted)] text-xs sm:text-sm leading-relaxed max-w-md mx-auto font-mono">
          {t("description")}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 pt-2">
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

      {/* Direct links to categories */}
      <div className="pt-8 border-t border-[var(--color-line)] space-y-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] block">
          Pilihan Kategori Furnitur
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          {quickCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/kategori/${cat.slug}`}
              className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-line)] text-xs font-mono text-[var(--color-ink)] hover:border-[var(--color-ink)] transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
