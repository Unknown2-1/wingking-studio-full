import { createClient } from "npm:@supabase/supabase-js@2.76.1";

// WINGKING STUDIO / Moderated photo gallery, 6 Nov 2026.
// Unapproved photos stay in a PRIVATE bucket; only an authorized moderator
// may copy them into the public bucket.
const BASE=Deno.env.get("SUPABASE_URL")||"";
const KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||Deno.env.get("SUPABASE_SECRET_KEY")||"";
if(!BASE||!KEY) throw Error("Missing Supabase server configuration");
const db=createClient(BASE,KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const PRIVATE="wk-gallery-pending", PUBLIC="wk-gallery-public", TABLE="wk_gallery_photos";
const MAX=5*1024*1024;
const allowedOrigins=new Set([
 "https://wingking-studio.vercel.app",
 "https://wingking-private-review-console.vercel.app",
 "https://wingking-private-review-console-xenseen.vercel.app",
 "https://wingking-studio-xenseen.vercel.app",
 "http://localhost:3000","http://127.0.0.1:3000",
 "http://localhost:5173","http://127.0.0.1:5173"
]);
const originOkay=(origin:string)=> !origin||allowedOrigins.has(origin)||
 /^https:\/\/wingking-studio-[a-z0-9-]+-xenseen\.vercel\.app$/i.test(origin)||
 /^https:\/\/wingking-private-review-console-[a-z0-9-]+-xenseen\.vercel\.app$/i.test(origin);
function headers(origin:string){
 const o:Record<string,string>={"content-type":"application/json; charset=utf-8","cache-control":"no-store","vary":"Origin","x-content-type-options":"nosniff"};
 if(originOkay(origin)&&origin){o["access-control-allow-origin"]=origin;o["access-control-allow-methods"]="POST, OPTIONS";o["access-control-allow-headers"]="content-type, apikey, authorization, x-client-info";}
 return o;
}
const output=(origin:string,x:unknown,status=200)=>new Response(JSON.stringify(x),{status,headers:headers(origin)});
function fail(message:string,status=400):never{throw Object.assign(new Error(message),{status})}
const clean=(s:unknown,n=300)=>typeof s==="string"?s.replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,n+1):"";
const uuid=(s:unknown)=>typeof s==="string"&&/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(s);
const extension:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
async function actor(req:Request,needAdmin=false){
 const raw=req.headers.get("authorization")||"";
 const token=raw.startsWith("Bearer ")?raw.slice(7):"";
 if(!token||token.startsWith("sb_")||token.length>6000)fail("Verifikasi email atau login admin terlebih dahulu.",401);
 const {data:{user},error}=await db.auth.getUser(token);
 if(error||!user?.email||!user.email_confirmed_at)fail("Sesi email belum terverifikasi atau sudah berakhir.",401);
 if(needAdmin){
  const {data:role,error:roleErr}=await db.from("wk_moderators").select("user_id").eq("user_id",user.id).maybeSingle();
  if(roleErr||!role)fail("Akses hanya untuk admin WINGKING STUDIO.",403);
 }
 return user;
}
function validateFile(b:Record<string,unknown>){
 const mime=clean(b.mime,80),size=Number(b.size);
 if(!extension[mime]||!Number.isInteger(size)||size<=0||size>MAX)fail("Hanya JPG, PNG atau WebP hingga 5 MB yang diperbolehkan.");
 const title=clean(b.title,100),caption=clean(b.caption,500);
 if(title.length<2||title.length>100)fail("Judul foto harus 2–100 karakter.");
 if(caption.length>500)fail("Deskripsi maksimal 500 karakter.");
 return {mime,size,title,caption};
}
async function audit(adminId:string,id:string,action:string,title:string){
 const {error}=await db.from("wk_content_activity").insert({actor_id:adminId,source:"gallery",content_id:id,action,label:title});
 if(error)console.warn("Gallery audit:",error.code);
}
async function findRow(id:unknown){
 if(!uuid(id))fail("ID foto tidak valid");
 const {data,error}=await db.from(TABLE).select("*").eq("id",id).maybeSingle();
 if(error)fail("Gagal membaca foto",503);
 if(!data)fail("Foto tidak ditemukan",404);
 return data;
}
async function validatePending(row:Record<string,any>){
 const path=String(row.pending_path||"");
 if(!path.startsWith("pending/"+row.id+"/")||path.includes(".."))fail("Path unggahan tidak valid",403);
 const segments=path.split("/"),filename=segments.pop();
 const {data:list,error}=await db.storage.from(PRIVATE).list(segments.join("/"),{limit:100,search:filename});
 if(error||!list?.some(x=>x.name===filename))fail("Foto belum selesai diunggah. Coba lagi.",409);
 return path;
}
function magicIsValid(bytes:Uint8Array,mime:string){
 if(mime==="image/jpeg")return bytes.length>=3&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
 if(mime==="image/png")return bytes.length>=8&&[137,80,78,71,13,10,26,10].every((x,i)=>bytes[i]===x);
 if(mime==="image/webp")return bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP";
 return false;
}
async function publish(row:Record<string,any>,adminId:string){
 const path=await validatePending(row);
 const {data:blob,error:downErr}=await db.storage.from(PRIVATE).download(path);
 if(downErr||!blob)fail("Foto belum bisa dibaca untuk verifikasi",503);
 if(blob.size<1||blob.size>MAX)fail("Ukuran foto di server tidak sesuai",413);
 const bytes=new Uint8Array(await blob.arrayBuffer());
 if(!magicIsValid(bytes,row.file_mime))fail("Isi file tidak sesuai tipe gambar",415);
 const target="studio/"+row.id+"."+extension[row.file_mime];
 const {error:uploadErr}=await db.storage.from(PUBLIC).upload(target,bytes,{contentType:row.file_mime,upsert:true,cacheControl:"3600"});
 if(uploadErr)fail("Gagal menerbitkan foto: "+uploadErr.message,503);
 const publicUrl=db.storage.from(PUBLIC).getPublicUrl(target).data.publicUrl;
 const patch={
  image_url:publicUrl,public_path:target,review_status:"approved",review_note:"",
  is_published:true,reviewed_at:new Date().toISOString(),reviewed_by:adminId,
  archived_at:null,deleted_at:null,updated_at:new Date().toISOString()
 };
 const {error:saveErr}=await db.from(TABLE).update(patch).eq("id",row.id);
 if(saveErr)fail("Foto tersimpan di Storage, tetapi publikasi database gagal: "+saveErr.message,503);
 await audit(adminId,row.id,"approve",row.title);
 // Image was successfully published; keep private upload if cleanup fails.
 const {error:removeErr}=await db.storage.from(PRIVATE).remove([path]);
 if(removeErr)console.warn("Private original cleanup pending:",removeErr.message);
 return {id:row.id,image_url:publicUrl,status:"approved"};
}
async function handle(req:Request,b:Record<string,any>){
 const action=clean(b.action,40);
 // Public gallery submissions are disabled: admin-only media management.
 if(action==="prepare"||action==="submit")fail("Upload foto hanya tersedia melalui Admin Hub WINGKING.",403);
 if(action==="prepare"||action==="admin-direct-prepare"){
  const admin=action==="admin-direct-prepare",user=await actor(req,admin);
  const values=validateFile(b);
  const since=new Date(Date.now()-86400000).toISOString();
  const {count,error:limitErr}=await db.from(TABLE).select("id",{count:"exact",head:true})
   .eq("submitted_by",user.id).gte("created_at",since);
  if(limitErr)fail("Batas unggahan belum bisa dicek",503);
  if((count||0)>=(admin?40:6))fail("Batas upload harian tercapai. Coba besok.",429);
  if(!admin){
   const {count:globalCount,error:globalErr}=await db.from(TABLE)
    .select("id",{count:"exact",head:true}).gte("created_at",since);
   if(globalErr||globalCount!==null&&globalCount>=250)fail("Antrean upload sedang penuh. Coba lagi nanti.",429);
  }
  const id=crypto.randomUUID(),path="pending/"+id+"/"+crypto.randomUUID()+"."+extension[values.mime];
  const {error}=await db.from(TABLE).insert({
    id,title:values.title,caption:values.caption,pending_path:path,
    file_mime:values.mime,review_status:"uploading",submitted_by:user.id,
    is_admin_upload:admin
  });
  if(error)fail("Gagal membuat antrean: "+error.message,503);
  const {data:signed,error:signedErr}=await db.storage.from(PRIVATE).createSignedUploadUrl(path,{upsert:false});
  if(signedErr||!signed?.token)fail("Gagal menyiapkan upload: "+(signedErr?.message||"token kosong"),503);
  return {ok:true,id,path,token:signed.token,bucket:PRIVATE};
 }
 if(action==="submit"||action==="admin-direct-submit"){
  const admin=action==="admin-direct-submit",user=await actor(req,admin);
  const row=await findRow(b.id);
  if(row.submitted_by!==user.id)fail("Pengajuan ini bukan milik email kamu.",403);
  if(admin&&!row.is_admin_upload)fail("Pengajuan pengunjung wajib melalui review admin.",403);
  if(!admin&&row.is_admin_upload)fail("Hanya admin yang bisa menerbitkan unggahan admin.",403);
  if(row.review_status==="pending"&&!admin)return {ok:true,status:"pending",id:row.id};
  if(row.review_status!=="uploading")fail("Unggahan sudah pernah diproses.",409);
  await validatePending(row);
  if(admin){return {ok:true,...await publish(row,user.id)}}
  const {error}=await db.from(TABLE).update({
   review_status:"pending",submitted_at:new Date().toISOString(),updated_at:new Date().toISOString()
  }).eq("id",row.id).eq("review_status","uploading");
  if(error)fail("Gagal mengirim ke antrean admin: "+error.message,503);
  return {ok:true,status:"pending",id:row.id};
 }
 if(action==="status"){
  const user=await actor(req);const row=await findRow(b.id);
  if(row.submitted_by!==user.id)fail("Tidak dapat melihat status pengajuan lain.",403);
  return {ok:true,status:row.review_status==="uploading"?"belum selesai":row.review_status,note:row.review_note};
 }
 if(action==="admin-list"){
  await actor(req,true);
  const {data,error}=await db.from(TABLE).select("*").neq("review_status","uploading")
    .order("created_at",{ascending:false}).limit(250);
  if(error)fail("Daftar galeri belum dapat dimuat: "+error.message,503);
  const rows=await Promise.all((data||[]).map(async (row)=>{
   let preview=row.image_url;
   if(row.pending_path&&row.review_status!=="approved"){
    const {data:signed}=await db.storage.from(PRIVATE).createSignedUrl(row.pending_path,360);
    if(signed?.signedUrl)preview=signed.signedUrl;
   }
   return {...row,preview};
  }));
  return {ok:true,rows};
 }
 if(action.startsWith("admin-")){
  const admin=await actor(req,true);const row=await findRow(b.id);
  if(action==="admin-review"){
   const decision=clean(b.decision,20),note=clean(b.note,500);
   if(row.deleted_at||row.archived_at)fail("Pulihkan foto dulu sebelum melakukan review.",409);
   if(!["approved","rejected"].includes(decision))fail("Pilih setujui atau tolak.");
   if(row.review_status==="uploading")fail("Upload belum selesai.",409);
   if(decision==="approved"){
    if(row.review_status==="approved")return {ok:true,status:"approved",id:row.id};
    return {ok:true,...await publish(row,admin.id)};
   }
   if(note.length<5||note.length>500)fail("Alasan penolakan minimal 5 karakter.");
   const {error}=await db.from(TABLE).update({
    review_status:"rejected",is_published:false,review_note:note,
    reviewed_by:admin.id,reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()
   }).eq("id",row.id);
   if(error)fail("Gagal menolak foto",503);
   await audit(admin.id,row.id,"reject",row.title);
   return {ok:true,status:"rejected",id:row.id};
  }
  if(action==="admin-edit"){
   const title=clean(b.title,100),caption=clean(b.caption,500);
   if(title.length<2||title.length>100||caption.length>500)fail("Judul/deskripsi tidak sesuai.");
   if(row.deleted_at)fail("Pulihkan dulu dari Tempat Sampah.",409);
   const {error}=await db.from(TABLE).update({title,caption,updated_at:new Date().toISOString()}).eq("id",row.id);
   if(error)fail("Gagal menyimpan perubahan",503);
   await audit(admin.id,row.id,"edit",title);
   return {ok:true,id:row.id};
  }
  if(action==="admin-archive"||action==="admin-restore"||action==="admin-trash"||action==="admin-restore-trash"){
   let patch:Record<string,any>={updated_at:new Date().toISOString()},act="";
   if(action==="admin-archive"){if(row.deleted_at)fail("Foto berada di sampah.");patch.archived_at=new Date().toISOString();act="archive";}
   if(action==="admin-restore"){if(!row.archived_at||row.deleted_at)fail("Foto tidak diarsip.");patch.archived_at=null;act="restore";}
   if(action==="admin-trash"){if(row.deleted_at)fail("Sudah di tempat sampah");patch.deleted_at=new Date().toISOString();patch.archived_at=row.archived_at||new Date().toISOString();act="trash";}
   if(action==="admin-restore-trash"){if(!row.deleted_at)fail("Foto tidak berada di sampah");patch.deleted_at=null;patch.archived_at=null;act="restore_trash";}
   const {error}=await db.from(TABLE).update(patch).eq("id",row.id);
   if(error)fail("Gagal mengubah status foto: "+error.message,503);
   await audit(admin.id,row.id,act,row.title);
   return {ok:true,id:row.id};
  }
  if(action==="admin-purge"){
   if(!row.deleted_at)fail("Pindahkan ke Tempat Sampah dulu.",409);
   if(clean(b.confirm,100)!==row.title)fail("Konfirmasi judul foto tidak sama.",400);
   const {error}=await db.from(TABLE).delete().eq("id",row.id).not("deleted_at","is",null);
   if(error)fail("Gagal menghapus data galeri",503);
   await audit(admin.id,row.id,"purge",row.title);
   if(row.pending_path?.startsWith("pending/"+row.id+"/"))
    await db.storage.from(PRIVATE).remove([row.pending_path]).catch(()=>{});
   if(row.public_path?.startsWith("studio/"+row.id+"."))
    await db.storage.from(PUBLIC).remove([row.public_path]).catch(()=>{});
   // Legacy photos refer to original website static assets, never delete GitHub files here.
   return {ok:true,id:row.id};
  }
  fail("Aksi admin tidak ditemukan",400);
 }
 fail("Aksi tidak dikenal",400);
}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin")||"";
 if(!originOkay(origin))return output(origin,{error:"Origin tidak diizinkan"},403);
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(origin)});
 if(req.method!=="POST")return output(origin,{error:"POST required"},405);
 try{
  if(Number(req.headers.get("content-length")||"0")>14000)fail("Permintaan terlalu besar",413);
  const raw=await req.text();
  if(raw.length>14000)fail("Permintaan terlalu besar",413);
  const body=JSON.parse(raw);
  if(!body||typeof body!=="object"||Array.isArray(body))fail("Format permintaan salah.");
  return output(origin,await handle(req,body),200);
 }catch(e){
  const err=e as Error&{status?:number};
  console.error("gallery:",String(err?.message||err).slice(0,160));
  return output(origin,{error:err?.message||"Layanan galeri belum tersedia"},err?.status||500);
 }
});
