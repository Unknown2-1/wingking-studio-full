// Wingking Studio — secure, server-side Supabase runtime
// No DB password or service key is sent to Vercel or to the browser.
// @ts-nocheck
import postgres from "npm:postgres@3.4.5";
const sql = postgres(Deno.env.get("SUPABASE_DB_URL"), { prepare: false, max: 1, connect_timeout: 6, idle_timeout: 5 });
const ADMIN_CHECK = "https://wingking-v27-fullstack-staging-xenseen.vercel.app/admin/check";
const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const json = (body, status=200) => new Response(JSON.stringify(body), {status,headers});
const validID = x => typeof x === "string" && /^[a-z0-9]{10,40}$/i.test(x);
const mins = x => typeof x === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(x) ? (+x.slice(0,2)*60 + +x.slice(3)) : null;
function jakartaNow(now=new Date()) {
  const parts=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Jakarta",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(now);
  const get=x=>parts.find(p=>p.type===x)?.value||"";
  return {day:get("year")+"-"+get("month")+"-"+get("day"), minutes:+get("hour")*60 + +get("minute")};
}
function checkDay(value) {
  if(typeof value!=="string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d=new Date(value+"T00:00:00Z");
  if(!Number.isFinite(d.getTime()) || d.toISOString().slice(0,10)!==value) return false;
  const delta=(d.getTime()-Date.parse(jakartaNow().day+"T00:00:00Z"))/86400000;
  return delta>=0 && delta<=120;
}
function conflicts(rows,start,duration) {
  return rows.some(b => {
    const s=mins(b.startTime);
    return s===null || (start < s+b.durationHours*60 && s < start+duration*60);
  });
}
async function adminAllowed(req) {
  const forwarded=req.headers.get("x-wingking-cookie")||"";
  if(!/^wingking_admin=\d{13}\.[a-f0-9]{32}\.[a-f0-9]{64}$/.test(forwarded)) return false;
  try {
    const r=await fetch(ADMIN_CHECK,{method:"GET",headers:{"Cookie":forwarded,"X-Wingking-Introspection":"1"},redirect:"manual",cache:"no-store",signal:AbortSignal.timeout(5500)});
    if(r.status!==200) return false;
    const data=await r.json();return data?.active===true;
  }catch{return false;}
}
async function readBody(req) {
  const txt=await req.text();
  if(txt.length>8000) throw new Error("too-big");
  return JSON.parse(txt);
}
async function services() {
  const rows=await sql.unsafe('SELECT id,name,"pricePerHour" FROM public."Service" ORDER BY "createdAt" ASC');
  return json({success:true,services:rows.filter(x=>!/mixing|mastering/i.test(x.name)).map(x=>({id:x.id,name:x.name,pricePerHour:x.pricePerHour}))});
}
async function availability(req) {
  const day=new URL(req.url).searchParams.get("date");
  if(!checkDay(day))return json({error:"Tanggal di luar periode reservasi"},400);
  const rows=await sql.unsafe('SELECT "startTime","durationHours" FROM public."Booking" WHERE "date"=$1::date AND status IN (\'PENDING\',\'CONFIRMED\')',[day]);
  return json({date:day,occupied:rows});
}
async function book(req) {
  if(!(req.headers.get("content-type")||"").includes("application/json"))return json({success:false,error:"Gunakan format JSON"},415);
  let b;
  try{b=await readBody(req)}catch{return json({success:false,error:"Data reservasi tidak valid"},400);}
  if(!b || typeof b!=="object" || Array.isArray(b))return json({success:false,error:"Data tidak valid"},400);
  const customerName=typeof b.customerName==="string"?b.customerName.trim().replace(/\s+/g," "):"";
  const customerPhone=typeof b.customerPhone==="string"?b.customerPhone.replace(/[\s()-]/g,""):"";
  if(customerName.length<2||customerName.length>80)return json({success:false,error:"Nama harus 2–80 karakter."},422);
  if(!/^(?:\+62|62|0)8\d{8,11}$/.test(customerPhone))return json({success:false,error:"Nomor WhatsApp tidak valid."},422);
  if(!validID(b.serviceId)||!checkDay(b.date))return json({success:false,error:"Layanan/tanggal tidak valid."},422);
  const start=mins(b.startTime), duration=b.durationHours;
  if(start===null||start%30!==0||!Number.isInteger(duration)||duration<1||duration>12||start<540||start+duration*60>1380)return json({success:false,error:"Pilih jam 09.00–23.00 WIB dan durasi 1–12 jam."},422);
  const now=jakartaNow();
  if(b.date===now.day && start<=now.minutes)return json({success:false,error:"Pilih jam yang masih akan datang."},422);
  const result=await sql.begin(async tx=>{
    await tx.unsafe("SELECT pg_advisory_xact_lock(hashtext('wingking-studio'),hashtext($1))",[b.date]);
    const srv=await tx.unsafe('SELECT id,name FROM public."Service" WHERE id=$1 LIMIT 1',[b.serviceId]);
    if(!srv.length||/mixing|mastering/i.test(srv[0].name))return {error:"Paket layanan tidak tersedia untuk booking per jam."};
    const existing=await tx.unsafe('SELECT "startTime","durationHours" FROM public."Booking" WHERE "date"=$1::date AND status IN (\'PENDING\',\'CONFIRMED\')',[b.date]);
    if(conflicts(existing,start,duration))return {error:"Jadwal bentrok. Silakan pilih jam lainnya."};
    const recent=await tx.unsafe('SELECT COUNT(*)::integer AS n FROM public."Booking" WHERE "customerPhone"=$1 AND "createdAt">=now()-interval \'24 hours\'',[customerPhone]);
    if(recent[0].n>=3)return {error:"Batas tiga permintaan per nomor WhatsApp per 24 jam tercapai."};
    const id=crypto.randomUUID().replace(/-/g,"");
    const inserted=await tx.unsafe('INSERT INTO public."Booking" (id,"customerName","customerPhone","serviceId","date","startTime","durationHours",status) VALUES ($1,$2,$3,$4,$5::date,$6,$7,\'PENDING\') RETURNING id,status',[id,customerName,customerPhone,b.serviceId,b.date,b.startTime,duration]);
    return {id:inserted[0].id,status:inserted[0].status};
  });
  if(result.error)return json({success:false,error:result.error},422);
  return json({success:true,reservation:result},201);
}
async function adminData(req) {
  if(!await adminAllowed(req))return json({error:"Unauthorized"},401);
  const size=new URL(req.url).searchParams.get("limit")==="5000"?5000:500;
  const [bookings,services]=await Promise.all([
    sql.unsafe('SELECT b.id,b."customerName",b."customerPhone",b."serviceId",to_char(b."date",\'YYYY-MM-DD\') AS date,b."startTime",b."durationHours",b.status,b."createdAt",s.name AS "serviceName",s."pricePerHour" AS "servicePrice" FROM public."Booking" b JOIN public."Service" s ON s.id=b."serviceId" ORDER BY b."createdAt" DESC LIMIT $1',[size]),
    sql.unsafe('SELECT id,name,"pricePerHour","createdAt" FROM public."Service" ORDER BY "createdAt" ASC')
  ]);
  return json({success:true,bookings:bookings.map(x=>({id:x.id,customerName:x.customerName,customerPhone:x.customerPhone,serviceId:x.serviceId,date:x.date,startTime:x.startTime,durationHours:x.durationHours,status:x.status,createdAt:x.createdAt,service:{name:x.serviceName,pricePerHour:x.servicePrice}})),services});
}
async function adminStatus(req) {
  if(!await adminAllowed(req))return json({error:"Unauthorized"},401);
  let b;try{b=await readBody(req)}catch{return json({error:"Data tidak valid"},400);}
  if(!validID(b?.bookingId)||!["PENDING","CONFIRMED","CANCELLED"].includes(b.status))return json({error:"Data tidak valid"},422);
  const result=await sql.begin(async tx=>{
    const rows=await tx.unsafe('SELECT id,to_char("date",\'YYYY-MM-DD\') AS day,"startTime","durationHours" FROM public."Booking" WHERE id=$1',[b.bookingId]);
    if(!rows.length)return {error:"Reservasi tidak ditemukan."};
    const row=rows[0];
    await tx.unsafe("SELECT pg_advisory_xact_lock(hashtext('wingking-studio'),hashtext($1))",[row.day]);
    if(b.status!=="CANCELLED"){
      const start=mins(row.startTime);
      if(start===null)return {error:"Waktu reservasi lama tidak valid."};
      const previous=await tx.unsafe('SELECT "startTime","durationHours" FROM public."Booking" WHERE "date"=$1::date AND id<>$2 AND status IN (\'PENDING\',\'CONFIRMED\')',[row.day,b.bookingId]);
      if(conflicts(previous,start,row.durationHours))return {error:"Jadwal bentrok dengan booking aktif lain."};
    }
    await tx.unsafe('UPDATE public."Booking" SET status=$1 WHERE id=$2',[b.status,b.bookingId]);
    return {success:true};
  });
  if(result.error)return json(result,422);
  return json(result);
}
async function adminPrice(req) {
  if(!await adminAllowed(req))return json({error:"Unauthorized"},401);
  let b;try{b=await readBody(req)}catch{return json({error:"Data tidak valid"},400);}
  if(!validID(b?.serviceId)||!Number.isInteger(b.price)||b.price<1000||b.price>10000000)return json({error:"Harga tidak valid"},422);
  const rows=await sql.unsafe('UPDATE public."Service" SET "pricePerHour"=$1 WHERE id=$2 RETURNING id',[b.price,b.serviceId]);
  if(!rows.length)return json({error:"Layanan tidak ditemukan"},404);
  return json({success:true});
}

import { scryptSync, timingSafeEqual, createHash } from "node:crypto";
import { Buffer } from "node:buffer";

function ipHash(req) {
  const ip=req.headers.get("cf-connecting-ip")||req.headers.get("x-real-ip")||req.headers.get("x-forwarded-for")?.split(",")[0]||"unknown";
  return createHash("sha256").update(String(ip).slice(0,180)).digest("hex");
}
async function authState() {
  const rows=await sql.unsafe("SELECT version FROM wingking_private.admin_credentials WHERE id=1");
  return json({initialized:rows.length===1,version:rows[0]?.version||0});
}
async function verifyAdminPasswordEdge(req) {
  if (!(req.headers.get("content-type")||"").startsWith("application/json")) return json({valid:false},415);
  let body;try{body=await readBody(req)}catch{return json({valid:false},400)}
  const pass=body?.password;
  if(typeof pass!=="string"||pass.length>256||pass.length<1)return json({valid:false},400);
  const key=ipHash(req);
  // Database-backed per-IP throttle, shared by every Edge instance.
  const attempts=await sql.unsafe("SELECT failed,window_start FROM wingking_private.admin_login_attempts WHERE ip_hash=$1",[key]);
  if(attempts.length && Number(attempts[0].failed)>=10 && Date.now()-new Date(attempts[0].window_start).getTime()<15*60*1000) return json({valid:false,error:"Terlalu banyak percobaan. Coba lagi nanti."},429);
  const row=await sql.unsafe("SELECT password_scrypt,version FROM wingking_private.admin_credentials WHERE id=1");
  if(!row.length)return json({initialized:false,valid:false,version:0});
  let valid=false;
  try {
    const [saltHex,hashHex]=String(row[0].password_scrypt).split(":");
    if(/^[a-f0-9]{48}$/.test(saltHex)&&/^[a-f0-9]{128}$/.test(hashHex)){
      const actual=scryptSync(pass,Buffer.from(saltHex,"hex"),64);
      valid=timingSafeEqual(actual,Buffer.from(hashHex,"hex"));
    }
  }catch(error){console.error("Password verification failed",error?.message)}
  if(valid)await sql.unsafe("DELETE FROM wingking_private.admin_login_attempts WHERE ip_hash=$1",[key]);
  else await sql.unsafe("INSERT INTO wingking_private.admin_login_attempts (ip_hash,failed,window_start) VALUES ($1,1,now()) ON CONFLICT (ip_hash) DO UPDATE SET failed=CASE WHEN wingking_private.admin_login_attempts.window_start < now()-interval '15 minutes' THEN 1 ELSE wingking_private.admin_login_attempts.failed+1 END, window_start=CASE WHEN wingking_private.admin_login_attempts.window_start < now()-interval '15 minutes' THEN now() ELSE wingking_private.admin_login_attempts.window_start END",[key]);
  return json({initialized:true,valid,version:row[0].version});
}
async function changeAdminPasswordEdge(req) {
  if(!await adminAllowed(req))return json({success:false,error:"Unauthorized"},401);
  let body;try{body=await readBody(req)}catch{return json({success:false,error:"Data tidak valid"},400)}
  const newHash=body?.passwordHash, expectedVersion=body?.expectedVersion;
  if(typeof newHash!=="string"||!/^[a-f0-9]{48}:[a-f0-9]{128}$/.test(newHash)||!Number.isSafeInteger(expectedVersion)||expectedVersion<0)return json({success:false,error:"Password tidak valid"},422);
  const rows=await sql.unsafe(`INSERT INTO wingking_private.admin_credentials(id,password_scrypt,version,changed_at)
    VALUES(1,$1,1,now()) ON CONFLICT(id) DO UPDATE SET password_scrypt=EXCLUDED.password_scrypt, version=wingking_private.admin_credentials.version+1, changed_at=now()
    WHERE wingking_private.admin_credentials.version=$2 RETURNING version`,[newHash,expectedVersion]);
  if(!rows.length)return json({success:false,error:"Password telah diubah oleh sesi lain. Login kembali."},409);
  await sql.unsafe("DELETE FROM wingking_private.admin_login_attempts");
  return json({success:true,version:rows[0].version});
}

Deno.serve(async(req)=>{
  const path=new URL(req.url).pathname;
  try {
    if(req.method==="GET"&&path.endsWith("/admin/auth/state"))return await authState();
    if(req.method==="POST"&&path.endsWith("/admin/auth/verify"))return await verifyAdminPasswordEdge(req);
    if(req.method==="POST"&&path.endsWith("/admin/auth/change"))return await changeAdminPasswordEdge(req);
    if(req.method==="GET"&&path.endsWith("/health")){
      const result=await sql.unsafe('SELECT COUNT(*)::integer AS n FROM public."Service"');
      return json({status:"ready",database:"connected",services:result[0].n});
    }
    if(req.method==="GET"&&path.endsWith("/services"))return await services();
    if(req.method==="GET"&&path.endsWith("/availability"))return await availability(req);
    if(req.method==="POST"&&path.endsWith("/booking"))return await book(req);
    if(req.method==="GET"&&path.endsWith("/admin/list"))return await adminData(req);
    if(req.method==="POST"&&path.endsWith("/admin/status"))return await adminStatus(req);
    if(req.method==="POST"&&path.endsWith("/admin/price"))return await adminPrice(req);
    return json({error:"Not found"},404);
  }catch(error){console.error("Wingking database operation",error?.code||"unknown",error?.message||"failed");return json({error:"Database sementara tidak tersedia",status:"degraded"},503);}
});