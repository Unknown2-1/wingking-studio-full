export type BookingInput = {
  customerName: string;
  customerPhone: string;
  serviceId: string;
  date: string;
  startTime: string;
  durationHours: number;
};

export type CleanBooking = BookingInput & { startMinutes: number };

export type ValidationResult =
  | { ok: true; value: CleanBooking }
  | { ok: false; error: string };

const OPEN_MINUTES = 9 * 60;
const CLOSE_MINUTES = 23 * 60;
const MAX_ADVANCE_DAYS = 120;

export function jakartaToday(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function minutesFromTime(value: string): number | null {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isBookableService(name: string): boolean {
  return !/mixing|mastering/i.test(name);
}

export function validateBooking(
  raw: BookingInput,
  now: Date = new Date(),
): ValidationResult {
  const name = typeof raw.customerName === "string" ? raw.customerName.trim().replace(/\s+/g, " ") : "";
  const phone = typeof raw.customerPhone === "string" ? raw.customerPhone.replace(/[\s()\-]/g, "") : "";
  const serviceId = typeof raw.serviceId === "string" ? raw.serviceId.trim() : "";
  if (name.length < 2 || name.length > 80) return { ok: false, error: "Nama harus 2–80 karakter." };
  if (!/^(?:\+62|62|0)8\d{8,11}$/.test(phone)) return { ok: false, error: "Masukkan nomor WhatsApp Indonesia yang valid." };
  if (!/^[a-z0-9]{10,40}$/i.test(serviceId)) return { ok: false, error: "Layanan tidak valid." };
  if (typeof raw.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw.date)) return { ok: false, error: "Tanggal tidak valid." };
  const day = new Date(`${raw.date}T00:00:00.000Z`);
  if (Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== raw.date) return { ok: false, error: "Tanggal tidak valid." };
  const today = jakartaToday(now);
  const dayDifference = (day.getTime() - Date.parse(`${today}T00:00:00.000Z`)) / 86400000;
  if (dayDifference < 0 || dayDifference > MAX_ADVANCE_DAYS) return { ok: false, error: "Pilih tanggal mulai hari ini hingga 120 hari ke depan." };
  const startMinutes = typeof raw.startTime === "string" ? minutesFromTime(raw.startTime) : null;
  if (startMinutes === null || startMinutes % 30 !== 0) return { ok: false, error: "Jam mulai harus dalam kelipatan 30 menit." };
  if (!Number.isInteger(raw.durationHours) || raw.durationHours < 1 || raw.durationHours > 12) return { ok: false, error: "Durasi harus antara 1–12 jam." };
  if (startMinutes < OPEN_MINUTES || startMinutes + raw.durationHours * 60 > CLOSE_MINUTES) return { ok: false, error: "Reservasi hanya tersedia pukul 09.00–23.00 WIB." };
  if (raw.date === today) {
    const localNow = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(now);
    const nowMinutes = minutesFromTime(localNow);
    if (nowMinutes !== null && startMinutes <= nowMinutes) return { ok: false, error: "Jam reservasi harus lebih dari waktu sekarang." };
  }
  return { ok: true, value: { customerName: name, customerPhone: phone, serviceId, date: raw.date, startTime: raw.startTime, durationHours: raw.durationHours, startMinutes } };
}

export function hasScheduleConflict(
  existing: Array<{ startTime: string; durationHours: number }>,
  startMinutes: number,
  durationHours: number,
): boolean {
  const endMinutes = startMinutes + durationHours * 60;
  return existing.some((booking) => {
    const previousStart = minutesFromTime(booking.startTime);
    if (previousStart === null) return true; // fail closed on corrupt legacy data
    return startMinutes < previousStart + booking.durationHours * 60 && previousStart < endMinutes;
  });
}
