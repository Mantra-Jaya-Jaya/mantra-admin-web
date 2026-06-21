"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🚀 LOGIKA PARALLAX (Bikin Awan Interaktif Ngikutin Mouse)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const xOffset = (clientX / window.innerWidth - 0.5) * 2; 
    const yOffset = (clientY / window.innerHeight - 0.5) * 2;
    mouseX.set(xOffset);
    mouseY.set(yOffset);
  };

  // Kecepatan gerak awan transparan (belakang) - Lebih lambat
  const bgCloudX = useTransform(mouseX, [-1, 1], [-8, 8]);
  const bgCloudY = useTransform(mouseY, [-1, 1], [-8, 8]);

  // Kecepatan gerak awan solid (depan) - Lebih cepat biar terasa 3D
  const fgCloudX = useTransform(mouseX, [-1, 1], [-20, 20]);
  const fgCloudY = useTransform(mouseY, [-1, 1], [-20, 20]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/v1/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Client-Type": "nextjs"
        },
        body: JSON.stringify(formData), 
      });
      
      const data = await res.json();
      
      if (res.ok && data.status === "success") {
        const role = data?.data?.user?.role;
        if (role !== "admin") {
          setErrorMsg("Akun ini bukan admin. Silakan login dengan akun admin.");
          setLoading(false);
          return;
        }
        setIsSuccess(true); 
        setTimeout(() => {
          router.push("/"); 
        }, 1200);
      } else {
        setErrorMsg(data.message || "Login gagal, silakan coba lagi.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Gagal terhubung ke server. Pastikan API Golang sudah menyala!");
      setLoading(false);
    }
  };

  return (
    // 🚀 Pasang onMouseMove di wadah paling luar
    <div onMouseMove={handleMouseMove} className="fixed inset-0 z-50 flex flex-col md:flex-row font-sans antialiased bg-white overflow-hidden">
      
      {/* 🚀 ANIMASI AWAN LEWAT SAAT LOGIN SUKSES */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ y: "100%", borderRadius: "100% 100% 0 0" }}
            animate={{ y: "0%", borderRadius: "0% 0% 0 0" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-100 bg-white flex flex-col justify-center items-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-[#AF520C] rounded-full flex items-center justify-center mb-4 shadow-xl">
                <img src="/logo_mantra.png" alt="Logo Mantra" className="w-12 h-12 object-contain filter brightness-0 invert" />
              </div>
              <h2 className="text-2xl font-bold text-[#301905]">Membuka Core System...</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BAGIAN KIRI (Gradient + Efek Tirai Geser & Awan Original Lu) */}
      <motion.div 
        initial={{ x: "-100%" }} // Efek tirai putih di awal
        animate={{ x: 0 }}       
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:flex w-full md:w-1/2 flex-col justify-center items-center text-white p-12 relative bg-linear-to-b from-[#924300] to-[#BF8040] overflow-hidden z-20"
      >
        {/* Konten Text Kiri */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="z-30 flex flex-col items-center text-center max-w-md relative"
        >
          <h2 className="text-3xl font-normal mb-8 text-white/90">Welcome to</h2>
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-white/30 overflow-hidden">
            <img src="/logo_mantra.png" alt="Logo Mantra" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6">Mantra</h1>
          <p className="text-sm text-white/85 leading-relaxed font-light px-8">
            Login ke panel admin untuk mengelola stok barang, karyawan, dan memantau transaksi harian Anda.
          </p>
        </motion.div>

        {/* 🚀 AWAN ORIGINAL HAMIM (Tapi udah di-convert ke px & dipasang Parallax) */}
        <div className="absolute top-0 right-0 h-full w-full pointer-events-none z-10 overflow-hidden">
          
          {/* Layer Awan Solid (Depan) - Gerak Cepat */}
          <motion.div style={{ x: fgCloudX, y: fgCloudY }} className="absolute inset-0 w-full h-full">
            <div className="absolute -right-20 top-[-5%] w-62.5 h-62.5 rounded-full bg-white "></div>
            <div className="absolute right-0 top-[-15%] w-50 h-50 rounded-full bg-white "></div>
            <div className="absolute -right-25 top-[10%] w-37.5 h-37.5 rounded-full bg-white "></div>
            <div className="absolute -right-25 top-[20%] w-37.5 h-37.5 rounded-full bg-white "></div>
            <div className="absolute -right-30 top-[28%] w-45 h-45 rounded-full bg-white "></div>
            <div className="absolute -right-30 top-[40%] w-37.5 h-37.5 rounded-full bg-white "></div>
            <div className="absolute -right-25 top-[55%] w-25 h-25 rounded-full bg-white "></div>
            <div className="absolute -right-25 top-[65%] w-50 h-50 rounded-full bg-white "></div>
            <div className="absolute -right-20 bottom-[30%] w-37.5 h-37.5 rounded-full bg-white "></div>
            <div className="absolute right-[-10%] bottom-[-15%] w-87.5 h-87.5 rounded-full bg-white "></div>
          </motion.div>

          {/* Layer Awan Transparan (Belakang) - Gerak Lambat */}
          <motion.div style={{ x: bgCloudX, y: bgCloudY }} className="absolute inset-0 w-full h-full opacity-60">
            <div className="absolute right-[-5%] bottom-[5%] w-62.5 h-62.5 rounded-full bg-white"></div>
            <div className="absolute right-[-3%] bottom-[30%] w-37.5 h-37.5 rounded-full bg-white"></div>
            <div className="absolute right-[-5%] bottom-[43%] w-25 h-25 rounded-full bg-white"></div>
            <div className="absolute right-[-4%] top-[40%] w-25 h-25 rounded-full bg-white"></div>
            <div className="absolute right-[-4%] top-[30%] w-37.5 h-37.5 rounded-full bg-white"></div>
            <div className="absolute right-[-4%] top-[10%] w-50.5 h-50.5 rounded-full bg-white"></div>
          </motion.div>

        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-10 text-xs text-white/60 font-semibold tracking-widest z-30"
        >
          ADMIN PANEL | V1.0
        </motion.div>
      </motion.div>

      {/* BAGIAN KANAN (Form Login) */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 1 }}
        className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-24 py-12 relative z-10 bg-white"
      >
        <div className="max-w-md w-full mx-auto">
          <div className="md:hidden flex justify-center mb-8">
            <div className="w-20 h-20 bg-[#AF520C] rounded-full flex items-center justify-center shadow-lg">
               <img src="/logo_mantra.png" alt="Logo Mantra" className="w-12 h-12 object-contain filter brightness-0 invert" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-[#301905] mb-2 text-center md:text-left">Welcome Back</h2>
          <p className="text-zinc-500 mb-10 text-center md:text-left text-sm">Silakan masukkan detail akun Anda.</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#301905] ml-1">Username</label>
              <input
                type="text"
                required
                spellCheck="false"
                placeholder="Enter your username"
                className="w-full border border-zinc-200 bg-zinc-50/50 rounded-2xl px-5 py-3.5 text-sm text-zinc-900 focus:outline-none focus:border-[#AF520C] focus:ring-4 focus:ring-[#AF520C]/10 transition-all placeholder:text-zinc-400"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#301905] ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  className="w-full border border-zinc-200 bg-zinc-50/50 rounded-2xl px-5 py-3.5 pr-12 text-sm text-zinc-900 focus:outline-none focus:border-[#AF520C] focus:ring-4 focus:ring-[#AF520C]/10 transition-all placeholder:text-zinc-400"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 text-[#AF520C] focus:ring-[#AF520C] cursor-pointer" />
                <span className="text-xs text-zinc-500 font-medium group-hover:text-zinc-800 transition">Remember me</span>
              </label>
              <button type="button" className="text-xs text-[#AF520C] font-bold hover:underline">Lupa Password?</button>
            </div>

            {errorMsg && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 bg-red-50 border border-red-100 p-3 rounded-xl text-xs font-semibold leading-relaxed"
              >
                {errorMsg}
              </motion.p>
            )}

            <div className="mt-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || isSuccess}
                className="w-full flex items-center justify-center gap-2 bg-[#AF520C] text-white font-bold py-4 rounded-2xl hover:bg-[#924300] transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm shadow-xl shadow-[#AF520C]/20"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>

    </div>
  );
}