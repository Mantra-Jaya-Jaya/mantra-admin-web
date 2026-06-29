"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, LogOut } from 'lucide-react';
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname(); 
  const router = useRouter();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [adminData, setAdminData] = useState<{nama_lengkap: string; email: string; foto_profil: string} | null>(null);

  useEffect(() => {
    if (pathname === '/login') return;

    fetch('/api/v1/admin/profil')
      .then(res => res.json())
      .then(json => {
        if (json.status === "success" && json.data) {
          setAdminData(json.data);
        } else {
          setAdminData(null);
        }
      })
      .catch(() => setAdminData(null));
  }, [pathname]);

  // Saklar Otomatis: Kalau lagi di halaman login, Navbar langsung ngilang!
  if (pathname === '/login') return null;

  // Fungsi Logout
  const handleLogout = async () => {
    try {
      // Tinggal ketuk pintu agen rahasia Next.js kita, sisanya dia yang urus!
      await fetch('/api/v1/logout', { method: 'POST' });
    } catch (error) {
      console.error("Gagal manggil API logout lokal:", error);
    } finally {
      // Pake window.location.href biar browser ke-refresh total dan ngebuang state React yang nyangkut
      window.location.href = '/login'; 
    }
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm relative z-40">
      {/* Logo Kiri */}
      <div className="flex items-center gap-2">
        <Image 
          src="/logo_mantra.png" 
          alt="Logo Mantra" 
          width={32} 
          height={32} 
          className="object-contain" 
        />
        <span className="text-xl font-bold text-zinc-800">Mantra</span>
      </div>
      
      {/* Menu Kanan */}
      <div className="flex items-center gap-10">
        <div className="flex gap-10 text-zinc-500 font-medium text-sm">
          <Link href="/" className={`pb-1 transition ${pathname === '/' ? 'text-[#AF520C] border-b-2 border-[#AF520C]' : 'hover:text-zinc-800'}`}>
            Home
          </Link>
          <Link href="/barang" className={`pb-1 transition ${pathname === '/barang' || pathname.startsWith('/barang/') ? 'text-[#AF520C] border-b-2 border-[#AF520C]' : 'hover:text-zinc-800'}`}>
            Barang
          </Link>
          <Link href="/karyawan" className={`pb-1 transition ${pathname === '/karyawan' ? 'text-[#AF520C] border-b-2 border-[#AF520C]' : 'hover:text-zinc-800'}`}>
            Karyawan
          </Link>
          <Link href="/pengantaran" className={`pb-1 transition ${pathname === '/pengantaran' || pathname.startsWith('/pengantaran/') ? 'text-[#AF520C] border-b-2 border-[#AF520C]' : 'hover:text-zinc-800'}`}>
            Pengantaran
          </Link>
          <Link href="/ekspedisi" className={`pb-1 transition ${pathname === '/ekspedisi' || pathname.startsWith('/ekspedisi/') ? 'text-[#AF520C] border-b-2 border-[#AF520C]' : 'hover:text-zinc-800'}`}>
            Ekspedisi
          </Link>
        </div>
        
        <div className="flex items-center gap-4 border-l border-zinc-200 pl-6">
          <Link href="/notifikasi" className="p-2 bg-zinc-50 rounded-full text-zinc-500 hover:bg-zinc-100 transition">
            <Bell size={18} />
          </Link>
          
          {/* PROFILE SECTION DENGAN DROPDOWN */}
          <div className="relative">
            {/* Foto Profil (Bisa di-klik) */}
            <div 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 bg-zinc-200 rounded-full overflow-hidden border border-zinc-200 cursor-pointer hover:ring-2 hover:ring-[#AF520C]/50 transition-all"
            >
              <img src={adminData?.foto_profil || `https://ui-avatars.com/api/?name=${adminData?.nama_lengkap || 'User'}&background=171717&color=fff`} alt={adminData?.nama_lengkap || 'User'} className="w-full h-full object-cover" />
            </div>

            {/* Dropdown Menu (Muncul kalau state showProfileMenu === true) */}
            {showProfileMenu && (
              <>
                {/* Overlay transparan buat nutup menu kalau user klik di luar kotak */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                ></div>

                {/* Kotak Menu Dropdown */}
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-zinc-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Info User */}
                  <div className="px-3 py-3 border-b border-zinc-100 mb-2">
                    <p className="text-sm font-bold text-zinc-800">{adminData?.nama_lengkap}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{adminData?.email}</p>
                  </div>

                  {/* Link Profil */}
                  <Link
                    href="/profil"
                    className="block w-full text-center text-sm font-semibold text-zinc-700 hover:bg-zinc-50 px-4 py-2.5 rounded-lg transition-colors mb-1"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Profil
                  </Link>

                  {/* Tombol Logout Coklat */}
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-[#AF520C] hover:bg-[#8e4209] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}