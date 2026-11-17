import { createClient } from "npm:@supabase/supabase-js@2.76.1";
const SUPABASE_API_URL=Deno.env.get("SUPABASE_URL")||"";
const KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||Deno.env.get("SUPABASE_SECRET_KEY")||"";
if(!SUPABASE_API_URL||!KEY)throw Error("Missing server configuration");
const db=createClient(SUPABASE_API_URL,KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const VIDEO_BUCKET="wk-clips",MAX_VIDEO=36*1024*1024;
const videoMimeByExt:Record<string,string>={"video/mp4":"mp4","video/webm":"webm"};
const originOK=(o:string)=>!o||[
 "https://wingking-studio.vercel.app","https://wingking-private-review-console.vercel.app",
 "http://localhost:5173","http://localhost:3000","http://127.0.0.1:5173"
].includes(o)||/^https:\/\/wingking-(?:studio|private-review-console)-[a-z0-9-]+-xenseen\.vercel\.app$/i.test(o);
const headers=(o:string)=>({"content-type":"application/json; charset=utf-8","cache-control":"no-store","vary":"Origin",
 ...(o&&originOK(o)?{"access-control-allow-origin":o,"access-control-allow-headers":"authorization,apikey,content-type,x-client-info","access-control-allow-methods":"POST,OPTIONS"}:{})});
const res=(o:string,data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:headers(o)});
const bad=(message:string,status=400):never=>{throw Object.assign(new Error(message),{status})};
const val=(s:unknown,max=500)=>typeof s==="string"?s.replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,max+1):"";
const uuid=(s:unknown)=>typeof s==="string"&&/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(s);
async function admin(req:Request){
 const auth=req.headers.get("authorization")||"";
 const token=auth.startsWith("Bearer ")?auth.slice(7):"";
 if(!token||token.startsWith("sb_")||token.length>7000)bad("Login admin dahulu.",401);
 const {data:{user},error}=await db.auth.getUser(token);
 if(error||!user)bad("Sesi admin tidak valid.",401);
 const {data:mod,error:e}=await db.from("wk_moderators").select("user_id").eq("user_id",user.id).maybeSingle();
 if(e||!mod)bad("Hanya admin WINGKING yang boleh mengubah video dan rilisan.",403);
 return user;
}
function validate(b:Record<string,unknown>){
 const kind=val(b.kind,16),band_name=val(b.band_name,80),title=val(b.title,100),titleSent=Object.prototype.hasOwnProperty.call(b,"title"),raw=val(b.link_url,500);
 if(kind!=="video"&&kind!=="release")bad("Jenis harus video atau rilisan.");
 if(kind==="release"&&(band_name.length<2||band_name.length>80))bad("Nama band harus 2–80 karakter.");
 if(kind==="release"&&titleSent&&!title)bad("Judul lagu atau rilisan wajib diisi.");
 let link_url="",platform="Lainnya";
 if(raw){
  let url:URL;
  try{url=new URL(raw)}catch{bad("Link tidak valid.")}
  if(url.protocol!=="https:"||url.username||url.password||url.port&&url.port!=="443")bad("Gunakan link HTTPS tanpa kredensial.");
  if(url.href.length>500)bad("Link terlalu panjang.");
  const host=url.hostname.toLowerCase().replace(/^www\./,"");
  if(["youtube.com","m.youtube.com","music.youtube.com","youtu.be"].includes(host))platform="YouTube";
  else if(["instagram.com","m.instagram.com"].includes(host))platform="Instagram";
  else if(["open.spotify.com","spotify.com"].includes(host))platform="Spotify";
  else if(kind==="release")bad("Link rilisan harus dari YouTube, Instagram, atau Spotify.");
  link_url=url.href;
 }else if(kind==="release")bad("Link rilisan wajib diisi.");
 return {kind,title:kind==="video"?"":title,band_name:kind==="release"?band_name:"",link_url,platform};
}
async function audit(userId:string,row:Record<string,any>,action:string){
 const {error}=await db.from("wk_content_activity").insert({actor_id:userId,source:"media",content_id:row.id,action,label:row.title||row.band_name||row.platform});
 if(error)console.warn("media audit",error.code);
}
function validVideoPath(id:unknown,path:unknown){
 return typeof id==="string"&&uuid(id)&&typeof path==="string"&&
  new RegExp("^admin/"+id+"/[0-9a-f-]{36}\\.(mp4|webm)$","i").test(path)&&!path.includes("..");
}
function validVideoSignature(bytes:Uint8Array,mime:string){
 if(mime==="video/mp4")return bytes.length>=12&&String.fromCharCode(...bytes.slice(4,8))==="ftyp";
 return mime==="video/webm"&&bytes.length>=4&&[0x1a,0x45,0xdf,0xa3].every((v,i)=>bytes[i]===v);
}
async function handle(req:Request,b:Record<string,any>){
 const action=val(b.action,40);
 if(action==="admin-list"){
  await admin(req);
  const {data,error}=await db.from("wk_media_links").select("*").order("created_at",{ascending:false}).limit(300);
  if(error)bad("Gagal membaca link media.",503);
  return {ok:true,rows:data||[]};
 }
 const a=await admin(req);
 if(action==="admin-video-prepare"){
  const v=validate({kind:"video",title:b.title,link_url:b.link_url});
  const mime=val(b.mime,40),size=Number(b.size),ext=videoMimeByExt[mime];
  if(!ext||!Number.isSafeInteger(size)||size<1||size>MAX_VIDEO)bad("Video harus MP4 atau WebM dengan ukuran maksimal 36 MB.");
  const id=crypto.randomUUID(),path="admin/"+id+"/"+crypto.randomUUID()+"."+ext;
  const {data:signed,error}=await db.storage.from(VIDEO_BUCKET).createSignedUploadUrl(path,{upsert:false});
  if(error||!signed?.token)bad("Gagal menyiapkan upload video.",503);
  return {ok:true,id,path,token:signed.token,bucket:VIDEO_BUCKET,...v,mime,size};
 }
 if(action==="admin-video-cancel"){
  if(!validVideoPath(b.id,b.path))bad("Alamat video tidak valid.");
  const {data:existing,error}=await db.from("wk_media_links").select("id").eq("video_path",b.path).maybeSingle();
  if(error)bad("Gagal memeriksa video.",503);
  if(existing)bad("Video ini sudah terhubung ke konten.");
  const dir=String(b.path).split("/").slice(0,2).join("/"),filename=String(b.path).split("/").pop()||"";
  const {data:files,error:listError}=await db.storage.from(VIDEO_BUCKET).list(dir,{limit:2,search:filename});
  if(listError)bad("Gagal memeriksa upload sementara.",503);
  if(files?.some(file=>file.name===filename)){
   const {error:removeError}=await db.storage.from(VIDEO_BUCKET).remove([String(b.path)]);
   if(removeError)bad("Upload sementara belum berhasil dibersihkan.",503);
  }
  return {ok:true};
 }
 if(action==="admin-video-submit"){
  const v=validate({kind:"video",title:b.title,link_url:b.link_url});
  const id=b.id,path=b.path,mime=val(b.mime,40),ext=videoMimeByExt[mime];
  if(!validVideoPath(id,path)||!ext||!String(path).endsWith("."+ext))bad("Alamat video tidak valid.");
  const {data:existing,error:existingError}=await db.from("wk_media_links").select("id").eq("video_path",path).maybeSingle();
  if(existingError)bad("Gagal memeriksa video.",503);
  if(existing){
   if(existing.id===id)return {ok:true,id};
   bad("Video ini sudah terhubung ke konten.",409);
  }
  const dir=String(path).split("/").slice(0,2).join("/"),filename=String(path).split("/").pop()||"";
  const {data:files,error:listError}=await db.storage.from(VIDEO_BUCKET).list(dir,{limit:2,search:filename});
  if(listError)bad("Gagal memeriksa upload video.",503);
  if(!files?.some(file=>file.name===filename))bad("Video belum selesai diunggah. Coba lagi.",409);
  const {data:blob,error:downloadError}=await db.storage.from(VIDEO_BUCKET).download(String(path));
  if(downloadError||!blob)bad("Video belum bisa dibaca. Coba lagi.",409);
  if(blob.size<1||blob.size>MAX_VIDEO)bad("Ukuran video tidak valid.",413);
  const bytes=new Uint8Array(await blob.arrayBuffer());
  if(!validVideoSignature(bytes,mime))bad("Isi file tidak sesuai format video yang dipilih.",415);
  const video_url=db.storage.from(VIDEO_BUCKET).getPublicUrl(String(path)).data.publicUrl;
  const {data,error}=await db.from("wk_media_links").insert({
   ...v,id,video_url,video_path:path,created_by:a.id,is_published:true
  }).select("id").single();
  if(error){
   const {data:linked,error:linkedError}=await db.from("wk_media_links").select("id").eq("video_path",path).maybeSingle();
   if(linkedError)bad("Video belum dapat dikaitkan ke data konten.",503);
   if(linked?.id===id)return {ok:true,id};
   if(!linked){
    const {error:removeError}=await db.storage.from(VIDEO_BUCKET).remove([String(path)]);
    if(removeError)console.warn("Unpublished video cleanup pending:",removeError.message);
   }
   bad("Gagal menyimpan video.",503);
  }
  await audit(a.id,{id:data.id,title:v.title},"create");
  return {ok:true,id:data.id};
 }
 if(action==="admin-create"){
  const v=validate(b);
  if(v.kind==="video")bad("Upload file video untuk membuat konten video.");
  const {data,error}=await db.from("wk_media_links").insert({...v,created_by:a.id}).select("id").single();
  if(error)bad("Gagal menambah link.",503);
  await audit(a.id,{id:data.id,band_name:v.band_name,platform:v.platform},"create");
  return {ok:true,id:data.id};
 }
 if(!uuid(b.id))bad("ID konten salah.");
 const {data:old,error:e}=await db.from("wk_media_links").select("*").eq("id",b.id).maybeSingle();
 if(e||!old)bad("Konten tidak ditemukan.",404);
 if(action==="admin-edit"){
  const v=validate({...b,kind:old.kind});
  if(old.deleted_at)bad("Pulihkan dari Sampah dulu.");
  const {error}=await db.from("wk_media_links").update({...v,updated_at:new Date().toISOString()}).eq("id",old.id);
  if(error)bad("Gagal menyimpan link.",503);
  await audit(a.id,old,"edit");return {ok:true,id:old.id};
 }
 const p:Record<string,unknown>={updated_at:new Date().toISOString()};
 let act="";
 if(action==="admin-hide"){p.is_published=!old.is_published;act="toggle_publish";}
 else if(action==="admin-archive"){if(old.deleted_at)bad("Konten di Sampah.");p.archived_at=new Date().toISOString();act="archive";}
 else if(action==="admin-restore"){if(old.deleted_at)bad("Konten di Sampah.");p.archived_at=null;act="restore";}
 else if(action==="admin-trash"){p.deleted_at=new Date().toISOString();act="trash";}
 else if(action==="admin-restore-trash"){if(!old.deleted_at)bad("Konten tidak di Sampah.");p.deleted_at=null;p.archived_at=null;act="restore_trash";}
 else if(action==="admin-purge"){
  if(!old.deleted_at)bad("Pindahkan ke Sampah dulu.");
  if(val(b.confirm,100)!==(old.title||old.band_name||old.platform))bad("Konfirmasi tidak cocok.");
  const {error}=await db.from("wk_media_links").delete().eq("id",old.id).not("deleted_at","is",null);
  if(error)bad("Gagal menghapus media.",503);
  await audit(a.id,old,"purge");
  let warning="";
  if(old.video_path&&validVideoPath(old.id,old.video_path)){
   const {error:removeError}=await db.storage.from(VIDEO_BUCKET).remove([old.video_path]);
   if(removeError)warning="Video dihapus dari daftar, tetapi file storage perlu dibersihkan manual.";
  }
  return {ok:true,id:old.id,...(warning?{warning}:{})};
 }else bad("Aksi tidak dikenal.");
 const {error}=await db.from("wk_media_links").update(p).eq("id",old.id);
 if(error)bad("Gagal mengubah konten.",503);
 await audit(a.id,old,act);
 return {ok:true,id:old.id};
}
Deno.serve(async(req)=>{
 const origin=req.headers.get("origin")||"";
 if(!originOK(origin))return res(origin,{error:"Origin tidak diizinkan"},403);
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(origin)});
 if(req.method!=="POST")return res(origin,{error:"Gunakan POST"},405);
 try{
  if(Number(req.headers.get("content-length")||0)>14000)bad("Permintaan terlalu besar",413);
  const raw=await req.text();if(raw.length>14000)bad("Permintaan terlalu besar",413);
  const b=JSON.parse(raw);if(!b||Array.isArray(b)||typeof b!=="object")bad("Permintaan tidak valid.");
  return res(origin,await handle(req,b));
 }catch(e){
  const err=e as Error&{status?:number};
  console.error("media",String(err?.message||err).slice(0,150));
  return res(origin,{error:err?.message||"Media belum tersedia"},err?.status||500);
 }
});
