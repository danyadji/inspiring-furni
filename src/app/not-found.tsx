import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="id">
      <body className="bg-[#FAF9F5] text-[#1C1B19] font-sans antialiased min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#F5F2EC] border border-[#E4DFD6] flex items-center justify-center mx-auto font-mono font-bold text-xl">
            404
          </div>
          <h1 className="text-2xl font-light tracking-tight">Halaman Tidak Ditemukan</h1>
          <p className="text-[#6B665E] text-sm">
            Halaman yang Anda tuju mungkin telah dipindahkan atau alamat URL salah.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/id"
              className="inline-flex items-center justify-center min-h-[44px] px-6 text-xs font-mono uppercase tracking-wider bg-[#1C1B19] text-white hover:bg-[#8A5A2B] transition-colors"
            >
              Beranda
            </Link>
            <Link
              href="/id/produk"
              className="inline-flex items-center justify-center min-h-[44px] px-6 text-xs font-mono uppercase tracking-wider border border-[#E4DFD6] hover:border-[#1C1B19] transition-colors"
            >
              Katalog
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
