import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "wingking_admin";
const SESSION_SECONDS = 8 * 60 * 60;
function sessionSecret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  return value && value.length >= 32 ? value : null;
}

export function adminReady() {
  return Boolean(sessionSecret() && process.env.ADMIN_PASSWORD_SCRYPT);
}

export function checkAdminPassword(password: string) {
  const encoded = process.env.ADMIN_PASSWORD_SCRYPT;
  if (!encoded || password.length > 256 || password.length < 1) return false;
  const [saltHex, hashHex] = encoded.split(":");
  if (!/^[0-9a-f]{48}$/i.test(saltHex || "") || !/^[0-9a-f]{128}$/i.test(hashHex || "")) return false;
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  const expected = Buffer.from(hashHex, "hex");
  return timingSafeEqual(actual, expected);
}

function digest(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export async function openAdminSession() {
  const secret = sessionSecret();
  if (!secret) throw new Error("Admin session secret is not configured");
  const expires = Date.now() + SESSION_SECONDS * 1000;
  const payload = `${expires}.${randomBytes(16).toString("hex")}`;
  (await cookies()).set(COOKIE, `${payload}.${digest(payload, secret)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict",
    path: "/admin", maxAge: SESSION_SECONDS,
  });
}

export async function isAdmin() {
  const secret = sessionSecret();
  if (!secret) return false;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const pieces = raw.split(".");
  if (pieces.length !== 3 || !/^\d{13}$/.test(pieces[0]) || !/^[0-9a-f]{32}$/.test(pieces[1]) || !/^[0-9a-f]{64}$/.test(pieces[2])) return false;
  const expires = Number(pieces[0]);
  if (expires <= Date.now() || expires > Date.now() + SESSION_SECONDS * 1000) return false;
  const expected = Buffer.from(digest(`${pieces[0]}.${pieces[1]}`, secret), "hex");
  const actual = Buffer.from(pieces[2], "hex");
  return timingSafeEqual(expected, actual);
}

export async function closeAdminSession() {
  (await cookies()).set(COOKIE, "", { path: "/admin", maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
}
