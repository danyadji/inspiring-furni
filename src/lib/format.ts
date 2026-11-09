export function formatRupiah(amount: number | string): string {
  const numeric = typeof amount === "string" ? parseInt(amount, 10) : amount;
  if (isNaN(numeric)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric);
}

/**
 * Format raw HTML or plain text from WooCommerce product descriptions
 * into cleanly structured, readable elements with headers and bullets.
 */
export function formatProductDescription(rawHtml: string): string {
  if (!rawHtml) return "";

  // 1. Sanitize unsafe tags and attributes
  const clean = rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*('[^']*'|"[^"]*"|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/&nbsp;/g, " ");

  // If already contains rich elements like ul/ol/h2/h3, return cleaned HTML
  if (/<(ul|ol|h[1-6]|blockquote)\b/i.test(clean)) {
    return clean;
  }

  // Parse paragraphs
  const matches = clean.match(/<p>([\s\S]*?)<\/p>/gi) || [];
  if (matches.length === 0) {
    // If raw text without <p>, split by newlines
    const lines = clean.split(/\r?\n+/);
    return lines
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return "";
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          return `<div class="flex items-start gap-2 my-1 text-xs sm:text-sm text-[var(--color-muted)]"><span class="text-[var(--color-ink)] select-none shrink-0 font-bold">•</span><span>${trimmed.slice(2)}</span></div>`;
        }
        return `<p class="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed mb-3">${trimmed}</p>`;
      })
      .filter(Boolean)
      .join("");
  }

  const transformed = matches.map((pTag) => {
    const text = pTag.replace(/<\/?p>/gi, "").trim();
    if (!text) return "";

    // Check if it's a section title: uppercase, length between 3 and 40 characters
    const plainText = text.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim();
    const isHeading =
      plainText.length >= 3 &&
      plainText.length <= 40 &&
      plainText === plainText.toUpperCase() &&
      !plainText.startsWith("-") &&
      !plainText.startsWith("•") &&
      /[A-Z]/.test(plainText);

    if (isHeading) {
      return `<h4 class="font-mono font-semibold text-[var(--color-ink)] text-xs uppercase tracking-wider pt-3 pb-1 border-b border-[var(--color-line)]/60 mb-2 mt-4 first:mt-0">${text}</h4>`;
    }

    // Check if it's a bullet point
    if (text.startsWith("- ") || text.startsWith("• ")) {
      const itemText = text.slice(2).trim();
      return `<div class="flex items-start gap-2 my-1 text-xs sm:text-sm text-[var(--color-muted)]"><span class="text-[var(--color-ink)] select-none shrink-0 font-bold">•</span><span>${itemText}</span></div>`;
    }

    return `<p class="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed mb-3">${text}</p>`;
  });

  return transformed.filter(Boolean).join("");
}

