import React from "react";

export default function AnnouncementBar() {
  const message =
    "Pengrajin Kayu Jati Asli Jepara · Menerima Pesanan Ukuran Custom · Langsung dari Workshop Tanpa Perantara · Pengiriman Aman ke Seluruh Indonesia";

  return (
    <div
      className="h-9 bg-[var(--color-ink)] text-white text-[13px] overflow-hidden flex items-center border-b border-[var(--color-ink)] select-none"
      role="region"
      aria-label="Pengumuman Toko"
    >
      <div className="animate-marquee whitespace-nowrap flex items-center font-mono">
        <span className="mx-6 tracking-wide">{message}</span>
        <span className="mx-6 tracking-wide">·</span>
        <span className="mx-6 tracking-wide">{message}</span>
        <span className="mx-6 tracking-wide">·</span>
      </div>
    </div>
  );
}

