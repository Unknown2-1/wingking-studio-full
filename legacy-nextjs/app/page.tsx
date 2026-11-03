// Mengimpor fungsi backend action dan komponen form booking
import { getServices } from "@/app/actions/booking";
import BookingForm from "@/components/BookingForm";
import MobileNav from "@/components/MobileNav";

export default async function Home() {
  // Mengambil daftar layanan resmi Wingking Studio dari Supabase
  const response = await getServices();
  const services = response.data || [];

  return (
    <div className="wk-page w-full min-h-screen bg-[#131315] text-[#e5e1e4] font-sans antialiased">
      {/* =========================================================================
          1. FIXED NAVIGATION HEADER
         ========================================================================= */}
      <header className="wk-header fixed top-0 left-0 right-0 z-50 bg-[#0e0e10]/95 backdrop-blur-md border-b border-[#353437]/60">
        <div className="h-20 w-full px-6 lg:px-16 flex items-center justify-between">
          <a
            className="group flex items-center gap-3 focus:outline-none"
            href="#"
          >
            <div className="w-3.5 h-3.5 bg-[#ffb86d] rounded-sm transform rotate-45 group-hover:rotate-180 transition-transform duration-500" />
            <div className="flex flex-col">
              <span className="font-mono text-xs uppercase text-[#e5e1e4] tracking-widest font-semibold group-hover:text-[#ffb86d] transition-colors">
                WINGKING STUDIO
              </span>
              <span className="font-mono text-[9px] uppercase text-[#a08d7e] tracking-wider">
                Acoustic Hub // Purwokerto
              </span>
            </div>
          </a>

          <nav className="hidden xl:flex items-center gap-10 font-mono text-xs uppercase">
            <a
              href="#about"
              className="text-[#d7c3b1] hover:text-[#ffb86d] transition-all py-1"
            >
              Studio
            </a>
            <a
              href="#capabilities"
              className="text-[#d7c3b1] hover:text-[#ffb86d] transition-all py-1"
            >
              Services
            </a>
            <a
              href="#spaces"
              className="text-[#d7c3b1] hover:text-[#ffb86d] transition-all py-1"
            >
              Spaces
            </a>
            <a
              href="#spaces"
              className="text-[#d7c3b1] hover:text-[#ffb86d] transition-all py-1"
            >
              Dispatches
            </a>
            <a
              href="#booking-console"
              className="text-[#d7c3b1] hover:text-[#ffb86d] transition-all py-1"
            >
              Booking
            </a>
          </nav>

          <div className="flex items-center gap-3 md:gap-4">
            <MobileNav />
            <a
              href="https://instagram.com/w.hubstudio"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center font-mono text-[10px] text-[#a08d7e] hover:text-[#ffb86d] transition-colors uppercase tracking-wider"
            >
              IG // @w.hubstudio
            </a>
            <div className="h-4 w-px bg-[#353437] hidden md:block"></div>
            <a
              href="/admin"
              className="hidden sm:inline-flex items-center gap-2 bg-[#ffb86d] text-[#492900] font-mono text-xs uppercase tracking-wider px-4 py-2 hover:bg-[#e59840] transition-colors font-semibold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#492900]"></span>
              Admin Portal →
            </a>
          </div>
        </div>
      </header>

      <main className="w-full pt-20 bg-[#131315] flex-1">
        {/* =========================================================================
            2. RUNNING TELEMETRY TICKER (PURWOKERTO CONTEXT)
           ========================================================================= */}
        <div className="wk-ticker w-full bg-[#0e0e10] px-6 lg:px-16 py-2 flex items-center justify-between text-[#c7c7c3] border-b border-[#353437]/40">
          <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
            <div className="flex items-center gap-2 text-[#ffb86d] shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#ffb86d] animate-pulse"></span>
              <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                STUDIO DISPATCH
              </span>
            </div>
            <div className="h-3 w-px bg-[#353437] shrink-0"></div>
            <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-wide overflow-x-auto no-scrollbar">
              <span>
                [REHEARSAL BAY] FULL BACKLINE READY // MARSHALL & PEARL
              </span>
              <span className="text-[#353437]">•</span>
              <span className="text-[#d7c3b1]">
                [RECORDING SUITE] MULTI-TRACK LIVE DRUM TRACKING
              </span>
              <span className="text-[#353437]">•</span>
              <span>
                [MIXING & MASTERING] HYBRID ANALOG & DIGITAL DAW ROUTING
              </span>
              <span className="text-[#353437]">•</span>
              <span className="text-[#ffb86d]">
                [OPERATIONAL] OPEN DAILY 09:00 - 23:00 WIB
              </span>
            </div>
          </div>
          <div className="hidden xl:flex items-center gap-4 shrink-0 text-[#a08d7e] font-mono text-[10px]">
            <span>LOCATION: PURWOKERTO</span>
            <span className="text-[#ffb86d]">STATUS: ACTIVE</span>
          </div>
        </div>

        {/* =========================================================================
            3. HERO SECTION
           ========================================================================= */}
        <section className="wk-hero relative w-full bg-[#0e0e10]">
          <div className="wk-hero-frame relative w-full h-[580px] lg:h-[680px] overflow-hidden">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDptAJUL0MDaNlofnooeMZ_ffMEAtzF7DgwyHFlLOw_OaMxX5GIUfGeVPgQt9XDZN8AFQ8SNmSXfhhgNq3AdPF72Y4sEc7aC3v-X7M73-7agnoiF4wg9-KRounN05qdO9AGCZadcTAXs12l_EuhNb_TEs0iintSwWMJao6_ohiOiA94a4HTelMhsG0pAj3F-C6vriU2RHIpgAeH5uVRbpXozPaObuE640kU5W-zWoYByIvSandD6HaUZQ"
              alt="Wingking Studio Master Control Room"
              className="w-full h-full object-cover object-center filter brightness-[0.82] contrast-[1.08] transition-transform duration-1000 ease-out hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#131315] via-[#0e0e10]/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0e0e10]/80 via-transparent to-[#0e0e10]/40"></div>

            {/* Indicator Overlay */}
            <div className="absolute top-6 left-6 lg:left-16 flex items-center gap-2 bg-[#0e0e10]/90 px-3 py-1.5 backdrop-blur-md shadow-2xl border border-[#353437]/50">
              <span className="w-2 h-2 rounded-full bg-[#ffb86d] animate-ping"></span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#e5e1e4]">
                WINGKING STUDIO — PURWOKERTO
              </span>
              <span className="text-[#a08d7e] font-mono text-[10px]">
                | @W.HUBSTUDIO
              </span>
            </div>

            {/* VU Meter Overlay */}
            <div className="hidden md:flex absolute top-6 right-6 lg:right-16 items-center gap-2 bg-[#0e0e10]/90 px-3 py-1.5 backdrop-blur-md border border-[#353437]/50">
              <span className="font-mono text-[10px] text-[#a08d7e] uppercase mr-1">
                VU L/R
              </span>
              <div className="flex items-end gap-[2px] h-3">
                <div className="w-1 bg-[#ffb86d] h-full"></div>
                <div className="w-1 bg-[#ffb86d] h-5/6"></div>
                <div className="w-1 bg-[#ffb86d] h-4/6"></div>
                <div className="w-1 bg-[#e59840] h-3/6"></div>
                <div className="w-1 bg-[#353437] h-2/6"></div>
              </div>
              <div className="flex items-end gap-[2px] h-3 ml-2">
                <div className="w-1 bg-[#ffb86d] h-full"></div>
                <div className="w-1 bg-[#ffb86d] h-5/6"></div>
                <div className="w-1 bg-[#e59840] h-4/6"></div>
                <div className="w-1 bg-[#353437] h-2/6"></div>
              </div>
            </div>

            {/* Content Display */}
            <div className="wk-hero-copy absolute bottom-0 left-0 right-0 px-6 lg:px-16 pb-12">
              <div className="max-w-6xl">
                <div className="inline-flex items-center gap-2 bg-[#2a2a2c] px-3 py-1 mb-4 border border-[#353437]">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#ffb86d] font-semibold">
                    [ AUDIO PRODUCTION & REHEARSAL HUB ]
                  </span>
                </div>
                <h1 className="wk-hero-title font-serif text-5xl lg:text-8xl tracking-tight text-[#e5e1e4] uppercase max-w-4xl leading-[0.95]">
                  Your Sound. <br className="hidden sm:inline" />
                  Your Space.
                </h1>
                <p className="wk-hero-lead text-[#d7c3b1] text-base lg:text-xl max-w-2xl mt-4 font-light leading-relaxed">
                  Ruang rekaman & latihan band berstandar akustik presisi di
                  Purwokerto. Menghadirkan karakter suara utuh, tebal, dan siap
                  bersaing di industri musik.
                </p>
                <div className="wk-hero-ctas mt-6 flex flex-wrap items-center gap-4">
                  <a
                    href="#booking-console"
                    className="inline-flex items-center gap-2 bg-[#ffb86d] text-[#492900] font-mono text-xs uppercase tracking-wider px-6 py-3.5 font-semibold hover:bg-[#e59840] transition-all shadow-xl"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#492900]"></span>
                    Reservasi Jadwal
                  </a>
                  <a
                    href="#spaces"
                    className="inline-flex items-center gap-2 bg-[#2a2a2c]/80 hover:bg-[#353437] text-[#e5e1e4] font-mono text-xs uppercase tracking-wider px-6 py-3.5 backdrop-blur-md transition-colors border border-[#353437]"
                  >
                    Eksplor Fasilitas Studio
                    <span className="material-symbols-outlined text-[16px] text-[#ffb86d]">
                      arrow_downward
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. MANIFESTO & REAL COUNTERS
           ========================================================================= */}
        <section
          id="about"
          className="wk-about w-full bg-[#131315] py-20 px-6 lg:px-16 border-b border-[#353437]/60"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#ffb86d] font-semibold">
                    01 // MANIFESTO
                  </span>
                  <span className="h-px w-12 bg-[#353437]"></span>
                  <span className="font-mono text-[10px] uppercase text-[#a08d7e]">
                    Wingking Philosophy
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-5xl text-[#e5e1e4] leading-tight max-w-xl">
                  Dirancang oleh musisi untuk kejernihan audio dan fokus
                  berkarya.
                </h2>
                <div className="space-y-4 mt-6 text-[#d7c3b1] text-sm leading-relaxed max-w-xl">
                  <p>
                    Wingking Studio lahir dari kebutuhan akan studio musik di
                    Purwokerto yang memiliki respon akustik yang tepat,
                    pendingin udara nyaman, serta backline instrumen yang
                    terawat.
                  </p>
                  <p>
                    Setiap sesi latihan maupun pengerjaan single/album ditangani
                    dengan pendekatan profesional, memastikan dinamika vokal dan
                    instrumen kamu tertangkap sempurna.
                  </p>
                </div>
              </div>

              {/* Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-6 bg-[#1b1b1d] p-4 border border-[#353437]">
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-[#a08d7e] uppercase">
                    Sesi Tracking
                  </span>
                  <span className="font-serif text-3xl text-[#ffb86d] mt-1">
                    —
                  </span>
                  <span className="font-mono text-[9px] text-[#b5b5b2]">
                    Jam Jamming & Rec
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-[#a08d7e] uppercase">
                    Karya Rilis
                  </span>
                  <span className="font-serif text-3xl text-[#e5e1e4] mt-1">
                    —
                  </span>
                  <span className="font-mono text-[9px] text-[#b5b5b2]">
                    Single & Album
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-[#a08d7e] uppercase">
                    Kualitas Ruang
                  </span>
                  <span className="font-serif text-3xl text-[#e5e1e4] mt-1">
                    —
                  </span>
                  <span className="font-mono text-[9px] text-[#b5b5b2]">
                    Treated Acoustics
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-[#a08d7e] uppercase">
                    Operasional
                  </span>
                  <span className="font-serif text-3xl text-[#ffb86d] mt-1">
                    09-23
                  </span>
                  <span className="font-mono text-[9px] text-[#b5b5b2]">
                    WIB Setiap Hari
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col">
              <div className="relative w-full aspect-[4/3] bg-[#1b1b1d] overflow-hidden shadow-2xl border border-[#353437]">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAik7Pwgn9T5SqU2rXUlKg1AlYQxuQLDzJRGbU1DbOmqaN-FueKJo12nKMYoN2y6Gj2FH-jlLRhKw7JxJutRX8bjTssMfPg-HSPJFZiXD9MEDBViRpprLDISN0hv00r5CEIR4SMYrMtNcvdpp7__NMUBj9ylhXfruuKB93THGimQb5jejVJW6JY0IHlW4SYbSpdK33PuYqwsOAInEIZ9c020b6mkfTFc9c01Wz_yHGTYlpoeHdwwJtZXQ"
                  alt="Band Rehearsal Session Wingking Studio"
                  className="w-full h-full object-cover filter brightness-[0.88] hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-[#0e0e10]/90 px-3 py-1 backdrop-blur-md border border-[#353437]">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#ffb86d] font-semibold">
                    [ REHEARSAL BAY // LIVE CAPTURE ]
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. SERVICES & TARIF RESMI
           ========================================================================= */}
        <section
          id="capabilities"
          className="wk-services w-full bg-[#1b1b1d] py-20 px-6 lg:px-16 border-b border-[#353437]/60"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#ffb86d] font-semibold">
                  02 // CAPABILITIES
                </span>
                <span className="h-px w-12 bg-[#353437]"></span>
                <span className="font-mono text-[10px] uppercase text-[#a08d7e]">
                  Layanan & Paket Tarif
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#e5e1e4]">
                Services & Capabilities
              </h2>
            </div>
            <p className="text-xs text-[#d7c3b1] max-w-md">
              Pilihan paket transparan untuk kebutuhan sewa ruang latihan,
              perekaman instrumen, hingga mixing mastering.
            </p>
          </div>

          <div className="wk-services-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Service Card 1 */}
            <div className="wk-service-card bg-[#131315] p-6 border border-[#353437] flex flex-col justify-between relative group">
              <div>
                <div className="flex items-center justify-between pb-2 mb-4 border-b border-[#353437]">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#ffb86d] font-semibold">
                    [ SVC_01 // LATIHAN BAND ]
                  </span>
                </div>
                <h3 className="font-serif text-2xl text-[#e5e1e4] mb-1">
                  Studio Rehearsal
                </h3>
                <div className="text-2xl font-mono text-[#ffb86d] font-bold mb-3">
                  Rp 75.000{" "}
                  <span className="text-xs font-sans text-[#a08d7e] font-normal">
                    / jam
                  </span>
                </div>
                <p className="text-xs text-[#d7c3b1] leading-relaxed mb-6">
                  Sewa ruang latihan ber-AC dengan backline drumset, amplifier
                  gitar high-gain, bass rig, dan mixer PA jernih.
                </p>
              </div>
              <a
                href="#booking-console"
                className="font-mono text-xs uppercase text-[#ffb86d] font-semibold flex items-center gap-1"
              >
                Pilih Paket Ini{" "}
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </a>
            </div>

            {/* Service Card 2 */}
            <div className="wk-service-card bg-[#131315] p-6 border border-[#353437] flex flex-col justify-between relative group">
              <div>
                <div className="flex items-center justify-between pb-2 mb-4 border-b border-[#353437]">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#ffb86d] font-semibold">
                    [ SVC_02 // REKAMAN MULTI-TRACK ]
                  </span>
                </div>
                <h3 className="font-serif text-2xl text-[#e5e1e4] mb-1">
                  Recording Session
                </h3>
                <div className="text-2xl font-mono text-[#ffb86d] font-bold mb-3">
                  Rp 150.000{" "}
                  <span className="text-xs font-sans text-[#a08d7e] font-normal">
                    / jam
                  </span>
                </div>
                <p className="text-xs text-[#d7c3b1] leading-relaxed mb-6">
                  Perekaman instrumen drum multi-mic, vokal terisolasi,
                  gitar/bass tracking dengan damping akustik tanpa bocor.
                </p>
              </div>
              <a
                href="#booking-console"
                className="font-mono text-xs uppercase text-[#ffb86d] font-semibold flex items-center gap-1"
              >
                Pilih Paket Ini{" "}
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </a>
            </div>

            {/* Service Card 3 */}
            <div className="wk-service-card bg-[#131315] p-6 border border-[#353437] flex flex-col justify-between relative group">
              <div>
                <div className="flex items-center justify-between pb-2 mb-4 border-b border-[#353437]">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#ffb86d] font-semibold">
                    [ SVC_03 // PASCA PRODUKSI ]
                  </span>
                </div>
                <h3 className="font-serif text-2xl text-[#e5e1e4] mb-1">
                  Mixing & Mastering
                </h3>
                <div className="text-2xl font-mono text-[#ffb86d] font-bold mb-3">
                  Rp 500.000{" "}
                  <span className="text-xs font-sans text-[#a08d7e] font-normal">
                    / lagu
                  </span>
                </div>
                <p className="text-xs text-[#d7c3b1] leading-relaxed mb-6">
                  Pengolahan frekuensi, balancing, hingga kompresi tingkat
                  lanjut agar lagu kamu siap edar di Spotify & Apple Music.
                </p>
              </div>
              <a
                href="https://instagram.com/w.hubstudio" target="_blank" rel="noopener noreferrer"
                className="font-mono text-xs uppercase text-[#ffb86d] font-semibold flex items-center gap-1"
              >
                Konsultasi Mixing{" "}
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. SPACES BENTO GRID
           ========================================================================= */}
        <section
          id="spaces"
          className="wk-spaces w-full bg-[#131315] py-20 px-6 lg:px-16 border-b border-[#353437]/60"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#ffb86d] font-semibold">
                  03 // SPACES
                </span>
                <span className="h-px w-12 bg-[#353437]"></span>
                <span className="font-mono text-[10px] uppercase text-[#a08d7e]">
                  Fasilitas Studio
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#e5e1e4]">
                Wingking Studio Spaces
              </h2>
            </div>
          </div>

          <div className="wk-space-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="wk-space-card bg-[#1b1b1d] p-4 border border-[#353437]">
              <div className="flex items-center justify-between text-[#a08d7e] font-mono text-[10px] uppercase mb-2">
                <span>[ BAY 01 ]</span>
                <span className="text-[#ffb86d]">REHEARSAL ROOM</span>
              </div>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAik7Pwgn9T5SqU2rXUlKg1AlYQxuQLDzJRGbU1DbOmqaN-FueKJo12nKMYoN2y6Gj2FH-jlLRhKw7JxJutRX8bjTssMfPg-HSPJFZiXD9MEDBViRpprLDISN0hv00r5CEIR4SMYrMtNcvdpp7__NMUBj9ylhXfruuKB93THGimQb5jejVJW6JY0IHlW4SYbSpdK33PuYqwsOAInEIZ9c020b6mkfTFc9c01Wz_yHGTYlpoeHdwwJtZXQ"
                alt="Rehearsal Room"
                className="w-full h-40 object-cover mb-3"
              />
              <h3 className="font-semibold text-lg text-[#e5e1e4] mb-1">
                Main Live Tracking Room
              </h3>
              <p className="text-xs text-[#d7c3b1] leading-relaxed">
                Ruang utama berdifuser kayu solid untuk latihan band penuh dan
                live tracking drum.
              </p>
            </div>

            <div className="wk-space-card bg-[#1b1b1d] p-4 border border-[#353437]">
              <div className="flex items-center justify-between text-[#a08d7e] font-mono text-[10px] uppercase mb-2">
                <span>[ BAY 02 ]</span>
                <span className="text-[#ffb86d]">CONTROL ROOM</span>
              </div>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDptAJUL0MDaNlofnooeMZ_ffMEAtzF7DgwyHFlLOw_OaMxX5GIUfGeVPgQt9XDZN8AFQ8SNmSXfhhgNq3AdPF72Y4sEc7aC3v-X7M73-7agnoiF4wg9-KRounN05qdO9AGCZadcTAXs12l_EuhNb_TEs0iintSwWMJao6_ohiOiA94a4HTelMhsG0pAj3F-C6vriU2RHIpgAeH5uVRbpXozPaObuE640kU5W-zWoYByIvSandD6HaUZQ"
                alt="Control Room"
                className="w-full h-40 object-cover mb-3"
              />
              <h3 className="font-semibold text-lg text-[#e5e1e4] mb-1">
                Control Suite Alpha
              </h3>
              <p className="text-xs text-[#d7c3b1] leading-relaxed">
                Ruang kendali operator dengan monitoring datar terkalibrasi
                untuk penyelarasan audio.
              </p>
            </div>

            <div className="wk-space-card bg-[#1b1b1d] p-4 border border-[#353437]">
              <div className="flex items-center justify-between text-[#a08d7e] font-mono text-[10px] uppercase mb-2">
                <span>[ BAY 03 ]</span>
                <span className="text-[#ffb86d]">BACKLINE RIGS</span>
              </div>
              <div
                className="w-full h-40 bg-cover bg-center mb-3"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCzPY9kmYit4dv1byy808m1VdCcoIH68WtRCuhbNJn1wzbPgK5lE_US_KlmqKqC4-p-99LYMH9mbn4rPq0JkDDFSM-OS1ZxMwVOTiRy82VoCAReDUm2kIazAxYNkjsWcB-BsbMYx2ajNfYwZAbt9uqSCEVCrVzhBplewTIIVjc2U8JOSOeknFhMiR1HFp6m_cBqnuDxwQTrDkxH8sQo1YS661NPesh3eDePOm5wxjnjl4CfhNJQ4AEuCg')",
                }}
              ></div>
              <h3 className="font-semibold text-lg text-[#e5e1e4] mb-1">
                Instrumen & Amplifikasi
              </h3>
              <p className="text-xs text-[#d7c3b1] leading-relaxed">
                Satu set drum akustik profesional dan jajaran amp tabung
                gitar/bass bertenaga.
              </p>
            </div>

            <div className="wk-space-card bg-[#1b1b1d] p-4 border border-[#353437]">
              <div className="flex items-center justify-between text-[#a08d7e] font-mono text-[10px] uppercase mb-2">
                <span>[ BAY 04 ]</span>
                <span className="text-[#ffb86d]">VOCAL BOOTH</span>
              </div>
              <div
                className="w-full h-40 bg-cover bg-center mb-3"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA0yv62PagzUUzZxCORkTCXN2GijrI1nkiJvsTuHL45efqWRveulCkI23ZvX1BO6-B1xs3Xuc3hs-kIwlzj2gzPSQkF58gR4_FzMdfan7t6z8lJWUWGuYVQV_lJfNOPqFhJ2Abl6SJQxYkEGfQwHCytSUFYhpyuMdjuFix5pzkxmtok6TgEkEu16LAmf6uNTL0jJ5eRjYOsE4Pe_99kIB9UG46voMs9EmrJ47K0_VEagS_mDRy3OtFUzA')",
                }}
              ></div>
              <h3 className="font-semibold text-lg text-[#e5e1e4] mb-1">
                Iso Vocal Booth
              </h3>
              <p className="text-xs text-[#d7c3b1] leading-relaxed">
                Booth isolasi kedap vokal dan instrumen akustik tunggal bebas
                gema.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. RESERVATION CONSOLE
           ========================================================================= */}
        <section
          id="booking-console"
          className="wk-booking w-full bg-[#1b1b1d] py-20 px-6 lg:px-16 border-b border-[#353437]/60"
        >
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#ffb86d] font-semibold">
                  04 // RESERVATION CONSOLE
                </span>
                <span className="h-px w-8 bg-[#353437]"></span>
                <span className="font-mono text-[10px] uppercase text-[#a08d7e]">
                  Realtime Booking
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#e5e1e4]">
                Form Reservasi Jadwal Studio
              </h2>
            </div>

            {!response.success && <p role="alert" className="mb-5 border border-red-400 p-4 text-red-300">Layanan booking belum tersedia karena koneksi data bermasalah. Coba lagi nanti.</p>}
            <BookingForm services={services} />
          </div>
        </section>
      </main>

      {/* =========================================================================
          8. FOOTER
         ========================================================================= */}
      <footer className="w-full bg-[#0e0e10] border-t border-[#353437] text-[#e5e1e4] py-12 px-6 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-[#353437]/60 pb-8">
          <div className="md:col-span-5 space-y-3">
            <div className="font-mono text-sm uppercase tracking-widest font-bold text-[#e5e1e4]">
              WINGKING STUDIO
            </div>
            <p className="text-xs text-[#d7c3b1] max-w-sm leading-relaxed">
              Studio rekaman & rehearsal musik Purwokerto (@w.hubstudio).
            </p>
          </div>

          <div className="md:col-span-3 space-y-2 font-mono text-xs">
            <span className="text-[#a08d7e] uppercase tracking-wider block border-b border-[#353437] pb-1">
              Lokasi & Operasional
            </span>
            <p className="text-[#d7c3b1]">Purwokerto, Jawa Tengah</p>
            <p className="text-[#ffb86d]">SETIAP HARI 09:00 — 23:00 WIB</p>
          </div>

          <div className="md:col-span-4 space-y-2 font-mono text-xs">
            <span className="text-[#a08d7e] uppercase tracking-wider block border-b border-[#353437] pb-1">
              Transmission
            </span>
            <a
              href="https://instagram.com/w.hubstudio"
              target="_blank"
              className="block text-[#ffb86d] hover:underline"
            >
              Instagram // @w.hubstudio
            </a>
            <p className="text-[#a08d7e] text-[10px] mt-2">
              © {new Date().getFullYear()} WINGKING STUDIO. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
