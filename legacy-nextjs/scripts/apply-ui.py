"""Apply safe, text-based UI improvements to an existing Wingking Studio checkout.

Run after copying this patch package's overrides into the checkout (or use apply.sh).
Idempotence: checks whether each upgrade has already been applied.
"""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
page_file = root / "app/page.tsx"
form_file = root / "components/BookingForm.tsx"
package_file = root / "package.json"


def once(text: str, before: str, after: str, context: str) -> str:
    n = text.count(before)
    if n == 1:
        return text.replace(before, after, 1)
    if n == 0 and after in text:
        return text
    raise RuntimeError(f"{context}: expected exactly one source anchor, got {n}; not applying a dangerous edit")


page = page_file.read_text()
page = once(page, 'import BookingForm from "@/components/BookingForm";',
            'import BookingForm from "@/components/BookingForm";\nimport MobileNav from "@/components/MobileNav";', 'mobile import')
page = once(page, '          <div className="flex items-center gap-4">',
            '          <div className="flex items-center gap-3 md:gap-4">\n            <MobileNav />', 'header mobile navigation')
page = once(page, 'href="#community"', 'href="#spaces"', 'dead menu link')
page = once(page, 'className="inline-flex items-center gap-2 bg-[#ffb86d] text-[#492900] font-mono text-xs uppercase tracking-wider px-4 py-2 hover:bg-[#e59840] transition-colors font-semibold"',
            'className="hidden sm:inline-flex items-center gap-2 bg-[#ffb86d] text-[#492900] font-mono text-xs uppercase tracking-wider px-4 py-2 hover:bg-[#e59840] transition-colors font-semibold"', 'hide admin link on narrow phones')
page = once(page, '            <BookingForm services={services} />',
            '            {!response.success && <p role="alert" className="mb-5 border border-red-400 p-4 text-red-300">Layanan booking belum tersedia karena koneksi data bermasalah. Coba lagi nanti.</p>}\n            <BookingForm services={services} />', 'database unavailable alert')

# Mixing/mastering is priced per song in the marketing copy; it must not link to hourly reservation.
mixing_card = '/* Service Card 3 */'
start = page.find(mixing_card)
end = page.find('        </section>', start)
if start < 0 or end < 0:
    raise RuntimeError('Could not locate mixing service card, refusing partial rewrite')
chunk = page[start:end]
chunk = once(chunk, 'href="#booking-console"', 'href="https://instagram.com/w.hubstudio" target="_blank" rel="noopener noreferrer"', 'mixing CTA link')
chunk = once(chunk, 'Pilih Paket Ini{" "}', 'Konsultasi Mixing{" "}', 'mixing CTA label')
page = page[:start] + chunk + page[end:]
# Avoid unverified numerical claims in client-facing cards until owner confirms them.
page = page.replace('1,500+', '—').replace('120+', '—').replace('100%', '—')
page_file.write_text(page)

form = form_file.read_text()
form = once(form, 'import { createBooking } from "@/app/actions/booking";',
            'import { createBooking } from "@/app/actions/booking";\nimport { jakartaToday } from "@/lib/booking-rules";', 'Jakarta date import')
form = form.replace('new Date().toISOString().split("T")[0]', 'jakartaToday()')
form = once(form, '          <input\n            type="date"\n            required', '          <input\n            type="date"\n            min={jakartaToday()}\n            required', 'date minimum')
form = once(form, '      setMessage({\n        type: "success",\n        text: "🔥 Sesi berhasil dikunci! Tim concierge Wingking Studio akan menghubungi WhatsApp kamu dalam < 60 menit.",',
            '      setMessage({\n        type: "success",\n        text: "Permintaan booking sudah tercatat dan MENUNGGU konfirmasi studio. Simpan jadwal sementara dan tunggu dihubungi oleh admin.",', 'honest booking confirmation')
form = once(form, '      disabled={loading}', '      disabled={loading || services.length === 0}', 'prevent empty-service submit')
form = once(form, '{loading ? "Proses..." : "Lock In Session Time"}',
            '{loading ? "Proses..." : "Ajukan Booking"}', 'booking call-to-action')
# Ensure an unexpected rejected network/server action does not leave permanent loading state.
form = once(form, '    const res = await createBooking({', '    try {\n    const res = await createBooking({', 'catch boundary begin')
form = once(form, '    setLoading(false);\n  };',
            '    } catch {\n      setMessage({ type: "error", text: "Koneksi bermasalah. Reservasi belum terkonfirmasi tersimpan." });\n    } finally {\n      setLoading(false);\n    }\n  };', 'catch boundary end')
form = once(form, '      {/* STEP 1: Pilih Paket Studio / Room */}',
            '      {services.length === 0 && <p role="alert" className="border border-red-400 p-3 text-sm text-red-300">Booking belum tersedia. Tidak ada layanan aktif atau database belum terhubung.</p>}\n      {/* STEP 1: Pilih Paket Studio / Room */}', 'empty service warning')
form_file.write_text(form)

import json
pkg = json.loads(package_file.read_text())
pkg['scripts']['build'] = 'prisma generate && next build'
pkg['scripts']['postinstall'] = 'prisma generate'
pkg['scripts']['test:booking'] = 'node --experimental-strip-types --test tests/*.test.mjs'
package_file.write_text(json.dumps(pkg, indent=2, ensure_ascii=False) + '\n')
print('Applied Wingking Studio UI and package script upgrades.')
