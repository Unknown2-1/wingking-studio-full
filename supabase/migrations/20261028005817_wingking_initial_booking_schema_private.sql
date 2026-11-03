-- Schema migration imported from user's Wingking Supabase project.
-- Version: 20261028005817
-- Apply using Supabase CLI on a fresh project; do not rerun on live database.

CREATE TABLE IF NOT EXISTS public."Service" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "pricePerHour" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT wingking_positive_service_price CHECK ("pricePerHour" >= 1000 AND "pricePerHour" <= 10000000)
);
CREATE TABLE IF NOT EXISTS public."Booking" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "startTime" TEXT NOT NULL,
  "durationHours" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT wingking_booking_status CHECK ("status" IN ('PENDING','CONFIRMED','CANCELLED')),
  CONSTRAINT wingking_booking_duration CHECK ("durationHours" BETWEEN 1 AND 12)
);
CREATE INDEX IF NOT EXISTS "Booking_date_status_idx" ON public."Booking"("date", "status");
CREATE INDEX IF NOT EXISTS "Booking_customerPhone_createdAt_idx" ON public."Booking"("customerPhone","createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "Service_name_key" ON public."Service"("name");
ALTER TABLE public."Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Booking" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."Service" FROM anon, authenticated, PUBLIC;
REVOKE ALL ON TABLE public."Booking" FROM anon, authenticated, PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
COMMENT ON TABLE public."Service" IS 'Private Wingking Studio service pricing for backend Prisma, not public Data API';
COMMENT ON TABLE public."Booking" IS 'Private Wingking Studio customer bookings; server-side only';
