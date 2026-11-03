"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  isBookableService, validateBooking, hasScheduleConflict,
  type BookingInput,
} from "@/lib/booking-rules";

export async function getServices() {
  try {
    const services = await prisma.service.findMany({ orderBy: { createdAt: "asc" } });
    return { success: true as const, data: services.filter((s) => isBookableService(s.name)) };
  } catch (error) {
    console.error("Unable to load studio services", error);
    return { success: false as const, data: [], error: "Layanan sementara tidak tersedia." };
  }
}

export async function createBooking(raw: BookingInput) {
  const validated = validateBooking(raw);
  if (!validated.ok) return { success: false as const, error: validated.error };
  const input = validated.value;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // One facility-wide PostgreSQL advisory transaction lock per calendar date.
      // This serializes concurrent submissions even on separate serverless instances.
      await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtext('wingking-studio'), hashtext(${input.date}))`;

      const service = await tx.service.findUnique({ where: { id: input.serviceId } });
      if (!service || !isBookableService(service.name)) {
        return { success: false as const, error: "Paket layanan tidak tersedia untuk booking per jam." };
      }

      const reservationDay = new Date(input.date + "T00:00:00.000Z");
      const existing = await tx.booking.findMany({
        where: { date: reservationDay, status: { in: ["PENDING", "CONFIRMED"] } },
        select: { startTime: true, durationHours: true },
      });
      if (hasScheduleConflict(existing, input.startMinutes, input.durationHours)) {
        return { success: false as const, error: "Jadwal bentrok. Silakan pilih jam lainnya." };
      }

      const recentRequests = await tx.booking.count({
        where: {
          customerPhone: input.customerPhone,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });
      if (recentRequests >= 3) {
        return { success: false as const, error: "Batas pengajuan harian tercapai. Hubungi studio untuk bantuan." };
      }

      const created = await tx.booking.create({
        data: {
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          serviceId: service.id,
          date: reservationDay,
          startTime: input.startTime,
          durationHours: input.durationHours,
          status: "PENDING",
        },
        select: { id: true, status: true },
      });
      return { success: true as const, data: created };
    }, { maxWait: 5000, timeout: 10000 });

    if (result.success) revalidatePath("/admin");
    return result;
  } catch (error) {
    console.error("Booking transaction failed", error);
    return { success: false as const, error: "Reservasi belum tersimpan. Silakan coba lagi." };
  }
}
