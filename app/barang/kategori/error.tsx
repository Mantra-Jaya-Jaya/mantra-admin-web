"use client";

export default function KategoriError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="w-full pb-12">
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <h2 className="text-xl font-bold text-red-600">Terjadi Kesalahan</h2>
        <p className="text-zinc-500 text-sm max-w-md text-center">
          {error.message || "Terjadi kesalahan saat memuat halaman kategori."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-[#AF520C] text-white rounded-lg text-sm font-semibold hover:bg-[#924300] transition"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
