import type { Metadata } from "next";
import "./globals.css";
import SiteMotion from "@/components/SiteMotion";

export const metadata: Metadata = {
  title: "WINGKING STUDIO — Acoustic Craft & Production (@w.hubstudio)",
  description:
    "Architectural precision acoustic suites engineered for record production, master tape transfer, and ensemble rehearsal in Purwokerto.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <head>
        {/* Google Fonts: Newsreader, JetBrains Mono, Hanken Grotesk */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,300..900;1,300..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap"
          rel="stylesheet"
        />
        {/* Google Material Symbols */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#131315] text-[#e5e1e4] antialiased selection:bg-[#e59840] selection:text-[#5c3400] min-h-screen flex flex-col">
        <SiteMotion />
        {children}
      </body>
    </html>
  );
}
