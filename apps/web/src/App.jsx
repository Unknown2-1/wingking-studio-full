/* WINGKING STUDIO — recovered editable React module.
 * Reconstructed from deployed production JS; original JSX not yet available.
 * Recovered components have descriptive names; internal variables still reflect the old minified build.
 */
import React from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowRight,
  ArrowUpRight,
  CloudUpload,
  Disc3,
  ExternalLink,
  Headphones,
  Instagram,
  MapPin,
  Menu,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { config } from "./config.js";
import WingkingAssistant from "./WingkingAssistant.jsx";

// Always redirect email login links to the live public site, not localhost.
const EMAIL_UPLOAD_REDIRECT = "https://wingking-studio.vercel.app/upload.html";
const EMAIL_GALLERY_REDIRECT =
  "https://wingking-studio.vercel.app/?gallery=upload";

const Lc = ArrowRight,
  dt = ArrowUpRight,
  Wy = CloudUpload,
  HE = Disc3,
  GE = ExternalLink,
  Fy = Headphones,
  eg = Instagram,
  PE = Menu,
  KE = Plus,
  VE = ShieldCheck,
  tg = Sparkles,
  Mi = X;

// Show useful, non-sensitive Auth feedback rather than raw API errors.
function emailOtpErrorMessage(error) {
  const code = String(error?.code || "");
  const raw = String(error?.message || "");
  if (
    code === "over_email_send_rate_limit" ||
    /email.*rate limit|rate limit.*email/i.test(raw)
  )
    return "Batas pengiriman email WINGKING sudah tercapai. Coba lagi nanti. Admin sedang perlu mengaktifkan layanan SMTP pengirim khusus.";
  if (
    code === "over_request_rate_limit" ||
    error?.status === 429 ||
    /rate limit|too many requests/i.test(raw)
  )
    return "Terlalu banyak permintaan kode. Jangan tekan berulang-ulang; coba lagi setelah jeda.";
  if (
    /error sending confirmation email|error sending magic link|failed to send email|smtp.*error|mailer.*error/i.test(
      raw,
    )
  )
    return "Kode OTP belum terkirim karena layanan email WINGKING sedang bermasalah. Tim admin perlu memeriksa pengaturan pengirim email.";
  if (code === "email_address_not_authorized")
    return "Email penerima belum diizinkan oleh layanan bawaan. Admin perlu mengaktifkan SMTP WINGKING.";
  if (
    /535|BadCredentials|Authentication failed|SMTP.*auth|Username and Password not accepted/i.test(
      raw,
    )
  )
    return "Pengirim email WINGKING sedang bermasalah. Admin perlu memperbaiki koneksi SMTP. Kode belum terkirim.";
  if (/otp_expired|token has expired|expired/i.test(raw))
    return "Kode sudah kedaluwarsa. Minta kode baru.";
  return raw || "Kode verifikasi belum bisa dikirim. Coba lagi nanti.";
}

// Shared OTP sender for WINGKING forms. Never show "sent" after a failed Auth request.
// The server also rate limits; this client guard reduces accidental repeated sends.
const wingkingOtpNextAllowed = new Map();
async function sendWingkingOtp(address, redirectTo) {
  if (!supabase) throw new Error("Verifikasi email sedang tidak tersedia.");
  const emailAddress = String(address || "")
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress))
    throw new Error("Masukkan alamat email yang benar.");
  const wait = Math.ceil(
    ((wingkingOtpNextAllowed.get(emailAddress) || 0) - Date.now()) / 1000,
  );
  if (wait > 0)
    throw new Error("Tunggu " + wait + " detik sebelum mengirim kode lagi.");
  const { error } = await supabase.auth.signInWithOtp({
    email: emailAddress,
    options: { shouldCreateUser: true, emailRedirectTo: redirectTo },
  });
  if (error) throw error;
  wingkingOtpNextAllowed.set(emailAddress, Date.now() + 60000);
}

const hasBackend = !!config.supabaseKey;
function isValidHttpUrl(s) {
  try {
    const a = new URL(s);
    return ["https:", "http:"].includes(a.protocol);
  } catch {
    return !1;
  }
}
function validatedUrl(s) {
  return isValidHttpUrl(s) ? s : null;
}
function WhatsAppIcon() {
  return React.createElement(
    "svg",
    {
      width: 22,
      height: 22,
      viewBox: "0 0 24 24",
      fill: "none",
      "aria-hidden": "true",
    },
    React.createElement("circle", {
      cx: 12,
      cy: 12,
      r: 10,
      fill: "#25d366",
    }),
    React.createElement("path", {
      d: "M7.5 4.8c-.5-.1-1.1.1-1.5.5L4.9 6.4c-.5.6-.7 1.4-.5 2.1 1.3 4.8 5.1 8.6 9.9 9.9.8.2 1.6-.1 2.1-.6l1-1c.4-.4.6-1 .4-1.5l-1.3-2.8c-.2-.5-.8-.8-1.3-.6l-1.9.6a11.2 11.2 0 0 1-2.5-2.5l.6-1.9c.2-.5-.1-1.1-.6-1.3L8 5.5c-.2-.1-.4-.2-.5-.2Z",
      fill: "#fff",
    }),
  );
}
function formatRupiah(s) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Number(s) || 0));
}
function parseRateList(s) {
  return String(s || "")
    .split(
      `
`,
    )
    .map((a) => a.trim())
    .filter(Boolean)
    .slice(0, 7)
    .map((a) => {
      const [r, l] = a.split("|").map((u) => u.trim());
      return {
        label: String(r || "").slice(0, 50),
        price: Number((l || "").replace(/[^0-9]/g, "")),
      };
    })
    .filter(
      (a) =>
        a.label && Number.isFinite(a.price) && a.price >= 0 && a.price <= 1e9,
    );
}
const DEMO_BANDS = [
    {
      id: "demo-1",
      name: "Sore Sebelah",
      genre: "Indie pop",
      city: "Purwokerto",
      tagline: "Lagu tentang hal kecil yang rasanya gede.",
      story: "Tiga teman, satu kamar, dan terlalu banyak cerita.",
      accent: "#F8CA45",
      rate_cards: [{ label: "Live set", price: 15e5 }],
      demo: !0,
      instagram_url: "",
      spotify_url: "",
    },
    {
      id: "demo-2",
      name: "Kebun Bising",
      genre: "Alternative",
      city: "Purwokerto",
      tagline: "Sedikit berisik, banyak perasaan.",
      story: "Bermula dari latihan malam minggu.",
      accent: "#FFA1B9",
      rate_cards: [{ label: "Band performance", price: 22e5 }],
      demo: !0,
      instagram_url: "",
      spotify_url: "",
    },
    {
      id: "demo-3",
      name: "Kamar Lima",
      genre: "Dream pop",
      city: "Banyumas",
      tagline: "Musik dari kamar buat dunia luar.",
      story: "Lagu-lagu kecil dari kamar nomor lima.",
      accent: "#A0D8BD",
      rate_cards: [{ label: "Acoustic set", price: 95e4 }],
      demo: !0,
      instagram_url: "",
      spotify_url: "",
    },
  ],
  DEMO_RELEASES = [
    {
      id: "dr-1",
      title: "Minggu yang Panjang",
      kind: "Single",
      band_name: "Sore Sebelah",
      art: "#C7E57D",
      emoji: "☀",
      demo: !0,
    },
    {
      id: "dr-2",
      title: "Bunyikan Lagi!",
      kind: "EP",
      band_name: "Kebun Bising",
      art: "#F3A3C3",
      emoji: "★",
      demo: !0,
    },
    {
      id: "dr-3",
      title: "Dari Kamar",
      kind: "Album",
      band_name: "Kamar Lima",
      art: "#F7C966",
      emoji: "✿",
      demo: !0,
    },
  ],
  supabase = hasBackend
    ? createClient(config.supabaseUrl, config.supabaseKey, {
        auth: {
          autoRefreshToken: !0,
          persistSession: !0,
          detectSessionInUrl: !0,
        },
      })
    : null,
  ACCENT_COLORS = ["#F8CA45", "#F4A6BD", "#BFE48A", "#9AD7C1", "#F29E83"],
  safeHref = (s) => (s && validatedUrl(s)) || "",
  ICON_SIZE = 19;
