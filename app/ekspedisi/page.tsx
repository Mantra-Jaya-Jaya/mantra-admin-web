"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Truck,
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

  const sortedEkspedisi = [...ekspedisiList].sort(
    (a, b) => Number(b.is_active) - Number(a.is_active),
  );

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

      {loading && !syncing ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-[#AF520C] animate-spin mb-4" />
          <p className="text-zinc-500 font-medium text-sm">
            Sedang memuat data ekspedisi...
          </p>
        </div>
      ) : sortedEkspedisi.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-12 text-center flex flex-col items-center">
          <ShieldAlert className="text-zinc-400 mb-3" size={48} />
          <h3 className="font-bold text-lg text-zinc-800">Belum Ada Ekspedisi</h3>
          <p className="text-zinc-500 text-sm max-w-sm mt-1">
            Silakan lakukan sinkronisasi data dari Biteship terlebih dahulu.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedEkspedisi.map((eks) => {
            const isExpanded = expandedId === eks.public_id;
            const activeServicesCount = eks.layanan.filter((layanan) => layanan.is_active).length;

            return (
              <div
                key={eks.public_id}
                className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0 overflow-hidden p-1 shadow-inner">
                        {eks.logo ? (
                          <Image
                            src={eks.logo}
                            alt={eks.nama_ekspedisi}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Truck className="text-[#AF520C]" size={22} />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h2 className="font-bold text-lg text-zinc-900">
                            {eks.nama_ekspedisi}
                          </h2>
                          <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                            {eks.kode_api}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-500 max-w-2xl">
                          {eks.deskripsi || "Tidak ada deskripsi"}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                          <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-semibold text-zinc-700">
                            {eks.layanan.length} layanan
                          </span>
                          <span className="rounded-full bg-green-50 px-2.5 py-1 font-semibold text-green-700">
                            {activeServicesCount} aktif
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-1 font-semibold ${
                              eks.is_active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-zinc-100 text-zinc-500"
                            }`}
                          >
                            {eks.is_active ? "Ekspedisi aktif" : "Ekspedisi nonaktif"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start lg:self-center">
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

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : eks.public_id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {isExpanded ? "Tutup" : "Lihat layanan"}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-zinc-100 bg-zinc-50/60 p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-sm text-zinc-700 uppercase tracking-wider">
                          Layanan Tersedia
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">
                          Aktifkan hanya layanan yang memang dipakai bisnis.
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-zinc-500">
                        {activeServicesCount} / {eks.layanan.length} aktif
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
                                  <span className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full font-bold border border-orange-100">
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
