"use client";

import { useState } from "react";
const links = [
  { href: "#about", label: "Studio" },
  { href: "#capabilities", label: "Layanan" },
  { href: "#spaces", label: "Fasilitas" },
  { href: "#booking-console", label: "Booking" },
  { href: "/admin", label: "Admin" },
];
export default function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative xl:hidden">
      <button type="button" aria-label="Menu navigasi" aria-expanded={open}
        aria-controls="mobile-nav" onClick={() => setOpen(!open)}
        className="min-h-11 min-w-11 border border-[#6b5748] text-[#ffb86d] font-mono text-xl focus-visible:outline-2 focus-visible:outline-[#ffb86d]">
        {open ? "✕" : "☰"}
      </button>
      {open && <nav id="mobile-nav" aria-label="Menu mobile"
        className="absolute right-0 top-14 w-60 bg-[#131315] border border-[#6b5748] p-4 shadow-2xl z-[100]">
        {links.map((item) => <a key={item.href} href={item.href} onClick={() => setOpen(false)}
          className="block py-3 px-3 font-mono text-sm text-[#e5e1e4] hover:bg-[#2a2a2c] focus-visible:outline-2 focus-visible:outline-[#ffb86d]">{item.label}</a>)}
      </nav>}
    </div>
  );
}
