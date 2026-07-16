"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UbahPasswordPage() {
  const router = useRouter();
  const [pwForm, setPwForm] = useState({
    password_lama: "",
    password_baru: "",
    konfirmasi_password: "",
  });
  const [pwChanging, setPwChanging] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const handleUbahPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwChanging(true);
    setPwError("");
    setPwSuccess("");

    if (!pwForm.password_lama || !pwForm.password_baru || !pwForm.konfirmasi_password) {
      setPwError("Semua field harus diisi");
      setPwChanging(false);
      return;
    }

    if (pwForm.password_baru.length < 8) {
      setPwError("Password baru minimal 8 karakter");
      setPwChanging(false);
      return;
    }

    if (pwForm.password_baru !== pwForm.konfirmasi_password) {
      setPwError("Konfirmasi password tidak cocok");
      setPwChanging(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/change-password", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "X-Client-Type": "nextjs"
        },
        body: JSON.stringify(pwForm),
      });
      const json = await res.json();
      if (res.ok && json.status === "success") {
        setPwSuccess("Password berhasil diubah. Mengalihkan ke halaman login...");
        setPwForm({ password_lama: "", password_baru: "", konfirmasi_password: "" });
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setPwError(json.message || "Gagal mengubah password");
      }
    } catch {
      setPwError("Gagal terhubung ke server");
    } finally {
      setPwChanging(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          href="/profil"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-[#AF520C] transition"
        >
          <ArrowLeft size={16} />
          Kembali ke Profil
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#AF520C]/10 text-[#AF520C] rounded-lg">
            <Lock size={20} />
          </div>
          <h1 className="text-xl font-bold text-zinc-800">Ubah Password</h1>
        </div>

        {pwError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2 flex-row animate-in fade-in">
            <X size={16} className="shrink-0" /> <span>{pwError}</span>
          </div>
        )}
        {pwSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2 flex-row animate-in fade-in">
            <Check size={16} className="shrink-0" /> <span>{pwSuccess}</span>
          </div>
        )}

        <form onSubmit={handleUbahPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
              Password Lama
            </label>
            <input
              type="password"
              required
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#AF520C] focus:ring-2 focus:ring-[#AF520C]/20"
              value={pwForm.password_lama}
              onChange={(e) => setPwForm({ ...pwForm, password_lama: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
              Password Baru (Min. 8 karakter)
            </label>
            <input
              type="password"
              required
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#AF520C] focus:ring-2 focus:ring-[#AF520C]/20"
              value={pwForm.password_baru}
              onChange={(e) => setPwForm({ ...pwForm, password_baru: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              required
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#AF520C] focus:ring-2 focus:ring-[#AF520C]/20"
              value={pwForm.konfirmasi_password}
              onChange={(e) => setPwForm({ ...pwForm, konfirmasi_password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={pwChanging}
            className="flex items-center justify-center gap-2 bg-[#AF520C] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#924300] transition disabled:opacity-60 w-full"
          >
            {pwChanging ? "Mengubah..." : "Ubah Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
