# Mantra Admin Web Dashboard ☕🧑‍💻

Mantra Admin Web Dashboard adalah antarmuka web modern yang digunakan untuk mengelola keseluruhan operasional kedai kopi "Mantra". Dibangun menggunakan teknologi web terkini untuk memberikan pengalaman pengguna (UX) yang cepat, interaktif, dan premium.

Panel admin ini merupakan bagian dari ekosistem Mantra, terhubung langsung dengan **Mantra Backend (Golang)** untuk sinkronisasi data *real-time* ke **Mantra Mobile App (Flutter)**.

## 🌟 Fitur Utama

- **Manajemen Dashboard & Analitik**: Menampilkan ringkasan pendapatan, grafik penjualan (dengan Recharts), dan laporan performa toko.
- **Manajemen Karyawan**: Menambah, mengedit, dan menghapus (atau menonaktifkan) akun karyawan (Kasir & Kurir) beserta rol dan aksesnya.
- **Manajemen Produk & Katalog**: Mengelola daftar menu kopi, spesifikasi barang, harga, dan ketersediaan stok.
- **Manajemen Pesanan & Pengantaran**: Memantau status pesanan pelanggan dan melacak pengantaran kurir.
- **Dukungan QR Code**: Terdapat integrasi pemindai QR (menggunakan HTML5 QR Code) untuk fitur operasional (seperti konfirmasi pesanan atau scan voucher).
- **UI/UX Modern & Animasi**: Dilengkapi dengan animasi halus menggunakan Framer Motion dan integrasi desain 3D via Spline Tool.

## 💻 Tech Stack

Proyek ini dikembangkan menggunakan tumpukan teknologi berikut:

- **Framework**: [Next.js](https://nextjs.org/) (versi 16.x)
- **Library UI**: [React](https://react.dev/) (versi 19.x)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **Animasi**: [Framer Motion](https://www.framer.com/motion/)
- **Visualisasi Data**: [Recharts](https://recharts.org/)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **3D Asset**: [@splinetool/react-spline](https://spline.design/)

## 🚀 Memulai (Getting Started)

### Prasyarat (Prerequisites)
Pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (Disarankan versi 20.x atau terbaru)
- npm atau yarn

### Instalasi & Menjalankan Aplikasi

1. Clone repositori ini atau masuk ke direktori proyek:
   ```bash
   cd mantra-admin-web
   ```

2. Instal seluruh dependensi proyek:
   ```bash
   npm install
   ```

3. (Opsional) Sesuaikan pengaturan *environment variables* (seperti `NEXT_PUBLIC_API_URL`) di dalam file `.env.local` untuk mengarahkan permintaan API ke Mantra Backend (Golang).

4. Jalankan *development server*:
   ```bash
   npm run dev
   ```

5. Buka [http://localhost:3000](http://localhost:3000) (atau IP lokal Anda) di browser kesayangan Anda. Aplikasi otomatis melakukan hot-reloading setiap ada perubahan kode.

## 🛠️ Perintah Skrip (Scripts)

Di dalam `package.json` tersedia perintah berikut:
- `npm run dev` : Menjalankan aplikasi dalam mode *development* (Bisa diakses dari perangkat lain di jaringan yang sama berkat `-H 0.0.0.0`).
- `npm run build` : Melakukan kompilasi untuk mode *production*.
- `npm run start` : Menjalankan server hasil *build*.
- `npm run lint` : Menjalankan ESLint untuk mengecek standar penulisan kode.

## 🌐 Koneksi ke Backend
Pastikan *Mantra Backend* berjalan (secara default biasanya di port `8080`) sebelum menggunakan fitur dinamis pada Admin Web ini, karena seluruh data karyawan, produk, dan transaksi bersumber dari REST API backend tersebut.
