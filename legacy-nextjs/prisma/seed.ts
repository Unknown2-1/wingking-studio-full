import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const defaults = [
  { name: "Studio Rehearsal (Regular)", pricePerHour: 75000 },
  { name: "Recording Session", pricePerHour: 150000 },
  { name: "Mixing & Mastering", pricePerHour: 500000 },
];
async function main() {
  // Never delete services: existing customer bookings reference their IDs.
  for (const service of defaults) {
    const exists = await prisma.service.findFirst({ where: { name: service.name } });
    if (!exists) await prisma.service.create({ data: service });
  }
  console.log("Studio services seeded without deleting previous bookings.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
