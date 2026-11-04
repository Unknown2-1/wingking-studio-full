import { config } from "./config.js";
import { createClient } from "@supabase/supabase-js";
const T = config.supabaseUrl,
  F = T + "/functions/v1/wingking-guest-submissions",
  E = config.supabaseKey,
  authClient =
    T && E
      ? createClient(T, E, {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
          },
        })
      : null,
  f = document.getElementById("form"),
  h = document.getElementById("send"),
  x = document.getElementById("status"),
  P = document.getElementById("ticket"),
  z = document.getElementById("code"),
  C = document.getElementById("check"),
  M = document.getElementById("result"),
  authGate = document.getElementById("auth-gate"),
  emailForm = document.getElementById("email-form"),
  emailCodeForm = document.getElementById("email-code-form"),
  authEmail = document.getElementById("auth-email"),
  authCode = document.getElementById("auth-code"),
  authStatus = document.getElementById("auth-status"),
  otpInstruction = document.getElementById("otp-instruction"),
  sendOtpButton = document.getElementById("send-otp"),
  verifyOtpButton = document.getElementById("verify-otp"),
  resendOtpButton = document.getElementById("resend-otp"),
  changeEmailButton = document.getElementById("change-email"),
  signOutButton = document.getElementById("sign-out"),
  verifiedEmail = document.getElementById("verified-email");
if (
  !f ||
  !h ||
  !x ||
  !P ||
  !z ||
  !C ||
  !M ||
  !authGate ||
  !emailForm ||
  !emailCodeForm ||
  !authEmail ||
  !authCode ||
  !authStatus ||
  !otpInstruction ||
  !sendOtpButton ||
  !verifyOtpButton ||
  !resendOtpButton ||
  !changeEmailButton ||
  !signOutButton ||
  !verifiedEmail
)
  throw Error("Bagian form upload tidak lengkap");
f.noValidate = !0;
for (const e of f.querySelectorAll('input[type="url"]'))
  ((e.type = "text"),
    (e.inputMode = "url"),
    (e.autocapitalize = "off"),
    (e.autocorrect = "off"));
const y = f.querySelector('[name="website"]');
y && ((y.autocomplete = "off"), (y.value = ""));
let b = "Menunggu file",
  p = null,
  G = "";
try {
  const e = JSON.parse(
    localStorage.getItem("wingking-last-submission") || "null",
  );
  e && e.id && e.receipt && e.status === "pending" && (p = e);
} catch {}
const A = (e) => (e / 1048576).toFixed(2) + " MB",
  k = (e) => String((e == null ? void 0 : e.name) || "media").slice(0, 100),
  w = (e) => k(e) + " (" + A(e.size) + ")",
  L = (e) => new Promise((a) => setTimeout(a, e));
function u(e, a = "") {
  (a && (b = a), (x.textContent = e), (G = "Tahap: " + b + " | " + e));
}
function j(e) {
  const a = String(
    (e == null ? void 0 : e.message) || "Terjadi kesalahan",
  ).slice(0, 460);
  (u("Gagal di " + b + ": " + a),
    m &&
      ((m.hidden = !1),
      (m.textContent =
        "DIAGNOSTIK: " +
        G +
        " | Browser " +
        navigator.userAgent.slice(0, 90))));
}
const m = document.createElement("p");
m.id = "upload-diagnostics";
m.hidden = !0;
m.style.cssText =
  "font:12px/1.6 monospace;overflow-wrap:anywhere;padding:12px;border:1px dashed #b14843;border-radius:8px;background:#ffe9e7;user-select:text";
