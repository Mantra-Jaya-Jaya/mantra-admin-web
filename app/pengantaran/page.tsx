"use client";
import { useState, useEffect } from "react";
import { Search, RefreshCw, MapPin } from "lucide-react";

export default function PengantaranPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filtered = data.filter((d) =>
    d.no_pesanan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.customer_nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.kurir_nama?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full pb-12">
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

      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex gap-4 mb-6">
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
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#AF520C] border-t-transparent rounded-full"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-12 text-center text-zinc-400">
          {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada pengantaran"}
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
                {filtered.map((d, i) => (
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
          <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between bg-white">
            <p className="text-sm text-zinc-500">Total: {filtered.length} pengantaran</p>
          </div>
        </div>
      )}
    </div>
  );
}
