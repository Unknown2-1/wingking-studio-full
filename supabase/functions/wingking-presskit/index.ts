import { createClient } from "npm:@supabase/supabase-js@2.76.1";

// WINGKING PRESS KIT — verified submitter + private Storage + moderator gate
const SB=Deno.env.get("SUPABASE_URL")||"";
const SECRET=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||Deno.env.get("SUPABASE_SECRET_KEY")||"";
if(!SB||!SECRET)throw Error("Supabase server credentials are not configured");
const svc=createClient(SB,SECRET,{auth:{persistSession:false,autoRefreshToken:false}});
const T="wk_presskits",BUCKET="wk-presskit-private",MAX=10*1024*1024,MAX_PHOTO=5*1024*1024;
const mimeByExt:Record<string,string>={
 pdf:"application/pdf",doc:"application/msword",
 docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
};
const photoMimeByExt:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
const allowOrigin=(o:string)=>!o||[
 "https://wingking-studio.vercel.app","https://wingking-private-review-console.vercel.app",
 "http://localhost:5173","http://127.0.0.1:5173","http://localhost:3000","http://127.0.0.1:3000"
].includes(o)||/^https:\/\/wingking-(?:studio|private-review-console)-[a-z0-9-]+-xenseen\.vercel\.app$/i.test(o);
function hdr(o:string){return {"content-type":"application/json; charset=utf-8",
 "cache-control":"no-store","x-content-type-options":"nosniff","vary":"Origin",
 ...(o&&allowOrigin(o)?{"access-control-allow-origin":o,"access-control-allow-methods":"POST,OPTIONS",
 "access-control-allow-headers":"authorization,apikey,content-type,x-client-info"}:{})};}