x.insertAdjacentElement("afterend", m);
function H() {
  p && ((P.hidden = !1), (z.textContent = p.id + " / " + p.receipt));
}
H();
let verifiedUser = null;
function setVerifiedUser(user) {
  verifiedUser = user?.email_confirmed_at ? user : null;
  authGate.hidden = !!verifiedUser;
  f.hidden = !verifiedUser;
  if (verifiedUser) verifiedEmail.textContent = verifiedUser.email || "";
}
async function requestOtp() {
  if (!authClient) throw Error("Login email belum dikonfigurasi.");
  const { error } = await authClient.auth.signInWithOtp({
    email: authEmail.value.trim(),
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
  otpInstruction.textContent =
    "Masukkan kode yang dikirim ke " +
    authEmail.value.trim() +
    ". Cek folder spam juga.";
  emailForm.hidden = true;
  emailCodeForm.hidden = false;
  authStatus.textContent = "Kode OTP dikirim.";
}
if (authClient) {
  const {
    data: { subscription },
  } = authClient.auth.onAuthStateChange((_event, session) =>
    setVerifiedUser(session?.user),
  );
  authClient.auth
    .getSession()
    .then(({ data, error }) => {
      if (error) {
        authStatus.textContent = error.message;
        return;
      }
      setVerifiedUser(data.session?.user);
    })
    .catch((error) => {
      authStatus.textContent =
        error.message || "Sesi email tidak dapat diperiksa.";
    });
  window.addEventListener("pagehide", () => subscription.unsubscribe(), {
    once: true,
  });
} else {
  authStatus.textContent = "Login email belum dikonfigurasi untuk website ini.";
  sendOtpButton.disabled = true;
}
emailForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  sendOtpButton.disabled = true;
  try {
    await requestOtp();
  } catch (error) {
    authStatus.textContent = error.message || "Kode OTP gagal dikirim.";
  } finally {
    sendOtpButton.disabled = false;
  }
});
emailCodeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  verifyOtpButton.disabled = true;
  try {
    if (!authClient) throw Error("Login email belum dikonfigurasi.");
    const { data, error } = await authClient.auth.verifyOtp({
      email: authEmail.value.trim(),
      token: authCode.value.trim(),
      type: "email",
    });
    if (error) throw error;
    if (!data.user?.email_confirmed_at)
      throw Error("Email belum berhasil diverifikasi. Coba kode terbaru.");
    setVerifiedUser(data.user);
    authCode.value = "";
    authStatus.textContent =
      "Email terverifikasi. Pengajuan tetap menunggu persetujuan admin.";
  } catch (error) {
    authStatus.textContent = error.message || "Kode OTP tidak valid.";
  } finally {
    verifyOtpButton.disabled = false;
  }
});
resendOtpButton.addEventListener("click", async () => {
  resendOtpButton.disabled = true;
  try {
    await requestOtp();
  } catch (error) {
    authStatus.textContent = error.message || "Kode OTP gagal dikirim.";
  } finally {
    resendOtpButton.disabled = false;
  }
});
changeEmailButton.addEventListener("click", () => {
  emailCodeForm.hidden = true;
  emailForm.hidden = false;
  authCode.value = "";
  authStatus.textContent = "";
});
signOutButton.addEventListener("click", async () => {
  if (!authClient) return;
  signOutButton.disabled = true;
  try {
    const { error } = await authClient.auth.signOut();
    if (error) throw error;
  } catch (error) {
    authStatus.textContent = error.message || "Gagal keluar dari akun.";
  } finally {
    signOutButton.disabled = false;
  }
});
const N = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};
function U(e) {
  const a = k(e).toLowerCase().split(".").pop(),
    i = N[a] || String(e.type || "").toLowerCase();
  if (!["video/mp4", "video/webm", "video/quicktime"].includes(i))
    throw Error(
      "Format video " +
        (a || e.type) +
        " tidak didukung. Gunakan MP4, MOV, atau WebM (maks 35 MB).",
    );
  return i;
}
function O(e) {
  return new Promise((a, i) => {
    const n = URL.createObjectURL(e),
      o = new Image();
    let c = !1;
    const l = (d, t) => {
      c || ((c = !0), URL.revokeObjectURL(n), d ? i(d) : a(t));
    };
    ((o.onload = () => {
      try {
        const d = Math.min(
            1,
            1800 / Math.max(o.naturalWidth || 1, o.naturalHeight || 1),
          ),
          t = document.createElement("canvas");
        ((t.width = Math.max(1, Math.round(o.naturalWidth * d))),
          (t.height = Math.max(1, Math.round(o.naturalHeight * d))),
          t
            .getContext("2d", { alpha: !1 })
            .drawImage(o, 0, 0, t.width, t.height),
          t.toBlob(
            (r) =>
              r
                ? l(null, r)
                : l(Error("Konversi foto gagal. Gunakan foto JPG.")),
            "image/jpeg",
            0.78,
          ));
      } catch {
        l(Error("Foto tidak bisa diolah di HP ini. Gunakan JPG/PNG."));
      }
    }),
      (o.onerror = () =>
        l(
          Error(
            "Foto HEIC/HEIF belum bisa dibaca browser ini. Pilih JPG/PNG atau kirim screenshot fotonya.",
          ),
        )),
      (o.src = n));
  });
}
async function _(e, a) {
  if (typeof e.size != "number" || !e.size) return null;
  if (a === "video") {
    if (e.size > 35 * 1048576)
      throw Error("Video " + w(e) + " melampaui batas 35 MB.");
    const t = U(e);
    if (t === e.type) return e;
    const r = e.slice(0, e.size, t);
    return ((r.name = k(e)), r);
  }
  if (!["photo", "price", "cover"].includes(a))
    throw Error("Jenis file " + a + " tidak dikenal.");
  const i = k(e),
    n = i.toLowerCase().split(".").pop(),
    o =
      ["heic", "heif"].includes(n) ||
      ["image/heic", "image/heif"].includes(e.type),
    c = N[n] || e.type,
    l = [
      "image/jpeg",
      "image/png",
      "image/webp",
      ...(a === "price" ? ["application/pdf"] : []),
    ];
  if (!o && !l.includes(c))
    throw Error(
      "Format " +
        i +
        " tidak didukung. Gunakan JPG, PNG, WebP" +
        (a === "price" ? ", PDF" : "") +
        ".",
    );
  if (c === "application/pdf") {
    if (e.size > 5 * 1048576)
      throw Error("PDF " + w(e) + " melebihi batas 5 MB.");
    return e;
  }
  if (o || e.size > 5 * 1048576) {
    u("Menyiapkan foto agar cocok untuk upload HP…", "Konversi foto");
    const t = await O(e);
    if (t.size > 5 * 1048576)
      throw Error(
        "Foto hasil konversi masih di atas 5 MB. Pilih foto yang lebih kecil.",
      );
    return ((t.name = i.replace(/\.[^.]+$/, "") + ".jpg"), t);
  }
  if (c === e.type) return e;
  const d = e.slice(0, e.size, c);
  return ((d.name = i), d);
}
function J(e, a) {
  let i = String(e || "").trim();
  if (!i) return "";
  i.startsWith("@") && a.includes("instagram")
    ? (i = "https://instagram.com/" + i.slice(1))
    : (/^www\./i.test(i) ||
        (!/^https?:\/\//i.test(i) && /^[\w-]+\.[a-z]{2,}/i.test(i))) &&
      (i = "https://" + i);
  try {
    const n = new URL(i);
    if (n.protocol !== "https:") throw Error();
    return n.href;
  } catch {
    throw Error(
      "Link " +
        a.replace(/_/g, " ") +
        " belum benar. Isi https://... atau kosongkan.",
    );
  }
}
async function S(e, a) {
  if (!T || !E)
    throw Error(
      "Frontend masih mode demo. Tambahkan kredensial Supabase STAGING di .env.local dahulu.",
    );
  const { data, error } = await authClient.auth.getSession();
  if (error) throw error;
  const accessToken = data.session?.access_token;
  if (e !== "status" && !accessToken)
    throw Error("Verifikasi email terlebih dahulu.");
  let i;
  try {
    i = await fetch(F, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: E,
        ...(accessToken && e !== "status"
          ? { authorization: "Bearer " + accessToken }
          : {}),
      },
      body: JSON.stringify({ action: e, ...a }),
      cache: "no-store",
    });
  } catch {
    throw Error(
      "Tidak bisa menghubungi Supabase dari HP. Matikan VPN/pemblokir lalu coba lagi.",
    );
  }
  const n = await i.json().catch(() => ({}));
  if (!i.ok || !n.ok)
    throw Error(
      (n.error || "Server menolak permintaan") + " (HTTP " + i.status + ")",
    );
  return n;
}
async function R(e, a) {
  const i =
    T +
    "/storage/v1/object/upload/sign/wk-guest-private/" +
    e.path +
    "?token=" +
    encodeURIComponent(e.token);
  for (let n = 0; n < 3; n++)
    try {
      if (n === 0) {
        await new Promise((t, r) => {
          const s = new XMLHttpRequest();
          (s.open("PUT", i, !0),
            s.setRequestHeader("apikey", E),
            s.setRequestHeader("content-type", a.type),
            s.setRequestHeader("x-upsert", "false"),
            (s.timeout = 21e4),
            (s.upload.onprogress = (g) => {
              g.lengthComputable &&
                g.total &&
                u(
                  "Mengunggah " +
                    e.kind +
                    " " +
                    Math.round((100 * g.loaded) / g.total) +
                    "% · " +
                    w(a),
                  "Mengirim file",
                );
            }),
            (s.onload = () => {
              if (s.status >= 200 && s.status < 300) {
                t();
                return;
              }
              let g = String(s.responseText || "").slice(0, 300);
              try {
                const B = JSON.parse(s.responseText);
                g = B.message || B.error || g;
              } catch {}
              const I = Error(
                "Upload " +
                  e.kind +
                  " ditolak HTTP " +
                  s.status +
                  ": " +
                  (g || "Tidak ada detail"),
              );
              ((I.code = s.status), r(I));
            }),
            (s.onerror = () =>
              r(
                Error(
                  "Sambungan upload gagal dari browser HP. Coba Chrome/Safari langsung, tanpa browser dalam aplikasi.",
                ),
              )),
            (s.ontimeout = () =>
              r(
                Error(
                  "Koneksi upload habis waktu. Coba Wi-Fi yang lebih stabil.",
                ),
              )),
            s.send(a));
        });
        return;
      }
      const o = await fetch(i, {
        method: "PUT",
        headers: { apikey: E, "content-type": a.type, "x-upsert": "false" },
        body: a,
      });
      if (o.ok || o.status === 409) return;
      const c = (await o.text()).slice(0, 240);
      let l = c;
      try {
        const t = JSON.parse(c);
        l = t.message || t.error || c;
      } catch {}
      const d = Error("Upload gagal HTTP " + o.status + ": " + l);
      throw ((d.code = o.status), d);
    } catch (o) {
      if (
        (!o.code || o.code === 408 || o.code === 429 || o.code >= 500) &&
        n < 2
      ) {
        (u(
          "Koneksi terputus. Mengulang upload " +
            e.kind +
            " (" +
            (n + 2) +
            "/3)…",
          "Mengulang upload",
        ),
          await L((n + 1) * 1500));
        continue;
      }
      throw o;
    }
}
C.onclick = async () => {
  if (p)
    try {
      const e = await S("status", { id: p.id, receipt: p.receipt });
      M.textContent =
        {
          pending: "MENUNGGU ADMIN",
          approved: "SUDAH TAYANG",
          rejected: "DITOLAK",
          draft: "BELUM SELESAI",
        }[e.status] +
        " " +
        (e.note || "");
    } catch (e) {
      M.textContent = e.message;
    }
};
const v = f.querySelector('input[type="file"][name="video"]');
v &&
  v.addEventListener("change", () => {
    var a;
    const e = (a = v.files) == null ? void 0 : a[0];
    if (e)
      try {
        (u(
          "Video dipilih: " + w(e) + " · " + U(e) + " · batas 35 MB",
          "Video siap",
        ),
          (m.hidden = !0));
      } catch (i) {
        j(i);
      }
  });
