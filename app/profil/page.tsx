"use client";
import { useState, useEffect } from "react";
import { Camera, Check, X, User, Mail, AtSign, Shield } from "lucide-react";

export default function ProfilePage() {
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
  const [uploading, setUploading] = useState(false);

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

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/v1/admin/profil/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.status === "success") {
        setProfile((prev) => prev ? { ...prev, foto_profil: json.data.url } : null);
        setSuccess("Foto profil berhasil diperbarui");
      } else {
        setError(json.message || "Gagal upload foto");
      }
    } catch {
      setError("Gagal upload foto");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AF520C]" />
      </div>
    );
  }

  const fieldIcon = (label: string) => {
    switch (label) {
      case "nama_lengkap": return <User size={16} className="text-zinc-400 shrink-0" />;
      case "email": return <Mail size={16} className="text-zinc-400 shrink-0" />;
      case "username": return <AtSign size={16} className="text-zinc-400 shrink-0" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">Profil Admin</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          <X size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          <Check size={16} /> {success}
        </div>
      )}

      {/* KARTU FOTO & INFO DASAR */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 bg-zinc-100 rounded-full overflow-hidden border-2 border-zinc-200">
              {profile?.foto_profil ? (
                <img
                  src={profile.foto_profil}
                  alt="Foto Profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                  <User size={32} />
                </div>
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Camera size={20} className="text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFotoUpload}
                disabled={uploading}
              />
            </label>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              </div>
            )}
          </div>
          <div>
            <p className="text-xl font-bold text-zinc-800">{profile?.nama_lengkap}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Shield size={14} className="text-[#AF520C]" />
              <span className="text-sm font-medium text-[#AF520C]">{profile?.nama_role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KARTU INFORMASI AKUN */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <h2 className="text-lg font-bold text-zinc-800 mb-4">Informasi Akun</h2>

        {editMode ? (
          <div className="space-y-4">
            {["nama_lengkap", "email", "username"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5 capitalize">
                  {field.replace("_", " ")}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    {fieldIcon(field)}
                  </div>
                  <input
                    type={field === "email" ? "email" : "text"}
                    className="w-full border border-zinc-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#AF520C] focus:ring-2 focus:ring-[#AF520C]/20"
                    value={form[field as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  />
                </div>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-[#AF520C] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#924300] transition disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Simpan
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  if (profile) {
                    setForm({
                      nama_lengkap: profile.nama_lengkap,
                      email: profile.email,
                      username: profile.username,
                    });
                  }
                }}
                className="flex items-center gap-2 border border-zinc-300 text-zinc-700 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-50 transition"
              >
                <X size={16} />
                Batal
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-zinc-100">
              {[
                { label: "Nama Lengkap", value: profile?.nama_lengkap, icon: User },
                { label: "Username", value: profile?.username, icon: AtSign },
                { label: "Email", value: profile?.email, icon: Mail },
                { label: "Role", value: profile?.nama_role, icon: Shield },
              ].map((item) => (
                <div key={item.label} className="flex items-center py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 w-40">
                    <item.icon size={16} className="text-[#AF520C]" />
                    <span className="text-sm font-medium text-zinc-500">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-zinc-800">{item.value || "-"}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setEditMode(true)}
              className="mt-5 bg-[#AF520C] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#924300] transition"
            >
              Edit Profil
            </button>
          </>
        )}
      </div>
    </div>
  );
}
