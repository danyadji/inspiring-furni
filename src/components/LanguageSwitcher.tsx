"use client";

import React, { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSwitch = (newLocale: "id" | "en") => {
    if (newLocale === locale) return;

    // Set cookie NEXT_LOCALE for 1 year
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;

    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div
      className="flex items-center text-xs font-mono select-none"
      role="group"
      aria-label="Pilih bahasa / Select language"
    >
      <button
        type="button"
        onClick={() => handleSwitch("id")}
        disabled={isPending}
        aria-current={locale === "id" ? "true" : undefined}
        aria-label="Bahasa Indonesia"
        className={`min-h-[44px] min-w-[36px] px-1.5 flex items-center justify-center transition-colors ${
          locale === "id"
            ? "font-bold text-[var(--color-ink)] underline underline-offset-4 decoration-[var(--color-ink)]"
            : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
        }`}
      >
        ID
      </button>

      <span className="text-[var(--color-line)] px-0.5" aria-hidden="true">
        |
      </span>

      <button
        type="button"
        onClick={() => handleSwitch("en")}
        disabled={isPending}
        aria-current={locale === "en" ? "true" : undefined}
        aria-label="English"
        className={`min-h-[44px] min-w-[36px] px-1.5 flex items-center justify-center transition-colors ${
          locale === "en"
            ? "font-bold text-[var(--color-ink)] underline underline-offset-4 decoration-[var(--color-ink)]"
            : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
        }`}
      >
        EN
      </button>
    </div>
  );
}

