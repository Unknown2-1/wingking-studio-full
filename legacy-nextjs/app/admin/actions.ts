"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { adminReady, checkAdminPassword, closeAdminSession, isAdmin, openAdminSession } from "@/lib/admin-auth";
import { loginLimit } from "@/lib/login-limiter";
import { hasScheduleConflict, minutesFromTime } from "@/lib/booking-rules";

export async function loginAdmin(formData: FormData) {
  const ip = (await headers()).get("x-real-ip") || (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `login:${ip}`;
  const pass = formData.get("password");
  const password = typeof pass === "string" ? pass : "";
  if (!adminReady() || loginLimit(key) || !checkAdminPassword(password)) {
    redirect("/admin?error=login");
  }
  loginLimit(key, true);
  await openAdminSession();
  redirect("/admin");
}

export async function logoutAdmin() {
  await closeAdminSession();
  redirect("/admin");
}

export async function setBookingStatus(formData: FormData) {
  if (!await isAdmin()) redirect("/admin?error=login");
  const bookingId = formData.get("bookingId");
  const status = formData.get("status");
  if (typeof bookingId !== "string" || !/^[a-z0-9]{10,40}$/i.test(bookingId)) return;
  if (status !== "CONFIRMED" && status !== "CANCELLED" && status !== "PENDING") return;
  let outcome = "error";
  try {
    outcome = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!booking) return "missing";
      const day = booking.date.toISOString().slice(0, 10);
      await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))", "wingking-studio", day);
      if (status !== "CANCELLED") {
        const start = minutesFromTime(booking.startTime);
        if (start === null) return "invalid";
        const existing = await tx.booking.findMany({
          where: { date: booking.date, id: { not: bookingId }, status: { in: ["PENDING", "CONFIRMED"] } },
          select: { startTime: true, durationHours: true },
        });
        if (hasScheduleConflict(existing, start, booking.durationHours)) return "conflict";
      }
      await tx.booking.update({ where: { id: bookingId }, data: { status } });
      return "saved";
    }, { maxWait: 5000, timeout: 10000 });
  } catch (error) {
    console.error("Admin reservation update failed", error);
  }
  if (outcome !== "saved") redirect("/admin?error=update");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateServicePrice(formData: FormData) {
  if (!await isAdmin()) redirect("/admin?error=login");
  const serviceId = formData.get("serviceId");
  const price = Number(formData.get("price"));
  if (typeof serviceId !== "string" || !/^[a-z0-9]{10,40}$/i.test(serviceId)) return;
  if (!Number.isInteger(price) || price < 1000 || price > 10_000_000) return;
  await prisma.service.update({ where: { id: serviceId }, data: { pricePerHour: price } });
  revalidatePath("/");
  revalidatePath("/admin");
}
