"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CloudUpload, ChevronRight, BadgePercent, Trash2, Info, Loader2, Calendar, Tag, Image as ImageIcon } from "lucide-react";

export default function KelolaDiskonPage() {
  const router = useRouter();
  
  // STATE LOADING & PESAN
  const [loadingForm, setLoadingForm] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // STATE FORM TAMBAH DISKON
  const [namaDiskon, setNamaDiskon] = useState("");
  const [besarDiskon, setBesarDiskon] = useState("");
  const [tglMulai, setTglMulai] = useState("");
  const [tglSelesai, setTglSelesai] = useState("");
  
  const [fileBanner, setFileBanner] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false); 

  // STATE LIST DISKON DARI GOLANG
  const [diskonList, setDiskonList] = useState<any[]>([]);

  // STATE CUSTOM MODAL DELETE
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [diskonToDelete, setDiskonToDelete] = useState<number | null>(null);

  // 🚀 1. FETCH DATA DISKON
  const fetchDiskon = async () => {
    setIsFetching(true);
    try {
      const res = await fetch("/api/v1/admin/diskon/semua");
      const json = await res.json();
      if (res.ok && json.data) {
        setDiskonList(json.data);
      }
    } catch (error) {
      console.error("Gagal mengambil daftar diskon:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchDiskon();
  }, []);

  // 🚀 2. HANDLER DRAG & DROP BANNER
  const processFile = (file: File | undefined) => {
    setErrorMsg("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return setErrorMsg("⚠️ Harap upload file gambar (PNG/JPG).");
    }
    if (file.size > 3 * 1024 * 1024) {
      return setErrorMsg("⚠️ Ukuran banner maksimal 3 MB.");
    }

    setFileBanner(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => processFile(e.target.files?.[0]);
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files?.[0]); };

  // 🚀 3. SUBMIT FORM
  const handleSimpan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!namaDiskon || !besarDiskon || !tglMulai || !tglSelesai) {
      return setErrorMsg("⚠️ Harap lengkapi semua form data diskon.");
    }

    setLoadingForm(true);
    setErrorMsg("");

    try {
      let bannerUrl = "";

      if (fileBanner) {
        const formData = new FormData();
        formData.append("banner", fileBanner); 

        const uploadRes = await fetch("/api/v1/admin/diskon/upload", {
          method: "POST",
          body: formData,
        });
        
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.message || "Gagal mengunggah banner.");
        
        bannerUrl = uploadJson.url;
      }

      const payload = {
        nama_diskon: namaDiskon,
        besar_diskon: parseInt(besarDiskon),
        banner_diskon: bannerUrl,
        tgl_mulai: tglMulai,
        tgl_selesai: tglSelesai
      };

      const res = await fetch("/api/v1/admin/diskon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan promo diskon.");

      setNamaDiskon("");
      setBesarDiskon("");
      setTglMulai("");
      setTglSelesai("");
      setFileBanner(null);
      setPreviewUrl("");
      fetchDiskon(); 

    } catch (error: any) {
      console.error("Save error:", error);
      setErrorMsg(error.message || "Terjadi kesalahan sistem saat menyimpan data.");
    } finally {
      setLoadingForm(false);
    }
  };

  // 🚀 4. LOGIC MODAL DELETE CUSTOM
  const triggerDelete = (id: number) => {
    setDiskonToDelete(id);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDiskonToDelete(null);
  };

  const confirmDelete = async () => {
    if (!diskonToDelete) return;
    
    try {
      const res = await fetch(`/api/v1/admin/diskon/${diskonToDelete}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menghapus diskon");
      
      setErrorMsg("");
      fetchDiskon();
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message);
    } finally {
      setShowDeleteModal(false);
      setDiskonToDelete(null);
    }
  };

  return (
    <div className="w-full pb-12 relative">
      
      {/* 🔥 CUSTOM MODAL DELETE */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-zinc-200 transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-4 text-[#AF520C]">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Hapus Promo Diskon?</h3>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Barang yang menggunakan promo ini akan otomatis kembali ke harga normal.
            </p>
            <div className="flex gap-3 w-full">
              <button onClick={cancelDelete} className="flex-1 py-2.5 rounded-lg border border-zinc-200 text-zinc-600 font-bold text-sm hover:bg-zinc-50 transition">
                Batal
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-lg bg-[#AF520C] text-white font-bold text-sm hover:bg-[#8e4209] transition shadow-sm">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Kelola Diskon & Promo</h1>
          <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
            <Link href="/barang" className="hover:text-[#AF520C] transition">Barang</Link>
            <ChevronRight size={14} />
            <span className="text-[#AF520C]">Diskon</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-orange-50 border border-[#AF520C]/30 text-[#AF520C] rounded-lg text-sm font-semibold">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KIRI: FORM TAMBAH DISKON */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-800 mb-6 flex items-center gap-2">
              <BadgePercent size={20} className="text-[#AF520C]" />
              Buat Promo Baru
            </h2>

            <form onSubmit={handleSimpan} className="flex flex-col gap-6">
              
              {/* BAGIAN UPLOAD BANNER */}
              <div>
                <label className="text-sm font-bold text-zinc-600 mb-2 flex items-center gap-2">
                  <ImageIcon size={16} className="text-zinc-400" /> Banner Promo (Opsional)
                </label>
                <label 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`w-full aspect-21/9 md:aspect-3/1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition cursor-pointer relative overflow-hidden group
                    ${isDragging ? "border-[#AF520C] bg-orange-50" : "border-zinc-300 bg-white hover:bg-zinc-50"}
                  `}
                >
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  
                  {previewUrl ? (
                    <div className="absolute inset-0 w-full h-full bg-zinc-100 flex items-center justify-center">
                      <img src={previewUrl} alt="Preview Banner" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-sm text-white text-sm font-bold gap-2">
                        <CloudUpload size={18} /> Ganti Banner
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center p-6">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${isDragging ? "bg-[#AF520C] text-white" : "bg-orange-50 text-[#AF520C]"}`}>
                        <CloudUpload size={24} />
                      </div>
                      <p className="font-bold text-zinc-700 text-sm mb-1">
                        {isDragging ? "Lepaskan Banner di Sini!" : "Tarik & Lepas Banner Promo"}
                      </p>
                      <p className="text-xs text-zinc-400">Direkomendasikan rasio 3:1 (Maks 3MB)</p>
                    </div>
                  )}
                </label>
              </div>

              {/* INPUT NAMA & BESAR DISKON */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-zinc-600 mb-2 flex items-center gap-2">
                    <Tag size={16} className="text-zinc-400" /> Nama Promo
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Cth: Merdeka Sale 2026" 
                    className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#AF520C]" 
                    value={namaDiskon}
                    onChange={(e) => setNamaDiskon(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-zinc-600 mb-2 block">Potongan (%)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      required min="1" max="100"
                      placeholder="0" 
                      className="w-full border border-zinc-200 rounded-lg p-3 pr-8 text-sm focus:outline-none focus:border-[#AF520C]" 
                      value={besarDiskon}
                      onChange={(e) => setBesarDiskon(e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">%</span>
                  </div>
                </div>
              </div>

              {/* INPUT TANGGAL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                <div>
                  <label className="text-sm font-bold text-zinc-600 mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-[#AF520C]" /> Tanggal Mulai
                  </label>
                  <input 
                    type="date" 
                    required 
                    className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#AF520C] bg-white cursor-pointer" 
                    value={tglMulai}
                    onChange={(e) => setTglMulai(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-zinc-600 mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-zinc-400" /> Tanggal Selesai
                  </label>
                  <input 
                    type="date" 
                    required 
                    className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#AF520C] bg-white cursor-pointer" 
                    value={tglSelesai}
                    onChange={(e) => setTglSelesai(e.target.value)}
                  />
                </div>
              </div>

              {/* TOMBOL AKSI */}
              <div className="flex justify-end mt-2 pt-6 border-t border-zinc-100">
                <button type="submit" disabled={loadingForm} className="px-8 py-2.5 bg-[#AF520C] text-white rounded-lg text-sm font-bold hover:bg-[#8e4209] transition shadow-sm disabled:opacity-50 flex items-center gap-2">
                  {loadingForm ? <><Loader2 className="animate-spin" size={16} /> Menyimpan...</> : "Buat Promo Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* KANAN: LIST DISKON TERSEDIA */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm h-full flex flex-col">
            {/* Judul list diam di atas */}
            <h2 className="text-lg font-bold text-zinc-800 mb-6 shrink-0">Daftar Promo</h2>
            
            {/* 🚀 FIXED: Area Scroll yang dibatasi ketinggiannya */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 h-125">
              {isFetching ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-[#AF520C]" size={28} />
                </div>
              ) : diskonList.length > 0 ? (
                diskonList.map((item) => (
                  <div key={item.id_diskon} className="flex flex-col border border-zinc-100 rounded-xl overflow-hidden hover:border-[#AF520C]/30 hover:shadow-md transition group bg-white shrink-0">
                    
                    {/* BAGIAN ATAS: BANNER ATAU PLACEHOLDER */}
                    <div className="w-full h-24 bg-zinc-100 relative border-b border-zinc-100">
                      {item.banner_url ? (
                        <img src={item.banner_url} alt={item.nama_diskon} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-30">
                          <ImageIcon size={32} className="text-zinc-400" />
                        </div>
                      )}
                      
                      {/* 🚀 FIXED: BADGE STATUS WARNA COKLAT SOFT */}
                      <div className="absolute top-2 left-2">
                        {item.aktif ? (
                          <span className="bg-orange-100/90 backdrop-blur-sm border border-[#AF520C]/30 text-[#AF520C] text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-[#AF520C] rounded-full animate-pulse"></span> Aktif
                          </span>
                        ) : (
                          <span className="bg-zinc-600/90 backdrop-blur-sm border border-zinc-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                            Expired
                          </span>
                        )}
                      </div>
                      
                      {/* BADGE PERSENTASE */}
                      <div className="absolute top-2 right-2 bg-[#AF520C] text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                        {item.besar_diskon}% OFF
                      </div>
                    </div>

                    {/* BAGIAN BAWAH: INFO & ACTION */}
                    <div className="p-4 flex items-end justify-between">
                      <div>
                        <h3 className="font-bold text-zinc-800 text-sm mb-1">{item.nama_diskon}</h3>
                        <p className="text-[11px] text-zinc-500 font-medium">
                          {item.tgl_mulai.split("T")[0]} s.d {item.tgl_selesai.split("T")[0]}
                        </p>
                      </div>
                      <button 
                        onClick={() => triggerDelete(item.id_diskon)}
                        className="text-zinc-400 hover:text-[#AF520C] bg-zinc-50 p-2 rounded-lg border border-zinc-200 hover:border-[#AF520C]/30 hover:bg-orange-50 transition-all"
                        title="Hapus Promo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <BadgePercent size={40} className="mx-auto text-zinc-300 mb-3" />
                  <p className="text-sm text-zinc-500 font-medium">Belum ada promo diskon.</p>
                </div>
              )}
            </div>

            {/* 🚀 FIXED: WARNING BOX DI BAWAH LIST */}
            <div className="mt-6 p-4 bg-orange-50/50 rounded-lg border border-[#AF520C]/20 text-center shrink-0">
              <p className="text-[11px] text-[#AF520C] font-medium leading-relaxed">
                <span className="font-bold">Perhatian:</span> Menghapus promo akan otomatis mencabut diskon tersebut dari barang, dan harga akan kembali normal.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}