"use client";
import { useEffect, useState, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Loader2 } from "lucide-react";

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export default function BarcodeScannerModal({ onScanSuccess, onClose }: ScannerProps) {
  const [error, setError] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Pakai useRef biar kamera gampang dibunuh pas modal diclose
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // 🚀 BUNGKAM TYPESCRIPT: Kita pakai "as any" biar TS gak rewel nanyain properti aneh-aneh!
    const html5QrCode = new Html5Qrcode("reader", {
      verbose: false,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13, // ISBN Buku (Barcode panjang lu)
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
      ]
    } as any); 

    scannerRef.current = html5QrCode;
    let isMounted = true;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10, // 🚀 Kita turunin dikit biar CPU laptop/HP gak ngos-ngosan nebak barcode
            // 🚀 KITA KEMBALIKAN QRBOX: Biar AI cuma mikirin gambar di tengah (Bikin scan super cepat!)
            qrbox: { width: 300, height: 150 }, 
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (isMounted && html5QrCode.isScanning) {
              html5QrCode.stop().then(() => {
                onScanSuccess(decodedText);
              }).catch(console.error);
            }
          },
          (err) => {
            // Abaikan error "NotFound", ini wajar kalau barcode belum pas
          }
        );

        if (isMounted) setIsCameraReady(true);
      } catch (err: any) {
        console.error("Kamera Error:", err);
        if (isMounted) {
          setError(`Gagal mengakses kamera: ${err?.message || "Pastikan izin kamera tidak diblokir."}`);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        // Stop paksa kamera pas modal diclose
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(console.error);
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform animate-in zoom-in-95 duration-200 border border-zinc-200 flex flex-col">
        
        <div className="flex justify-between items-center p-4 border-b border-zinc-100 bg-white shrink-0">
          <h3 className="font-bold text-zinc-800">Scan Barcode / SKU</h3>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="relative bg-black w-full h-[50vh] md:h-87.5 overflow-hidden flex items-center justify-center">
          
          {!isCameraReady && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 z-20 gap-3 bg-zinc-900">
              <Loader2 className="animate-spin text-[#AF520C]" size={32} />
              <span className="text-xs font-bold">Menyiapkan Lensa...</span>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center z-20 p-6 text-center bg-zinc-900">
              <span className="text-sm font-bold text-red-500 bg-red-50 p-4 rounded-xl border border-red-200 leading-relaxed">
                {error}
              </span>
            </div>
          )}

          {/* WADAH KAMERA CORE ENGINE */}
          <div 
            id="reader" 
            className="absolute inset-0 w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover [&_a]:hidden [&_span]:hidden [&_div]:border-none!"
          ></div>

          {/* 🚀 CUSTOM UI: LASER SCANNER (SUDAH PRESISI 100% DI TENGAH) */}
          {isCameraReady && (
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center px-4">
              
              {/* Kotak bidikan biar user tau harus taruh barcode di mana */}
              <div className="w-full max-w-75 h-37.5 border-2 border-white/20 rounded-lg relative flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                
                {/* 🚀 Garis Merah Laser (Pasti pas di tengah!) */}
                <div className="w-[110%] h-0.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.9)] animate-pulse"></div>

                {/* Siku-siku Target */}
                <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl"></div>
                <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr"></div>
                <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl"></div>
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-white rounded-br"></div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-zinc-50 text-center border-t border-zinc-100 shrink-0">
          <p className="text-xs text-zinc-500 font-medium leading-relaxed">
            Arahkan <span className="font-bold text-red-500">garis merah</span> ke tengah barcode produk.<br/>Pastikan pencahayaan terang dan barcode tidak lecek.
          </p>
        </div>
        
      </div>
    </div>
  );
}