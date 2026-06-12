"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, Truck, Check, X, ShieldAlert, Sparkles, Loader2 } from "lucide-react";

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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modals state
  const [isLayananModalOpen, setIsLayananModalOpen] = useState(false);
  const [selectedEkspedisi, setSelectedEkspedisi] = useState<Ekspedisi | null>(null);
  const [editingLayanan, setEditingLayanan] = useState<Layanan | null>(null);

  // Layanan Form State
  const [formNamaLayanan, setFormNamaLayanan] = useState("");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [formEstimasiMin, setFormEstimasiMin] = useState(1);
  const [formEstimasiMax, setFormEstimasiMax] = useState(3);
  const [formLayananActive, setFormLayananActive] = useState(true);

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

  const handleOpenLayananModal = (ekspedisi: Ekspedisi, layanan?: Layanan) => {
    setSelectedEkspedisi(ekspedisi);
    if (layanan) {
      setEditingLayanan(layanan);
      setFormNamaLayanan(layanan.nama_layanan);
      setFormDeskripsi(layanan.deskripsi);
      setFormEstimasiMin(layanan.estimasi_min);
      setFormEstimasiMax(layanan.estimasi_max);
      setFormLayananActive(layanan.is_active);
    } else {
      setEditingLayanan(null);
      setFormNamaLayanan("");
      setFormDeskripsi("");
      setFormEstimasiMin(1);
      setFormEstimasiMax(3);
      setFormLayananActive(true);
    }
    setIsLayananModalOpen(true);
  };

  const handleSaveLayanan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEkspedisi) return;

    try {
      if (editingLayanan) {
        // Edit existing
        const res = await fetch(`/api/v1/admin/ekspedisi/layanan/${editingLayanan.public_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama_layanan: formNamaLayanan,
            deskripsi: formDeskripsi,
            estimasi_min: Number(formEstimasiMin),
            estimasi_max: Number(formEstimasiMax),
            is_active: formLayananActive,
          }),
        });
        if (res.ok) {
          setIsLayananModalOpen(false);
          fetchData();
        }
      } else {
        // Add new
        const res = await fetch("/api/v1/admin/ekspedisi/layanan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_ekspedisi: selectedEkspedisi.id_ekspedisi,
            nama_layanan: formNamaLayanan,
            deskripsi: formDeskripsi,
            estimasi_min: Number(formEstimasiMin),
            estimasi_max: Number(formEstimasiMax),
            is_active: formLayananActive,
          }),
        });
        if (res.ok) {
          setIsLayananModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      console.error("Gagal menyimpan layanan", err);
    }
  };

  const handleDeleteLayanan = async (layanan: Layanan) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus layanan "${layanan.nama_layanan}"?`)) return;

    try {
      const res = await fetch(`/api/v1/admin/ekspedisi/layanan/${layanan.public_id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Gagal menghapus layanan", err);
    }
  };

  return (
    <div className="w-full pb-12">
      {/* HEADER HERO */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 to-amber-700 p-6 md:p-8 text-white shadow-lg mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-200 text-xs font-bold mb-3 border border-white/10">
            <Sparkles size={12} />
            Pengaturan Pengiriman
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Manajemen Ekspedisi & Ongkir</h1>
          <p className="text-orange-100/90 text-sm max-w-xl font-medium">
            Kelola status aktif kurir eksternal (Biteship API) dan pengiriman internal toko beserta detail estimasi layanan.
          </p>
        </div>
        <div className="flex items-center gap-4 relative z-10 shrink-0">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-white shadow-inner">
            <Truck size={40} className="animate-pulse" />
          </div>
        </div>
        {/* Glow effect */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-[#AF520C] animate-spin mb-4" />
          <p className="text-zinc-500 font-medium text-sm">Sedang memuat data ekspedisi...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {ekspedisiList.length === 0 ? (
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-12 text-center flex flex-col items-center">
              <ShieldAlert className="text-zinc-400 mb-3" size={48} />
              <h3 className="font-bold text-lg text-zinc-800">Belum Ada Ekspedisi</h3>
              <p className="text-zinc-500 text-sm max-w-sm mt-1">
                Silakan tambahkan data ekspedisi di database terlebih dahulu.
              </p>
            </div>
          ) : (
            ekspedisiList.map((eks) => {
              const isExpanded = expandedId === eks.public_id;
              const activeServicesCount = eks.layanan ? eks.layanan.filter((l) => l.is_active).length : 0;

              return (
                <div
                  key={eks.public_id}
                  className={`bg-white rounded-xl border transition-all duration-300 shadow-sm overflow-hidden ${
                    eks.is_active ? "border-zinc-200 hover:shadow-md" : "border-zinc-200 opacity-70"
                  }`}
                >
                  {/* EXPEDITION CARD HEADER */}
                  <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 overflow-hidden shadow-inner p-2">
                        {eks.logo ? (
                          <img src={eks.logo} alt={eks.nama_ekspedisi} className="w-full h-full object-contain" />
                        ) : (
                          <Truck className="text-[#AF520C]" size={24} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-zinc-900">{eks.nama_ekspedisi}</h3>
                          <span className="text-xs px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full font-semibold border border-zinc-200 uppercase">
                            {eks.kode_api}
                          </span>
                        </div>
                        <p className="text-zinc-500 text-sm mt-0.5 line-clamp-1">{eks.deskripsi || "Tidak ada deskripsi"}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${eks.is_active ? "bg-green-500" : "bg-zinc-400"}`}></span>
                          <span className="text-xs font-semibold text-zinc-600">
                            {eks.is_active
                              ? `${activeServicesCount} dari ${eks.layanan ? eks.layanan.length : 0} Layanan Aktif`
                              : "Nonaktif"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
                      {/* TOGGLE SWITCH */}
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

                      {/* COLLAPSIBLE TRIGGER */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : eks.public_id)}
                        className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDABLE SERVICES LIST */}
                  {isExpanded && (
                    <div className="bg-zinc-50 border-t border-zinc-100 p-5">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-sm text-zinc-700 uppercase tracking-wider">Layanan Tersedia</h4>
                        <button
                          onClick={() => handleOpenLayananModal(eks)}
                          disabled={!eks.is_active}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#AF520C] text-white rounded-lg text-xs font-bold hover:bg-[#8e4209] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                          <Plus size={14} />
                          Tambah Layanan
                        </button>
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
                                    <h5 className="font-bold text-zinc-900 text-sm">{lay.nama_layanan}</h5>
                                    <span className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full font-bold border border-orange-100">
                                      {lay.estimasi_min}-{lay.estimasi_max} Hari
                                    </span>
                                  </div>
                                  <p className="text-zinc-500 text-xs mt-1">{lay.deskripsi || "Tidak ada deskripsi"}</p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {/* Toggle Active status for service */}
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

                                  <button
                                    onClick={() => handleOpenLayananModal(eks, lay)}
                                    className="p-1.5 hover:bg-zinc-100 text-zinc-600 rounded-md transition"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLayanan(lay)}
                                    className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ADD/EDIT LAYANAN MODAL */}
      {isLayananModalOpen && selectedEkspedisi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-zinc-200">
            <div className="bg-gradient-to-r from-orange-600 to-amber-700 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{editingLayanan ? "Edit Layanan" : "Tambah Layanan Baru"}</h3>
                <p className="text-xs text-orange-100 mt-0.5">{selectedEkspedisi.nama_ekspedisi}</p>
              </div>
              <button
                onClick={() => setIsLayananModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveLayanan} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Nama Layanan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Reguler, YES, Cargo"
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#AF520C]"
                  value={formNamaLayanan}
                  onChange={(e) => setFormNamaLayanan(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Deskripsi Layanan
                </label>
                <textarea
                  placeholder="Deskripsi singkat mengenai layanan..."
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#AF520C] h-20 resize-none"
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Min Estimasi (Hari)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#AF520C]"
                    value={formEstimasiMin}
                    onChange={(e) => setFormEstimasiMin(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Max Estimasi (Hari)
                  </label>
                  <input
                    type="number"
                    min={formEstimasiMin}
                    required
                    className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#AF520C]"
                    value={formEstimasiMax}
                    onChange={(e) => setFormEstimasiMax(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <h5 className="font-bold text-sm text-zinc-800">Status Aktif</h5>
                  <p className="text-xs text-zinc-500">Layanan dapat langsung dipilih jika aktif</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormLayananActive(!formLayananActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formLayananActive ? "bg-green-600" : "bg-zinc-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formLayananActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsLayananModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-lg text-zinc-700 text-sm font-semibold hover:bg-zinc-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#AF520C] text-white rounded-lg text-sm font-bold hover:bg-[#8e4209] transition flex items-center gap-1.5"
                >
                  <Check size={16} />
                  Simpan Layanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