function AssetImage({
  name: s,
  className: a = "",
  alt: r = "",
  loading: l = "lazy",
  style: u,
}) {
  return React.createElement("img", {
    className: "wingking-asset " + a,
    src: "/assets/" + s + ".webp",
    alt: r,
    loading: l,
    decoding: "async",
    draggable: "false",
    style: u,
  });
}
function WatermelonHeroArt() {
  return React.createElement(
    "div",
    {
      className: "boombox-rig",
      role: "img",
      "aria-label": "Maskot semangka Wingking",
    },
    React.createElement("img", {
      src: "/assets/watermelon-hero-transparent.webp",
      className: "boombox-hero-portrait",
      alt: "Maskot semangka ceria bertuliskan INFO INFO",
      width: 500,
      height: 500,
      loading: "eager",
      decoding: "async",
      draggable: false,
    }),
  );
}
function WingkingLogo() {
  return React.createElement(
    "a",
    {
      href: "#atas",
      className: "brand brand-official-link",
      "aria-label": "Wingking Studio — kembali ke atas",
    },
    React.createElement("img", {
      src: "/wingking-logo-festival.webp",
      className: "brand-original",
      alt: "Wingking Studio — logo festival",
      width: "137",
      height: "70",
    }),
  );
}
function PillLink({
  href: s,
  children: a,
  className: r = "",
  outline: l = !1,
}) {
  return React.createElement(
    "a",
    { className: "pill-button " + (l ? "pill-outline " : "") + r, href: s },
    React.createElement("span", null, a),
    React.createElement(dt, { size: ICON_SIZE, strokeWidth: 2.5 }),
  );
}
function SectionKicker({ children: s }) {
  return React.createElement(
    "span",
    { className: "kicker" },
    React.createElement(AssetImage, {
      name: "burst-star",
      className: "kicker-img",
    }),
    " ",
    s,
  );
}
function MotionMarquee({ play: s = !0 }) {
  const a = React.useRef(null);
  return (
    React.useEffect(() => {
      const r = a.current;
      if (!r) return;
      if (!s) {
        ((r.style.transform = "translate3d(0,0,0)"),
          (r.dataset.motionTick = "0"));
        return;
      }
      let l = 0,
        u = 0,
        c = 0,
        h = 0;
      const m = (y) => {
        u || (u = y);
        const d = Math.min(65, y - u);
        u = y;
        const b = r.scrollWidth / 2;
        (b > 0 &&
          ((c = (c + d * 0.065) % b),
          (r.style.transform = `translate3d(${-c.toFixed(2)}px,0,0)`),
          y > h &&
            ((r.dataset.motionTick = Math.round(c).toString()), (h = y + 500))),
          (l = requestAnimationFrame(m)));
      };
      return (
        (l = requestAnimationFrame(m)),
        () => {
          (cancelAnimationFrame(l), (r.style.transform = "translate3d(0,0,0)"));
        }
      );
    }, [s]),
    React.createElement(
      "div",
      { className: "marquee", "aria-label": "Musik lokal, seru terus" },
      React.createElement(
        "div",
        {
          ref: a,
          className: "marquee-inner",
          "data-motion-running": s ? "true" : "false",
        },
        Array.from({ length: 4 }, (r, l) =>
          React.createElement(
            "span",
            { key: l },
            "MUSIK LOKAL ",
            React.createElement(AssetImage, {
              name: "burst-star",
              className: "marquee-sticker",
            }),
            " SUARA BARU ",
            React.createElement(AssetImage, {
              name: "watermelon-sparkle",
              className: "marquee-sticker",
            }),
            " BIKIN RAME ",
            React.createElement(AssetImage, {
              name: "watermelon-music",
              className: "marquee-sticker",
            }),
            " ",
          ),
        ),
      ),
    )
  );
}
function ReleaseArtwork({
  tone: s = "#F8CA45",
  image: a = "",
  variant: r = 0,
}) {
  const l = [
    "watermelon-music",
    "watermelon-sparkle",
    "watermelon-welcome",
    "watermelon-music",
  ][r % 4];
  return React.createElement(
    "div",
    { className: "art art-" + r, style: { "--art": s } },
    a && validatedUrl(a)
      ? React.createElement("img", {
          src: a,
          alt: "Sampul rilisan",
          loading: "lazy",
        })
      : React.createElement(
          React.Fragment,
          null,
          React.createElement(AssetImage, {
            name: l,
            className: "record-art",
            alt: "Ilustrasi musik Wingking",
          }),
          React.createElement(
            "span",
            { className: "art-stamp" },
            "WINGKING STUDIO",
            React.createElement("br", null),
            "LOCAL BEATS",
          ),
        ),
  );
}
function ReleaseCard({ item: s, index: a, onClick: r }) {
  var l;
  return React.createElement(
    "button",
    {
      className: "release-card",
      onClick: () => r(s),
      type: "button",
      "aria-label": "Lihat rilisan " + s.title,
    },
    React.createElement(
      "div",
      { className: "release-picture" },
      React.createElement(ReleaseArtwork, {
        tone: s.art || ACCENT_COLORS[a % ACCENT_COLORS.length],
        image: s.cover_url,
        variant: a % 4,
      }),
      React.createElement(
        "span",
        { className: "release-index" },
        String(a + 1).padStart(2, "0"),
        " / ",
        s.kind,
      ),
    ),
    React.createElement(
      "div",
      { className: "release-text" },
      React.createElement(
        "div",
        null,
        React.createElement("h3", null, s.title),
        React.createElement(
          "p",
          null,
          s.band_name ||
            ((l = s.wk_bands) == null ? void 0 : l.name) ||
            "Band Wingking",
          " ",
          s.demo &&
            React.createElement("small", { className: "demo-badge" }, "CONTOH"),
        ),
      ),
      React.createElement(
        "span",
        { className: "round-arrow" },
        React.createElement(dt, { size: 19 }),
      ),
    ),
  );
}
function BandCard({ band: s, index: a, onClick: r }) {
  const initials =
    String(s.name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0] || "")
      .join("")
      .toUpperCase() || "B";
  return React.createElement(
    "button",
    {
      type: "button",
      className: "band-card",
      onClick: () => r(s),
      style: { "--band": s.accent || ACCENT_COLORS[a % ACCENT_COLORS.length] },
    },
    React.createElement(
      "div",
      { className: "band-poster" },
      s.photo_url && validatedUrl(s.photo_url)
        ? React.createElement("img", {
            className: "band-photo",
            src: s.photo_url,
            alt: "Foto " + s.name,
            loading: "lazy",
          })
        : React.createElement(
            "span",
            { className: "band-initials", "aria-hidden": "true" },
            initials,
          ),
      React.createElement(
        "span",
        { className: "band-sticker" },
        s.genre || "Indie",
      ),
    ),
    React.createElement(
      "div",
      { className: "band-meta" },
      React.createElement(
        "div",
        null,
        React.createElement("h3", null, s.name),
        React.createElement(
          "p",
          null,
          s.city || "Purwokerto",
          " ",
          s.demo &&
            React.createElement("small", { className: "demo-badge" }, "CONTOH"),
        ),
      ),
      React.createElement(dt, { size: 26 }),
    ),
    React.createElement(
      "div",
      { className: "band-tagline" },
      s.tagline || "Kenalan sama band ini yuk!",
    ),
    React.createElement(
      "div",
      { className: "band-bottom" },
      React.createElement(
        "span",
        null,
        s.presskit_id ? "DOWNLOAD PRESS KIT" : "CERITA + HARGA",
      ),
      React.createElement(Lc, { size: 17 }),
    ),
  );
}
function VideoCard({ item: s, index: a }) {
  var y;
  const r = React.useRef(null),
    [l, u] = React.useState(!1),
    [c, h] = React.useState(!1);
  (React.useEffect(() => {
    const d = r.current;
    d && (d.muted = !l);
  }, [l]),
    React.useEffect(() => {
      const d = r.current;
      if (!d) return;
      const b = new IntersectionObserver(
        ([R]) => {
          R.isIntersecting && R.intersectionRatio >= 0.4
            ? ((d.muted = !0), d.play().catch(() => {}))
            : (d.pause(), (d.muted = !0), u(!1));
        },
        { threshold: [0, 0.4, 0.7] },
      );
      return (
        b.observe(d),
        () => {
          (b.disconnect(), d.pause());
        }
      );
    }, [s.video_url]));
  const m = () => {
    const d = r.current;
    if (!d) return;
    const b = !l;
    (u(b), (d.muted = !b), b && d.play().catch(() => u(!1)));
  };
  return React.createElement(
    "article",
    {
      className: "clip-card",
      style: {
        "--clip-accent": ["#f5a7c1", "#ffce5e", "#c0e7dd", "#cbe68f"][a % 4],
      },
    },
    React.createElement("video", {
      ref: r,
      className: "clip-video",
      src: s.video_url,
      playsInline: !0,
      muted: !0,
      loop: !0,
      preload: "metadata",
      autoPlay: !1,
      onError: () => h(!0),
      "aria-label": "Video " + s.title,
    }),
    c &&
      React.createElement(
        "div",
        { className: "clip-error" },
        "Video tidak dapat diputar",
      ),
    React.createElement("div", { className: "clip-shade" }),
    React.createElement(
      "div",
      { className: "clip-bottom" },
      React.createElement(
        "p",
        null,
        ((y = s.wk_bands) == null ? void 0 : y.name) || "Wingking Studio",
      ),
      React.createElement("h3", null, s.title),
      React.createElement(
        "div",
        { className: "clip-controls" },
        React.createElement(
          "button",
          {
            type: "button",
            className: "clip-sound",
            onClick: m,
            "aria-label": l ? "Matikan suara" : "Nyalakan suara",
          },
          l ? "SUARA ON" : "SUARA OFF",
          " ",
          React.createElement(Fy, { size: 15 }),
        ),
        safeHref(s.instagram_url) &&
          React.createElement(
            "a",
            {
              href: s.instagram_url,
              target: "_blank",
              rel: "noopener noreferrer",
              "aria-label": "Buka Instagram " + s.title,
            },
            React.createElement(eg, { size: 21 }),
          ),
      ),
    ),
  );
}
function VideoPlaceholder({ index: s }) {
  return React.createElement(
    "article",
    {
      className: "clip-card clip-card-placeholder",
      style: { "--clip-accent": ["#7dc7bf", "#f5a7c1", "#8db8ff"][s % 3] },
    },
    React.createElement(
      "div",
      { className: "clip-placeholder-center" },
      React.createElement(
        "span",
        null,
        "VIDEO",
        React.createElement("br", null),
        "NOT AVAILABLE",
      ),
      React.createElement("small", null, "COMING SOON"),
    ),
    React.createElement(
      "div",
      { className: "clip-placeholder-footer" },
      React.createElement("p", null, "WINGKING STUDIO"),
      React.createElement("h3", null, "NO FOOTAGE YET"),
    ),
  );
}

function studioVideoId(link) {
  try {
    const url = new URL(link);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    let id = "";
    if (hostname === "youtu.be") id = url.pathname.split("/")[1] || "";
    else if (
      ["youtube.com", "m.youtube.com", "music.youtube.com"].includes(hostname)
    ) {
      id = url.searchParams.get("v") || "";
      if (!id && url.pathname.startsWith("/shorts/"))
        id = url.pathname.split("/")[2] || "";
    }
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "";
  } catch {
    return "";
  }
}

