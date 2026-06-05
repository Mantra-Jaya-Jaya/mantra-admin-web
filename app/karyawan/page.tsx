"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, Trash2, Edit2, ChevronLeft, ChevronRight } from "lucide-react";

export default function KaryawanPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Semua Role");
  const [statusFilter, setStatusFilter] = useState("Aktif");

  const [dummyKaryawan, setDummyKaryawan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset page ke 1 kalau cari baru
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchKaryawan = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/admin/karyawan?limit=${itemsPerPage}&page=${currentPage}&search=${encodeURIComponent(debouncedSearch)}&role=${encodeURIComponent(roleFilter)}&status=${encodeURIComponent(statusFilter)}`);
      const result = await res.json();
      if (res.ok && result.data) {
        setDummyKaryawan(
          result.data.map((item: any) => ({
            id: item.public_id,
            nama: item.nama_lengkap,
            email: item.email,
            role: item.role,
            terakhirLogin: item.terakhir_login,
            status: item.status,
            inisial: item.inisial,
            fotoProfil: item.foto_profil
          }))
        );
        if (result.meta) {
          setTotalPages(result.meta.total_pages || 1);
          setTotalItems(result.meta.total || 0);
        }
      }
    } catch (err) {
      console.error("Gagal ambil data karyawan", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKaryawan();
  }, [currentPage, debouncedSearch, roleFilter, statusFilter]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = dummyKaryawan; // Data dari API sudah dipotong

  return (
    <div className="w-full pb-12">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-1">Daftar Karyawan</h1>
          <p className="text-sm text-zinc-500 font-medium">Kelola Karyawan Anda</p>
        </div>
        
        <Link 
          href="/karyawan/tambah" 
          className="flex items-center gap-2 px-5 py-2.5 bg-[#AF520C] text-white rounded-lg text-sm font-bold hover:bg-[#8e4209] transition shadow-sm"
        >
          <Plus size={18} />
          Tambah Karyawan
        </Link>
      </div>

      {/* FILTER BAR (Putih melengkung kayak di desain lu) */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Cari nama atau email karyawan..." // Kak Gem benerin copy-paste lu wkwk
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#AF520C]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dropdown Role */}
        <div className="w-full md:w-48">
          <select 
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#AF520C] appearance-none bg-white cursor-pointer"
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="Semua Role">Semua Role</option>
            <option value="Kasir">Kasir</option>
            <option value="Kurir">Kurir</option>
          </select>
        </div>

        {/* Dropdown Status */}
        <div className="w-full md:w-48">
          <select 
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#AF520C] appearance-none bg-white cursor-pointer"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="Aktif">Status Aktif</option>
            <option value="Semua Status">Semua Status</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* TABEL KARYAWAN */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Terakhir Login</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {currentData.map((user) => (
                <tr key={user.id} className="hover:bg-orange-50/30 transition">
                  {/* Kolom User (Foto + Nama + Email) */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 font-bold text-sm shrink-0 overflow-hidden">
                        {user.fotoProfil ? (
                          <img src={user.fotoProfil} alt={user.nama} className="w-full h-full object-cover" />
                        ) : (
                          user.inisial
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-zinc-800">{user.nama}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Kolom Role */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-zinc-700">{user.role}</span>
                  </td>
                  
                  {/* Kolom Terakhir Login */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-500">{user.terakhirLogin}</span>
                  </td>
                  
                  {/* Kolom Status (Badge) */}
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      user.status === "Aktif" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === "Aktif" ? "bg-green-500" : "bg-red-500"}`}></span>
                      {user.status}
                    </div>
                  </td>
                  
                  {/* Kolom Action */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button 
                        className="text-zinc-400 hover:text-red-500 transition" 
                        title="Hapus"
                        onClick={async () => {
                          if (confirm(`Hapus karyawan ${user.nama}?`)) {
                            const res = await fetch(`/api/v1/admin/karyawan/${user.id}`, { method: "DELETE" });
                            if (res.ok) fetchKaryawan();
                          }
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                      <Link href={`/karyawan/edit/${user.id}`} className="text-zinc-400 hover:text-blue-500 transition" title="Edit">
                        <Edit2 size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between bg-white">
          <p className="text-sm text-zinc-500">
            Menampilkan {totalItems === 0 ? 0 : startIndex + 1} hingga {startIndex + currentData.length} dari {totalItems} karyawan
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
              
              {/* Generate Angka Halaman Otomatis */}
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition ${
                    currentPage === i + 1 
                      ? "bg-[#AF520C] text-white font-bold shadow-sm" // Warna aktif
                      : "text-zinc-600 hover:bg-zinc-100" // Warna mati
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
      </div>

    </div>
  );
}