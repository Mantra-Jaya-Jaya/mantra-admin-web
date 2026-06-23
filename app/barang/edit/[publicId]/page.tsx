"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CloudUpload, ScanLine, Trash2, Plus, ChevronRight, 
  ChevronDown, Package, Barcode, Loader2, RefreshCw, 
  ArrowDownToLine, ArrowUpFromLine, Pencil, BadgePercent
} from "lucide-react"; 
import dynamic from "next/dynamic";
const BarcodeScannerModal = dynamic(() => import("@/components/BarcodeScanner"), {
  ssr: false,
});

export default function EditBarangPage() {
  const router = useRouter();
  const params = useParams();
  
  const publicId = params?.publicId as string;
  
  // 🚀 STATE FETCHING DATA MASTER
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [diskonList, setDiskonList] = useState<any[]>([]);
  const [satuanList, setSatuanList] = useState<any[]>([]);
  const [isFetchingMaster, setIsFetchingMaster] = useState(true);

  // 🚀 STATE KONTROL UI
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showSatuanDropdown, setShowSatuanDropdown] = useState(false);
  const [fileGambar, setFileGambar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(""); 
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [info, setInfo] = useState({ 
    nama: "", 
    hargaBeli: "", 
    kategori: "", 
    satuan: "", 
    diskon: "", 
    deskripsi: "" 
  });

  const [spesifikasi, setSpesifikasi] = useState<any[]>([]);

  const [activeScanner, setActiveScanner] = useState<{spekId: number, barcodeId: number} | null>(null);

  // 🚀 1. FETCH DATA MASTER (Kategori, Diskon, Satuan)
  useEffect(() => {
    const fetchMasterData = async () => {
      setIsFetchingMaster(true);
      try {
        const [resKat, resDisk, resSat] = await Promise.all([
          fetch("/api/v1/admin/kategori"),
          fetch("/api/v1/admin/diskon"),
          fetch("/api/v1/admin/satuan")
        ]);

        if (resKat.ok) {
          const jsonKat = await resKat.json();
          if (jsonKat.data) setKategoriList(jsonKat.data);
        }
        if (resDisk.ok) {
          const jsonDisk = await resDisk.json();
          if (jsonDisk.data) setDiskonList(jsonDisk.data);
        }
        if (resSat.ok) {
          const jsonSat = await resSat.json();
          if (jsonSat.data) setSatuanList(jsonSat.data);
        }
      } catch (error) {
        console.error("Gagal menarik data master:", error);
      } finally {
        setIsFetchingMaster(false);
      }
    };

    fetchMasterData();
  }, []);

  // 🚀 2. FETCH DATA DETAIL BARANG
  useEffect(() => {
    if (!publicId) return;

    const fetchDetailBarang = async () => {
      try {
        const res = await fetch(`/api/v1/admin/barang/detail/${publicId}`);
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const rawText = await res.text();
          throw new Error(`Endpoint tidak mereturn JSON! Respons server: ${rawText.substring(0, 50)}...`);
        }

        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Gagal mengambil data barang dari server.");

        const data = json.data;

        // 🔥 FIX: Parsing data diskon dari object JSON backend
        const diskonIdDariServer = data.diskon?.id_diskon ? data.diskon.id_diskon.toString() : "";

        setInfo({
          nama: data.nama_barang || "",
          hargaBeli: data.harga_beli?.toString() || "", 
          kategori: data.kategori || "", 
          satuan: data.satuan || "",
          diskon: diskonIdDariServer,
          deskripsi: data.deskripsi || ""
        });

        if (data.gambar_barang) {
          setPreviewUrl(data.gambar_barang);
        }

        if (data.varian && data.varian.length > 0) {
          const mappedSpesifikasi = data.varian.map((v: any, index: number) => ({
            id: v.id_spesifikasi_barang || Date.now() + index,
            atribut: v.nama_spesifikasi || "",
            nilai: v.nama_detail || "",
            stokSekarang: v.stok?.toString() || "0", 
            hargaJual: v.harga_barang?.toString() || "0",
            statusStok: "", 
            jumlahUbah: "",
            keterangan: "",
            barcodes: v.barcodes && v.barcodes.length > 0 
              ? v.barcodes.map((b: any, bIndex: number) => ({
                  b_id: b.id_barcode || Date.now() + bIndex,
                  code: b.kode_barcode || "",
                  qty: b.kuantitas?.toString() || "1"
                })) 
              : [{ b_id: Date.now(), code: "", qty: "1" }] 
          }));
          
          setSpesifikasi(mappedSpesifikasi);
        }
      } catch (error: any) {
        console.error("Fetch Data Error:", error);
        setErrorMsg(error.message || "Gagal memuat data dari server.");
      } finally {
        setIsLoadingData(false); 
      }
    };

    fetchDetailBarang();
  }, [publicId]);

  // 🚀 FILTER SATUAN UNTUK AUTOCOMPLETE
  const filteredSatuan = satuanList.filter(sat => 
    sat.nama_satuan.toLowerCase().includes(info.satuan.toLowerCase())
  );

  const formatRupiah = (value: any) => {
    if (!value) return "";
    const angkaMurni = value.toString().replace(/\D/g, "");
    if (!angkaMurni) return "";
    return new Intl.NumberFormat('id-ID').format(angkaMurni);
  };

  const processFile = (file: File | undefined) => {
    setErrorMsg(""); 
    if (!file) return;
    if (!file.type.startsWith("image/")) return setErrorMsg("⚠️ Format file tidak didukung. Harap upload gambar (JPG/PNG).");
    if (file.size > 1024 * 1024) return setErrorMsg("⚠️ Ukuran gambar maksimal 1 MB.");

    setFileGambar(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const addSpesifikasiRow = () => {
    setSpesifikasi([...spesifikasi, { 
      id: Date.now(), atribut: "", nilai: "", stokSekarang: "0", hargaJual: "", statusStok: "", jumlahUbah: "", keterangan: "",
      barcodes: [{ b_id: Date.now() + 1, code: "", qty: "1" }] 
    }]);
  };

  const removeSpesifikasiRow = (id: number) => setSpesifikasi(spesifikasi.filter(s => s.id !== id));
  const updateSpesifikasi = (id: number, field: string, value: any) => setSpesifikasi(spesifikasi.map(s => s.id === id ? { ...s, [field]: value } : s));
  const updateBarcodeInSpek = (spekId: number, barcodeId: number, field: string, value: any) => setSpesifikasi(spesifikasi.map(s => s.id === spekId ? { ...s, barcodes: s.barcodes.map((b: any) => b.b_id === barcodeId ? { ...b, [field]: value } : b) } : s));
  const addBarcodeToSpesifikasi = (spekId: number) => setSpesifikasi(spesifikasi.map(s => s.id === spekId ? { ...s, barcodes: [...s.barcodes, { b_id: Date.now(), code: "", qty: "1" }] } : s));
  const removeBarcodeFromSpesifikasi = (spekId: number, barcodeId: number) => setSpesifikasi(spesifikasi.map(s => s.id === spekId ? { ...s, barcodes: s.barcodes.filter((b: any) => b.b_id !== barcodeId) } : s));

  const handleSimpan = async () => {
    setErrorMsg("");
    setLoading(true);

    try {
      let finalMediaUrl = previewUrl; 

      if (fileGambar) {
        const formData = new FormData();
        formData.append("gambar", fileGambar);
        const uploadRes = await fetch("/api/v1/admin/barang/upload", { method: "POST", body: formData });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.message || "Gagal mengunggah gambar baru.");
        finalMediaUrl = uploadJson.url; 
      }

      const payload = {
        media: finalMediaUrl, 
        informasi_barang: info,
        spesifikasi: spesifikasi.map(spek => {
          let penyesuaianStok = null;
          if (spek.statusStok !== "" && spek.jumlahUbah) {
             penyesuaianStok = { isMasuk: spek.statusStok === "1", jumlah: parseInt(spek.jumlahUbah) || 0, keterangan: spek.keterangan };
          }
          return {
            atribut: spek.atribut, nilai: spek.nilai, hargaJual: spek.hargaJual.toString(), penyesuaian_stok: penyesuaianStok, 
            barcodes: spek.barcodes.map((bc: any) => ({ code: bc.code, qty: bc.qty.toString() }))
          };
        })
      };

      const res = await fetch(`/api/v1/admin/barang/${publicId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Gagal menyimpan: API tidak mereturn JSON. Pastikan endpoint PUT di Golang berjalan.");
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan perubahan data barang.");

      router.push("/barang");

    } catch (error: any) {
      console.error("Save error:", error);
      setErrorMsg(error.message || "Terjadi kesalahan saat menyambung ke server.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#AF520C]" size={40} />
        <p className="text-zinc-500 font-bold animate-pulse">Menarik data dari gudang...</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-12"> 
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Edit Barang</h1>
          <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
            <Link href="/barang" className="hover:text-[#AF520C] transition">Barang</Link>
            <ChevronRight size={14} />
            <span className="text-[#AF520C]">Edit Barang</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/barang" className="px-6 py-2.5 bg-white border border-zinc-200 text-zinc-600 rounded-lg text-sm font-bold hover:bg-zinc-50 transition shadow-sm">
            Batal
          </Link>
          <button 
            onClick={handleSimpan} disabled={loading || isFetchingMaster}
            className="px-6 py-2.5 bg-[#AF520C] text-white rounded-lg text-sm font-bold hover:bg-[#8e4209] transition shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <><Loader2 className="animate-spin" size={16} /> Menyimpan...</> : "Simpan Perubahan"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-semibold">
          {errorMsg}
        </div>
      )}

      {/* MEDIA PRODUK */}
      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-zinc-800 mb-4">Media Produk</h2>
        <label 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          className={`w-full border-2 border-dashed rounded-xl p-1 relative flex flex-col items-center justify-center text-center transition cursor-pointer overflow-hidden min-h-60 ${isDragging ? "border-[#AF520C] bg-orange-50" : "border-zinc-300 hover:bg-zinc-50"}`}
        >
          <input type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={(e) => processFile(e.target.files?.[0])} />
          {previewUrl ? (
            <div className="w-full h-full absolute inset-0 group bg-zinc-100 flex items-center justify-center">
               <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-sm">
                 <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-lg text-sm font-bold text-zinc-700 shadow-lg hover:scale-105 transition transform">
                   <Pencil size={16} className="text-[#AF520C]" /> Ubah Gambar
                 </div>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center p-12 pointer-events-none">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 transition bg-orange-50 text-[#AF520C]">
                <CloudUpload size={28} />
              </div>
              <p className="font-bold text-zinc-700 mb-1">Tarik & Lepas, atau Klik File</p>
            </div>
          )}
        </label>
      </div>

      {/* INFORMASI BARANG */}
      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-zinc-800 mb-6">Informasi Dasar Barang</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          <div>
            <label className="text-sm font-bold text-zinc-600 mb-2 block">Nama barang</label>
            <input type="text" className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#AF520C]" 
              value={info.nama} onChange={(e) => setInfo({ ...info, nama: e.target.value })} />
          </div>
          
          <div>
            <label className="text-sm font-bold text-zinc-600 mb-2 block">Harga Beli Terakhir (Stok Opname)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">Rp</span>
              <input type="text" className="w-full border border-zinc-200 rounded-lg p-3 pl-10 text-sm focus:outline-none focus:border-[#AF520C] bg-zinc-50" 
                value={formatRupiah(info.hargaBeli)} onChange={(e) => setInfo({ ...info, hargaBeli: e.target.value.replace(/\D/g, "") })} />
            </div>
          </div>
          
          {/* 🚀 KATEGORI DINAMIS */}
          <div>
            <label className="text-sm font-bold text-zinc-600 mb-2 block">Kategori</label>
            <div className="relative">
              <select className="w-full border border-zinc-200 rounded-lg p-3 pr-10 text-sm focus:outline-none focus:border-[#AF520C] appearance-none bg-white cursor-pointer capitalize"
                value={info.kategori} onChange={(e) => setInfo({ ...info, kategori: e.target.value })} disabled={isFetchingMaster}>
                <option value="" disabled>{isFetchingMaster ? "Memuat Kategori..." : "Pilih Kategori"}</option>
                {kategoriList.map(kat => (
                  <option key={kat.id_kategori} value={kat.nama_kategori}>{kat.nama_kategori}</option>
                ))}
              </select>
              {isFetchingMaster ? <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 animate-spin" /> : <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={18} />}
            </div>
          </div>
          
          {/* 🚀 SATUAN CUSTOM AUTOCOMPLETE */}
          <div className="relative">
            <label className="text-sm font-bold text-zinc-600 mb-2 flex items-center gap-2">Satuan Dasar</label>
            <input 
              type="text" 
              placeholder="Ketik atau pilih satuan (Pcs, Box...)" 
              className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#AF520C] bg-white text-zinc-800 placeholder:text-zinc-400 font-medium transition-all"
              value={info.satuan} 
              onChange={(e) => setInfo({ ...info, satuan: e.target.value })} 
              onFocus={() => setShowSatuanDropdown(true)}
              onBlur={() => setTimeout(() => setShowSatuanDropdown(false), 200)} 
              disabled={isFetchingMaster}
            />
            {showSatuanDropdown && (
              <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150 p-1 flex flex-col gap-0.5">
                {filteredSatuan.length > 0 ? (
                  filteredSatuan.map((sat) => (
                    <button
                      key={sat.id_satuan}
                      type="button"
                      onClick={() => setInfo({ ...info, satuan: sat.nama_satuan })}
                      className="w-full text-left px-3 py-2.5 text-sm font-semibold rounded-lg text-zinc-700 hover:bg-orange-50 hover:text-[#AF520C] transition-colors"
                    >
                      {sat.nama_satuan}
                    </button>
                  ))
                ) : info.satuan.trim() !== "" ? (
                  <div className="px-3 py-2.5 text-xs font-bold bg-zinc-50 rounded-lg flex flex-col gap-0.5 border border-zinc-100">
                    <span className="text-zinc-500">"{info.satuan}" belum terdaftar</span>
                    <span className="text-[10px] text-[#AF520C] font-semibold">Sistem akan otomatis membuat satuan baru ✨</span>
                  </div>
                ) : (
                  <div className="px-3 py-4 text-xs font-semibold text-zinc-400 text-center">
                    Ketik untuk mencari satuan...
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* 🚀 DISKON DINAMIS */}
          <div className="md:col-span-2">
            <label className="text-sm font-bold text-zinc-600 mb-2 flex items-center gap-2">
              <BadgePercent size={16} className="text-[#AF520C]"/> Diskon / Promo (Opsional)
            </label>
            <div className="relative">
              <select className="w-full border border-zinc-200 rounded-lg p-3 pr-10 text-sm focus:outline-none focus:border-[#AF520C] appearance-none bg-white cursor-pointer"
                value={info.diskon} onChange={(e) => setInfo({ ...info, diskon: e.target.value })} disabled={isFetchingMaster}>
                <option value="">- Tidak Menggunakan Diskon -</option>
                {diskonList.map(d => (
                  <option key={d.id_diskon} value={d.id_diskon.toString()}>{d.nama_diskon} ({d.besar_diskon}%)</option>
                ))}
              </select>
              {isFetchingMaster ? <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 animate-spin" /> : <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={18} />}
            </div>
          </div>

        </div>
        <div>
          <label className="text-sm font-bold text-zinc-600 mb-2 block">Deskripsi (Opsional)</label>
          <textarea rows={3} className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#AF520C] resize-none"
            value={info.deskripsi} onChange={(e) => setInfo({ ...info, deskripsi: e.target.value })}></textarea>
        </div>
      </div>

      {/* SPESIFIKASI BARANG & STOK OPNAME */}
      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
            <Package size={20} className="text-[#AF520C]" />
            Spesifikasi & Manajemen Stok
          </h2>
          <button onClick={addSpesifikasiRow} className="px-4 py-2 bg-orange-50 text-[#AF520C] rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-orange-100 transition">
            <Plus size={16} /> Tambah Varian Baru
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {spesifikasi.map((item, index) => (
            <div key={item.id} className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-sm group">
              <div className="p-5 border-b border-zinc-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-zinc-700 bg-zinc-100 px-3 py-1 rounded-full inline-block">Varian {index + 1}</h3>
                  {spesifikasi.length > 1 && (
                    <button onClick={() => removeSpesifikasiRow(item.id)} className="text-red-500 hover:text-red-700 transition flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100">
                      <Trash2 size={14} /> Hapus Varian
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-600 mb-2 block">Nama Atribut</label>
                    <input type="text" className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#AF520C] bg-white" 
                      value={item.atribut} onChange={(e) => updateSpesifikasi(item.id, "atribut", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-600 mb-2 block">Nilai Atribut</label>
                    <input type="text" className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#AF520C] bg-white" 
                      value={item.nilai} onChange={(e) => updateSpesifikasi(item.id, "nilai", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-600 mb-2 block">Harga Jual</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-semibold">Rp</span>
                      <input type="text" className="w-full border border-zinc-200 rounded-lg p-2.5 pl-8 text-sm focus:outline-none focus:border-[#AF520C]"
                        value={formatRupiah(item.hargaJual)} onChange={(e) => updateSpesifikasi(item.id, "hargaJual", e.target.value.replace(/\D/g, ""))} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-600 mb-2 block">Stok Sistem Saat Ini</label>
                    <input type="text" className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm bg-zinc-100 font-bold text-zinc-500 cursor-not-allowed" 
                      value={item.stokSekarang} readOnly title="Stok ini dikunci, gunakan Penyesuaian Stok untuk mengubah" />
                  </div>
                </div>
              </div>

              <div className="p-5 border-b border-zinc-100 bg-zinc-50/50">
                <h4 className="text-sm font-bold text-zinc-800 mb-4 flex items-center gap-2">
                  <RefreshCw size={16} className="text-zinc-600" />
                  Penyesuaian Stok Fisik
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-600 mb-2 block">Pilih Status Penyesuaian</label>
                    <div className="relative">
                      <select 
                        className={`w-full border rounded-lg p-2.5 pr-8 text-sm focus:outline-none appearance-none cursor-pointer font-semibold transition
                          ${item.statusStok === "1" ? "border-[#AF520C] text-[#AF520C] bg-orange-50/50" : 
                            item.statusStok === "0" ? "border-zinc-400 text-zinc-700 bg-zinc-100" : 
                            "border-zinc-300 bg-white hover:border-zinc-400"}`}
                        value={item.statusStok} 
                        onChange={(e) => {
                          updateSpesifikasi(item.id, "statusStok", e.target.value);
                          if(e.target.value === "") {
                            updateSpesifikasi(item.id, "jumlahUbah", "");
                            updateSpesifikasi(item.id, "keterangan", "");
                          }
                        }}
                      >
                        <option value="">- Tidak Ubah Stok -</option>
                        <option value="1">➕ Barang Masuk</option>
                        <option value="0">➖ Barang Keluar</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  {item.statusStok !== "" && (
                    <>
                      <div>
                        <label className="text-xs font-bold text-zinc-600 mb-2 flex items-center gap-1">
                          Jumlah {item.statusStok === "1" ? <ArrowDownToLine size={14} className="text-[#AF520C]"/> : <ArrowUpFromLine size={14} className="text-zinc-500"/>}
                        </label>
                        <input type="number" placeholder="Berapa qty?" className="w-full border border-zinc-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-zinc-400 bg-white"
                          value={item.jumlahUbah} onChange={(e) => updateSpesifikasi(item.id, "jumlahUbah", e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-zinc-600 mb-2 block">Keterangan / Alasan</label>
                        <input type="text" placeholder={item.statusStok === "1" ? "Cth: Tambahan dari Supplier..." : "Cth: Expired / Hilang / Rusak..."} 
                          className="w-full border border-zinc-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-zinc-400 bg-white"
                          value={item.keterangan} onChange={(e) => updateSpesifikasi(item.id, "keterangan", e.target.value)} />
                      </div>
                    </>
                  )}
                </div>
                
                {item.statusStok !== "" && item.jumlahUbah && (
                  <div className={`mt-4 px-4 py-2.5 rounded-lg border text-sm font-bold flex justify-between items-center transition
                    ${item.statusStok === "1" ? "bg-orange-50 text-[#AF520C] border-orange-200" : "bg-zinc-100 text-zinc-700 border-zinc-200"}`}>
                    <span>Estimasi Stok Akhir Setelah Disimpan:</span>
                    <span className="text-base">
                      {parseInt(item.stokSekarang) + (item.statusStok === "1" ? parseInt(item.jumlahUbah || "0") : -parseInt(item.jumlahUbah || "0"))}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 bg-white">
                <label className="text-xs font-bold text-zinc-600 flex items-center gap-1.5 mb-3">
                  <Barcode size={14} /> Pemetaan Barcode / SKU
                </label>
                <div className="flex flex-col gap-3">
                  {item.barcodes.map((bc: any) => (
                    <div key={bc.b_id} className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <input type="text" placeholder="Scan atau Ketik Barcode/SKU..." className="w-full border border-zinc-300 rounded-lg p-2.5 pl-3 text-sm focus:outline-none focus:border-[#AF520C] bg-white"
                          value={bc.code} onChange={(e) => updateBarcodeInSpek(item.id, bc.b_id, "code", e.target.value)} />
                        <button 
                          type="button"
                          onClick={() => setActiveScanner({ spekId: item.id, barcodeId: bc.b_id })}
                          className="absolute right-0 top-0 h-full px-3 text-zinc-400 hover:text-[#AF520C] border-l border-zinc-200 transition bg-zinc-50 hover:bg-orange-50 rounded-r-lg" 
                          title="Scan via Kamera"
                        >
                          <ScanLine size={16} />
                        </button>
                      </div>
                      <div className="w-32 relative">
                        <input type="number" placeholder="Qty" className="w-full border border-zinc-300 rounded-lg p-2.5 pr-8 text-sm focus:outline-none focus:border-[#AF520C] bg-white"
                          value={bc.qty} onChange={(e) => updateBarcodeInSpek(item.id, bc.b_id, "qty", e.target.value)} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-bold">Qty</span>
                      </div>
                      
                      {item.barcodes.length > 1 && (
                        <button onClick={() => removeBarcodeFromSpesifikasi(item.id, bc.b_id)} className="p-2.5 text-zinc-400 hover:text-red-500 transition">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <button onClick={() => addBarcodeToSpesifikasi(item.id)} className="mt-4 text-[#AF520C] text-xs font-bold flex items-center gap-1 hover:underline">
                  <Plus size={14} /> Tambah Relasi Barcode Lain
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
      {activeScanner && (
        <BarcodeScannerModal 
          onClose={() => setActiveScanner(null)}
          onScanSuccess={(decodedText) => {
            updateBarcodeInSpek(activeScanner.spekId, activeScanner.barcodeId, "code", decodedText);
            setActiveScanner(null);
          }}
        />
      )}
    </div>
  );
}