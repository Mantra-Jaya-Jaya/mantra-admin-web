"use client";
import { useState, useEffect, useMemo } from "react";
import { Search, RefreshCw, MapPin, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

export default function PengantaranPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/pengantaran");
      const result = await res.json();
      if (res.ok && result.data) setData(result.data);
    } catch (err) {
      console.error("Gagal ambil data pengantaran", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filter client-side
  const filtered = useMemo(() => {
    return data.filter((d) => {
      const matchSearch =
        !debouncedSearch ||
        d.no_pesanan?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        d.customer_nama?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        d.kurir_nama?.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchStatus =
        statusFilter === "Semua Status" ||
        (statusFilter === "Internal" && !d.is_external) ||
        (statusFilter === "Ekspedisi" && d.is_external) ||
        (statusFilter === "Selesai" && d.status_pengantaran === "Selesai");

      return matchSearch && matchStatus;
    });
  }, [data, debouncedSearch, statusFilter]);

  // Pagination client-side
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full pb-12">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-1">Monitoring Pengantaran</h1>
          <p className="text-sm text-zinc-500 font-medium">Pantau status pengiriman pesanan</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-zinc-700 border border-zinc-200 rounded-lg text-sm font-bold hover:bg-zinc-50 transition shadow-sm"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            spellCheck="false"
            placeholder="Cari no. pesanan, customer, atau kurir..."
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#AF520C]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dropdown Status */}
        <div className="relative">
          <select
            className="appearance-none bg-white border border-zinc-200 text-zinc-700 text-sm rounded-lg pl-4 pr-10 py-2 outline-none cursor-pointer hover:bg-zinc-50 focus:border-[#AF520C]"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Internal">Internal (Kurir Toko)</option>
            <option value="Ekspedisi">Ekspedisi Eksternal</option>
            <option value="Selesai">Selesai</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* TABEL */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#AF520C] border-t-transparent rounded-full"></div>
        </div>
      ) : currentData.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-12 text-center text-zinc-400">
          {debouncedSearch || statusFilter !== "Semua Status"
            ? "Tidak ada hasil pencarian"
            : "Belum ada pengantaran"}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f8fafc] text-zinc-600 text-xs font-bold uppercase tracking-wider border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4">No. Pesanan</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Kurir / Ekspedisi</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Lokasi</th>
                  <th className="px-6 py-4">Resi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm text-zinc-800">
                {currentData.map((d, i) => (
                  <tr key={d.public_id || i} className="hover:bg-orange-50/30 transition">
                    <td className="px-6 py-4 align-middle font-semibold">{d.no_pesanan}</td>
                    <td className="px-6 py-4 align-middle">{d.customer_nama}</td>
                    <td className="px-6 py-4 align-middle">
                      <div>
                        <span className="font-medium">{d.kurir_nama}</span>
                        {d.kurir_nama !== "-" && <span className="text-zinc-400"> — </span>}
                        <span className="text-zinc-500 text-xs">{d.ekspedisi}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        d.is_external
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : d.status_pengantaran === "Selesai"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          d.is_external ? "bg-purple-500" : d.status_pengantaran === "Selesai" ? "bg-green-500" : "bg-blue-500"
                        }`}></span>
                        {d.is_external ? "Ekspedisi" : d.status_pengantaran}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      {d.last_latitude !== 0 && d.last_longitude !== 0 ? (
                        <a
                          href={`https://www.google.com/maps?q=${d.last_latitude},${d.last_longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                        >
                          <MapPin size={14} />
                          {d.last_latitude.toFixed(4)}, {d.last_longitude.toFixed(4)}
                        </a>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      {d.nomor_resi ? (
                        <span className="text-xs font-mono">{d.nomor_resi}</span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between bg-white">
            <p className="text-sm text-zinc-500">
              Menampilkan {filtered.length === 0 ? 0 : startIndex + 1} hingga{" "}
              {Math.min(startIndex + itemsPerPage, filtered.length)} dari{" "}
              {filtered.length} pengantaran
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 text-zinc-400 hover:text-zinc-800 transition rounded-md hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>

                {(() => {
                  const pages: (number | string)[] = [];
                  const s = Math.max(1, currentPage - 2);
                  const e = Math.min(totalPages, currentPage + 2);
                  if (s > 1) { pages.push(1); if (s > 2) pages.push("..."); }
                  for (let i = s; i <= e; i++) pages.push(i);
                  if (e < totalPages) { if (e < totalPages - 1) pages.push("..."); pages.push(totalPages); }
                  return pages.map((p, i) =>
                    typeof p === "string" ? (
                      <span key={`e${i}`} className="px-1 text-zinc-400 text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition ${
                          currentPage === p
                            ? "bg-[#AF520C] text-white font-bold shadow-sm"
                            : "text-zinc-600 hover:bg-zinc-100"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  );
                })()}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 text-zinc-400 hover:text-zinc-800 transition rounded-md hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
