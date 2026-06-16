"use client";

import { useState, useEffect, Fragment } from "react";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Truck, Check, X, ShieldAlert, Loader2, Search, RefreshCw } from "lucide-react";

interface Layanan {
  id_ekspedisi_layanan: number;
  public_id: string;
  id_ekspedisi: number;
  nama_layanan: string;
  deskripsi: string;
  estimasi_min: number;
  estimasi_max: number;
  is_active: boolean;
}

interface Ekspedisi {
  id_ekspedisi: number;
  public_id: string;
  nama_ekspedisi: string;
  kode_api: string;
  logo: string;
  deskripsi: string;
  is_active: boolean;
  layanan: Layanan[];
}

export default function EkspedisiPage() {
  const [ekspedisiList, setEkspedisiList] = useState<Ekspedisi[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredEkspedisi = ekspedisiList.filter((eks) => {
    const matchesSearch = eks.nama_ekspedisi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          eks.kode_api.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === "Aktif") matchesStatus = eks.is_active;
    if (statusFilter === "Nonaktif") matchesStatus = !eks.is_active;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEkspedisi.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredEkspedisi.slice(startIndex, startIndex + itemsPerPage);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/ekspedisi");
      const result = await res.json();
      if (res.ok && result.data) {
        setEkspedisiList(result.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data ekspedisi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch("/api/v1/admin/ekspedisi/sync", {
        method: "POST",
      });
      const result = await res.json();
      if (res.ok) {
        fetchData();
      } else {
        alert(result.message || "Gagal sinkronisasi data dari Biteship");
      }
    } catch (err) {
      console.error("Gagal melakukan sinkronisasi", err);
      alert("Terjadi kesalahan saat menyambung ke server");
    } finally {
      setSyncing(false);
    }
  };

  const toggleEkspedisi = async (eks: Ekspedisi) => {
    try {
      const updatedStatus = !eks.is_active;
      const res = await fetch(`/api/v1/admin/ekspedisi/${eks.public_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: updatedStatus }),
      });
      if (res.ok) {
        setEkspedisiList((prev) =>
          prev.map((e) => (e.public_id === eks.public_id ? { ...e, is_active: updatedStatus } : e))
        );
      }
    } catch (err) {
      console.error("Gagal mengubah status ekspedisi", err);
    }
  };

  const toggleLayanan = async (layanan: Layanan) => {
    try {
      const updatedStatus = !layanan.is_active;
      const res = await fetch(`/api/v1/admin/ekspedisi/layanan/${layanan.public_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: updatedStatus }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Gagal mengubah status layanan", err);
    }
  };

  return (
    <div className="w-full pb-12">
      {/* Header Halaman */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-1">Manajemen Ekspedisi & Ongkir</h1>
          <p className="text-sm text-zinc-500 font-medium">
            Kelola status aktif kurir eksternal (Biteship API) dan pengiriman internal toko beserta detail estimasi layanan.
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing || loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#AF520C] text-white rounded-lg text-sm font-bold hover:bg-[#8e4209] transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Menyinkronkan..." : "Sinkronisasi Biteship"}
        </button>
      </div>

      {loading && !syncing ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-[#AF520C] animate-spin mb-4" />
          <p className="text-zinc-500 font-medium text-sm">Sedang memuat data ekspedisi...</p>
        </div>
      ) : (
        <>
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="text"
                spellCheck="false"
                placeholder="Cari nama ekspedisi atau kode..."
                className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#AF520C]"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
                <option value="Aktif">Status Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            {ekspedisiList.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <ShieldAlert className="text-zinc-400 mb-3" size={48} />
                <h3 className="font-bold text-lg text-zinc-800">Belum Ada Ekspedisi</h3>
                <p className="text-zinc-500 text-sm max-w-sm mt-1">
                  Silakan lakukan sinkronisasi data dari Biteship terlebih dahulu menggunakan tombol di atas.
                </p>
              </div>
            ) : filteredEkspedisi.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center text-zinc-400">
                <ShieldAlert className="mb-3" size={48} />
                <h3 className="font-bold text-lg text-zinc-800">Tidak Ditemukan</h3>
                <p className="text-sm mt-1">
                  Tidak ada ekspedisi yang cocok dengan pencarian "{searchQuery}"
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8fafc] text-zinc-600 text-xs font-bold uppercase tracking-wider border-b border-zinc-200">
                      <tr>
                        <th className="px-6 py-4">Ekspedisi</th>
                        <th className="px-6 py-4">Deskripsi</th>
                        <th className="px-6 py-4">Layanan Aktif</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-sm text-zinc-800">
                      {currentData.map((eks) => {
                        const isExpanded = expandedId === eks.public_id;
                        const activeServicesCount = eks.layanan ? eks.layanan.filter((l) => l.is_active).length : 0;

                        return (
                        <Fragment key={eks.public_id}>
                          <tr className="hover:bg-orange-50/30 transition">
                            {/* Ekspedisi (Logo + Nama + API Code) */}
                            <td className="px-6 py-4 align-middle">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0 overflow-hidden p-1 shadow-inner">
                                  {eks.logo ? (
                                    <img src={eks.logo} alt={eks.nama_ekspedisi} className="w-full h-full object-contain" />
                                  ) : (
                                    <Truck className="text-[#AF520C]" size={20} />
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-zinc-800">{eks.nama_ekspedisi}</p>
                                  <span className="inline-block text-[10px] px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full font-semibold border border-zinc-200 uppercase mt-0.5">
                                    {eks.kode_api}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Deskripsi */}
                            <td className="px-6 py-4 align-middle">
                              <p className="text-zinc-500 text-sm max-w-md truncate" title={eks.deskripsi}>
                                {eks.deskripsi || "Tidak ada deskripsi"}
                              </p>
                            </td>

                            {/* Layanan Aktif */}
                            <td className="px-6 py-4 align-middle">
                              <span className="text-sm font-semibold text-zinc-700">
                                {eks.is_active ? `${activeServicesCount} dari ${eks.layanan ? eks.layanan.length : 0}` : "-"}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 align-middle">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                eks.is_active ? "bg-green-50 text-green-700 border border-green-200" : "bg-zinc-50 text-zinc-500 border border-zinc-200"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${eks.is_active ? "bg-green-500" : "bg-zinc-400"}`}></span>
                                {eks.is_active ? "Aktif" : "Nonaktif"}
                              </div>
                            </td>

                            {/* Action */}
                            <td className="px-6 py-4 align-middle">
                              <div className="flex items-center gap-3">
                                {/* Toggle switch status ekspedisi */}
                                <button
                                  onClick={() => toggleEkspedisi(eks)}
                                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    eks.is_active ? "bg-[#AF520C]" : "bg-zinc-200"
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                      eks.is_active ? "translate-x-5" : "translate-x-0"
                                    }`}
                                  />
                                </button>

                                {/* Collapse/expand trigger */}
                                <button
                                  onClick={() => setExpandedId(isExpanded ? null : eks.public_id)}
                                  className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors"
                                >
                                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expandable Services Row */}
                          {isExpanded && (
                            <tr className="bg-zinc-50/60">
                              <td colSpan={5} className="px-6 py-5 border-t border-b border-zinc-100">
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="font-bold text-xs text-zinc-500 uppercase tracking-wider">Layanan Tersedia</h4>
                                </div>

                                {(!eks.layanan || eks.layanan.length === 0) ? (
                                  <div className="text-center py-6 text-zinc-400 text-sm bg-white rounded-xl border border-zinc-200 border-dashed">
                                    Belum ada layanan untuk ekspedisi ini.
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {eks.layanan.map((lay) => (
                                      <div
                                        key={lay.public_id}
                                        className={`bg-white rounded-xl p-4 border transition-all ${
                                          lay.is_active ? "border-zinc-200 shadow-sm" : "border-zinc-200 opacity-60"
                                        }`}
                                      >
                                        <div className="flex justify-between items-start gap-4">
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <h5 className="font-bold text-zinc-950 text-sm">{lay.nama_layanan}</h5>
                                              <span className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full font-bold border border-orange-100">
                                                {lay.estimasi_min}-{lay.estimasi_max} Hari
                                              </span>
                                            </div>
                                            <p className="text-zinc-500 text-xs mt-1">{lay.deskripsi || "Tidak ada deskripsi"}</p>
                                          </div>

                                          <div className="flex items-center gap-2 shrink-0">
                                            <button
                                              onClick={() => toggleLayanan(lay)}
                                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                lay.is_active ? "bg-green-600" : "bg-zinc-200"
                                              }`}
                                            >
                                              <span
                                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                  lay.is_active ? "translate-x-4" : "translate-x-0"
                                                }`}
                                              />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between bg-white">
                  <p className="text-sm text-zinc-500">
                    Menampilkan {filteredEkspedisi.length === 0 ? 0 : startIndex + 1} hingga {Math.min(startIndex + itemsPerPage, filteredEkspedisi.length)} dari {filteredEkspedisi.length} ekspedisi
                  </p>
                  
                  {/* Cuma tampil kalau halamannya lebih dari 1 */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      {/* Tombol Previous */}
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 text-zinc-400 hover:text-zinc-800 transition rounded-md hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      
                      {/* Generate Angka Halaman */}
                      {[...Array(totalPages)].map((_, i) => (
                        <button 
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition ${
                            currentPage === i + 1 
                              ? "bg-[#AF520C] text-white font-bold shadow-sm"
                              : "text-zinc-600 hover:bg-zinc-100"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      {/* Tombol Next */}
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 text-zinc-400 hover:text-zinc-800 transition rounded-md hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
