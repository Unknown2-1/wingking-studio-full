
import {createClient} from "npm:@supabase/supabase-js@2.76.1";
const SB_URL=Deno.env.get("SUPABASE_URL");
const SERVICE=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||Deno.env.get("SUPABASE_SECRET_KEY");
const db=createClient(SB_URL,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}});
const bucket="wk-guest-private",maxImage=5*1024*1024,maxVideo=35*1024*1024;
const mime={photo:["image/jpeg","image/png","image/webp"],price:["image/jpeg","image/png","image/webp","application/pdf"],cover:["image/jpeg","image/png","image/webp"],video:["video/mp4","video/webm","video/quicktime"]};
const extensions={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","application/pdf":"pdf","video/mp4":"mp4","video/webm":"webm","video/quicktime":"mov"};
const okayOrigin=req=>{const o=req.headers.get("origin")||"";return ["https://wingking-studio.vercel.app","https://wingking-private-review-console.vercel.app"].includes(o)||/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)};
const cors=req=>({"Access-Control-Allow-Origin":okayOrigin(req)?req.headers.get("origin"):"null","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info","Vary":"Origin","Cache-Control":"no-store"});
const json=(r,v,status=200)=>new Response(JSON.stringify(v),{status,headers:{"Content-Type":"application/json; charset=utf-8",...cors(r)}});
const err=(message,status=400)=>{throw {message,status}};
const txt=(v,max)=>String(v??"").trim().slice(0,max);
const link=v=>{const s=txt(v,350);if(!s)return "";let u;try{u=new URL(s)}catch{err("Link tidak valid")}if(u.protocol!=="https:")err("Gunakan link HTTPS");return u.href};
const sha=async s=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,"0")).join("");
function validate(b){
 if(b.website)err("Spam terdeteksi");const name=txt(b.name,80);if(name.length<2)err("Nama band minimal 2 huruf");
 const rates=String(b.rates||"").split("\n").map(s=>s.trim()).filter(Boolean).slice(0,7).map(s=>{const a=s.split("|");return {label:txt(a[0],50),price:Number(String(a[1]||"").replace(/[^0-9]/g,""))}}).filter(r=>r.label&&Number.isFinite(r.price)&&r.price>=0&&r.price<=1000000000);
 const data={name,genre:txt(b.genre,60)||"Musik",city:txt(b.city,80)||"Purwokerto",tagline:txt(b.tagline,180),story:txt(b.story,1200),accent:/^#[a-fA-F0-9]{6}$/.test(b.accent)?b.accent:"#f7ca4f",rate_cards:rates,instagram_url:link(b.instagram_url),spotify_url:link(b.spotify_url),release_title:txt(b.release_title,100),release_kind:["Single","EP","Album","Live Session"].includes(b.release_kind)?b.release_kind:"Single",release_caption:txt(b.release_caption,300),release_listen_url:link(b.release_listen_url),clip_title:txt(b.clip_title,100),clip_caption:txt(b.clip_caption,240),clip_instagram_url:link(b.clip_instagram_url)};
 const files={};for(const [kind,f] of Object.entries(b.files||{})){if(!mime[kind])err("Jenis file tidak dikenal");const size=Number(f.size),type=String(f.type||"");if(!mime[kind].includes(type)||!Number.isFinite(size)||size<=0||size>(kind==="video"?maxVideo:maxImage))err("Ukuran atau tipe file "+kind+" tidak valid");files[kind]={type,size,path:""}}
 if(files.video&&!data.clip_title)err("Isi judul video");if(files.cover&&!data.release_title)err("Isi judul rilisan");return {data,files};
}
async function moderator(req){
 const jwt=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 if(!jwt||jwt.startsWith("sb_"))err("Login admin dulu",401);
 const {data:{user},error}=await db.auth.getUser(jwt);
 if(error||!user)err("Sesi admin tidak valid",401);
 const {data:role,error:e}=await db.from("wk_moderators").select("user_id").eq("user_id",user.id).maybeSingle();
 if(e||!role)err("Bukan admin Wingking",403);return user.id;
}
async function main(req,b){
 const action=String(b.action||"");
 let submitterId="";
 if(action==="prepare"||action==="finish"){
   const jwt=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
   if(!jwt||jwt.length>5000)err("Verifikasi email terlebih dahulu",401);
   const {data:{user},error}=await db.auth.getUser(jwt);
   if(error||!user?.email||!user.email_confirmed_at)err("Sesi tidak valid atau email belum diverifikasi",401);
   submitterId=user.id;
 }
 if(action==="prepare"){
   err("Form upload lama ditutup. Daftarkan band melalui Press Kit WINGKING.",410);
   const {data,files}=validate(b);
   const ip=(req.headers.get("cf-connecting-ip")||req.headers.get("x-real-ip")||req.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim(),ip_hash=await sha(ip+"|"+SERVICE.slice(0,24));
   const since=new Date(Date.now()-86400000).toISOString();
   const [a,g]=await Promise.all([db.from("wk_guest_requests").select("id",{head:true,count:"exact"}).eq("ip_hash",ip_hash).gte("created_at",since),db.from("wk_guest_requests").select("id",{head:true,count:"exact"}).gte("created_at",since)]);
   if(a.error||g.error)err("Gagal mengecek batas upload",503);
   if((a.count||0)>=4||(g.count||0)>=250)err("Batas pengajuan hari ini tercapai",429);
   const id=crypto.randomUUID(),receipt=crypto.randomUUID()+"-"+crypto.randomUUID();
   for(const [kind,f] of Object.entries(files))f.path=id+"/"+kind+"."+extensions[f.type];
   const {error}=await db.from("wk_guest_requests").insert({id,receipt_hash:await sha(receipt),ip_hash,payload:data,assets:files,status:"draft",submitted_by:submitterId});if(error)err("Gagal membuat pengajuan",500);
   const uploads=[];for(const [kind,f] of Object.entries(files)){const {data:s,error:e}=await db.storage.from(bucket).createSignedUploadUrl(f.path);if(e||!s?.token)err("Gagal membuat link upload",500);uploads.push({kind,path:f.path,token:s.token,type:f.type})}
   return {ok:true,id,receipt,uploads};
 }
 if(action==="finish"||action==="status"){
   const id=txt(b.id,80),receipt=txt(b.receipt,150);
   if(!id||!receipt)err("Kode tidak ditemukan");
   const {data:r,error}=await db.from("wk_guest_requests").select("id,receipt_hash,status,assets,review_note,submitted_by").eq("id",id).maybeSingle();
   if(error||!r||r.receipt_hash!==await sha(receipt))err("Kode pengajuan tidak cocok",404);
   if(action==="status")return {ok:true,status:r.status,note:r.review_note};
   if(r.submitted_by!==submitterId)err("Pengajuan ini dibuat dengan akun email lain",403);
   if(r.status==="pending")return {ok:true,status:"pending"};if(r.status!=="draft")err("Pengajuan sudah diproses");
   const {data:items,error:e}=await db.storage.from(bucket).list(id,{limit:20});if(e)err("Gagal memeriksa file",500);
   for(const f of Object.values(r.assets||{})){const name=f.path.split("/").pop(),found=(items||[]).find(x=>x.name===name);if(!found)err("File "+name+" belum selesai diupload");const size=Number(found.metadata?.size||0);if(size<=0||size>(f.type.startsWith("video/")?maxVideo:maxImage))err("Ukuran file tidak sesuai")}
   const {error:up}=await db.from("wk_guest_requests").update({status:"pending",submitted_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",id).eq("status","draft");if(up)err("Gagal memasukkan antrean",500);
   return {ok:true,status:"pending"};
 }
 if(action==="admin-list"){
   await moderator(req);
   const {data,error}=await db.from("wk_guest_requests").select("id,status,payload,assets,review_note,created_at,submitted_at,reviewed_at").neq("status","draft").order("created_at",{ascending:false}).limit(120);
   if(error)err("Gagal mengambil pengajuan",500);
   const rows=[];for(const row of data||[]){const preview={};for(const [kind,f] of Object.entries(row.assets||{})){const {data:s}=await db.storage.from(bucket).createSignedUrl(f.path,300);if(s?.signedUrl)preview[kind]=s.signedUrl}rows.push({...row,preview})}return {ok:true,rows};
 }
 if(action==="admin-review"){
   const user_id=await moderator(req),id=txt(b.id,80),decision=b.decision,note=txt(b.note,500);
   if(!["approved","rejected"].includes(decision))err("Pilihan tidak valid");
   if(decision==="rejected"&&note.length<5)err("Alasan penolakan minimal 5 karakter");
   const {data:r,error}=await db.from("wk_guest_requests").select("*").eq("id",id).maybeSingle();
   if(error||!r)err("Pengajuan tidak ada",404);if(r.status==="draft")err("Upload belum selesai");
   if(decision==="rejected"){
      await db.from("wk_guest_posts").update({is_visible:false}).eq("id",id);
      const {error:e}=await db.from("wk_guest_requests").update({status:"rejected",review_note:note,reviewed_by:user_id,reviewed_at:new Date().toISOString()}).eq("id",id);
      if(e)err("Gagal menolak",500);return {ok:true,status:"rejected"};
   }
   const media={};for(const [kind,f] of Object.entries(r.assets||{})){
      const target=kind==="video"?"wk-clips":"wk-band-assets",dest="guest/"+id+"/"+kind+"."+extensions[f.type];
      const {data:blob,error:e}=await db.storage.from(bucket).download(f.path);if(e||!blob)err("File gagal dibaca",502);
      const {error:ue}=await db.storage.from(target).upload(dest,blob,{contentType:f.type,upsert:true});if(ue)err("Gagal memindahkan "+kind+": "+ue.message,502);
      media[kind]=db.storage.from(target).getPublicUrl(dest).data.publicUrl;
   }
   const p=r.payload;const post={id,name:p.name,genre:p.genre,city:p.city,tagline:p.tagline,story:p.story,accent:p.accent,rate_cards:p.rate_cards,instagram_url:p.instagram_url,spotify_url:p.spotify_url,photo_url:media.photo||"",price_image_url:media.price||"",release_title:p.release_title,release_kind:p.release_kind,release_caption:p.release_caption,release_listen_url:p.release_listen_url,release_cover_url:media.cover||"",clip_title:p.clip_title,clip_caption:p.clip_caption,clip_url:media.video||"",clip_instagram_url:p.clip_instagram_url,is_visible:false};
   const {error:pe}=await db.from("wk_guest_posts").upsert(post,{onConflict:"id"});if(pe)err("Gagal simpan halaman: "+pe.message,500);
   const {error:re}=await db.from("wk_guest_requests").update({status:"approved",review_note:"",reviewed_by:user_id,reviewed_at:new Date().toISOString()}).eq("id",id);if(re)err("Gagal mengubah status",500);
   const {error:sh}=await db.from("wk_guest_posts").update({is_visible:true}).eq("id",id);if(sh)err("Gagal menampilkan band",500);
   return {ok:true,status:"approved"};
 }
 err("Aksi tidak dikenal");
}
Deno.serve(async req=>{if(req.method==="OPTIONS")return new Response(null,{headers:cors(req)});if(req.method!=="POST")return json(req,{error:"Method tidak didukung"},405);if(!okayOrigin(req))return json(req,{error:"Origin tidak diizinkan"},403);try{return json(req,await main(req,await req.json()))}catch(e){console.error("guest-submissions",e?.message||e);return json(req,{error:e?.message||"Gagal memproses pengajuan"},Number(e?.status)||500)}});
