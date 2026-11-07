"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600 font-bold text-xl">
        !
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
        Terjadi Kesalahan Saat Memuat Halaman
      </h1>
      <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
        Koneksi atau data halaman sedang mengalami kendala. Anda dapat mencoba memuat ulang halaman ini.
      </p>
      <div className="flex justify-center gap-4 pt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-md bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 transition-colors"
        >
          Muat Ulang
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-md border border-stone-300 bg-white text-stone-900 font-semibold text-sm hover:bg-stone-50 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

