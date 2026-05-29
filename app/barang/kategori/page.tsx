"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CloudUpload, ChevronRight, Tags, Trash2, Info, Loader2, Pencil, X } from "lucide-react";

export default function TambahKategoriPage() {
  const router = useRouter();
  
  // STATE LOADING & PESAN
  const [loadingForm, setLoadingForm] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // STATE FORM (TAMBAH / EDIT)
  const [editingId, setEditingId] = useState<number | null>(null); 
  const [namaKategori, setNamaKategori] = useState("");
  const [fileIcon, setFileIcon] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false); 

  // STATE LIST KATEGORI
  const [kategoriList, setKategoriList] = useState<any[]>([]);

  // STATE CUSTOM MODAL DELETE
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [kategoriToDelete, setKategoriToDelete] = useState<number | null>(null);

  // 🚀 1. FETCH DATA KATEGORI
  const fetchKategori = async () => {
    setIsFetching(true);
    try {
      const res = await fetch("/api/v1/admin/kategori");
      const json = await res.json();
      if (res.ok && json.data) {
        setKategoriList(json.data);
      }
    } catch (error) {
      console.error("Gagal mengambil daftar kategori:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  // 🚀 2. HANDLER DRAG & DROP GAMBAR
  const processFile = (file: File | undefined) => {
    setErrorMsg("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return setErrorMsg("⚠️ Harap upload file gambar (PNG/JPG).");
    }
    if (file.size > 2 * 1024 * 1024) {
      return setErrorMsg("⚠️ Ukuran gambar maksimal 2 MB.");
    }

    setFileIcon(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files?.[0]); };

  // 🔥 3. HANDLER KLIK TOMBOL EDIT
  const handleEditClick = (item: any) => {
    setEditingId(item.id_kategori || item.id);
    setNamaKategori(item.nama_kategori);
    setPreviewUrl(item.icon_kategori || "");
    setFileIcon(null); // Kosongin file baru, pake preview URL lama
    setErrorMsg("");
  };

  // 🔥 4. HANDLER BATAL EDIT
  const handleBatalEdit = () => {
    setEditingId(null);
    setNamaKategori("");
    setFileIcon(null);
    setPreviewUrl("");
    setErrorMsg("");
  };

  // 🚀 5. SUBMIT FORM (HYBRID: POST / PUT)
  const handleSimpan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!namaKategori) return;

    setLoadingForm(true);
    setErrorMsg("");

    try {
      let iconUrl = "";

      // A. Upload Gambar ke MinIO JIKA ada file baru yang dipilih
      if (fileIcon) {
        const formData = new FormData();
        formData.append("icon", fileIcon);

        const uploadRes = await fetch("/api/v1/admin/kategori/upload", {
          method: "POST",
          body: formData,
        });
        
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.message || "Gagal mengunggah icon.");
        
        iconUrl = uploadJson.url;
      }

      // B. Siapkan Payload JSON
      const payload: any = {
        nama_kategori: namaKategori,
      };
      
      // Kirim URL icon baru ke Golang kalau ada (Backend bakal ngabaikan kalau kosong)
      if (iconUrl) {
        payload.icon_kategori = iconUrl;
      }

      // C. Tentukan Endpoint & Method (PUT untuk Edit, POST untuk Tambah Baru)
      const endpoint = editingId 
        ? `/api/v1/admin/kategori/${editingId}` 
        : "/api/v1/admin/kategori";
      
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan kategori.");

      // D. Sukses! Reset form dan refresh list
      handleBatalEdit();
      fetchKategori(); 

    } catch (error: any) {
      console.error("Save error:", error);
      setErrorMsg(error.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoadingForm(false);
    }
  };

  // 🚀 6. LOGIC MODAL DELETE CUSTOM
  const triggerDelete = (id: number) => {
    setKategoriToDelete(id);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setKategoriToDelete(null);
  };

  const confirmDelete = async () => {
    if (!kategoriToDelete) return;
    
    try {
      const res = await fetch(`/api/v1/admin/kategori/${kategoriToDelete}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menghapus kategori");
      
      setErrorMsg(""); 
      fetchKategori();

      // Kalau yang dihapus kebetulan lagi di-edit, reset formnya juga
      if (editingId === kategoriToDelete) {
        handleBatalEdit();
      }

    } catch (error: any) {
      console.error("Delete error:", error);
      setErrorMsg(error.message); 
    } finally {
      setShowDeleteModal(false);
      setKategoriToDelete(null);
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
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Hapus Kategori?</h3>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Pastikan kategori ini sudah tidak digunakan oleh barang manapun.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={cancelDelete} 
                className="flex-1 py-2.5 rounded-lg border border-zinc-200 text-zinc-600 font-bold text-sm hover:bg-zinc-50 transition"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-2.5 rounded-lg bg-[#AF520C] text-white font-bold text-sm hover:bg-[#8e4209] transition shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Kelola Kategori</h1>
          <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
            <Link href="/barang" className="hover:text-[#AF520C] transition">Barang</Link>
            <ChevronRight size={14} />
            <span className="text-[#AF520C]">Kategori</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-orange-50 border border-[#AF520C]/30 text-[#AF520C] rounded-lg text-sm font-semibold flex justify-between items-center">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")} className="text-[#AF520C] hover:text-[#8e4209]"><X size={16}/></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KIRI: FORM TAMBAH / EDIT KATEGORI */}
        <div className="lg:col-span-2">
          <div className={`bg-white p-6 rounded-xl border shadow-sm transition-colors duration-300 ${editingId ? "border-[#AF520C]/50 shadow-orange-500/5" : "border-zinc-200"}`}>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
                <Tags size={20} className="text-[#AF520C]" />
                {editingId ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h2>
            </div>

            <form onSubmit={handleSimpan} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                
                {/* 🚀 BAGIAN UPLOAD IKON */}
                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-zinc-600 mb-2 block">Ikon Kategori</label>
                  <label 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition cursor-pointer relative overflow-hidden group
                      ${isDragging ? "border-[#AF520C] bg-orange-50" : "border-zinc-300 bg-white hover:bg-zinc-50"}
                    `}
                  >
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileChange} 
                    />
                    
                    {previewUrl ? (
                      <div className="absolute inset-0 w-full h-full bg-zinc-100 flex items-center justify-center p-2">
                        <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-sm text-white text-xs font-bold">
                          Ganti Gambar
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${isDragging ? "bg-[#AF520C] text-white" : "bg-orange-50 text-[#AF520C]"}`}>
                          <CloudUpload size={20} />
                        </div>
                        <p className="font-bold text-zinc-700 text-xs mb-1">
                          {isDragging ? "Lepaskan Gambar!" : "Tarik File / Klik"}
                        </p>
                        <p className="text-[10px] text-zinc-400">PNG/JPG (Maks 2MB)</p>
                      </>
                    )}
                  </label>
                </div>

                {/* BAGIAN INPUT NAMA */}
                <div className="md:col-span-3 flex flex-col justify-between">
                  <div>
                    <label className="text-sm font-bold text-zinc-600 mb-2 block">Nama Kategori</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Cth: Kertas & Buku" 
                      className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#AF520C]" 
                      value={namaKategori}
                      onChange={(e) => setNamaKategori(e.target.value)}
                    />
                  </div>

                  <div className="mt-4 p-3.5 bg-orange-50/50 border border-[#AF520C]/20 rounded-lg flex gap-3 items-start">
                    <Info size={16} className="text-[#AF520C] mt-0.5 shrink-0" />
                    <div>
                      <h3 className="text-xs font-bold text-zinc-800 mb-1">Panduan Kategori</h3>
                      <p className="text-[11px] text-zinc-600 leading-relaxed">
                        Gunakan nama yang singkat dan padat. Anda dapat mengubah nama atau ikon kategori yang sudah ada melalui tombol edit di sebelah kanan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TOMBOL AKSI */}
              <div className="flex justify-end gap-3 mt-2 pt-6 border-t border-zinc-100">
                {editingId && (
                  <button 
                    type="button" 
                    onClick={handleBatalEdit}
                    className="px-6 py-2.5 bg-zinc-100 text-zinc-600 rounded-lg text-sm font-bold hover:bg-zinc-200 transition"
                  >
                    Batal Edit
                  </button>
                )}
                <button type="submit" disabled={loadingForm} className="px-6 py-2.5 bg-[#AF520C] text-white rounded-lg text-sm font-bold hover:bg-[#8e4209] transition shadow-sm disabled:opacity-50 flex items-center gap-2">
                  {loadingForm ? <><Loader2 className="animate-spin" size={16} /> Menyimpan...</> : (editingId ? "Simpan Perubahan" : "Simpan Kategori")}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* KANAN: LIST KATEGORI TERSEDIA */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm h-full flex flex-col">
            <h2 className="text-lg font-bold text-zinc-800 mb-6">Kategori Tersedia</h2>
            
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[400px] pr-2">
              {isFetching ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-[#AF520C]" size={24} />
                </div>
              ) : kategoriList.length > 0 ? (
                kategoriList.map((item) => {
                  const itemId = item.id_kategori || item.id;
                  const isCurrentlyEditing = editingId === itemId;

                  return (
                    <div 
                      key={itemId} 
                      className={`flex items-center justify-between p-3.5 border rounded-lg transition group
                        ${isCurrentlyEditing ? "border-[#AF520C] bg-orange-50/50" : "border-zinc-100 hover:border-[#AF520C]/30 hover:bg-zinc-50"}`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon_kategori ? (
                          <img src={item.icon_kategori} alt={item.nama_kategori} className="w-9 h-9 rounded-lg shadow-sm object-cover bg-white" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg shadow-sm bg-zinc-200 flex items-center justify-center text-zinc-500 font-bold text-xs">
                            {item.nama_kategori.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <p className={`font-bold text-sm capitalize ${isCurrentlyEditing ? "text-[#AF520C]" : "text-zinc-800"}`}>
                          {item.nama_kategori}
                        </p>
                      </div>
                      
                      <div className={`flex gap-1.5 transition-opacity ${isCurrentlyEditing ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                        {/* 🔥 TOMBOL EDIT BARU */}
                        <button 
                          onClick={() => handleEditClick(item)}
                          className="text-zinc-400 hover:text-blue-600 bg-white p-1.5 rounded-md shadow-sm border border-zinc-100 hover:border-blue-200 transition-all"
                          title="Edit Kategori"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => triggerDelete(itemId)}
                          className="text-zinc-400 hover:text-red-500 bg-white p-1.5 rounded-md shadow-sm border border-zinc-100 hover:border-red-200 transition-all"
                          title="Hapus Kategori"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-center text-zinc-500 py-4">Belum ada data kategori.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}