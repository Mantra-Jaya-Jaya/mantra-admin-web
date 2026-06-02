import { AlertTriangle, Info } from "lucide-react";
// 🚀 1. WAJIB IMPORT LINK DARI NEXT.JS
import Link from "next/link"; 

export default function NotificationItem({ notif, onDismiss }: { notif: any, onDismiss: any }) {
  // 🚀 Deteksi tipe dari data Golang (STK = Stock, SYS = System)
  const isStock = notif.id_notifikasi?.toString().startsWith("STK") || notif.judul === "Stok Menipis";

  const getIcon = () => {
    if (isStock) {
      return <AlertTriangle size={20} className="text-red-500" />;
    }
    return <Info size={20} className="text-blue-500" />; // Default icon
  };

  // 🚀 Format Tanggal biar estetik
  const formatTime = (dateString: string) => {
    if (!dateString) return "Baru saja";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  return (
    <div className={`relative flex gap-4 p-6 border-b border-zinc-100 last:border-0 transition-colors hover:bg-zinc-50/50 ${notif.isRead ? 'opacity-70' : 'bg-white'}`}>
      
      {/* Indikator Unread */}
      {!notif.isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#AF520C] rounded-l-xl"></div>
      )}

      {/* Ikon */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isStock ? "bg-red-50" : "bg-blue-50"}`}>
        {getIcon()}
      </div>

      {/* Konten Text */}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className={`text-sm ${notif.isRead ? 'font-semibold text-zinc-700' : 'font-bold text-zinc-900'}`}>
            {notif.judul}
          </h3>
          <span className="text-[11px] text-zinc-400 font-medium whitespace-nowrap ml-4">
            {formatTime(notif.created_at)}
          </span>
        </div>
        
        <p className="text-xs text-zinc-500 leading-relaxed max-w-3xl mb-3">
          {notif.pesan}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4">
          
          {/* 🚀 2. TOMBOL SAKTI: Lempar ke route [publicId] */}
          {isStock && notif.public_id && (
            <Link 
              href={`/barang/detail/${notif.public_id}`} 
              className="text-[10px] font-bold text-[#AF520C] uppercase tracking-wider hover:underline"
            >
              Cek Barang
            </Link>
          )}
          
          <button 
            onClick={() => onDismiss(notif.id_notifikasi)}
            className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider hover:text-zinc-600 transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}