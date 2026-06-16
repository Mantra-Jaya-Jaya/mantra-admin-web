"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{
    id_user: number;
    username: string;
    email: string;
    nama_lengkap: string;
    foto_profil: string;
    nama_role: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ nama_lengkap: "", email: "", username: "" });

  useEffect(() => {
    fetch("/api/v1/admin/profil")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setProfile(json.data);
          setForm({
            nama_lengkap: json.data.nama_lengkap || "",
            email: json.data.email || "",
            username: json.data.username || "",
          });
        }
      })
      .catch(() => setError("Gagal memuat profil"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/v1/admin/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (res.ok && json.status === "success") {
        setSuccess("Profil berhasil diperbarui");
        setEditMode(false);
        if (json.data) {
          setProfile((prev) => prev ? { ...prev, ...json.data } : null);
        }
      } else {
        setError(json.message || "Gagal menyimpan");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-500">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">Profil Admin</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-zinc-200 rounded-full overflow-hidden">
            <img
              src={profile?.foto_profil || `https://ui-avatars.com/api/?name=${profile?.nama_lengkap || "Admin"}&background=AF520C&color=fff`}
              alt="Foto Profil"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-lg font-bold text-zinc-800">{profile?.nama_lengkap}</p>
            <p className="text-sm text-zinc-500">{profile?.nama_role}</p>
          </div>
        </div>

        {editMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#AF520C] focus:ring-2 focus:ring-[#AF520C]/20"
                value={form.nama_lengkap}
                onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#AF520C] focus:ring-2 focus:ring-[#AF520C]/20"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Username</label>
              <input
                type="text"
                className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#AF520C] focus:ring-2 focus:ring-[#AF520C]/20"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#AF520C] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#924300] transition disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="border border-zinc-300 text-zinc-700 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-50 transition"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
              <span className="text-zinc-500 font-medium">Username</span>
              <span className="text-zinc-800">{profile?.username}</span>
              <span className="text-zinc-500 font-medium">Email</span>
              <span className="text-zinc-800">{profile?.email}</span>
              <span className="text-zinc-500 font-medium">Nama Lengkap</span>
              <span className="text-zinc-800">{profile?.nama_lengkap}</span>
              <span className="text-zinc-500 font-medium">Role</span>
              <span className="text-zinc-800">{profile?.nama_role}</span>
            </div>
            <button
              onClick={() => setEditMode(true)}
              className="bg-[#AF520C] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#924300] transition mt-4"
            >
              Edit Profil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
