"use client";

import { useState, useEffect } from "react";
import { Save, Settings } from "lucide-react";

export default function PengaturanPage() {
  const [radius, setRadius] = useState("5");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/v1/admin/pengaturan")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.radius_kurir_internal) {
          setRadius(json.data.radius_kurir_internal);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/v1/admin/pengaturan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "radius_kurir_internal", value: radius }),
      });
      const json = await res.json();
      if (json.status === "success") {
        setMessage("Pengaturan berhasil disimpan!");
      } else {
        setMessage("Gagal: " + (json.message || "Unknown error"));
      }
    } catch {
      setMessage("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AF520C]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="text-[#AF520C]" size={28} />
        <h1 className="text-2xl font-bold text-zinc-800">Pengaturan Toko</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-zinc-700 mb-2">
            Radius Kurir Internal (km)
          </label>
          <p className="text-xs text-zinc-500 mb-3">
            Kurir toko hanya melayani pengiriman dalam radius ini dari toko. 
            Di luar radius ini, customer harus memilih ekspedisi eksternal.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="100"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="w-24 px-3 py-2 border border-zinc-300 rounded-lg text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#AF520C] focus:border-transparent"
            />
            <span className="text-zinc-600 font-medium">kilometer</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#AF520C] hover:bg-[#8e4209] disabled:bg-zinc-300 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <Save size={16} />
          {saving ? "Menyimpan..." : "Simpan"}
        </button>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.includes("berhasil") 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
