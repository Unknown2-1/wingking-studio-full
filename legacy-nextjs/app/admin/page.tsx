import { prisma } from "@/lib/prisma";
import { adminReady, isAdmin } from "@/lib/admin-auth";
import { loginAdmin, logoutAdmin, setBookingStatus, updateServicePrice } from "./actions";

export const dynamic = "force-dynamic";

const card = "rounded-sm border border-[#353437] bg-[#1b1b1d] p-5";
const input = "w-full border border-[#6b5748] bg-[#0e0e10] p-3 text-white";
const btn = "bg-[#ffb86d] px-4 py-3 font-mono font-semibold text-[#301c0e] hover:bg-[#e59840] focus-visible:outline-2 focus-visible:outline-white";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{error?: string}> }) {
  const { error } = await searchParams;
  const authed = await isAdmin();
  if (!authed) return <main className="min-h-screen bg-[#131315] text-[#e5e1e4] p-6 flex items-center justify-center">
    <section className={`${card} w-full max-w-md space-y-5`}>
      <a href="/" className="text-[#ffb86d]">← Wingking Studio</a>
      <h1 className="font-serif text-3xl">Admin Studio</h1>
      <p className="text-sm text-[#c5b5a8]">Login hanya untuk pengelola studio.</p>
      {!adminReady() && <p role="alert" className="text-red-300">Akun admin belum dikonfigurasi di server. Hubungi pengembang.</p>}
      {error && <p role="alert" className="text-red-300">{error === "update" ? "Perubahan reservasi gagal, ditolak, atau bentrok dengan jadwal lain." : "Login gagal atau terlalu banyak percobaan."}</p>}
      <form action={loginAdmin} className="space-y-4">
        <label className="block text-sm">Kata sandi admin<input className={`${input} mt-2`} type="password" name="password" autoComplete="current-password" required minLength={1}/></label>
        <button disabled={!adminReady()} className={`${btn} w-full disabled:opacity-40`}>Masuk ke dashboard</button>
      </form>
    </section>
  </main>;

  type BookingWithService = import("@prisma/client").Prisma.BookingGetPayload<{include:{service:{select:{name:true}}}}> ;
  let bookings: BookingWithService[] = [];
  let services: Awaited<ReturnType<typeof prisma.service.findMany>> = [];
  let dbError = false;
  try {
    [bookings, services] = await Promise.all([
      prisma.booking.findMany({ orderBy: [{date:"desc"},{startTime:"desc"}],take:100,include:{service:{select:{name:true}}}}),
      prisma.service.findMany({orderBy:{createdAt:"asc"}}),
    ]);
  } catch (error) { console.error("Admin dashboard database unavailable", error); dbError = true; }

  return <main className="min-h-screen bg-[#131315] px-4 py-8 md:px-10 text-[#e5e1e4]">
    <header className="flex flex-wrap justify-between items-center gap-4 border-b border-[#353437] pb-6">
      <div><p className="font-mono text-xs text-[#ffb86d]">WINGKING STUDIO // ADMIN</p><h1 className="font-serif text-4xl mt-2">Booking Console</h1></div>
      <form action={logoutAdmin}><button className={btn}>Keluar</button></form>
    </header>
    {error === "update" && <p role="alert" className="my-5 border border-red-500 p-4 text-red-300">Perubahan reservasi ditolak atau terjadi bentrokan jadwal. Periksa ulang status booking.</p>}
    {dbError && <p role="alert" className="my-5 border border-red-500 p-4 text-red-300">Database belum terhubung. Reservasi dan harga tidak dapat ditampilkan.</p>}
    <section className="my-8"><h2 className="text-xl font-semibold mb-4">Reservasi terbaru ({bookings.length})</h2>
      <div className="space-y-3">{bookings.map((b) => <article key={b.id} className={card}>
        <div className="flex flex-wrap justify-between gap-3">
          <div><p className="text-[#ffb86d] font-mono text-xs">{b.status}</p><h3 className="text-xl font-semibold">{b.customerName}</h3>
            <p className="text-sm text-[#c5b5a8]">{b.service.name} · {b.date.toISOString().slice(0,10)} · {b.startTime} WIB · {b.durationHours} jam</p>
            <p className="text-sm mt-1">WhatsApp: {b.customerPhone}</p></div>
          <form action={setBookingStatus} className="flex flex-wrap gap-2 items-end">
            <input type="hidden" name="bookingId" value={b.id}/>
            <label className="text-xs">Status<select name="status" defaultValue={b.status} className={`${input} mt-1`}>
              <option value="PENDING">PENDING</option><option value="CONFIRMED">CONFIRMED</option><option value="CANCELLED">CANCELLED</option>
            </select></label><button className={btn}>Simpan</button>
          </form>
        </div>
      </article>)}{!dbError && bookings.length === 0 && <p className="text-[#c5b5a8]">Belum ada reservasi.</p>}</div>
    </section>
    <section className="my-8"><h2 className="text-xl font-semibold mb-4">Harga layanan</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{services.map((s) => <form key={s.id} action={updateServicePrice} className={`${card} space-y-3`}>
        <h3 className="font-semibold">{s.name}</h3>
        <p className="text-xs text-[#c5b5a8]">{s.name.match(/mixing|mastering/i) ? "Tarif referensi per lagu (tidak tersedia untuk booking jam)" : "Tarif per jam"}</p>
        <input type="hidden" name="serviceId" value={s.id}/>
        <label className="block text-xs">Harga (Rp)<input className={`${input} mt-1`} type="number" name="price" defaultValue={s.pricePerHour} min="1000" max="10000000" required/></label>
        <button className={btn}>Simpan harga</button>
      </form>)}</div>
    </section>
  </main>;
}
