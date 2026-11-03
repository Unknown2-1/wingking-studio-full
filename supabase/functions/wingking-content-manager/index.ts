import { createClient } from "npm:@supabase/supabase-js@2.76.1";

const URL=Deno.env.get("SUPABASE_URL")||"";
const SECRET=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||Deno.env.get("SUPABASE_SECRET_KEY")||"";
const PUBLISH=Deno.env.get("SUPABASE_ANON_KEY")||"";
if(!URL||!SECRET||!PUBLISH)throw Error("Supabase environment configuration missing");
const service=createClient(URL,SECRET,{auth:{persistSession:false,autoRefreshToken:false}});
const ALLOWED=/^https:\/\/(?:wingking-content-manager-preview(?:-[a-z0-9]+)?(?:-[a-z0-9]+)?\.vercel\.app|wingking-private-review-console\.vercel\.app)$/i;
function originOK(o){return ALLOWED.test(o)||/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)}
function cors(o){return {"access-control-allow-origin":originOK(o)?o:"null","access-control-allow-methods":"POST,OPTIONS","access-control-allow-headers":"authorization,apikey,content-type,x-client-info","vary":"Origin","cache-control":"no-store","x-content-type-options":"nosniff"}}
function answer(o,data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8",...cors(o)}})}
function fail(m,status=400){throw Object.assign(new Error(m),{status})}
const tables={public:"wk_public_submissions",guest:"wk_guest_posts",band:"wk_bands",release:"wk_releases",clip:"wk_clips"};
const editFields={
 public:{band_name:80,title:100,genre:60,city:70,description:1200,instagram_url:350,music_url:350,price_text:600},
 guest:{name:80,genre:60,city:80,tagline:180,story:1200,instagram_url:350,spotify_url:350,release_title:100,release_caption:300,release_listen_url:350,clip_title:100,clip_caption:240,clip_instagram_url:350},
 band:{name:80,genre:60,city:80,tagline:180,story:1200,instagram_url:350,spotify_url:350},
 release:{title:100,kind:40,caption:300,listen_url:350},
 clip:{title:80,caption:240,instagram_url:350}
};
const selections={
 public:"id,kind,band_name,title,genre,city,description,instagram_url,music_url,price_text,photo_url,video_url,review_status,review_note,is_published,submitted_at,archived_at,deleted_at",
 guest:"id,name,genre,city,tagline,story,instagram_url,spotify_url,photo_url,price_image_url,release_title,release_caption,release_listen_url,release_cover_url,clip_title,clip_caption,clip_url,clip_instagram_url,is_visible,created_at,archived_at,deleted_at",
 band:"id,name,genre,city,tagline,story,instagram_url,spotify_url,photo_url,price_image_url,is_published,review_status,review_note,created_at,archived_at,deleted_at",
 release:"id,title,kind,caption,cover_url,listen_url,band_id,is_published,review_status,review_note,created_at,archived_at,deleted_at",
 clip:"id,title,caption,video_url,instagram_url,band_id,is_published,review_status,review_note,created_at,archived_at,deleted_at"
};
function display(s,r){return String(s==="public"?(r.title||r.band_name):s==="guest"?r.name:s==="band"?r.name:r.title||"Konten").slice(0,100)}
function validatePatch(s,p){
 if(!p||typeof p!=="object"||Array.isArray(p))fail("Data edit tidak valid");
 const out={},defs=editFields[s];
 for(const [k,v]of Object.entries(p)){
  if(!Object.hasOwn(defs,k)||typeof v!=="string")fail("Kolom edit tidak diizinkan: "+k);
  const z=v.trim();
  if(z.length>defs[k])fail(k+" terlalu panjang");
  if((k==="name"||k==="band_name")&&z.length<2)fail("Nama minimal 2 karakter");
  if(k==="title"&&s!=="public"&&z.length<1)fail("Judul wajib diisi");
  if(k==="kind"&&!["Single","EP","Album","Live Session"].includes(z))fail("Jenis rilisan tidak sesuai");
  if(k.endsWith("_url")&&z){let u;try{u=new URL(z)}catch{fail("Link "+k+" tidak valid")}if(u.protocol!=="https:")fail("Link wajib HTTPS")}
  out[k]=z;
 }
 if(!Object.keys(out).length)fail("Tidak ada perubahan");
 return out;
}
async function audit(uid,source,rowId,action,label,metadata={}){
 const {error}=await service.from("wk_content_activity").insert({actor_id:uid,source,content_id:rowId,action,label,metadata});
 if(error){console.error("audit",error.code);return "Riwayat aktivitas belum tercatat: "+error.message}
 return null;
}
function storageRef(raw){
 try{
  if(!raw)return null;
  const u=new URL(raw),root=new URL(URL);
  if(u.origin!==root.origin)return null;
  const x=u.pathname.match(/^\/storage\/v1\/object\/public\/(wk-public-intake|wk-band-assets|wk-clips)\/(.+)$/);
  if(!x)return null;const path=decodeURIComponent(x[2]);
  if(!path||path.includes("..")||path.includes("\\")||path.startsWith("/")||path.endsWith("/"))return null;
  return {bucket:x[1],path,url:raw};
 }catch{return null}
}
const mediaColumns={
 public:["photo_url","video_url"], guest:["photo_url","price_image_url","release_cover_url","clip_url"],
 band:["photo_url","price_image_url"],release:["cover_url"],clip:["video_url"]
};
async function referencedElsewhere(url){
 for(const [source,cols] of Object.entries(mediaColumns)){
  for(const col of cols){
   const {count,error}=await service.from(tables[source]).select("id",{head:true,count:"exact"}).eq(col,url);
   if(error)throw Error("Gagal memeriksa referensi file");
   if((count||0)>0)return true;
  }
 }
 return false;
}
async function safeCleanup(source,record){
 const refs=[],seen=new Set();
 for(const field of mediaColumns[source]){
  const ref=storageRef(record[field]);if(ref&&!seen.has(ref.bucket+"/"+ref.path)){refs.push(ref);seen.add(ref.bucket+"/"+ref.path)}
 }
 const warnings=[];
 for(const item of refs){
  try{
   if(await referencedElsewhere(item.url)){warnings.push("File dipakai konten lain, tidak dihapus");continue}
   const {error}=await service.storage.from(item.bucket).remove([item.path]);
   if(error)warnings.push("File "+item.path+" belum bisa dibersihkan: "+error.message);
  }catch(e){warnings.push("Pembersihan storage tertunda: "+String(e.message||e))}
 }
 return warnings;
}
Deno.serve(async(req)=>{
 const o=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(o)});
 if(req.method!=="POST")return answer(o,{error:"POST required"},405);
 if(!originOK(o))return answer(o,{error:"Origin tidak diizinkan"},403);
 try{
  if(Number(req.headers.get("content-length")||0)>16000)fail("Permintaan terlalu besar",413);
  const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
  if(!token||token.length>5000||token.startsWith("sb_"))fail("Silakan login sebagai admin Wingking",401);
  const {data:{user},error:authErr}=await service.auth.getUser(token);
  if(authErr||!user)fail("Sesi admin telah berakhir, silakan login lagi",401);
  const {data:mod,error:modError}=await service.from("wk_moderators").select("user_id").eq("user_id",user.id).maybeSingle();
  if(modError||!mod)fail("Akses khusus moderator Wingking",403);
  const b=await req.json();const action=String(b.action||"");
  if(action==="list"){
   const sources=Object.keys(tables),lookups=await Promise.all(sources.map(s=>service.from(tables[s]).select(selections[s]).order(s==="public"?"submitted_at":"created_at",{ascending:false}).limit(250)));
   for(const result of lookups)if(result.error)fail("Gagal membaca katalog: "+result.error.message,503);
   const {data:activity,error:activityError}=await service.from("wk_content_activity").select("id,source,content_id,action,label,metadata,created_at").order("created_at",{ascending:false}).limit(60);
   return answer(o,{ok:true,items:lookups.flatMap((r,i)=>(r.data||[]).map(item=>({source:sources[i],...item}))),activity:activityError?[]:(activity||[]),stats:{total:lookups.reduce((n,x)=>n+(x.data?.length||0),0)}});
  }
  const source=String(b.source||"");if(!Object.hasOwn(tables,source))fail("Jenis konten tidak dikenal");
  const id=String(b.id||"");if(!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(id))fail("ID konten tidak valid");
  const table=tables[source],{data:old,error:readError}=await service.from(table).select("*").eq("id",id).maybeSingle();
  if(readError)fail("Gagal membaca konten",503);if(!old)fail("Konten tidak ditemukan atau sudah dihapus",404);
  const label=display(source,old);
  if(action==="purge"){
   if(!old.deleted_at)fail("Pindahkan konten ke Tempat Sampah dahulu");
   if(b.confirm!==label)fail("Konfirmasi nama konten tidak sesuai");
   if(source==="band"){
    for(const dep of ["wk_clips","wk_releases"]){const {count,error}=await service.from(dep).select("id",{count:"exact",head:true}).eq("band_id",id);
     if(error)fail("Gagal memeriksa konten terkait",503);
     if((count||0)>0)fail("Profil band ini masih memiliki rilisan/video. Hapus konten terkait dulu",409);
    }
   }
   const {data:removed,error:e}=await service.from(table).delete().eq("id",id).not("deleted_at","is",null).select("id").maybeSingle();
   if(e)fail("Gagal menghapus record: "+e.message,500);
   if(!removed)fail("Konten sudah diproses admin lain, muat ulang",409);
   const warnings=await safeCleanup(source,old),auditWarning=await audit(user.id,source,id,"purge",label,{cleanup_warnings:warnings.length});
   return answer(o,{ok:true,action,warning:[...warnings,...(auditWarning?[auditWarning]:[])].join(" | ")});
  }
  if(old.deleted_at&&!["restore_trash"].includes(action))fail("Konten ada di Tempat Sampah. Pulihkan dahulu");
  let patch={},logAction=action;
  if(action==="edit"){patch=validatePatch(source,b.patch)}
  else if(action==="archive"){if(old.archived_at)fail("Konten sudah diarsipkan");patch={archived_at:new Date().toISOString()};if(source==="guest")patch.is_visible=false}
  else if(action==="restore"){if(!old.archived_at)fail("Konten tidak sedang diarsipkan");patch={archived_at:null};if(source==="guest")patch.is_visible=await isApprovedGuest(id)}
  else if(action==="trash"){patch={deleted_at:new Date().toISOString(),archived_at:old.archived_at||new Date().toISOString()};if(source==="guest")patch.is_visible=false}
  else if(action==="restore_trash"){if(!old.deleted_at)fail("Konten tidak berada di Tempat Sampah");patch={deleted_at:null,archived_at:null};if(source==="guest")patch.is_visible=await isApprovedGuest(id)}
  else if(action==="approve"||action==="reject"){
   if(source==="guest")fail("Persetujuan kiriman tamu dilakukan dari menu moderasi");
   if(old.archived_at)fail("Pulihkan konten dari arsip sebelum meninjau");
   if(action==="reject"&&String(b.note||"").trim().length<5)fail("Isi alasan penolakan minimal 5 karakter");
   patch={review_status:action==="approve"?"approved":"rejected",review_note:action==="reject"?String(b.note||"").trim().slice(0,500):""};
  }else fail("Aksi tidak tersedia");
  // All direct browser-equivalent writes use the moderator JWT to preserve RLS and auth.uid() in review triggers.
  const asUser=createClient(URL,PUBLISH,{global:{headers:{authorization:"Bearer "+token}},auth:{persistSession:false,autoRefreshToken:false}});
  const writer=source==="guest"?service:asUser;
  const {data:changed,error:e}=await writer.from(table).update(patch).eq("id",id).select("id").maybeSingle();
  if(e)fail("Gagal menyimpan: "+e.message,403);
  if(!changed)fail("Tidak ada perubahan (periksa sesi dan izin admin)",409);
  const auditWarning=await audit(user.id,source,id,logAction,label,action==="edit"?{fields:Object.keys(patch)}:{});
  return answer(o,{ok:true,action,warning:auditWarning||""});
 }catch(e){console.error("content-manager",String(e?.message||e).slice(0,220));return answer(o,{error:String(e?.message||"Kesalahan tidak diketahui")},Number(e?.status)||500)}
});
async function isApprovedGuest(id){
 const {data,error}=await service.from("wk_guest_requests").select("status").eq("id",id).maybeSingle();
 if(error)fail("Gagal memeriksa status konten",503);return data?.status==="approved";
}