window.addEventListener("unhandledrejection", (e) => {
  h.disabled && j(e.reason || Error("JavaScript gagal menjalankan upload."));
});
f.onsubmit = async (e) => {
  if ((e.preventDefault(), h.disabled)) return;
  h.disabled = !0;
  const a = h.textContent;
  ((h.textContent = "MENGIRIM…"), (m.hidden = !0));
  try {
    b = "Memeriksa formulir";
    const i = new FormData(f),
      n = {},
      o = {},
      c = {};
    for (const [t, r] of i.entries())
      if (
        r &&
        typeof r == "object" &&
        typeof r.size == "number" &&
        typeof r.slice == "function"
      ) {
        if (!r.size) continue;
        const s = await _(r, t);
        if (!s) continue;
        ((c[t] = s), (o[t] = { type: s.type, size: s.size }));
      } else t !== "website" && (n[t] = String(r || ""));
    n.website = "";
    for (const t of [
      "instagram_url",
      "spotify_url",
      "release_listen_url",
      "clip_instagram_url",
    ])
      n[t] = J(n[t], t);
    if (String(n.name || "").trim().length < 2)
      throw Error("Nama band wajib diisi minimal 2 huruf.");
    if (
      (c.video &&
        !String(n.clip_title || "").trim() &&
        (n.clip_title =
          String(k(c.video))
            .replace(/\.[^.]+$/, "")
            .slice(0, 90) || "Video band"),
      c.cover && !String(n.release_title || "").trim())
    )
      throw Error("Isi judul rilisan sebelum mengirim.");
    (Object.keys(o).length &&
      u(
        "File terpilih: " +
          Object.entries(c)
            .map(([t, r]) => t + " " + w(r))
            .join(", "),
        "Memeriksa media",
      ),
      (b = "Menyiapkan pengajuan"),
      u("Menghubungkan ke server…"));
    const l = await S("prepare", { ...n, files: o });
    for (const [t, r] of (l.uploads || []).entries()) {
      b = "Mengunggah " + r.kind;
      const s = c[r.kind];
      if (!s) throw Error("File " + r.kind + " tidak ditemukan.");
      (u(
        "Mengirim " + w(s) + " (" + (t + 1) + "/" + l.uploads.length + ")…",
        "Mengirim file",
      ),
        await R(r, s));
    }
    ((b = "Memasukkan antrean admin"),
      u("File selesai. Mendaftarkan pengajuan ke admin…"));
    let d = !1;
    for (let t = 0; t < 3; t++)
      try {
        (await S("finish", { id: l.id, receipt: l.receipt }), (d = !0));
        break;
      } catch (r) {
        if (
          t === 2 ||
          !String(r.message).toLowerCase().includes("belum selesai")
        )
          throw r;
        await L(1500 * (t + 1));
      }
    if (!d) throw Error("Pengajuan belum tersimpan.");
    p = { id: l.id, receipt: l.receipt, status: "pending" };
    try {
      localStorage.setItem("wingking-last-submission", JSON.stringify(p));
    } catch {}
    (H(),
      f.reset(),
      u(
        "BERHASIL! Video/band sudah masuk antrean admin. Simpan kode pengajuan di bawah.",
        "Selesai",
      ),
      P.scrollIntoView({ behavior: "smooth", block: "center" }));
  } catch (i) {
    j(i);
  } finally {
    ((h.disabled = !1), (h.textContent = a));
  }
};
