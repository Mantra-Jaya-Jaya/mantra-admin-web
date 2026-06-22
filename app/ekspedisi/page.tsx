"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Truck,
  Search,
} from "lucide-react";

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

  // States untuk pencarian, filter, dan pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchData = async () => {
    try {
      const res = await fetch("/api/v1/admin/ekspedisi");
      const result = await res.json();
      if (res.ok && result.data) {
        setEkspedisiList(result.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data ekspedisi", err);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const res = await fetch("/api/v1/admin/ekspedisi");
        const result = await res.json();
        if (mounted && res.ok && result.data) {
          setEkspedisiList(result.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data ekspedisi", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch("/api/v1/admin/ekspedisi/sync", {
        method: "POST",
      });
      const result = await res.json();
      if (res.ok) {
        await fetchData();
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
          prev.map((item) =>
            item.public_id === eks.public_id
              ? { ...item, is_active: updatedStatus }
              : item,
          ),
        );
      } else {
        alert("Gagal mengubah status ekspedisi");
      }
    } catch (err) {
      console.error("Gagal mengubah status ekspedisi", err);
      alert("Terjadi kesalahan saat mengubah status ekspedisi");
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
        setEkspedisiList((prev) =>
          prev.map((eks) => ({
            ...eks,
            layanan: eks.layanan.map((item) =>
              item.public_id === layanan.public_id
                ? { ...item, is_active: updatedStatus }
                : item,
            ),
          })),
        );
      } else {
        alert("Gagal mengubah status layanan");
      }
    } catch (err) {
      console.error("Gagal mengubah status layanan", err);
      alert("Terjadi kesalahan saat mengubah status layanan");
    }
  };

  // 1. Terapkan filter pencarian & status
  const filteredEkspedisi = ekspedisiList.filter((eks) => {
    // Pencarian berdasarkan nama, kode API, atau deskripsi
    const matchSearch =
      eks.nama_ekspedisi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eks.kode_api.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (eks.deskripsi && eks.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filter status
    let matchStatus = true;
    if (statusFilter === "Aktif") {
      matchStatus = eks.is_active === true;
    } else if (statusFilter === "Nonaktif") {
      matchStatus = eks.is_active === false;
    }

    return matchSearch && matchStatus;
  });

  // Urutkan: Aktif dulu baru nonaktif
  const sortedEkspedisi = [...filteredEkspedisi].sort(
    (a, b) => Number(b.is_active) - Number(a.is_active),
  );

  // Pagination
  const totalItems = sortedEkspedisi.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEkspedisi = sortedEkspedisi.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-1">
            Manajemen Ekspedisi
          </h1>
          <p className="text-sm text-zinc-500 font-medium max-w-2xl">
            Sinkronkan daftar kurir dari Biteship, lihat layanan yang tersedia,
            lalu aktifkan atau nonaktifkan ekspedisi sesuai kebutuhan bisnis.
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing || loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#AF520C] text-white rounded-lg text-sm font-bold hover:bg-[#8e4209] transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Menyinkronkan..." : "Sinkronisasi Biteship"}
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm">
        Data ekspedisi dan layanan disimpan lokal sebagai katalog aplikasi, tetapi
        sumber utamanya tetap Biteship. Gunakan sinkronisasi jika daftar kurir
        berubah.
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            spellCheck="false"
            placeholder="Cari nama ekspedisi atau kode API..."
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
            <option value="Nonaktif">Status Nonaktif</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
        </div>
      </div>

      {loading && !syncing ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-[#AF520C] animate-spin mb-4" />
          <p className="text-zinc-500 font-medium text-sm">
            Sedang memuat data ekspedisi...
          </p>
        </div>
      ) : paginatedEkspedisi.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-12 text-center flex flex-col items-center">
          <ShieldAlert className="text-zinc-400 mb-3" size={48} />
          <h3 className="font-bold text-lg text-zinc-800">Tidak Ada Ekspedisi</h3>
          <p className="text-zinc-500 text-sm max-w-sm mt-1">
            Data tidak ditemukan untuk pencarian atau filter saat ini.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f8fafc] text-zinc-600 text-xs font-bold uppercase tracking-wider border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4">Ekspedisi</th>
                  <th className="px-6 py-4">Kode API</th>
                  <th className="px-6 py-4">Deskripsi</th>
                  <th className="px-6 py-4">Layanan</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm text-zinc-800">
                {paginatedEkspedisi.map((eks) => {
                  const isExpanded = expandedId === eks.public_id;
                  const activeServicesCount = eks.layanan.filter((layanan) => layanan.is_active).length;

                  return (
                    <React.Fragment key={eks.public_id}>
                      <tr className="hover:bg-orange-50/30 transition">
                        {/* Kolom Ekspedisi (Logo + Nama) */}
                        <td className="px-6 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0 overflow-hidden p-1 shadow-inner">
                              {eks.logo ? (
                                <img
                                  src={eks.logo}
                                  alt={eks.nama_ekspedisi}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Truck className="text-[#AF520C]" size={20} />
                              )}
                            </div>
                            <span className="font-bold text-sm text-zinc-800">{eks.nama_ekspedisi}</span>
                          </div>
                        </td>

                        {/* Kolom Kode API */}
                        <td className="px-6 py-4 align-middle">
                          <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                            {eks.kode_api}
                          </span>
                        </td>

                        {/* Kolom Deskripsi */}
                        <td className="px-6 py-4 align-middle max-w-xs truncate">
                          <span className="text-zinc-500 text-sm" title={eks.deskripsi}>
                            {eks.deskripsi || "Tidak ada deskripsi"}
                          </span>
                        </td>

                        {/* Kolom Layanan */}
                        <td className="px-6 py-4 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                              {eks.layanan.length} Layanan
                            </span>
                            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 border border-green-100">
                              {activeServicesCount} Aktif
                            </span>
                          </div>
                        </td>

                        {/* Kolom Status (Toggle Switch) */}
                        <td className="px-6 py-4 align-middle text-center">
                          <button
                            onClick={() => toggleEkspedisi(eks)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              eks.is_active ? "bg-[#AF520C]" : "bg-zinc-200"
                            }`}
                            aria-label={`Toggle ekspedisi ${eks.nama_ekspedisi}`}
                            aria-pressed={eks.is_active}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                eks.is_active ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </td>

                        {/* Kolom Aksi */}
                        <td className="px-6 py-4 align-middle text-right">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : eks.public_id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {isExpanded ? "Tutup" : "Layanan"}
                          </button>
                        </td>
                      </tr>

                      {/* Collapsible Row for Services */}
                      {isExpanded && (
                        <tr className="bg-zinc-50/50">
                          <td colSpan={6} className="p-6 border-b border-zinc-200">
                            <div className="mb-4 flex items-center justify-between gap-3">
                              <div>
                                <h3 className="font-bold text-xs text-[#AF520C] uppercase tracking-wider">
                                  Layanan Kurir Tersedia
                                </h3>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                  Aktifkan hanya layanan yang digunakan untuk pengiriman toko Anda.
                                </p>
                              </div>
                              <span className="text-xs font-bold text-zinc-600 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-sm">
                                {activeServicesCount} / {eks.layanan.length} Layanan Aktif
                              </span>
                            </div>

                            {eks.layanan.length === 0 ? (
                              <div className="text-center py-6 text-zinc-400 text-sm bg-white rounded-xl border border-zinc-200 border-dashed">
                                Belum ada layanan untuk ekspedisi ini.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {eks.layanan.map((layanan) => (
                                  <div
                                    key={layanan.public_id}
                                    className={`bg-white rounded-xl p-4 border transition-all ${
                                      layanan.is_active ? "border-zinc-200 shadow-sm" : "border-zinc-200 opacity-60"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h4 className="font-bold text-zinc-950 text-sm">
                                            {layanan.nama_layanan}
                                          </h4>
                                          <span className="text-[10px] px-2.5 py-0.5 bg-orange-50 text-[#AF520C] rounded-full font-bold border border-orange-100">
                                            {layanan.estimasi_min}-{layanan.estimasi_max} Hari
                                          </span>
                                        </div>
                                        <p className="text-zinc-500 text-xs mt-1">
                                          {layanan.deskripsi || "Tidak ada deskripsi"}
                                        </p>
                                      </div>

                                      <button
                                        onClick={() => toggleLayanan(layanan)}
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                          layanan.is_active ? "bg-green-600" : "bg-zinc-200"
                                        }`}
                                        aria-label={`Toggle layanan ${layanan.nama_layanan}`}
                                        aria-pressed={layanan.is_active}
                                      >
                                        <span
                                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            layanan.is_active ? "translate-x-4" : "translate-x-0"
                                          }`}
                                        />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION FOOTER */}
          <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between bg-white">
            <p className="text-sm text-zinc-500 font-medium">
              Menampilkan {totalItems === 0 ? 0 : startIndex + 1} hingga {Math.min(startIndex + itemsPerPage, totalItems)} dari {totalItems} ekspedisi
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {/* Tombol Previous */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 text-zinc-400 hover:text-zinc-800 transition rounded-md hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Angka Halaman */}
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
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
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
