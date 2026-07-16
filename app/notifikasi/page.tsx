"use client";
import { useState, useEffect } from "react";
import { CheckCheck, Loader2 } from "lucide-react";
import NotificationItem from "@/components/NotificationItem";

export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // 🚀 NGE-FETCH DATA DARI GOLANG
  useEffect(() => {
    const fetchNotifikasi = async () => {
      try {
        // Sesuaikan URL-nya dengan nama grup route admin lu
        const res = await fetch("/api/v1/admin/notifikasi");
        const json = await res.json();
        
        if (res.ok && json.data) {
          // Tambahin isRead manual, karena dari Golang belum ngirim status dibaca/belum
          const dataWithReadStatus = json.data.map((n: any) => ({
            ...n,
            isRead: n.status === "read" // Anggap aja kalau "read" berarti true
          }));
          setNotifications(dataWithReadStatus);
        } else {
          setErrorMsg(json.message || "Gagal memuat notifikasi dari server.");
        }
      } catch (err) {
        console.error("Fetch notifikasi error:", err);
        setErrorMsg("Gagal terhubung ke API Server. Pastikan backend Golang aktif!");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifikasi();
  }, []);

  const markAllAsRead = async () => {
    const unreadSys = notifications.filter(
      n => !n.isRead && typeof n.id_notifikasi === 'string' && n.id_notifikasi.startsWith('SYS-')
    );

    await Promise.all(
      unreadSys.map(n => {
        const id = n.id_notifikasi.replace('SYS-', '');
        return fetch(`/api/v1/admin/notifikasi/${id}/baca`, { method: 'PATCH' });
      })
    );

    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const dismissNotification = async (idTarget: string) => {
    setNotifications(prev => prev.filter(n => n.id_notifikasi !== idTarget));

    if (idTarget.startsWith('SYS-')) {
      const id = idTarget.replace('SYS-', '');
      await fetch(`/api/v1/admin/notifikasi/${id}`, { method: 'DELETE' });
    }
  };

  return (
    <div className="w-full pb-12">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-1">Notifikasi</h1>
          <p className="text-sm text-zinc-500 font-medium">Pantau peringatan & update sistem secara real-time.</p>
        </div>
        
        <button 
          onClick={markAllAsRead}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-bold hover:bg-zinc-200 transition"
        >
          <CheckCheck size={16} />
          Mark All as Read
        </button>
      </div>

      {errorMsg && (
        <div className="w-full p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-semibold mb-6">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* CONTAINER LIST NOTIFIKASI */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden mb-6">
        {loading ? (
           <div className="p-12 flex flex-col items-center justify-center text-zinc-400 gap-3">
             <Loader2 className="animate-spin text-[#AF520C]" size={40} />
             <p className="font-bold text-sm text-zinc-700">Menarik data dari server...</p>
           </div>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
            <NotificationItem 
              key={notif.id_notifikasi} 
              notif={notif} 
              onDismiss={dismissNotification} 
            />
          ))
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <CheckCheck size={40} className="text-zinc-300 mb-3" />
            <p className="text-sm font-bold text-zinc-500">Semua aman terkendali!</p>
            <p className="text-xs text-zinc-400 mt-1">Belum ada peringatan stok atau notifikasi sistem hari ini.</p>
          </div>
        )}
      </div>

    </div>
  );
}