"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

interface ContactFormProps {
  waNumber: string;
}

export default function ContactForm({ waNumber }: ContactFormProps) {
  const t = useTranslations("Contact");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      return;
    }

    const text = `Halo Inspiring Furni, nama saya ${name.trim()}.\n\n${message.trim()}`;
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;

    setSubmitted(true);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-[family-name:var(--font-dm-sans)]">
      <div>
        <label
          htmlFor="contact-name"
          className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink)] mb-1.5"
        >
          {t("formNameLabel")}
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("formNamePlaceholder")}
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-[family-name:var(--font-dm-sans)] bg-transparent border border-[var(--color-line)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
        />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink)] mb-1.5"
        >
          {t("formMessageLabel")}
        </label>
        <textarea
          id="contact-message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("formMessagePlaceholder")}
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-[family-name:var(--font-dm-sans)] bg-transparent border border-[var(--color-line)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
        />
      </div>

      <button
        type="submit"
        className="w-full inline-flex items-center justify-center min-h-[48px] px-6 py-3 bg-[var(--color-ink)] text-white hover:bg-stone-800 font-semibold text-xs uppercase tracking-wider transition-colors gap-2 cursor-pointer font-[family-name:var(--font-dm-sans)]"
      >
        <svg
          className="w-4 h-4 flex-shrink-0 text-[var(--color-whatsapp)]"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.203c.044.072.044.419-.1 1.024z" />
        </svg>
        {t("formSubmit")}
      </button>

      {submitted && (
        <p className="text-xs text-[var(--color-muted)] text-center mt-2 font-[family-name:var(--font-dm-sans)]">
          {t("formSubmittedNote")}
        </p>
      )}
    </form>
  );
}
