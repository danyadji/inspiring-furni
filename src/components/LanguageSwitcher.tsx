"use client";

import React, { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

interface LanguageSwitcherProps {
  theme?: "light" | "dark";
}

export default function LanguageSwitcher({ theme = "dark" }: LanguageSwitcherProps) {
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

  const isLight = theme === "light";

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
            ? isLight
              ? "font-bold text-white underline underline-offset-4 decoration-white"
              : "font-bold text-[var(--color-ink)] underline underline-offset-4 decoration-[var(--color-ink)]"
            : isLight
            ? "text-white/70 hover:text-white"
            : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
        }`}
      >
        ID
      </button>

      <span
        className={`px-0.5 ${isLight ? "text-white/30" : "text-[var(--color-line)]"}`}
        aria-hidden="true"
      >
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
            ? isLight
              ? "font-bold text-white underline underline-offset-4 decoration-white"
              : "font-bold text-[var(--color-ink)] underline underline-offset-4 decoration-[var(--color-ink)]"
            : isLight
            ? "text-white/70 hover:text-white"
            : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
        }`}
      >
        EN
      </button>
    </div>
  );
}

