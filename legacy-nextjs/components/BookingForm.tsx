"use client";

import { useState } from "react";
import { createBooking } from "@/app/actions/booking";
import { jakartaToday } from "@/lib/booking-rules";

interface Service {
  id: string;
  name: string;
  pricePerHour: number;
}

/* Read-only visual service references when the production database is unavailable.
 * These must never be submitted as real bookings. */
const previewServices: Service[] = [
  { id: "preview-rehearsal", name: "Studio Rehearsal (Regular)", pricePerHour: 75000 },
  { id: "preview-recording", name: "Recording Session", pricePerHour: 150000 },
];

export default function BookingForm({ services }: { services: Service[] }) {
  const [selectedServiceId, setSelectedServiceId] = useState(
    services[0]?.id || "preview-rehearsal",
  );
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    date: jakartaToday(),
    startTime: "14:00",
    durationHours: 4,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Ambil paket yang dipilih untuk kalkulasi estimasi harga
  const presentedServices = services.length > 0 ? services : previewServices;
  const activeService =
    presentedServices.find((s) => s.id === selectedServiceId) || presentedServices[0];
  const estimatedCost = activeService
    ? activeService.pricePerHour * formData.durationHours
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
    const res = await createBooking({
      ...formData,
      serviceId: selectedServiceId,
    });

    if (res.success) {
      setMessage({
        type: "success",
        text: "Permintaan booking sudah tercatat dan MENUNGGU konfirmasi studio. Simpan jadwal sementara dan tunggu dihubungi oleh admin.",
      });
      setFormData({
        customerName: "",
        customerPhone: "",
        date: jakartaToday(),
        startTime: "14:00",
        durationHours: 4,
      });
    } else {
      setMessage({
        type: "error",
        text: res.error || "Terjadi kesalahan saat memproses jadwal.",
      });
    }
    } catch {
      setMessage({ type: "error", text: "Koneksi bermasalah. Reservasi belum terkonfirmasi tersimpan." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-[#131315] p-6 lg:p-8 border border-[#353437] shadow-2xl"
    >
      {/* Pesan Status Notifikasi */}
      {message && (
        <div
          className={`p-4 border text-xs font-mono flex items-center justify-between ${
            message.type === "success"
              ? "bg-[#1b1b1d] border-[#ffb86d] text-[#ffb86d]"
              : "bg-[#93000a]/20 border-red-500 text-red-300"
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-[#a08d7e] hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {services.length === 0 && <p role="alert" className="border border-[#ffb86d] bg-[#2a231b] p-3 text-sm text-[#ffcc96]">Mode pratinjau: database studio belum tersambung. Harga di bawah hanya referensi tampilan dan tombol booking dinonaktifkan; tidak ada reservasi yang terkirim.</p>}
      {/* STEP 1: Pilih Paket Studio / Room */}
      <div>
        <label className="block text-[11px] font-mono uppercase text-[#a08d7e] mb-2 tracking-wider">
          1. Pilih Paket Layanan Studio
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {presentedServices.map((service) => {
            const isSelected = service.id === selectedServiceId;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelectedServiceId(service.id)}
                className={`text-left p-3 border transition-colors ${
                  isSelected
                    ? "bg-[#2a2a2c] border-[#ffb86d] text-[#ffb86d]"
                    : "bg-[#1b1b1d] border-[#353437] text-[#e5e1e4] hover:bg-[#201f21]"
                }`}
              >
                <span className="block text-xs font-mono font-semibold">
                  {service.name}
                </span>
                <span
                  className={`block text-[11px] font-mono ${isSelected ? "text-[#ffb86d]" : "text-[#a08d7e]"}`}
                >
                  Rp {service.pricePerHour.toLocaleString("id-ID")}/jam
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: Tanggal & Jam Mulai */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-mono uppercase text-[#a08d7e] mb-2 tracking-wider">
            2. Tanggal Reservasi
          </label>
          <input
            type="date"
            min={jakartaToday()}
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full bg-[#0e0e10] border border-[#353437] px-4 py-2.5 text-xs font-mono text-[#e5e1e4] focus:outline-none focus:border-[#ffb86d]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase text-[#a08d7e] mb-2 tracking-wider">
            3. Jam Mulai & Durasi (Jam)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="time"
              required
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              className="w-full bg-[#0e0e10] border border-[#353437] px-3 py-2.5 text-xs font-mono text-[#e5e1e4] focus:outline-none focus:border-[#ffb86d]"
            />
            <input
              type="number"
              min="1"
              max="12"
              required
              value={formData.durationHours}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  durationHours: Number(e.target.value),
                })
              }
              className="w-full bg-[#0e0e10] border border-[#353437] px-3 py-2.5 text-xs font-mono text-[#e5e1e4] focus:outline-none focus:border-[#ffb86d]"
            />
          </div>
        </div>
      </div>

      {/* STEP 3: Data Pemesan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-mono uppercase text-[#a08d7e] mb-2 tracking-wider">
            4. Nama Lengkap / Band
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Budi (The Rockers)"
            value={formData.customerName}
            onChange={(e) =>
              setFormData({ ...formData, customerName: e.target.value })
            }
            className="w-full bg-[#0e0e10] border border-[#353437] px-4 py-2.5 text-xs font-mono text-[#e5e1e4] placeholder:text-[#a08d7e] focus:outline-none focus:border-[#ffb86d]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase text-[#a08d7e] mb-2 tracking-wider">
            5. Nomor WhatsApp
          </label>
          <input
            type="tel"
            required
            placeholder="08123456789"
            value={formData.customerPhone}
            onChange={(e) =>
              setFormData({ ...formData, customerPhone: e.target.value })
            }
            className="w-full bg-[#0e0e10] border border-[#353437] px-4 py-2.5 text-xs font-mono text-[#e5e1e4] placeholder:text-[#a08d7e] focus:outline-none focus:border-[#ffb86d]"
          />
        </div>
      </div>

      {/* Kalkulasi Biaya Estimasi & Tombol Submit */}
      <div className="pt-4 border-t border-[#353437] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="block text-[10px] font-mono uppercase text-[#a08d7e]">
            ESTIMASI TARIF JADWAL
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono text-[#ffb86d] font-bold">
              Rp {estimatedCost.toLocaleString("id-ID")}
            </span>
            <span className="text-[10px] font-mono text-[#a08d7e]">
              ({formData.durationHours} Jam)
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || services.length === 0}
          className="inline-flex items-center justify-center gap-2 bg-[#ffb86d] text-[#492900] font-mono text-xs uppercase tracking-wider px-6 py-3 font-semibold hover:bg-[#e59840] transition-all disabled:opacity-50"
        >
          <span className="w-2 h-2 rounded-full bg-[#492900]"></span>
          {loading ? "Proses..." : "Ajukan Booking"}
        </button>
      </div>
    </form>
  );
}