const out=(o:string,j:unknown,status=200)=>new Response(JSON.stringify(j),{status,headers:hdr(o)});
const bad=(message:string,status=400):never=>{throw Object.assign(new Error(message),{status})};
const trim=(v:unknown,limit=200)=>typeof v==="string"?v.replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,limit+1):"";
const uid=(s:unknown)=>typeof s==="string"&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(s);
async function user(req:Request,admin=false){
 const auth=req.headers.get("authorization")||"";
 const token=auth.startsWith("Bearer ")?auth.slice(7):"";
 if(!token||token.length>7000||token.startsWith("sb_"))bad("Verifikasi email atau login admin dulu.",401);
 const {data:{user:u},error}=await svc.auth.getUser(token);
 if(error||!u?.email||!u.email_confirmed_at)bad("Sesi email belum diverifikasi atau berakhir.",401);
 if(admin){
  const {data:mod,error:err}=await svc.from("wk_moderators").select("user_id").eq("user_id",u.id).maybeSingle();
  if(err||!mod)bad("Akses khusus admin WINGKING STUDIO.",403);
 }
 return u;
}
async function find(id:unknown){
 if(!uid(id))bad("ID Press Kit salah.");
 const {data,error}=await svc.from(T).select("*").eq("id",id).maybeSingle();
 if(error)bad("Database belum bisa dibaca.",503);
 if(!data)bad("Press Kit tidak ditemukan.",404);
 return data;
}
function validName(input:unknown){
 const name=trim(input,80);
 if(name.length<2||name.length>80)bad("Nama band harus 2–80 karakter.");
 return name;
}
function validFile(input:Record<string,unknown>){
 const filename=trim(input.filename,180);
 if(filename.length<1||filename.length>180||/[\\/]/.test(filename))bad("Nama berkas tidak valid.");
 const ext=filename.split(".").pop()?.toLowerCase()||"";
 const mime=trim(input.mime,110);
 const size=Number(input.size);
 if(!mimeByExt[ext]||mimeByExt[ext]!==mime)bad("Gunakan file PDF, DOC, atau DOCX yang valid.");
 if(!Number.isSafeInteger(size)||size<1||size>MAX)bad("Press Kit maksimal 10 MB.");
 return {filename,ext,mime,size};
}
function validPhoto(input:unknown){
 if(input==null)return null;
 if(typeof input!=="object"||Array.isArray(input))bad("Data foto band tidak valid.");
 const photo=input as Record<string,unknown>,mime=trim(photo.mime,40),size=Number(photo.size);
 if(!photoMimeByExt[mime]||!Number.isSafeInteger(size)||size<1||size>MAX_PHOTO)
  bad("Foto harus JPG, PNG, atau WebP dengan ukuran maksimal 5 MB.");
 return {mime,size,ext:photoMimeByExt[mime]};
}
function validSignature(bytes:Uint8Array,mime:string){
 const head=bytes.slice(0,8),ascii=String.fromCharCode(...head);
 if(mime==="application/pdf")return ascii.startsWith("%PDF-");
 if(mime==="application/msword")return [0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1].every((v,i)=>head[i]===v);
 if(mime.endsWith(".document"))return ascii.startsWith("PK\u0003\u0004")||ascii.startsWith("PK\u0005\u0006");
 return false;
}
function validPhotoSignature(bytes:Uint8Array,mime:string){
 if(mime==="image/jpeg")return bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
 if(mime==="image/png")return String.fromCharCode(...bytes.slice(0,8))==="\x89PNG\r\n\x1a\n";
 return mime==="image/webp"&&String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP";
}
async function audit(actor:string,row:Record<string,any>,action:string){
 const {error}=await svc.from("wk_content_activity").insert({
  actor_id:actor,source:"presskit",content_id:row.id,action,label:row.band_name,
  metadata:{status:row.status}
 });
 if(error)console.warn("presskit audit",error.code);
}
async function signed(row:Record<string,any>,seconds:number){
 if(!String(row.file_path||"").startsWith("presskits/"+row.id+"/")||row.file_path.includes(".."))
  bad("Alamat dokumen tidak valid.",403);
 const {data,error}=await svc.storage.from(BUCKET).createSignedUrl(row.file_path,seconds,{
  download:row.original_filename
 });
 if(error||!data?.signedUrl)bad("Berkas tidak dapat diunduh sekarang.",503);
 return data.signedUrl;
}
async function signedPhoto(row:Record<string,any>,seconds:number){
 if(!row.photo_path)return "";
 if(!String(row.photo_path).startsWith("presskits/"+row.id+"/")||row.photo_path.includes(".."))
  bad("Alamat foto band tidak valid.",403);
 const {data,error}=await svc.storage.from(BUCKET).createSignedUrl(row.photo_path,seconds);
 if(error||!data?.signedUrl)bad("Foto band tidak dapat dimuat sekarang.",503);
 return data.signedUrl;
}
async function handle(req:Request,b:Record<string,any>){
 const action=trim(b.action,40);
 if(action==="prepare"){
  const actor=await user(req);
  const name=validName(b.band_name),f=validFile(b),photo=validPhoto(b.photo);
  const since=new Date(Date.now()-86400000).toISOString();
  const {count,error:limErr}=await svc.from(T).select("id",{head:true,count:"exact"}).eq("submitted_by",actor.id).gte("created_at",since);
  if(limErr)bad("Gagal mengecek batas unggahan.",503);
  if((count||0)>=5)bad("Batas 5 pendaftaran per email per hari tercapai.",429);
  const id=crypto.randomUUID(),file_path="presskits/"+id+"/"+crypto.randomUUID()+"."+f.ext;
  const photo_path=photo?"presskits/"+id+"/"+crypto.randomUUID()+"."+photo.ext:null;
  const {error}=await svc.from(T).insert({
   id,submitted_by:actor.id,band_name:name,file_path,original_filename:f.filename,
   mime_type:f.mime,file_size:f.size,photo_path,photo_mime_type:photo?.mime||null,
   photo_size:photo?.size||null,status:"draft",is_published:false
  });
  if(error)bad("Gagal menyiapkan pengajuan.",503);
  const {data:signedUrl,error:signedErr}=await svc.storage.from(BUCKET).createSignedUploadUrl(file_path,{upsert:false});
  if(signedErr||!signedUrl?.token)bad("Gagal menyiapkan tempat upload.",503);
  let photoUpload=null;
  if(photo_path){
   const {data:signedPhotoUrl,error:photoErr}=await svc.storage.from(BUCKET).createSignedUploadUrl(photo_path,{upsert:false});
   if(photoErr||!signedPhotoUrl?.token)bad("Gagal menyiapkan tempat upload foto.",503);
   photoUpload={path:photo_path,token:signedPhotoUrl.token};
  }
  return {ok:true,id,path:file_path,token:signedUrl.token,bucket:BUCKET,photoUpload};
 }
 if(action==="finish"){
  const actor=await user(req),row=await find(b.id);
  if(row.submitted_by!==actor.id)bad("Akun email tidak sesuai pengajuan.",403);
  if(row.status==="pending")return {ok:true,id:row.id,status:"pending"};
  if(row.status!=="draft")bad("Pengajuan ini sudah diproses.",409);
  const {data:file,error}=await svc.storage.from(BUCKET).download(row.file_path);
  if(error||!file)bad("File belum selesai diunggah. Coba lagi.",409);
  if(file.size<1||file.size>MAX)bad("Ukuran file di server tidak valid.",413);
  const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer());
  if(!validSignature(bytes,row.mime_type))bad("Format berkas tidak cocok dengan file yang diunggah.",415);
  if(row.photo_path){
   if(!String(row.photo_path).startsWith("presskits/"+row.id+"/")||row.photo_path.includes(".."))
    bad("Alamat foto tidak valid.",403);
   const {data:photo,error:photoError}=await svc.storage.from(BUCKET).download(row.photo_path);
   if(photoError||!photo)bad("Foto band belum selesai diunggah. Coba lagi.",409);
   if(photo.size<1||photo.size>MAX_PHOTO||photo.size!==Number(row.photo_size))
    bad("Ukuran foto di server tidak sesuai.",413);
   const photoBytes=new Uint8Array(await photo.slice(0,12).arrayBuffer());
   if(!validPhotoSignature(photoBytes,row.photo_mime_type))bad("Format foto tidak cocok dengan file yang diunggah.",415);
  }
  const {data:updated,error:save}=await svc.from(T).update({
   status:"pending",file_size:file.size,submitted_at:new Date().toISOString(),updated_at:new Date().toISOString()
  }).eq("id",row.id).eq("status","draft").select("id").maybeSingle();
  if(save||!updated)bad("Gagal mengirim pengajuan ke admin.",503);
  return {ok:true,id:row.id,status:"pending"};
 }
 if(action==="public-download"){
  const row=await find(b.id);
  if(row.status!=="approved"||!row.is_published||row.archived_at||row.deleted_at)
   bad("Press Kit ini belum tersedia untuk publik.",403);
  return {ok:true,url:await signed(row,120)};
 }
 if(action==="public-list"){
  const {data:rows,error}=await svc.from(T).select("id,band_name,created_at,photo_path")
   .eq("status","approved").eq("is_published",true).is("archived_at",null).is("deleted_at",null)
   .order("created_at",{ascending:false}).limit(36);
  if(error)bad("Daftar band belum dapat dimuat.",503);
  return {ok:true,rows:await Promise.all((rows||[]).map(async row=>({
   id:row.id,band_name:row.band_name,created_at:row.created_at,photo_url:await signedPhoto(row,86400)
  })))};
 }
 if(action==="status"){
  const actor=await user(req),row=await find(b.id);
  if(row.submitted_by!==actor.id)bad("Kamu tidak bisa melihat pengajuan orang lain.",403);
  return {ok:true,status:row.status,note:row.review_note};
 }
 if(action==="admin-list"){
  await user(req,true);
  const {data,error}=await svc.from(T).select("*").neq("status","draft")
   .order("created_at",{ascending:false}).limit(250);
  if(error)bad("Daftar Press Kit gagal dimuat.",503);
  return {ok:true,rows:await Promise.all((data||[]).map(async row=>({
   ...row,photo_preview_url:await signedPhoto(row,1800)
  })))};
 }
 if(action==="admin-download"){
  await user(req,true);
  const row=await find(b.id);
  if(row.status==="draft")bad("File pengajuan belum selesai.",409);
  return {ok:true,url:await signed(row,180)};
 }
 if(action.startsWith("admin-")){
  const actor=await user(req,true),row=await find(b.id);
  if(action==="admin-review"){
   const decision=trim(b.decision,16),note=trim(b.note,500);
   if(!["approved","rejected"].includes(decision))bad("Pilih setujui atau tolak.");
   if(row.status==="draft"||row.deleted_at||row.archived_at)bad("Pengajuan belum siap direview.",409);
   if(decision==="rejected"&&note.length<5)bad("Alasan penolakan minimal 5 karakter.");
   const {error}=await svc.from(T).update({
    status:decision,is_published:decision==="approved",review_note:decision==="approved"?"":note,
    reviewed_by:actor.id,reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()
   }).eq("id",row.id);
   if(error)bad("Gagal menyimpan keputusan.",503);
   await audit(actor.id,row,decision==="approved"?"approve":"reject");
   return {ok:true,id:row.id,status:decision};
  }
  if(action==="admin-edit"){
   if(row.deleted_at)bad("Pulihkan dulu dari Tempat Sampah.");
   const name=validName(b.band_name);
   const {error}=await svc.from(T).update({band_name:name,updated_at:new Date().toISOString()}).eq("id",row.id);
   if(error)bad("Gagal mengubah nama band.",503);
   await audit(actor.id,row,"edit");
   return {ok:true,id:row.id};
  }
  const now=new Date().toISOString(),patch:Record<string,any>={updated_at:now};
  let auditAction="";
  if(action==="admin-archive"){
   if(row.deleted_at)bad("Dokumen berada di Tempat Sampah.");patch.archived_at=now;auditAction="archive";
  }else if(action==="admin-restore"){
   if(row.deleted_at||!row.archived_at)bad("Dokumen tidak sedang diarsipkan.");patch.archived_at=null;auditAction="restore";
  }else if(action==="admin-trash"){
   if(row.deleted_at)bad("Sudah di Tempat Sampah.");patch.deleted_at=now;auditAction="trash";
  }else if(action==="admin-restore-trash"){
   if(!row.deleted_at)bad("Dokumen tidak berada di Tempat Sampah.");patch.deleted_at=null;patch.archived_at=null;auditAction="restore_trash";
  }else if(action==="admin-purge"){
   if(!row.deleted_at)bad("Pindahkan ke Tempat Sampah dahulu.",409);
   if(trim(b.confirm,80)!==row.band_name)bad("Nama band untuk konfirmasi tidak sesuai.");
   const {error}=await svc.from(T).delete().eq("id",row.id).not("deleted_at","is",null);
   if(error)bad("Gagal menghapus data.",503);
   await audit(actor.id,row,"purge");
   const paths=[row.file_path,row.photo_path].filter(Boolean);
   const {error:remove}=await svc.storage.from(BUCKET).remove(paths);
   if(remove)console.warn("Presskit storage cleanup",remove.message);
   return {ok:true,id:row.id};
  }else bad("Aksi pengelolaan tidak dikenal.",400);
  const {error}=await svc.from(T).update(patch).eq("id",row.id);
  if(error)bad("Gagal mengubah status.",503);
  await audit(actor.id,row,auditAction);
  return {ok:true,id:row.id};
 }
 bad("Aksi tidak dikenal.",400);
}
Deno.serve(async(req)=>{
 const o=req.headers.get("origin")||"";
 if(!allowOrigin(o))return out(o,{error:"Origin tidak diizinkan."},403);
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:hdr(o)});
 if(req.method!=="POST")return out(o,{error:"Gunakan POST"},405);
 try{
  if(Number(req.headers.get("content-length")||0)>16000)bad("Permintaan terlalu besar.",413);
  const text=await req.text();if(text.length>16000)bad("Permintaan terlalu besar.",413);
  const b=JSON.parse(text);
  if(!b||typeof b!=="object"||Array.isArray(b))bad("Data tidak valid.");
  return out(o,await handle(req,b),200);
 }catch(e){
  const err=e as Error&{status?:number};
  console.error("presskit",String(err?.message||err).slice(0,200));
  return out(o,{error:err?.message||"Layanan Press Kit belum tersedia."},err?.status||500);
 }
});
