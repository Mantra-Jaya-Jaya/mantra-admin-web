"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CloudUpload, ScanLine, Trash2, Plus, ChevronRight, ChevronDown, Package, Barcode, Loader2, Tag, BadgePercent } from "lucide-react"; 
import dynamic from "next/dynamic";
const BarcodeScannerModal = dynamic(() => import("@/components/BarcodeScanner"), {
  ssr: false,
});

export default function TambahBarangPage() {
  const router = useRouter();
  
  // 🚀 STATE FETCHING DATA MASTER (Kategori, Diskon, Satuan)
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [diskonList, setDiskonList] = useState<any[]>([]);
  const [satuanList, setSatuanList] = useState<any[]>([]);
  const [isFetchingMaster, setIsFetchingMaster] = useState(true);

  // STATE INFORMASI DASAR
  const [fileGambar, setFileGambar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // 🔥 Tambah atribut diskon di state info
  const [info, setInfo] = useState({ nama: "", hargaBeli: "", kategori: "", diskon: "", satuan: "", deskripsi: "" });
  
  // STATE SPESIFIKASI 
  const [spesifikasi, setSpesifikasi] = useState([
    { 
      id: 1, 
      atribut: "", 
      nilai: "", 
      stok: "", 
      hargaJual: "", 
      barcodes: [{ b_id: 101, code: "", qty: "1" }] 
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [showSatuanDropdown, setShowSatuanDropdown] = useState(false);

  const [activeScanner, setActiveScanner] = useState<{spekId: number, barcodeId: number} | null>(null);

  const filteredSatuan = satuanList.filter(sat => 
  sat.nama_satuan.toLowerCase().includes(info.satuan.toLowerCase())
  );

  // 🚀 FETCH DATA MASTER SAAT HALAMAN DIBUKA
  useEffect(() => {
    const fetchMasterData = async () => {
      setIsFetchingMaster(true);
      try {
        // Ambil Kategori
        const resKat = await fetch("/api/v1/admin/kategori");
        const jsonKat = await resKat.json();
        if (resKat.ok && jsonKat.data) setKategoriList(jsonKat.data);

        // Ambil Diskon Aktif
        const resDisk = await fetch("/api/v1/admin/diskon");
        const jsonDisk = await resDisk.json();
        if (resDisk.ok && jsonDisk.data) setDiskonList(jsonDisk.data);

        // Ambil Satuan (Pastikan lu udah bikin endpoint GET /satuan di backend ya!)
        const resSat = await fetch("/api/v1/admin/satuan");
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

  const formatRupiah = (value: any) => {
    if (!value) return "";
    const angkaMurni = value.toString().replace(/\D/g, "");
    if (!angkaMurni) return "";
    return new Intl.NumberFormat('id-ID').format(angkaMurni);
  };

  // --- 🚀 HANDLER FILE ---
  const processFile = (file: File | undefined) => {
    setErrorMsg("");
    if (!file) return;
    if (!file.type.startsWith("image/")) return setErrorMsg("⚠️ Format file tidak didukung (JPG/PNG).");
    if (file.size > 1024 * 1024) return setErrorMsg("⚠️ Ukuran gambar maksimal 1 MB.");

    setFileGambar(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files?.[0]); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => processFile(e.target.files?.[0]);
  const hapusGambar = () => { setFileGambar(null); setPreviewUrl(""); };

  // --- HANDLER SPESIFIKASI & BARCODE ---
  const addSpesifikasiRow = () => {
    setSpesifikasi([...spesifikasi, { id: Date.now(), atribut: "", nilai: "", stok: "", hargaJual: "", barcodes: [{ b_id: Date.now() + 1, code: "", qty: "1" }] }]);
  };
  const removeSpesifikasiRow = (id: number) => setSpesifikasi(spesifikasi.filter(s => s.id !== id));
  const updateSpesifikasi = (id: number, field: string, value: any) => setSpesifikasi(spesifikasi.map(s => s.id === id ? { ...s, [field]: value } : s));
  
  const addBarcodeToSpesifikasi = (spekId: number) => setSpesifikasi(spesifikasi.map(s => s.id === spekId ? { ...s, barcodes: [...s.barcodes, { b_id: Date.now(), code: "", qty: "1" }] } : s));
  const removeBarcodeFromSpesifikasi = (spekId: number, barcodeId: number) => setSpesifikasi(spesifikasi.map(s => s.id === spekId ? { ...s, barcodes: s.barcodes.filter(b => b.b_id !== barcodeId) } : s));
  const updateBarcodeInSpek = (spekId: number, barcodeId: number, field: string, value: any) => setSpesifikasi(spesifikasi.map(s => s.id === spekId ? { ...s, barcodes: s.barcodes.map(b => b.b_id === barcodeId ? { ...b, [field]: value } : b) } : s));

  // --- 🚀 LOGIKA SIMPAN API KE GOLANG ---
  const handleSimpan = async () => {
    setErrorMsg("");

    if (!info.nama || !info.hargaBeli || !info.kategori || !info.satuan) {
      return setErrorMsg("Semua kolom Informasi Barang wajib diisi (kecuali deskripsi & diskon).");
    }

    setLoading(true);

    try {
      let finalMediaUrl = "";

      if (fileGambar) {
        const formData = new FormData();
        formData.append("gambar", fileGambar);
        const uploadRes = await fetch("/api/v1/admin/barang/upload", { method: "POST", body: formData });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.message || "Gagal mengunggah gambar.");
        finalMediaUrl = uploadJson.url; 
      }

      const payload = {
        media: finalMediaUrl, 
        informasi_barang: {
          nama: info.nama,
          hargaBeli: info.hargaBeli,
          kategori: info.kategori,
          diskon: info.diskon, // 🔥 Diskon masuk payload
          satuan: info.satuan,
          deskripsi: info.deskripsi
        },
        spesifikasi: spesifikasi.map(spek => ({
          atribut: spek.atribut,
          nilai: spek.nilai,
          stok: spek.stok.toString(),
          hargaJual: spek.hargaJual.toString(),
          barcodes: spek.barcodes.map(bc => ({
            code: bc.code,
            qty: bc.qty.toString()
          }))
        }))
      };

      const res = await fetch("/api/v1/admin/barang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan data barang.");

      router.push("/barang");

    } catch (error: any) {
      console.error("Save error:", error);
      setErrorMsg(error.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full pb-12"> 
      
      {/* Header Halaman */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Tambah Barang Baru</h1>
          <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
            <Link href="/barang" className="hover:text-[#AF520C] transition">Barang</Link>
            <ChevronRight size={14} />
            <span className="text-[#AF520C]">Tambah Barang</span>
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
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full border-2 border-dashed rounded-xl p-1 relative flex flex-col items-center justify-center text-center transition cursor-pointer overflow-hidden min-h-60
            ${isDragging ? "border-[#AF520C] bg-orange-50" : "border-zinc-300 hover:bg-zinc-50"}
          `}
        >
          <input type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleFileChange} />
          {previewUrl ? (
            <div className="w-full h-full absolute inset-0 flex items-center justify-center bg-zinc-100">
               <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
            </div>
          ) : (
            <div className="flex flex-col items-center p-12 pointer-events-none">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition ${isDragging ? "bg-[#AF520C] text-white" : "bg-orange-50 text-[#AF520C]"}`}>
                <CloudUpload size={28} />
              </div>
              <p className="font-bold text-zinc-700 mb-1">
                {isDragging ? "Lepaskan gambar di sini!" : "Tarik & Lepas, atau Klik File"}
              </p>
              <p className="text-sm text-zinc-400 max-w-xs">Gunakan format JPG, PNG. (Maks. 1MB)</p>
            </div>
          )}
        </label>
        
        {previewUrl && (
          <div className="mt-3 flex justify-end">
            <button onClick={hapusGambar} className="text-sm text-red-500 font-bold hover:text-red-700 flex items-center gap-1">
              <Trash2 size={16} /> Hapus Gambar
            </button>
          </div>
        )}
      </div>

      {/* INFORMASI BARANG */}
      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-zinc-800 mb-6">Informasi Dasar Barang</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          <div>
            <label className="text-sm font-bold text-zinc-600 mb-2 block">Nama barang</label>
            <input type="text" placeholder="Masukkan nama barang" className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#AF520C]" 
              value={info.nama} onChange={(e) => setInfo({ ...info, nama: e.target.value })} />
          </div>
          
          <div>
            <label className="text-sm font-bold text-zinc-600 mb-2 block">Total Harga Beli (Modal Induk)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">Rp</span>
              <input type="text" placeholder="0" className="w-full border border-zinc-200 rounded-lg p-3 pl-10 text-sm focus:outline-none focus:border-[#AF520C]" 
                value={formatRupiah(info.hargaBeli)} onChange={(e) => setInfo({ ...info, hargaBeli: e.target.value.replace(/\D/g, "") })} />
            </div>
          </div>

          {/* 🚀 DROPDOWN KATEGORI DINAMIS */}
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

          {/* 🚀 FITUR SATUAN AUTOCOMPLETE */}
          <div className="relative">
            <label className="text-sm font-bold text-zinc-600 mb-2 flex items-center gap-2">Satuan Dasar</label>
            <input 
              type="text" 
              placeholder="Ketik atau pilih satuan (Pcs, Box...)" 
              className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#AF520C] bg-white text-zinc-800 placeholder:text-zinc-400 font-medium transition-all"
              value={info.satuan} 
              onChange={(e) => setInfo({ ...info, satuan: e.target.value })} 
              onFocus={() => setShowSatuanDropdown(true)}
              // 🔥 Trick onBlur pake setTimeout 200ms agar event onClick di dalam menu sempat tereksekusi sebelum ditutup
              onBlur={() => setTimeout(() => setShowSatuanDropdown(false), 200)} 
              disabled={isFetchingMaster}
            />
            
            {/* POPUP DROPDOWN CUSTOM OVERLAY */}
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
                  // ✨ NOTIFIKASI SMART JIKA SATUAN BELUM ADA DI DB GOLANG
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

          {/* 🚀 DROPDOWN DISKON DINAMIS */}
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
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={18} />
            </div>
          </div>

        </div>

        <div>
          <label className="text-sm font-bold text-zinc-600 mb-2 block">Deskripsi (Opsional)</label>
          <textarea rows={4} placeholder="Tuliskan deskripsi lengkap barang..." className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#AF520C] resize-none"
            value={info.deskripsi} onChange={(e) => setInfo({ ...info, deskripsi: e.target.value })}></textarea>
        </div>
      </div>

      {/* SPESIFIKASI BARANG & BARCODE */}
      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
            <Package size={20} className="text-[#AF520C]" />
            Spesifikasi & Relasi Barcode
          </h2>
          <button onClick={addSpesifikasiRow} className="px-4 py-2 bg-orange-50 text-[#AF520C] rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-orange-100 transition">
            <Plus size={16} /> Tambah Varian
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {spesifikasi.map((item, index) => (
            <div key={item.id} className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-sm group">
              
              <div className="p-5 border-b border-zinc-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-zinc-700 bg-zinc-100 px-3 py-1 rounded-full">Varian {index + 1}</h3>
                  {spesifikasi.length > 1 && (
                    <button onClick={() => removeSpesifikasiRow(item.id)} className="text-red-500 hover:text-red-700 transition flex items-center gap-1 text-xs font-bold">
                      <Trash2 size={14} /> Hapus Varian
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-600 mb-2 block">Nama Atribut</label>
                    <input type="text" placeholder="Cth: Ukuran / Rasa" className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#AF520C]"
                      value={item.atribut} onChange={(e) => updateSpesifikasi(item.id, "atribut", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-600 mb-2 block">Nilai Atribut</label>
                    <input type="text" placeholder="Cth: 100ml / Pedas" className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#AF520C]"
                      value={item.nilai} onChange={(e) => updateSpesifikasi(item.id, "nilai", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-600 mb-2 block">Total Stok Fisik</label>
                    <input type="number" placeholder="0" className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#AF520C]"
                      value={item.stok} onChange={(e) => updateSpesifikasi(item.id, "stok", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-600 mb-2 block">Harga Jual Dasar</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-semibold">Rp</span>
                      <input type="text" placeholder="0" className="w-full border border-zinc-200 rounded-lg p-2.5 pl-8 text-sm focus:outline-none focus:border-[#AF520C]"
                        value={formatRupiah(item.hargaJual)} onChange={(e) => updateSpesifikasi(item.id, "hargaJual", e.target.value.replace(/\D/g, ""))} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-zinc-50">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
                    <Barcode size={14} /> Pemetaan Barcode & Kuantitas
                  </label>
                </div>
                
                <div className="flex flex-col gap-3">
                  {item.barcodes.map((bc) => (
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

      {/*SCANNER KAMERA */}
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