function ExternalVideoCard({ item, index }) {
  const link = validatedUrl(item.external_url);
  const preview = validatedUrl(item.video_url);
  const youtubeId = studioVideoId(item.external_url);
  const poster = youtubeId
    ? "https://i.ytimg.com/vi/" + youtubeId + "/hqdefault.jpg"
    : "";
  const cardRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const youtubeRef = React.useRef(null);
  const [previewError, setPreviewError] = React.useState(false);
  const [youtubeActive, setYoutubeActive] = React.useState(false);
  const [soundOn, setSoundOn] = React.useState(false);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !preview || previewError) return;
    video.muted = true;
    setSoundOn(false);
    if (typeof IntersectionObserver === "undefined") {
      video.play().catch(() => {});
      return () => video.pause();
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [preview, previewError]);

  React.useEffect(() => {
    if (!youtubeId || preview) return;
    const card = cardRef.current;
    if (!card || typeof IntersectionObserver === "undefined") {
      setYoutubeActive(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setYoutubeActive(entry.isIntersecting);
        if (!entry.isIntersecting) setSoundOn(false);
      },
      { rootMargin: "100px", threshold: 0.1 },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, [youtubeId, preview]);

  React.useEffect(() => {
    const player = youtubeRef.current;
    if (!player || !youtubeActive) return;
    player.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func: soundOn ? "unMute" : "mute",
        args: [],
      }),
      "https://www.youtube-nocookie.com",
    );
  }, [soundOn, youtubeActive]);

  const toggleSound = () => {
    const next = !soundOn;
    if (videoRef.current) videoRef.current.muted = !next;
    if (youtubeRef.current?.contentWindow) {
      youtubeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: next ? "unMute" : "mute",
          args: [],
        }),
        "https://www.youtube-nocookie.com",
      );
    }
    setSoundOn(next);
  };

  return (
    <article
      ref={cardRef}
      className="clip-card wk-external-video wk-original-session-card"
    >
      <div className="wk-external-video-art">
        {youtubeActive && youtubeId && !preview ? (
          <iframe
            ref={youtubeRef}
            className="wk-external-video-embed"
            src={
              "https://www.youtube-nocookie.com/embed/" +
              youtubeId +
              "?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&enablejsapi=1"
            }
            title={"Video Wingking di " + (item.platform || "YouTube")}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : preview && !previewError ? (
          <video
            ref={videoRef}
            className="wk-external-video-preview"
            src={preview}
            poster={poster || undefined}
            muted
            playsInline
            loop
            preload="metadata"
            onError={() => setPreviewError(true)}
            aria-label={"Preview video Wingking - " + item.platform}
          />
        ) : poster ? (
          <img
            className="wk-external-video-poster"
            src={poster}
            alt={"Pratinjau video Wingking di " + item.platform}
            loading="lazy"
          />
        ) : (
          <div className="wk-external-video-unavailable">
            PREVIEW TIDAK TERSEDIA
          </div>
        )}
      </div>
      <div className="wk-original-session-overlay">
        <span className="wk-original-session-label">WINGKING / LIVE</span>
        <div className="wk-original-session-controls">
          {(preview || youtubeId) && (
            <button
              className="wk-original-session-sound"
              type="button"
              onClick={toggleSound}
              aria-label={soundOn ? "Matikan suara" : "Nyalakan suara"}
              aria-pressed={soundOn}
            >
              SUARA {soundOn ? "ON" : "OFF"}
              <Fy size={15} />
            </button>
          )}
          {link && (
            <a
              className="wk-original-session-link"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={"Buka video di " + (item.platform || "platform")}
            >
              {youtubeId ? "YOUTUBE" : item.platform || "BUKA VIDEO"}
              <ArrowUpRight size={17} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function ExternalReleaseCard({ item }) {
  const url = validatedUrl(item.external_url);
  return (
    <a
      className="wk-external-release"
      href={url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        "Dengarkan " +
        item.title +
        " oleh " +
        item.band_name +
        " di " +
        item.platform
      }
    >
      <AssetImage name="watermelon-music" alt="Maskot semangka bernyanyi" />
      <div>
        <small>RILISAN / {item.platform}</small>
        <strong>{item.title}</strong>
        <span className="wk-release-artist">{item.band_name}</span>
        <span>
          DENGARKAN SEKARANG <ArrowUpRight size={16} />
        </span>
      </div>
    </a>
  );
}

function VideoSection({ clips: s, onAdd: a }) {
  const r = s.length > 0;
  return React.createElement(
    "section",
    { id: "keseruan", className: "clip-section section-pad" },
    React.createElement(
      "div",
      { className: "container" },
      React.createElement(
        "div",
        { className: "clip-heading" },
        React.createElement(
          "div",
          null,
          React.createElement(
            "span",
            { className: "clip-eyebrow" },
            "WINGKING / LIVE SESSION",
          ),
          React.createElement(
            "h2",
            null,
            "STUDIO",
            React.createElement("br", null),
            React.createElement("span", null, "SESSIONS."),
          ),
          React.createElement(
            "p",
            null,
            "Video dari studio. Tonton, lalu buka link aslinya.",
          ),
        ),
        React.createElement(AssetImage, {
          name: "watermelon-music",
          className: "clip-heading-mascot",
          alt: "Maskot Wingking",
        }),
      ),
      React.createElement(
        "div",
        { className: "clip-rail" },
        r
          ? s.slice(0, 8).map((l, u) =>
              l.external_url
                ? React.createElement(ExternalVideoCard, {
                    item: l,
                    index: u,
                    key: l.id,
                  })
                : React.createElement(VideoCard, {
                    item: l,
                    index: u,
                    key: l.id,
                  }),
            )
          : Array.from({ length: 3 }, (l, u) =>
              React.createElement(VideoPlaceholder, { index: u, key: u }),
            ),
      ),
      React.createElement(
        "div",
        { className: "clip-section-footer" },
        React.createElement("span", null, "REAL MOMENTS. REAL NOISE."),
        React.createElement(
          "span",
          null,
          "GESER UNTUK LIHAT VIDEO ",
          React.createElement(Lc, { size: 18 }),
        ),
      ),
    ),
  );
}
function ToastMessage({ message: s, onClose: a }) {
  return (
    React.useEffect(() => {
      if (!s) return;
      const r = setTimeout(a, 4500);
      return () => clearTimeout(r);
    }, [s, a]),
    s
      ? React.createElement(
          "div",
          { className: "toast", role: "status" },
          React.createElement(tg, { size: 16 }),
          s,
          React.createElement(
            "button",
            { "aria-label": "Tutup pesan", onClick: a },
            React.createElement(Mi, { size: 16 }),
          ),
        )
      : null
  );
}
function StudioGalleryModal({ onClose }) {
  const [photos, setPhotos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [galleryError, setGalleryError] = React.useState("");
  const [showUpload, setShowUpload] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [codeSent, setCodeSent] = React.useState(false);
  const [verified, setVerified] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [caption, setCaption] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const endpoint = config.supabaseUrl
    ? config.supabaseUrl.replace(/\/+$/, "") + "/functions/v1/wingking-gallery"
    : "";

  const refreshGallery = React.useCallback(async () => {
    if (!supabase) {
      setGalleryError("Galeri sedang tidak terhubung. Coba lagi nanti.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("wk_gallery_photos")
        .select("id,title,caption,image_url,display_order,created_at")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(90);
      if (error) throw error;
      setPhotos(
        (data || []).filter((p) => /^https:\/\//i.test(p.image_url || "")),
      );
      setGalleryError("");
    } catch {
      setGalleryError("Foto galeri belum bisa dimuat. Coba muat ulang.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshGallery();
    let alive = true;
    let subscription;
    if (supabase) {
      const updateUser = (user) => {
        if (!alive) return;
        setVerified(Boolean(user?.email && user?.email_confirmed_at));
        if (user?.email) setEmail(user.email);
      };
      supabase.auth
        .getSession()
        .then(({ data }) => {
          updateUser(data?.session?.user);
        })
        .catch(() => {});
      const listener = supabase.auth.onAuthStateChange((_event, session) => {
        updateUser(session?.user);
      });
      subscription = listener?.data?.subscription;
    }
    return () => {
      alive = false;
      subscription?.unsubscribe();
    };
  }, [refreshGallery]);

  const galleryRequest = async (action, payload = {}) => {
    if (!supabase || !endpoint)
      throw new Error("Koneksi galeri belum tersedia.");
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    if (!session?.access_token || !session.user?.email_confirmed_at)
      throw new Error("Verifikasi email kamu sebelum mengirim foto.");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: config.supabaseKey,
        authorization: "Bearer " + session.access_token,
      },
      body: JSON.stringify({ action, ...payload }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok)
      throw new Error(result.error || "Layanan galeri sedang bermasalah.");
    return result;
  };

  const sendOtp = async (event) => {
    event.preventDefault();
    if (!supabase || busy) return;
    setBusy(true);
    setNotice("");
    try {
      const address = email.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))
        throw new Error("Isi email yang benar dulu, ya.");
      await sendWingkingOtp(address, EMAIL_GALLERY_REDIRECT);
      setCodeSent(true);
      setNotice("Kode verifikasi dikirim. Cek inbox atau folder spam.");
    } catch (err) {
      setNotice(emailOtpErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    if (!supabase || busy) return;
    setBusy(true);
    setNotice("");
    try {
      if (!/^\d{6}$/.test(code.trim()))
        throw new Error("Masukkan 6 angka kode OTP.");
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "email",
      });
      if (error) throw error;
      if (!data?.user?.email_confirmed_at)
        throw new Error("Email belum terverifikasi.");
      setVerified(true);
      setNotice("Email berhasil diverifikasi. Sekarang kamu bisa upload foto.");
    } catch (err) {
      setNotice(err?.message || "Kode verifikasi tidak sesuai.");
    } finally {
      setBusy(false);
    }
  };

  const submitPhoto = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      if (
        !file ||
        !["image/jpeg", "image/png", "image/webp"].includes(file.type)
      )
        throw new Error("Pilih foto JPG, PNG atau WebP.");
      if (!file.size || file.size > 5 * 1024 * 1024)
        throw new Error("Ukuran foto maksimal 5 MB.");
      if (title.trim().length < 2 || title.trim().length > 100)
        throw new Error("Judul minimal 2 dan maksimal 100 karakter.");
      const ticket = await galleryRequest("prepare", {
        title: title.trim(),
        caption: caption.trim(),
        mime: file.type,
        size: file.size,
      });
      const { error: uploadError } = await supabase.storage
        .from(ticket.bucket)
        .uploadToSignedUrl(ticket.path, ticket.token, file, {
          contentType: file.type,
          upsert: false,
        });
      if (uploadError) throw uploadError;
      await galleryRequest("submit", { id: ticket.id });
      setSent(true);
      setFile(null);
      setNotice(
        "Foto berhasil dikirim! Menunggu persetujuan admin Wingking sebelum ditampilkan.",
      );
    } catch (err) {
      setNotice(err?.message || "Foto gagal diunggah. Silakan coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="studio-gallery-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="studio-gallery-title"
      >
        <button
          type="button"
          className="close-btn"
          onClick={onClose}
          aria-label="Tutup galeri"
        >
          <Mi />
        </button>
        <div className="gallery-mascot-header">
          <div>
            <SectionKicker>WINGKING HUB STUDIO</SectionKicker>
            <h2 id="studio-gallery-title">GALERI STUDIO</h2>
            <p>Intip suasana di studio musik Wingking.</p>
          </div>
          <img
            src="/assets/watermelon-gallery.webp"
            className="gallery-mascot-picture"
            alt="Maskot semangka memperlihatkan foto galeri"
            width="166"
            height="166"
            loading="lazy"
          />
        </div>
        <div className="studio-gallery-actions">
          <button
            type="button"
            className="gallery-reload-button"
            onClick={refreshGallery}
            disabled={loading}
          >
            Muat ulang foto
          </button>
        </div>

        {false && (
          <div className="gallery-upload-shell">
            <h3>KIRIM FOTO KE GALERI</h3>
            <p>Foto kamu akan diperiksa admin sebelum tampil di website.</p>
            {!verified ? (
              !codeSent ? (
                <form onSubmit={sendOtp} className="gallery-upload-form">
                  <label htmlFor="gallery-email">Verifikasi email</label>
                  <input
                    id="gallery-email"
                    type="email"
                    required
                    placeholder="nama@email.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button type="submit" disabled={busy}>
                    {busy ? "MENGIRIM..." : "KIRIM KODE OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyCode} className="gallery-upload-form">
                  <label htmlFor="gallery-code">Kode OTP 6 digit</label>
                  <input
                    id="gallery-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                  />
                  <button type="submit" disabled={busy}>
                    {busy ? "MEMERIKSA..." : "VERIFIKASI EMAIL"}
                  </button>
                  <button
                    type="button"
                    className="gallery-text-button"
                    disabled={busy}
                    onClick={() => {
                      setCodeSent(false);
                      setCode("");
                    }}
                  >
                    Ganti email / kirim kode lagi
                  </button>
                </form>
              )
            ) : sent ? (
              <div className="gallery-success" role="status">
                <img
                  className="gallery-success-mascot"
                  src="/assets/watermelon-success.webp"
                  alt="Maskot semangka mengacungkan jempol"
                  width="90"
                  height="90"
                />
                <strong>FOTO BERHASIL DIKIRIM!</strong>
                <p>
                  Admin akan meninjau foto kamu. Hanya yang disetujui yang
                  tampil di sini.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setTitle("");
                    setCaption("");
                    setNotice("");
                  }}
                >
                  Kirim foto lain
                </button>
              </div>
            ) : (
              <form className="gallery-upload-form" onSubmit={submitPhoto}>
                <p className="gallery-verified-email">
                  Email terverifikasi: {email}
                </p>
                <label htmlFor="gallery-title-input">Judul foto *</label>
                <input
                  id="gallery-title-input"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Contoh: Suasana latihan di Wingking"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <label htmlFor="gallery-caption-input">
                  Deskripsi singkat (opsional)
                </label>
                <textarea
                  id="gallery-caption-input"
                  maxLength={500}
                  rows={2}
                  placeholder="Ceritakan tentang foto ini..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
                <label htmlFor="gallery-photo-input">
                  Pilih foto (JPG, PNG, WebP — maks. 5 MB) *
                </label>
                <input
                  id="gallery-photo-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <button type="submit" disabled={busy}>
                  {busy ? "SEDANG UPLOAD..." : "KIRIM UNTUK REVIEW ADMIN"}
                </button>
              </form>
            )}
            {notice && (
              <p role="status" className="gallery-notice">
                {notice}
              </p>
            )}
          </div>
        )}
        {loading ? (
          <p className="gallery-empty">Memuat foto studio...</p>
        ) : galleryError ? (
          <p className="gallery-empty" role="alert">
            {galleryError}
          </p>
        ) : photos.length === 0 ? (
          <p className="gallery-empty">Belum ada foto yang disetujui admin.</p>
        ) : (
          <div className="studio-gallery-grid">
            {photos.map((photo) => (
              <a
                className="studio-gallery-item"
                key={photo.id}
                href={photo.image_url}
                target="_blank"
                rel="noopener noreferrer"
                title={photo.title}
                aria-label={"Buka foto " + photo.title}
              >
                <img
                  src={photo.image_url}
                  alt={photo.title}
                  loading="lazy"
                  decoding="async"
                />
                <span className="gallery-photo-caption">{photo.title}</span>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* Simple Press Kit: only email, band name and one PDF/Word file. */
function BandPressKitUploadModal({ onClose, onSaved, showToast }) {
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [otpSent, setOtpSent] = React.useState(false);
  const [verified, setVerified] = React.useState(false);
  const [name, setName] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [photo, setPhoto] = React.useState(null);
  const [photoPreview, setPhotoPreview] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState("");
  const [complete, setComplete] = React.useState(false);
  const ENDPOINT =
    config.supabaseUrl.replace(/\/+$/, "") + "/functions/v1/wingking-presskit";
  React.useEffect(() => {
    if (!photo) {
      setPhotoPreview("");
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  React.useEffect(() => {
    if (!supabase) return;
    let alive = true;
    const update = (session) => {
      if (!alive) return;
      const user = session?.user;
      setVerified(Boolean(user?.email && user?.email_confirmed_at));
      if (user?.email) setEmail(user.email);
    };
    supabase.auth
      .getSession()
      .then(({ data }) => update(data.session))
      .catch(() => {});
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => update(session));
    return () => {
      alive = false;
      subscription?.unsubscribe();
    };
  }, []);
  const api = async (action, payload = {}) => {
    if (!supabase) throw Error("Layanan pendaftaran belum tersedia.");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token || !session?.user?.email_confirmed_at)
      throw Error("Verifikasi email dulu sebelum upload Press Kit.");
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: config.supabaseKey,
        authorization: "Bearer " + session.access_token,
      },
      body: JSON.stringify({ action, ...payload }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok)
      throw Error(result.error || "Permintaan tidak berhasil.");
    return result;
  };
  const sendOtp = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      const address = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))
        throw Error("Isi alamat email yang benar.");
      await sendWingkingOtp(
        address,
        "https://wingking-studio.vercel.app/?band=upload",
      );
      setOtpSent(true);
      setNotice("Kode dikirim. Cek inbox/spam; jangan minta berulang-ulang.");
    } catch (error) {
      setNotice(emailOtpErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  const verifyOtp = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      if (!/^\d{6}$/.test(code.trim())) throw Error("Kode OTP harus 6 angka.");
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "email",
      });
      if (error) throw error;
      if (!data?.user?.email_confirmed_at)
        throw Error("Email belum terverifikasi.");
      setVerified(true);
      setNotice("Email terverifikasi. Silakan kirim Press Kit.");
    } catch (error) {
      setNotice(error.message || "Kode tidak sesuai.");
    } finally {
      setBusy(false);
    }
  };
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      if (name.trim().length < 2 || name.trim().length > 80)
        throw Error("Nama band minimal 2 dan maksimal 80 karakter.");
      if (!file) throw Error("Pilih Press Kit PDF atau Word.");
      if (
        photo &&
        (!["image/jpeg", "image/png", "image/webp"].includes(photo.type) ||
          !photo.size ||
          photo.size > 5 * 1024 * 1024)
      )
        throw Error("Foto harus JPG, PNG, atau WebP dengan ukuran maksimal 5 MB.");
      const ext = file.name.split(".").pop()?.toLowerCase();
      const mimes = {
        pdf: "application/pdf",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };
      if (!mimes[ext]) throw Error("Format harus PDF, DOC atau DOCX.");
      if (!file.size || file.size > 10 * 1024 * 1024)
        throw Error("Ukuran maksimum 10 MB.");
      const converted =
        file.type === mimes[ext]
          ? file
          : new File([file], file.name, {
              type: mimes[ext],
              lastModified: file.lastModified,
            });
      const ticket = await api("prepare", {
        band_name: name.trim(),
        filename: converted.name,
        mime: converted.type,
        size: converted.size,
        photo: photo ? { mime: photo.type, size: photo.size } : null,
      });
      const { error } = await supabase.storage
        .from(ticket.bucket)
        .uploadToSignedUrl(ticket.path, ticket.token, converted, {
          contentType: converted.type,
          upsert: false,
        });
      if (error) throw Error("Upload gagal: " + error.message);
        if (ticket.photoUpload) {
          const { error: photoError } = await supabase.storage
            .from(ticket.bucket)
            .uploadToSignedUrl(
              ticket.photoUpload.path,
              ticket.photoUpload.token,
              photo,
              { contentType: photo.type, upsert: false },
            );
          if (photoError) throw Error("Upload foto gagal: " + photoError.message);
        }
        await api("finish", { id: ticket.id });
      setComplete(true);
      setNotice(
        "Berhasil! Press Kit" +
          (photo ? " dan foto band" : "") +
          " masuk antrean review admin. Foto hanya tampil setelah disetujui.",
      );
      showToast?.("Press Kit terkirim. Menunggu persetujuan admin.");
      onSaved?.();
    } catch (error) {
      setNotice(error.message || "Pengajuan gagal dikirim.");
    } finally {
      setBusy(false);
    }
  };
  const signOut = async () => {
    if (busy || !supabase) return;
    await supabase.auth.signOut();
    setVerified(false);
    setOtpSent(false);
    setEmail("");
    setCode("");
  };
  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="presskit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="presskit-title"
      >
        <button
          type="button"
          className="close-btn"
          onClick={onClose}
          aria-label="Tutup pendaftaran"
        >
          <Mi />
        </button>
        <div className="presskit-head">
          <div>
            <SectionKicker>BAND & HARGA / WINGKING</SectionKicker>
            <h2 id="presskit-title">
              DAFTARKAN
              <br />
              BANDMU!
            </h2>
            <p>
              Cukup email, nama band, foto opsional dan Press Kit. Harga dan
              profil band ada di berkasnya.
            </p>
          </div>
          <AssetImage
            name="watermelon-upload"
            alt="Semangka membawa berkas"
            className="presskit-mascot"
          />
        </div>
        {complete ? (
          <div className="presskit-done">
            <AssetImage
              name="watermelon-success"
              alt="Pengajuan berhasil"
              className="presskit-done-image"
            />
            <h3>BERHASIL DIKIRIM!</h3>
            <p>
              Admin akan memeriksa Press Kit. Band kamu baru tampil setelah
              disetujui.
            </p>
            <button
              type="button"
              className="presskit-primary"
              onClick={onClose}
            >
              SELESAI
            </button>
          </div>
        ) : (
          <div className="presskit-body">
            {!verified ? (
              !otpSent ? (
                <form onSubmit={sendOtp} className="presskit-form">
                  <label htmlFor="presskit-email">01 — EMAIL BAND *</label>
                  <input
                    id="presskit-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="bandkamu@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    className="presskit-primary"
                    type="submit"
                    disabled={busy}
                  >
                    {busy ? "MENGIRIM..." : "KIRIM KODE EMAIL"}
                  </button>
                  <p className="presskit-help">
                    Setelah verifikasi, kamu bisa lanjut mengisi nama band dan
                    mengunggah foto band (opsional) dan Press Kit.
                  </p>
                </form>
              ) : (
                <form onSubmit={verifyOtp} className="presskit-form">
                  <label htmlFor="presskit-code">VERIFIKASI EMAIL *</label>
                  <p>Kode enam digit dikirim ke {email}</p>
                  <input
                    id="presskit-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                  />
                  <button
                    className="presskit-primary"
                    type="submit"
                    disabled={busy}
                  >
                    {busy ? "MEMERIKSA..." : "VERIFIKASI KODE"}
                  </button>
                  <button
                    type="button"
                    className="presskit-secondary"
                    disabled={busy}
                    onClick={sendOtp}
                  >
                    Kirim ulang kode
                  </button>
                  <button
                    type="button"
                    className="presskit-secondary"
                    disabled={busy}
                    onClick={() => {
                      setOtpSent(false);
                      setCode("");
                    }}
                  >
                    Ganti email
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={submit} className="presskit-form">
                <div className="presskit-verified">
                  <VE size={17} /> Email terverifikasi: {email}
                  <button type="button" onClick={signOut}>
                    Ganti
                  </button>
                </div>
                <label htmlFor="presskit-name">02 — NAMA BAND *</label>
                <input
                  id="presskit-name"
                  type="text"
                  minLength={2}
                  maxLength={80}
                  required
                  placeholder="Nama band kamu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <label htmlFor="presskit-photo">
                  03 — FOTO BAND (OPSIONAL)
                </label>
                <label className="presskit-filedrop" htmlFor="presskit-photo">
                  {photo ? (
                    <img
                      className="presskit-photo-preview"
                      src={photoPreview}
                      alt="Pratinjau foto band"
                    />
                  ) : (
                    <Wy size={28} />
                  )}
                  <strong>
                    {photo ? photo.name : "PILIH FOTO BAND"}
                  </strong>
                  <span>JPG, PNG, WebP • maksimal 5 MB</span>
                </label>
                <input
                  id="presskit-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                />
                <label htmlFor="presskit-file">04 — UPLOAD PRESS KIT *</label>
                <label className="presskit-filedrop" htmlFor="presskit-file">
                  <Wy size={28} />
                  <strong>
                    {file ? file.name : "PILIH BERKAS PDF / WORD"}
                  </strong>
                  <span>PDF, DOC, DOCX • maksimal 10 MB</span>
                </label>
                <input
                  id="presskit-file"
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <button
                  className="presskit-primary"
                  type="submit"
                  disabled={busy}
                >
                  {busy ? "SEDANG MENGIRIM..." : "KIRIM BANDKU"}{" "}
                  <ArrowUpRight size={18} />
                </button>
                <p className="presskit-help">
                  Foto dan Press Kit disimpan privat sampai admin menyetujui.
                  Pastikan foto dan dokumen hanya memuat informasi yang boleh
                  dipublikasikan.
                </p>
              </form>
            )}
            {notice && (
              <p className="presskit-notice" role="status">
                {notice}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
function PressKitDetailsModal({ band, onClose }) {
  const [busy, setBusy] = React.useState(false),
    [error, setError] = React.useState("");
  const download = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        config.supabaseUrl + "/functions/v1/wingking-presskit",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            apikey: config.supabaseKey,
          },
          body: JSON.stringify({
            action: "public-download",
            id: band.presskit_id,
          }),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok)
        throw Error(data.error || "Download belum tersedia.");
      const u = new URL(data.url);
      if (
        u.protocol !== "https:" ||
        u.hostname !== new URL(config.supabaseUrl).hostname
      )
        throw Error("Alamat unduhan tidak aman.");
      window.location.assign(u.href);
    } catch (e) {
      setError(e.message || "Gagal menyiapkan unduhan.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="presskit-modal presskit-details"
        role="dialog"
        aria-modal="true"
        aria-label={"Press Kit " + band.name}
      >
        <button className="close-btn" onClick={onClose} aria-label="Tutup">
          <Mi />
        </button>
        {band.photo_url && validatedUrl(band.photo_url) ? (
          <img
            src={band.photo_url}
            alt={"Foto " + band.name}
            className="presskit-details-photo"
          />
        ) : (
          <AssetImage
            name="watermelon-welcome"
            alt="Maskot Wingking"
            className="presskit-details-art"
          />
        )}
        <SectionKicker>BAND & HARGA</SectionKicker>
        <h2>{band.name}</h2>
        <p>
          Profil, informasi penampilan, dan harga (jika tersedia) ada di dokumen
          Press Kit band ini.
        </p>
        <button
          className="presskit-primary"
          type="button"
          onClick={download}
          disabled={busy}
        >
          <Wy size={19} /> {busy ? "MENYIAPKAN..." : "DOWNLOAD PRESS KIT"}
        </button>
        {error && (
          <p role="alert" className="presskit-notice">
            {error}
          </p>
        )}
        <p className="presskit-help">
          File diunggah oleh band dan sudah diperiksa admin WINGKING. Unduh
          hanya jika kamu mempercayai sumbernya.
        </p>
      </section>
    </div>
  );
}

function BandDetailsModal({ band: s, releases: a, onClose: r }) {
  const l = a.filter((c) => c.band_id === s.id),
    u = Array.isArray(s.rate_cards) ? s.rate_cards : [];
  return React.createElement(
    "div",
    {
      className: "overlay",
      onMouseDown: (c) => c.target === c.currentTarget && r(),
    },
    React.createElement(
      "section",
      {
        className: "detail-modal",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "Profil " + s.name,
      },
      React.createElement(
        "button",
        { className: "close-btn", onClick: r, "aria-label": "Tutup" },
        React.createElement(Mi, null),
      ),
      React.createElement(
        "div",
        {
          className: "detail-cover",
          style: { background: s.accent || "#f8ca45" },
        },
        s.photo_url && validatedUrl(s.photo_url)
          ? React.createElement("img", { src: s.photo_url, alt: "Foto band" })
          : React.createElement(AssetImage, {
              name: "watermelon-welcome",
              className: "detail-band-asset",
              alt: "Ilustrasi band",
            }),
        React.createElement("small", null, s.genre, " / ", s.city),
      ),
      React.createElement(
        "div",
        { className: "detail-content" },
        React.createElement(SectionKicker, null, "KENALAN DULU"),
        React.createElement("h2", null, s.name),
        React.createElement("p", { className: "detail-tagline" }, s.tagline),
        React.createElement(
          "p",
          null,
          s.story ||
            "Cerita band ini bakal ada di sini. Tunggu rilisan barunya ya!",
        ),
        React.createElement(
          "div",
          { className: "detail-links" },
          safeHref(s.instagram_url) &&
            React.createElement(
              "a",
              {
                href: s.instagram_url,
                target: "_blank",
                rel: "noopener noreferrer",
              },
              React.createElement(eg, { size: 16 }),
              " Instagram ",
              React.createElement(dt, { size: 16 }),
            ),
          safeHref(s.spotify_url) &&
            React.createElement(
              "a",
              {
                href: s.spotify_url,
                target: "_blank",
                rel: "noopener noreferrer",
              },
              React.createElement(GE, { size: 16 }),
              " Link band ",
              React.createElement(dt, { size: 16 }),
            ),
        ),
        React.createElement(
          "div",
          { className: "price-heading" },
          React.createElement(
            "h3",
            { className: "detail-heading" },
            "PRICE LIST",
          ),
          React.createElement(AssetImage, {
            name: "watermelon-ticket",
            className: "pricing-sticker",
            alt: "Ilustrasi tiket harga",
          }),
        ),
        u.length
          ? u.map((c, h) =>
              React.createElement(
                "div",
                { className: "rate-item", key: h },
                React.createElement("span", null, c.label),
                React.createElement("b", null, formatRupiah(c.price)),
              ),
            )
          : React.createElement(
              "p",
              { className: "muted" },
              "Harga penampilan belum ditambahkan.",
            ),
        safeHref(s.price_image_url) &&
          React.createElement(
            "a",
            {
              className: "sheet-link",
              href: s.price_image_url,
              target: "_blank",
              rel: "noopener noreferrer",
            },
            React.createElement(GE, { size: 16 }),
            " Lihat price list lengkap ",
            React.createElement(dt, { size: 16 }),
          ),
        s.demo &&
          React.createElement(
            "p",
            { className: "demo-note" },
            "Ini hanya konten contoh untuk menunjukkan tampilan website, bukan profil band sungguhan.",
          ),
        l.length > 0 &&
          React.createElement(
            React.Fragment,
            null,
            React.createElement(
              "h3",
              { className: "detail-heading" },
              "RILISAN TERBARU",
            ),
            l.map((c) =>
              React.createElement(
                "a",
                {
                  className: "mini-release",
                  key: c.id,
                  href: safeHref(c.listen_url) || "#rilisan",
                  target: safeHref(c.listen_url) ? "_blank" : void 0,
                  rel: "noopener noreferrer",
                },
                React.createElement(HE, { size: 19 }),
                c.title,
                React.createElement(dt, { size: 17 }),
              ),
            ),
          ),
        React.createElement(
          PillLink,
          { href: "#kontak", className: "detail-cta" },
          "Tanya booking",
        ),
      ),
    ),
  );
}
function ReleaseDetailsModal({ release: s, onClose: a }) {
  var l;
  const r = safeHref(s.listen_url);
  return React.createElement(
    "div",
    {
      className: "overlay",
      onMouseDown: (u) => u.target === u.currentTarget && a(),
    },
    React.createElement(
      "section",
      {
        className: "detail-modal release-modal",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "Rilisan " + s.title,
      },
      React.createElement(
        "button",
        { className: "close-btn", onClick: a, "aria-label": "Tutup" },
        React.createElement(Mi, null),
      ),
      React.createElement(ReleaseArtwork, {
        tone: s.art || "#f4a4b9",
        image: s.cover_url,
      }),
      React.createElement(
        "div",
        { className: "detail-content" },
        React.createElement(SectionKicker, null, s.kind, " / NOW PLAYING"),
        React.createElement("h2", null, s.title),
        React.createElement(
          "p",
          { className: "detail-tagline" },
          s.band_name ||
            ((l = s.wk_bands) == null ? void 0 : l.name) ||
            "Band Wingking",
        ),
        React.createElement(
          "p",
          null,
          s.caption || "Sebuah rilisan dari ruang penuh suara.",
        ),
        s.demo &&
          React.createElement(
            "p",
            { className: "demo-note" },
            "Konten contoh — belum ada rilisan sungguhan.",
          ),
        r &&
          React.createElement(
            "a",
            {
              className: "pill-button",
              href: r,
              target: "_blank",
              rel: "noopener noreferrer",
            },
            "Dengerin sekarang ",
            React.createElement(dt, { size: 18 }),
          ),
      ),
    ),
  );
}
const Ln = ({ label: s, children: a, wide: r = !1 }) =>
  React.createElement(
    "label",
    { className: "form-field " + (r ? "wide" : "") },
    React.createElement("span", null, s),
    a,
  );
function UploadFileField({
  name: s,
  current: a,
  onChange: r,
  allowPdf: l = !1,
}) {
  return React.createElement(
    "div",
    { className: "upload-wrap" },
    React.createElement(
      "label",
      { className: "upload-button" },
      React.createElement(Wy, { size: 19 }),
      React.createElement("span", null, s),
      React.createElement("input", {
        type: "file",
        accept: l
          ? "image/png,image/jpeg,image/webp,application/pdf"
          : "image/png,image/jpeg,image/webp",
        onChange: (u) => {
          var c;
          return r(((c = u.target.files) == null ? void 0 : c[0]) || null);
        },
      }),
    ),
    React.createElement(
      "small",
      null,
      a ||
        (l
          ? "JPG / PNG / WEBP / PDF • maksimal 5MB"
          : "JPG / PNG / WEBP • maksimal 5MB"),
    ),
  );
}
function UploadBandModal({
  onClose: s,
  onSaved: a,
  showToast: r,
  initialTab: t = "band",
}) {
  const [l, u] = React.useState(t),
    [c, h] = React.useState({
      band_name: "",
      title: "",
      genre: "",
      city: "Purwokerto",
      description: "",
      instagram_url: "",
      music_url: "",
      price_text: "",
      website: "",
    }),
    [m, y] = React.useState(null),
    [d, b] = React.useState(null),
    [R, k] = React.useState(!1),
    [B, K] = React.useState(""),
    [P, H] = React.useState(""),
    [W, C] = React.useState(""),
    [N, L] = React.useState(null),
    [authUser, setAuthUser] = React.useState(null),
    [authReady, setAuthReady] = React.useState(false),
    [authEmail, setAuthEmail] = React.useState(""),
    [otpCode, setOtpCode] = React.useState(""),
    [otpSent, setOtpSent] = React.useState(false),
    [authBusy, setAuthBusy] = React.useState(false),
    D = (ae, oe) => h((J) => ({ ...J, [ae]: oe })),
    Q = config.supabaseUrl + "/functions/v1/wingking-public-intake",
    Z = async (ae) => {
      if (!supabase) throw Error("Login dan upload belum dikonfigurasi");
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const accessToken = sessionData.session?.access_token;
      if (ae.action !== "status" && !accessToken)
        throw Error("Verifikasi email terlebih dahulu");
      const oe = await fetch(Q, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            apikey: config.supabaseKey,
            ...(accessToken && ae.action !== "status"
              ? { authorization: "Bearer " + accessToken }
              : {}),
          },
          body: JSON.stringify(ae),
        }),
        J = await oe.json().catch(() => ({}));
      if (!oe.ok) throw Error(J.error || "Server sedang bermasalah");
      return J;
    },
    ie = async (ae, oe, J) => {
      if (!ae) return null;
      K("Menyiapkan " + oe + "...");
      const Ae = await Z({
        action: "prepare",
        kind: oe,
        mime: ae.type,
        size: ae.size,
        requestKey: J,
        website: "",
      });
      K("Mengunggah " + oe + "...");
      const { error: F } = await supabase.storage
        .from("wk-public-intake")
        .uploadToSignedUrl(Ae.path, Ae.token, ae, {
          contentType: ae.type,
          upsert: !1,
        });
      if (F) throw F;
      return Ae.ticketId;
    },
    ee = async (ae) => {
      if ((ae.preventDefault(), !R)) {
        k(!0);
        try {
          if (!authUser?.email_confirmed_at)
            throw Error("Verifikasi email terlebih dahulu");
          if (l === "video" && !d) throw Error("Pilih video terlebih dahulu");
          if (
            m &&
            (!["image/jpeg", "image/png", "image/webp"].includes(m.type) ||
              m.size > 5242880)
          )
            throw Error("Foto maksimal 5 MB (JPG, PNG, WebP)");
          if (d && d.size > 36700160)
            throw Error(
              "Ukuran video " +
                (d.size / 1048576).toFixed(2) +
                " MB melebihi batas 35 MB",
            );
          const _wkMime =
            d &&
            ((d.name || "").toLowerCase().endsWith(".mov")
              ? "video/quicktime"
              : [".mp4", ".m4v"].some((x) =>
                    (d.name || "").toLowerCase().endsWith(x),
                  )
                ? "video/mp4"
                : (d.name || "").toLowerCase().endsWith(".webm")
                  ? "video/webm"
                  : d.type);
          if (
            d &&
            !["video/mp4", "video/webm", "video/quicktime"].includes(_wkMime)
          )
            throw Error(
              "Format video tidak didukung. Gunakan MP4, MOV dari iPhone, atau WebM.",
            );
          const _wkFile =
            d && d.type !== _wkMime
              ? new File([d], d.name || "video.mov", {
                  type: _wkMime,
                  lastModified: d.lastModified || Date.now(),
                })
              : d;
          const oe = crypto.randomUUID() + "-" + crypto.randomUUID(),
            J = await ie(m, "image", oe),
            Ae = await ie(_wkFile, "video", oe);
          K("Mengirim ke admin...");
          const F = await Z({
            action: "submit",
            kind: l,
            ...c,
            photo_ticket_id: J,
            video_ticket_id: Ae,
            requestKey: oe,
          });
          H(F.receipt);
          try {
            const w = JSON.parse(
              localStorage.getItem("wingking-receipts") || "[]",
            );
            localStorage.setItem(
              "wingking-receipts",
              JSON.stringify([F.receipt, ...w].slice(0, 10)),
            );
          } catch {}
          (r("Pengajuan terkirim. Tunggu persetujuan admin."), a());
        } catch (oe) {
          r(oe.message || "Pengajuan gagal");
        } finally {
          (k(!1), K(""));
        }
      }
    },
    je = async (ae) => {
      ae.preventDefault();
      try {
        const oe = await Z({
          action: "status",
          receipt: W.trim(),
          website: "",
        });
        L(oe.data);
      } catch (oe) {
        r(oe.message);
      }
    };
  React.useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setAuthUser(session?.user || null);
        setAuthReady(true);
      }
    });
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) r(error.message);
        setAuthUser(data.session?.user || null);
        setAuthReady(true);
      })
      .catch((error) => {
        if (!active) return;
        r(error.message || "Sesi login tidak dapat diperiksa");
        setAuthReady(true);
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  const sendEmailOtp = async (ae) => {
    ae.preventDefault();
    if (authBusy) return;
    if (!supabase) {
      r("Login email belum dikonfigurasi untuk website ini");
      return;
    }
    setAuthBusy(true);
    try {
      await sendWingkingOtp(authEmail, EMAIL_UPLOAD_REDIRECT);
      setOtpSent(true);
      r("Kode OTP dikirim. Cek inbox atau folder spam emailmu.");
    } catch (error) {
      r(emailOtpErrorMessage(error));
    } finally {
      setAuthBusy(false);
    }
  };
  const verifyEmailOtp = async (ae) => {
    ae.preventDefault();
    if (authBusy) return;
    setAuthBusy(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: authEmail.trim(),
        token: otpCode.trim(),
        type: "email",
      });
      if (error) throw error;
      if (!data.user?.email_confirmed_at)
        throw Error("Email belum berhasil diverifikasi. Coba kode terbaru.");
      setAuthUser(data.user);
      setOtpCode("");
      r("Email terverifikasi. Kamu bisa mengirim pengajuan.");
    } catch (error) {
      r(error.message || "Kode OTP tidak valid");
    } finally {
      setAuthBusy(false);
    }
  };
  const signOutSubmitter = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      r(error.message || "Gagal keluar dari akun");
      return;
    }
    setOtpSent(false);
    setOtpCode("");
    setAuthEmail("");
  };
  return React.createElement(
    "div",
    {
      className: "overlay panel-overlay",
      onMouseDown: (ae) => ae.target === ae.currentTarget && s(),
    },
    React.createElement(
      "aside",
      {
        className: "upload-panel",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "Upload band langsung",
      },
      React.createElement(
        "header",
        { className: "panel-header" },
        React.createElement("span", null, "UPLOAD LANGSUNG"),
        React.createElement(
          "button",
          { "aria-label": "Tutup", onClick: s },
          React.createElement(Mi, null),
        ),
      ),
      React.createElement(
        "div",
        { className: "panel-body" },
        React.createElement(
          "div",
          { className: "panel-welcome" },
          React.createElement(AssetImage, {
            name: "watermelon-upload",
            className: "panel-welcome-mascot",
            alt: "Semangka siap mengirim karya",
          }),
          React.createElement(
            "h2",
            null,
            l === "band"
              ? "Kenalkan bandmu."
              : l === "release"
                ? "Kirim rilisanmu."
                : "Kirim karyamu.",
          ),
          React.createElement(
            "p",
            null,
            l === "band"
              ? "Isi profil, cerita, harga booking, dan tautan bandmu. Tim Wingking akan meninjau sebelum ditayangkan."
              : "Verifikasi email diperlukan. Tim Wingking akan meninjau sebelum konten ditayangkan.",
          ),
        ),
        !authReady
          ? React.createElement(
              "p",
              { className: "auth-message", role: "status" },
              "Memeriksa sesi email...",
            )
          : !authUser
            ? otpSent
              ? React.createElement(
                  "form",
                  {
                    className: "editor-form auth-form",
                    onSubmit: verifyEmailOtp,
                  },
                  React.createElement("h3", null, "Masukkan kode OTP"),
                  React.createElement(
                    "p",
                    { className: "auth-message" },
                    "Kode 6 digit dikirim ke ",
                    React.createElement("strong", null, authEmail),
                    ". Cek juga folder spam.",
                  ),
                  React.createElement(
                    Ln,
                    { label: "KODE OTP *" },
                    React.createElement("input", {
                      type: "text",
                      inputMode: "numeric",
                      autoComplete: "one-time-code",
                      pattern: "[0-9]{6}",
                      minLength: 6,
                      maxLength: 6,
                      required: !0,
                      value: otpCode,
                      onChange: (ae) =>
                        setOtpCode(
                          ae.target.value.replace(/\D/g, "").slice(0, 6),
                        ),
                      placeholder: "123456",
                    }),
                  ),
                  React.createElement(
                    "button",
                    {
                      className: "pill-button form-submit",
                      type: "submit",
                      disabled: authBusy,
                    },
                    authBusy ? "Memverifikasi..." : "Verifikasi email",
                  ),
                  React.createElement(
                    "div",
                    { className: "auth-secondary-actions" },
                    React.createElement(
                      "button",
                      {
                        className: "text-button",
                        type: "button",
                        disabled: authBusy,
                        onClick: async () => {
                          setAuthBusy(!0);
                          try {
                            await sendWingkingOtp(
                              authEmail,
                              EMAIL_UPLOAD_REDIRECT,
                            );
                            r("Kode OTP baru sudah dikirim.");
                          } catch (error) {
                            r(emailOtpErrorMessage(error));
                          } finally {
                            setAuthBusy(!1);
                          }
                        },
                      },
                      "Kirim ulang kode",
                    ),
                    React.createElement(
                      "button",
                      {
                        className: "text-button",
                        type: "button",
                        disabled: authBusy,
                        onClick: () => {
                          (setOtpSent(!1), setOtpCode(""));
                        },
                      },
                      "Ganti email",
                    ),
                  ),
                )
              : React.createElement(
                  "form",
                  {
                    className: "editor-form auth-form",
                    onSubmit: sendEmailOtp,
                  },
                  React.createElement("h3", null, "Verifikasi email dulu"),
                  React.createElement(
                    "p",
                    { className: "auth-message" },
                    "Masukkan email aktif. Kami kirim kode sekali pakai sebelum kamu bisa mengajukan konten.",
                  ),
                  React.createElement(
                    Ln,
                    { label: "EMAIL AKTIF *" },
                    React.createElement("input", {
                      type: "email",
                      autoComplete: "email",
                      maxLength: 254,
                      required: !0,
                      value: authEmail,
                      onChange: (ae) => setAuthEmail(ae.target.value),
                      placeholder: "nama@email.com",
                    }),
                  ),
                  React.createElement(
                    "button",
                    {
                      className: "pill-button form-submit",
                      type: "submit",
                      disabled: authBusy || !supabase,
                    },
                    authBusy ? "Mengirim kode..." : "Kirim kode OTP",
                  ),
                  !supabase &&
                    React.createElement(
                      "p",
                      { className: "auth-message", role: "status" },
                      "Login email belum tersedia di konfigurasi lokal ini.",
                    ),
                  React.createElement(
                    "p",
                    { className: "tiny-hint" },
                    "Pengajuan hanya tayang setelah ditinjau admin Wingking.",
                  ),
                )
            : P
              ? React.createElement(
                  "div",
                  { className: "success-box" },
                  React.createElement(VE, { size: 32 }),
                  React.createElement("h3", null, "Berhasil dikirim!"),
                  React.createElement(
                    "p",
                    null,
                    "Status: MENUNGGU REVIEW. Simpan kode untuk cek status:",
                  ),
                  React.createElement("code", { className: "wk-receipt" }, P),
                  React.createElement(
                    "button",
                    {
                      className: "pill-button form-submit",
                      onClick: () => {
                        (H(""), y(null), b(null));
                      },
                    },
                    "Kirim lagi",
                  ),
                )
              : React.createElement(
                  "form",
                  { className: "editor-form", onSubmit: ee },
                  React.createElement(
                    "div",
                    { className: "panel-tabs" },
                    React.createElement(
                      "button",
                      {
                        type: "button",
                        className: l === "band" ? "active" : "",
                        onClick: () => {
                          (u("band"), b(null));
                        },
                      },
                      "Band",
                    ),
                    React.createElement(
                      "button",
                      {
                        type: "button",
                        className: l === "video" ? "active" : "",
                        onClick: () => {
                          (u("video"), y(null));
                        },
                      },
                      "Video",
                    ),
                    React.createElement(
                      "button",
                      {
                        type: "button",
                        className: l === "release" ? "active" : "",
                        onClick: () => {
                          (u("release"), b(null));
                        },
                      },
                      "Rilisan",
                    ),
                  ),
                  React.createElement(
                    "div",
                    { className: "auth-session" },
                    React.createElement(
                      "span",
                      null,
                      "Email terverifikasi: ",
                      React.createElement("strong", null, authUser.email),
                    ),
                    React.createElement(
                      "button",
                      {
                        className: "text-button",
                        type: "button",
                        onClick: signOutSubmitter,
                      },
                      "Keluar",
                    ),
                  ),
                  React.createElement(
                    Ln,
                    { label: "NAMA BAND *" },
                    React.createElement("input", {
                      required: !0,
                      minLength: 2,
                      maxLength: 80,
                      value: c.band_name,
                      onChange: (ae) => D("band_name", ae.target.value),
                      placeholder: "Contoh: Sore Sebelah",
                    }),
                  ),
                  l !== "band" &&
                    React.createElement(
                      Ln,
                      { label: "JUDUL *" },
                      React.createElement("input", {
                        required: !0,
                        minLength: 2,
                        maxLength: 100,
                        value: c.title,
                        onChange: (ae) => D("title", ae.target.value),
                        placeholder:
                          l === "video" ? "Judul video" : "Judul lagu/album",
                      }),
                    ),
                  l === "band" &&
                    React.createElement(
                      "div",
                      { className: "form-pair" },
                      React.createElement(
                        Ln,
                        { label: "GENRE" },
                        React.createElement("input", {
                          maxLength: 60,
                          value: c.genre,
                          onChange: (ae) => D("genre", ae.target.value),
                          placeholder: "Contoh: Indie pop",
                        }),
                      ),
                      React.createElement(
                        Ln,
                        { label: "KOTA" },
                        React.createElement("input", {
                          maxLength: 70,
                          value: c.city,
                          onChange: (ae) => D("city", ae.target.value),
                          placeholder: "Contoh: Purwokerto",
                        }),
                      ),
                    ),
                  React.createElement(
                    Ln,
                    {
                      label:
                        l === "band" ? "CERITA BAND *" : "CERITA / DESKRIPSI",
                    },
                    React.createElement("textarea", {
                      required: l === "band",
                      minLength: l === "band" ? 10 : void 0,
                      rows: 3,
                      maxLength: 1200,
                      value: c.description,
                      onChange: (ae) => D("description", ae.target.value),
                      placeholder:
                        l === "band"
                          ? "Ceritakan perjalanan band, karakter musik, dan hal yang ingin dikenal orang..."
                          : "Ceritakan singkat...",
                    }),
                  ),
                  l === "band" &&
                    React.createElement(
                      Ln,
                      { label: "HARGA BOOKING (OPSIONAL)" },
                      React.createElement("textarea", {
                        rows: 2,
                        maxLength: 600,
                        value: c.price_text,
                        onChange: (ae) => D("price_text", ae.target.value),
                        placeholder: `Full band | 2500000
Akustik | 1500000`,
                        "aria-describedby": "band-price-hint",
                      }),
                      React.createElement(
                        "small",
                        { id: "band-price-hint" },
                        "Satu layanan per baris dengan format Nama layanan | harga angka. Maksimal 7 layanan.",
                      ),
                    ),
                  React.createElement(
                    "div",
                    { className: "form-pair" },
                    React.createElement(
                      Ln,
                      { label: "INSTAGRAM (OPSIONAL)" },
                      React.createElement("input", {
                        type: "url",
                        value: c.instagram_url,
                        onChange: (ae) => D("instagram_url", ae.target.value),
                        placeholder: "https://instagram.com/...",
                        pattern: "https://.+",
                        title:
                          "Gunakan tautan HTTPS, misalnya https://instagram.com/namaband",
                      }),
                    ),
                    React.createElement(
                      Ln,
                      {
                        label:
                          l === "band"
                            ? "LINK MUSIK / YOUTUBE (OPSIONAL)"
                            : "LINK MUSIK",
                      },
                      React.createElement("input", {
                        type: "url",
                        value: c.music_url,
                        onChange: (ae) => D("music_url", ae.target.value),
                        placeholder:
                          l === "band"
                            ? "YouTube, Spotify, SoundCloud, atau situs band"
                            : "https://open.spotify.com/...",
                        pattern: "https://.+",
                        title:
                          "Gunakan tautan HTTPS, misalnya https://youtube.com/@namaband",
                      }),
                    ),
                  ),
                  l === "video"
                    ? React.createElement(
                        "div",
                        { className: "video-upload-field" },
                        React.createElement(
                          "label",
                          { className: "upload-button" },
                          React.createElement(Wy, { size: 18 }),
                          " Pilih MP4/MOV/WebM",
                          React.createElement("input", {
                            type: "file",
                            required: !0,
                            accept:
                              "video/mp4,video/webm,video/quicktime,.mp4,.m4v,.mov,.webm",
                            onChange: (ae) => {
                              var oe;
                              return b(
                                ((oe = ae.target.files) == null
                                  ? void 0
                                  : oe[0]) || null,
                              );
                            },
                          }),
                        ),
                        React.createElement(
                          "small",
                          null,
                          d
                            ? d.name
                            : "MP4/MOV/WebM · maks 35 MB · portrait 9:16 disarankan",
                        ),
                      )
                    : React.createElement(UploadFileField, {
                        name:
                          l === "band"
                            ? "Pilih foto band / logo (opsional)"
                            : "Pilih foto / cover (opsional)",
                        current:
                          (m == null ? void 0 : m.name) ||
                          "JPG/PNG/WebP maks 5 MB",
                        onChange: y,
                      }),
                  React.createElement(
                    "div",
                    { className: "wk-trap", "aria-hidden": "true" },
                    React.createElement(
                      "label",
                      null,
                      "Website",
                      React.createElement("input", {
                        tabIndex: -1,
                        autoComplete: "off",
                        value: c.website,
                        onChange: (ae) => D("website", ae.target.value),
                      }),
                    ),
                  ),
                  React.createElement(
                    "button",
                    {
                      className: "pill-button form-submit",
                      type: "submit",
                      disabled: R,
                    },
                    R ? B || "Mengirim..." : "Kirim untuk review",
                    " ",
                    React.createElement(dt, { size: 18 }),
                  ),
                  React.createElement(
                    "p",
                    { className: "tiny-hint" },
                    "Email sudah terverifikasi. Konten baru tayang setelah admin menyetujui.",
                  ),
                ),
        React.createElement(
          "div",
          { className: "wk-review-check" },
          React.createElement("h3", null, "Cek status pengajuan"),
          React.createElement(
            "form",
            { onSubmit: je },
            React.createElement("input", {
              required: !0,
              value: W,
              onChange: (ae) => C(ae.target.value),
              placeholder: "Kode pengajuan",
            }),
            React.createElement("button", { type: "submit" }, "Cek"),
          ),
          N &&
            React.createElement(
              "p",
              null,
              N.band_name,
              ": ",
              React.createElement(
                "b",
                null,
                N.review_status === "approved"
                  ? "DISETUJUI"
                  : N.review_status === "rejected"
                    ? "DITOLAK"
                    : "MENUNGGU",
              ),
              N.review_note ? " — " + N.review_note : "",
            ),
        ),
      ),
    ),
  );
}
async function loadPublicPresskits() {
  const response = await fetch(
    config.supabaseUrl.replace(/\/+$/, "") +
      "/functions/v1/wingking-presskit",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: config.supabaseKey,
      },
      body: JSON.stringify({ action: "public-list" }),
      cache: "no-store",
    },
  );
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok)
    throw Error(result.error || "Daftar band belum dapat dimuat.");
  return { data: result.rows || [], error: null };
}
function HomePage() {
  const [s, a] = React.useState(() => {
      try {
        return localStorage.getItem("wingking-motion-v6") === "off"
          ? "off"
          : "on";
      } catch {
        return "on";
      }
    }),
    [r, l] = React.useState(null),
    [u, c] = React.useState(null),
    [h, m] = React.useState(
      () =>
        new URLSearchParams(window.location.search).get("band") === "upload",
    ),
    [galleryOpen, setGalleryOpen] = React.useState(() => false),
    [y, d] = React.useState(!1),
    [b, R] = React.useState(!1),
    [k, B] = React.useState(!1),
    [releaseSearch, setReleaseSearch] = React.useState(""),
    [K, P] = React.useState(""),
    [H, W] = React.useState(null),
    [uploadTab, setUploadTab] = React.useState("band"),
    [C, N] = React.useState([]),
    [L, D] = React.useState([]),
    [Q, Z] = React.useState([]),
    [ie, ee] = React.useState(!1),
    je = (F) => P(String(F || "")),
    openUpload = (F = "band") => {
      (setUploadTab(F), m(!0));
    },
    ae = async () => {
      var F, w, E;
      if (!supabase) {
        ee(!0);
        return;
      }
      try {
        const [O, q, _, kit, media] = await Promise.all([
          supabase
            .from("wk_bands")
            .select(
              "id,name,genre,city,tagline,story,accent,rate_cards,instagram_url,spotify_url,photo_url,price_image_url",
            )
            .eq("is_published", !0)
            .eq("review_status", "approved")
            .order("created_at", { ascending: !1 })
            .limit(36),
          supabase
            .from("wk_releases")
            .select(
              "id,band_id,title,kind,caption,cover_url,listen_url,created_at,wk_bands(name)",
            )
            .eq("is_published", !0)
            .eq("review_status", "approved")
            .order("created_at", { ascending: !1 })
            .limit(40),
          supabase
            .from("wk_clips")
            .select(
              "id,band_id,title,caption,video_url,instagram_url,created_at,wk_bands(name)",
            )
            .eq("is_published", !0)
            .eq("review_status", "approved")
            .order("created_at", { ascending: !1 })
            .limit(24),
          loadPublicPresskits(),
          supabase
            .from("wk_media_links")
            .select(
              "id,kind,band_name,title,link_url,video_url,platform,created_at",
            )
            .order("created_at", { ascending: false })
            .limit(100),
        ]);
        if (O.error || q.error || _.error || kit.error || media.error)
          throw new Error(
            ((F = O.error) == null ? void 0 : F.message) ||
              ((w = q.error) == null ? void 0 : w.message) ||
              ((E = _.error) == null ? void 0 : E.message) ||
              kit.error?.message ||
              media.error?.message,
          );
        const { data: A, error: V } = await supabase
          .from("wk_public_submissions")
          .select(
            "id,kind,band_name,title,genre,city,description,instagram_url,music_url,price_text,photo_url,video_url,submitted_at",
          )
          .eq("review_status", "approved")
          .eq("is_published", !0)
          .order("submitted_at", { ascending: !1 })
          .limit(100);
        if (V) throw V;
        const X = A || [];
        (N([
          ...(O.data || []),
          ...X.filter((Y) => Y.kind === "band").map((Y) => ({
            id: Y.id,
            name: Y.band_name,
            genre: Y.genre || "Musik",
            city: Y.city || "Indonesia",
            tagline: Y.description.slice(0, 180),
            story: Y.description,
            accent: "#F4A6BD",
            rate_cards: parseRateList(Y.price_text),
            instagram_url: Y.instagram_url,
            spotify_url: Y.music_url,
            photo_url: Y.photo_url,
          })),
          ...(kit.data || []).map((Y) => ({
            id: "kit-" + Y.id,
            presskit_id: Y.id,
            name: Y.band_name,
            genre: "Press Kit",
            city: "WINGKING STUDIO",
            tagline: "Profil dan harga lengkap di Press Kit",
            accent: "#F1B9C5",
            rate_cards: [],
            photo_url: Y.photo_url || "",
          })),
        ]),
          D([
            ...(media.data || [])
              .filter((Y) => Y.kind === "release")
              .map((Y) => ({
                id: "media-" + Y.id,
                external_url: Y.link_url,
                platform: Y.platform,
                title:
                  String(Y.title || "").trim() || "Judul rilisan belum diisi",
                band_name: Y.band_name,
                kind: "Single",
                caption: "",
                cover_url: "",
                listen_url: Y.link_url,
              })),
            ...(q.data || []),
            ...X.filter((Y) => Y.kind === "release").map((Y) => ({
              id: Y.id,
              title: Y.title,
              kind: "Single",
              caption: Y.description,
              cover_url: Y.photo_url,
              listen_url: Y.music_url,
              band_name: Y.band_name,
            })),
          ]),
          Z([
            ...(media.data || [])
              .filter((Y) => Y.kind === "video")
              .map((Y) => ({
                id: "media-" + Y.id,
                external_url: Y.link_url,
                platform: Y.platform,
                title: "Studio Sessions",
                caption: "",
                video_url: Y.video_url || "",
              })),
            ...(_.data || []),
            ...X.filter((Y) => Y.kind === "video" && Y.video_url).map((Y) => ({
              id: Y.id,
              title: Y.title,
              caption: Y.description,
              video_url: Y.video_url,
              instagram_url: Y.instagram_url,
              wk_bands: { name: Y.band_name },
            })),
          ]));
      } catch (O) {
        (console.error(O),
          je("Data band belum bisa dimuat, cek koneksi backend."));
      } finally {
        ee(!0);
      }
    };
  (React.useEffect(() => {
    if ((ae(), !supabase)) return;
    supabase.auth.getSession().then(({ data: w }) => W(w.session));
    const {
      data: { subscription: F },
    } = supabase.auth.onAuthStateChange((w, E) => {
      W(E);
    });
    return () => F.unsubscribe();
  }, []),
    React.useEffect(() => {
      const F = h || r || u || galleryOpen;
      return (
        (document.body.style.overflow = F ? "hidden" : ""),
        () => {
          document.body.style.overflow = "";
        }
      );
    }, [h, r, u, galleryOpen]),
    React.useEffect(() => {
      if (!galleryOpen) return;
      const F = (w) => {
        if (w.key === "Escape") setGalleryOpen(!1);
      };
      window.addEventListener("keydown", F);
      return () => window.removeEventListener("keydown", F);
    }, [galleryOpen]),
    React.useEffect(() => {
      document.documentElement.dataset.motion = s;
      try {
        localStorage.setItem("wingking-motion-v6", s);
      } catch {}
    }, [s]));
  const oe = s === "on";
  React.useEffect(() => {
    const F = [...document.querySelectorAll(".reveal-on-scroll")];
    if (!("IntersectionObserver" in window)) {
      F.forEach((E) => E.classList.add("is-visible"));
      return;
    }
    const w = new IntersectionObserver(
      (E) => {
        E.forEach((O) => {
          O.isIntersecting &&
            (O.target.classList.add("is-visible"), w.unobserve(O.target));
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
    );
    return (F.forEach((E) => w.observe(E)), () => w.disconnect());
  }, []);
  const J = hasBackend || C.length ? C : DEMO_BANDS,
    Ae = hasBackend
      ? L.map((F) => {
          var w;
          return {
            ...F,
            band_name:
              ((w = F.wk_bands) == null ? void 0 : w.name) || F.band_name || "",
          };
        })
      : L.length
        ? L
        : DEMO_RELEASES;
  return React.createElement(
    React.Fragment,
    null,
    React.createElement("div", { id: "atas" }),
    React.createElement(
      "header",
      { className: "site-header" },
      React.createElement(
        "div",
        { className: "nav-inner" },
        React.createElement(WingkingLogo, null),
        React.createElement(
          "div",
          { className: "nav-center-group" },
          React.createElement(
            "nav",
            { className: y ? "nav-links is-open" : "nav-links" },
            React.createElement(
              "a",
              { href: "#keseruan", onClick: () => d(!1) },
              "Studio Sessions",
            ),
            React.createElement(
              "a",
              { href: "#band", onClick: () => d(!1) },
              "BAND IDAMANMU",
            ),
            React.createElement(
              "a",
              { href: "#rilisan", onClick: () => d(!1) },
              "Rilisan",
            ),
            React.createElement(
              "a",
              { href: "#kontak", onClick: () => d(!1) },
              "Kontak",
            ),
          ),
          React.createElement(
            "button",
            {
              className: "nav-action",
              onClick: () => {
                (openUpload(), d(!1));
              },
            },
            "Upload band ",
            React.createElement(dt, { size: 18, strokeWidth: 2.5 }),
          ),
        ),
        React.createElement(
          "a",
          {
            className: "location-link",
            href: safeHref(config.locationUrl),
            target: "_blank",
            rel: "noopener noreferrer",
            "aria-label": "Buka lokasi Wingking Hub Studio di Google Maps",
          },
          React.createElement(MapPin, { size: 17 }),
          React.createElement(
            "span",
            { className: "location-label-full" },
            "Wingking Hub Studio",
          ),
          React.createElement(
            "span",
            { className: "location-label-short" },
            "Maps",
          ),
        ),
        React.createElement(
          "button",
          {
            className: "mobile-menu",
            "aria-label": y ? "Tutup navigasi" : "Buka navigasi",
            "aria-expanded": y,
            onClick: () => d((F) => !F),
          },
          y ? React.createElement(Mi, null) : React.createElement(PE, null),
        ),
      ),
    ),
    React.createElement(
      "button",
      {
        type: "button",
        className: "motion-switch",
        onClick: () => a(oe ? "off" : "on"),
        "aria-pressed": oe,
        title: oe ? "Hentikan animasi halaman" : "Jalankan animasi halaman",
      },
      React.createElement("span", {
        className: "motion-led",
        "aria-hidden": "true",
      }),
      React.createElement("span", null, "Gerak ", oe ? "ON" : "OFF"),
    ),
    React.createElement(
      "main",
      null,
      React.createElement(
        "section",
        {
          className: "hero",
          onPointerMove: (F) => {
            if (F.pointerType !== "mouse") return;
            const w = F.currentTarget.getBoundingClientRect();
            (F.currentTarget.style.setProperty(
              "--px",
              ((F.clientX - w.left) / w.width - 0.5).toFixed(2),
            ),
              F.currentTarget.style.setProperty(
                "--py",
                ((F.clientY - w.top) / w.height - 0.5).toFixed(2),
              ));
          },
          onPointerLeave: (F) => {
            (F.currentTarget.style.setProperty("--px", 0),
              F.currentTarget.style.setProperty("--py", 0));
          },
        },
        React.createElement(
          "div",
          { className: "hero-topline" },
          React.createElement("span", null, "LOCAL SOUND"),
        ),
        React.createElement(
          "div",
          { className: "hero-inner" },
          React.createElement(
            "div",
            { className: "hero-copy" },
            React.createElement(
              "div",
              { className: "hero-small" },
              React.createElement(AssetImage, {
                name: "burst-star",
                className: "spark-img",
              }),
              " Hello, W Frinedss!!!!",
            ),
            React.createElement(
              "h1",
              null,
              "BUAT",
              React.createElement("br", null),
              React.createElement(
                "span",
                { className: "hero-outline" },
                "RAME",
              ),
              React.createElement("br", null),
              "TERUS",
              React.createElement("span", { className: "hero-exclaim" }, "!"),
            ),
            React.createElement(
              "p",
              null,
              "Band lokal. Rilisan baru. Cerita baru.",
            ),
            React.createElement(
              "div",
              { className: "hero-actions" },
              React.createElement(
                PillLink,
                { href: "#keseruan" },
                "Studio Sessions",
              ),
              React.createElement(
                "a",
                { className: "hero-text-link", href: "#band" },
                "Cari band ",
                React.createElement(Lc, { size: 19 }),
              ),
            ),
          ),
          React.createElement(
            "div",
            { className: "hero-art" },
            React.createElement(WatermelonHeroArt, null),
            React.createElement(
              "button",
              {
                className: "hero-gallery-link",
                type: "button",
                onClick: () => setGalleryOpen(!0),
              },
              "GALERI STUDIO",
              React.createElement(dt, { size: 17 }),
            ),
          ),
        ),
        React.createElement(
          "div",
          { className: "hero-base" },
          React.createElement("span", null, "WINGKING / MUSIC PLAYGROUND"),
          React.createElement(
            "span",
            null,
            "LANJUT KE BAWAH ",
            React.createElement("span", { className: "down-arrow" }, "↓"),
          ),
        ),
      ),
      React.createElement(MotionMarquee, { play: oe }),
      React.createElement(VideoSection, {
        clips: Q,
        onAdd: () => openUpload(),
      }),
      React.createElement(
        "section",
        { id: "band", className: "bands-section section-pad" },
        React.createElement(
          "div",
          { className: "container" },
          React.createElement(
            "div",
            { className: "section-title reveal-on-scroll" },
            React.createElement(
              "div",
              null,
              React.createElement(SectionKicker, null, "KENALAN DULU"),
              React.createElement(
                "h2",
                null,
                "BAND ",
                React.createElement(
                  "span",
                  { className: "underlined pink-line" },
                  "IDAMANMU",
                ),
              ),
            ),
            React.createElement(AssetImage, {
              name: "watermelon-welcome",
              className: "band-heading-watermelon",
              alt: "Maskot semangka mengajak band bergabung",
            }),
          ),
          React.createElement(
            "div",
            { className: "bands-grid reveal-on-scroll" },
            J.slice(0, b ? 36 : 3).map((F, w) =>
              React.createElement(BandCard, {
                key: F.id,
                band: F,
                index: w,
                onClick: l,
              }),
            ),
          ),
          J.length > 3 &&
            React.createElement(
              "button",
              {
                type: "button",
                className: "more-button",
                onClick: () => R((F) => !F),
              },
              b ? "Lebih sedikit" : "Lihat semua band",
              " ",
              React.createElement(dt, { size: 17 }),
            ),
          React.createElement(
            "div",
            { className: "join-strip" },
            React.createElement(
              "div",
              null,
              React.createElement(AssetImage, {
                name: "burst-star",
                className: "join-flower",
              }),
              React.createElement("h3", null, "Band idamanmu belum ada?"),
            ),
            React.createElement(
              "button",
              { className: "pill-button", onClick: () => openUpload() },
              "Upload band ",
              React.createElement(dt, { size: 20 }),
            ),
          ),
        ),
      ),
      React.createElement(
        "section",
        { id: "rilisan", className: "releases-section section-pad" },
        React.createElement(
          "div",
          { className: "container" },
          React.createElement(
            "div",
            { className: "section-title reveal-on-scroll" },
            React.createElement(
              "div",
              null,
              React.createElement(SectionKicker, null, "LAGI HANGAT"),
              React.createElement(
                "h2",
                null,
                React.createElement(
                  "span",
                  { className: "underlined" },
                  "RILISAN.",
                ),
              ),
            ),
            React.createElement(AssetImage, {
              name: "watermelon-music",
              className: "title-flower",
            }),
          ),
          React.createElement(
            "div",
            { className: "wk-release-search" },
            React.createElement("input", {
              type: "search",
              value: releaseSearch,
              onChange: (e) => setReleaseSearch(e.target.value),
              placeholder: "Cari nama band atau rilisan...",
              "aria-label": "Cari rilisan musik",
            }),
            React.createElement(HE, { size: 19 }),
          ),
          !ie &&
            React.createElement(
              "p",
              { className: "loading-status" },
              "Sedang nyari lagu baru...",
            ),
          React.createElement(
            "div",
            { className: "releases-grid reveal-on-scroll" },
            Ae.filter((F) =>
              [F.title, F.band_name, F.wk_bands?.name]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(releaseSearch.trim().toLowerCase()),
            )
              .slice(0, releaseSearch.trim() ? 24 : k ? 12 : 3)
              .map((F, w) =>
                F.external_url
                  ? React.createElement(ExternalReleaseCard, {
                      key: F.id,
                      item: F,
                    })
                  : React.createElement(ReleaseCard, {
                      key: F.id,
                      item: F,
                      index: w,
                      onClick: c,
                    }),
              ),
          ),
          !releaseSearch.trim() &&
            Ae.length > 3 &&
            React.createElement(
              "button",
              {
                type: "button",
                className: "more-button",
                onClick: () => B((F) => !F),
              },
              k ? "Lebih sedikit" : "Lihat semua rilisan",
              " ",
              React.createElement(dt, { size: 17 }),
            ),
          L.length === 0 &&
            React.createElement(
              "p",
              { className: "demo-explainer" },
              React.createElement(tg, { size: 16 }),
              " ",
              C.length
                ? "Belum ada rilisan. Band bisa menambahkannya dari panel upload."
                : "Belum ada rilisan yang disetujui admin. Tunggu rilisan pertamanya!",
            ),
        ),
      ),
      React.createElement(
        "section",
        { id: "kontak", className: "contact-section" },
        React.createElement(
          "div",
          { className: "container contact-inner" },
          React.createElement(AssetImage, {
            name: "burst-star",
            className: "contact-star-asset",
          }),
          React.createElement(
            "div",
            null,
            React.createElement(
              SectionKicker,
              null,
              "BUAT MANGGUNG & MAIN MUSIK",
            ),
            React.createElement(
              "h2",
              null,
              "MAU",
              React.createElement("br", null),
              "BOOKING",
              React.createElement("span", null, "?"),
            ),
            React.createElement(
              "p",
              null,
              "Langsung ngobrol sama contact person.",
            ),
            React.createElement(
              "div",
              { className: "booking-notice" },
              React.createElement("span", null, "!"),
              React.createElement(
                "div",
                null,
                React.createElement(
                  "strong",
                  null,
                  "BOOKING PALING LAMBAT H-1",
                ),
                React.createElement(
                  "small",
                  null,
                  "Hubungi minimal sehari sebelum booked.",
                ),
              ),
            ),
            React.createElement(
              "a",
              {
                className: "contact-button",
                href: safeHref(config.whatsappUrl) || "#kontak",
                target: "_blank",
                rel: "noopener noreferrer",
              },
              React.createElement(WhatsAppIcon, null),
              React.createElement(
                "span",
                null,
                "HUBUNGI ",
                config.contactName.toUpperCase(),
              ),
              React.createElement(dt, { size: 23 }),
            ),
            React.createElement(
              "small",
              { className: "contact-helper" },
              "Jadwal dan harga langsung lewat contact person.",
            ),
          ),
          React.createElement(
            "div",
            {
              className: "contact-sticker contact-image",
              "aria-hidden": "true",
            },
            React.createElement(AssetImage, {
              name: "watermelon-contact",
              alt: "Maskot semangka menghubungi tim Wingking",
            }),
            React.createElement(
              "span",
              { className: "contact-halo" },
              "HELLO!",
            ),
          ),
        ),
      ),
    ),
    React.createElement(
      "footer",
      { className: "footer" },
      React.createElement(
        "div",
        { className: "container footer-main" },
        React.createElement(WingkingLogo, null),
        React.createElement(
          "div",
          null,
          React.createElement("span", null, "CREATED BY:"),
          React.createElement(
            "p",
            null,
            "Evan Faadillah, Dionisius Deandra, Fadhil Rekh, Danish Adelio",
          ),
          React.createElement("p", null, "SMK Telkom Purwokerto"),
          React.createElement(
            "p",
            null,
            "© ",
            new Date().getFullYear(),
            " WINGKING STUDIO. MUSIC PLAYGROUND.",
          ),
        ),
        React.createElement(
          "a",
          {
            href: "#atas",
            "aria-label": "Kembali ke atas",
            className: "back-top",
          },
          "↑",
        ),
      ),
    ),
    h &&
      React.createElement(BandPressKitUploadModal, {
        onClose: () => m(!1),
        onSaved: ae,
        showToast: je,
      }),
    r &&
      (r.presskit_id
        ? React.createElement(PressKitDetailsModal, {
            band: r,
            onClose: () => l(null),
          })
        : React.createElement(BandDetailsModal, {
            band: r,
            releases: L,
            onClose: () => l(null),
          })),
    " ",
    u &&
      React.createElement(ReleaseDetailsModal, {
        release: u,
        onClose: () => c(null),
      }),
    galleryOpen &&
      React.createElement(StudioGalleryModal, {
        onClose: () => setGalleryOpen(!1),
      }),
    React.createElement(ToastMessage, { message: K, onClose: () => P("") }),
  );
}
class ErrorBoundary extends React.Component {
  constructor(a) {
    (super(a), (this.state = { hasError: !1 }));
  }
  static getDerivedStateFromError() {
    return { hasError: !0 };
  }
  componentDidCatch(a, r) {
    console.error("Wingking render error:", a, r);
  }
  render() {
    return this.state.hasError
      ? React.createElement(
          "div",
          {
            className: "fatal-recovery",
            style: {
              minHeight: "100svh",
              background: "#f9f5e8",
              color: "#173e31",
              padding: "clamp(25px,6vw,80px)",
              fontFamily: "system-ui,Arial,sans-serif",
            },
          },
          React.createElement("img", {
            src: "/wingking-logo-festival.webp",
            alt: "Wingking Studio",
            style: { width: 160, maxWidth: "45%" },
          }),
          React.createElement(
            "h1",
            { style: { fontSize: "clamp(36px,7vw,76px)", marginTop: 70 } },
            "LAGI SETEL SUARA!",
          ),
          React.createElement(
            "p",
            null,
            "Halaman Wingking belum berhasil dibuka. Coba muat ulang.",
          ),
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () => window.location.reload(),
              style: {
                background: "#173e31",
                color: "#fff",
                padding: "14px 24px",
                borderRadius: 50,
                border: 0,
                fontWeight: 800,
                cursor: "pointer",
              },
            },
            "COBA LAGI",
          ),
          React.createElement(
            "a",
            {
              href: "https://instagram.com/w.hubstudio",
              style: { display: "block", marginTop: 20, color: "#173e31" },
            },
            "Kontak Wingking ↗",
          ),
        )
      : this.props.children;
  }
}

export default function WingkingApp() {
  return React.createElement(
    ErrorBoundary,
    null,
    React.createElement(HomePage, null),
    React.createElement(WingkingAssistant, null),
  );
}
