import {createClient} from 'npm:@supabase/supabase-js@2.76.1';
const sb=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
const origins=['https://wingking-studio.vercel.app','http://localhost:5173','http://127.0.0.1:5173','http://localhost:3000','http://127.0.0.1:3000'];
const sha=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(b=>b.toString(16).padStart(2,'0')).join('');
const text=(s,n=1200)=>String(s??'').trim().slice(0,n);
const url=s=>{let v=text(s,350);if(!v)return '';try{let u=new URL(v);return u.protocol==='https:'?u.href:''}catch{return ''}};
function respond(data,status,origin){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store','access-control-allow-origin':origin,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'apikey,authorization,content-type'}})}
Deno.serve(async req=>{
const origin=req.headers.get('origin')||'';
const res=(data,status=200)=>respond(data,status,origin);
if(origin&&!origins.includes(origin))return res({error:'Domain tidak diizinkan'},403);
if(req.method==='OPTIONS')return new Response(null,{headers:{'access-control-allow-origin':origin,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'apikey,authorization,content-type'}});
if(req.method!=='POST')return res({error:'POST required'},405);
try{
 if(Number(req.headers.get('content-length')||0)>18000)return res({error:'Payload terlalu besar'},413);
 const b=await req.json();if(text(b.website,150))return res({error:'Pengajuan ditolak'},400);
 const act=text(b.action,15),key=text(b.requestKey,160),ip=(req.headers.get('cf-connecting-ip')||req.headers.get('x-real-ip')||req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown').trim(),ipHash=await sha('wingking-v1:'+ip+new Date().toISOString().slice(0,10));
 if(act==='status'){const receipt=text(b.receipt,160);if(receipt.length<25)return res({error:'Kode tidak sah'},400);const {data,error}=await sb.from('wk_public_submissions').select('band_name,title,kind,review_status,review_note,submitted_at').eq('receipt_hash',await sha(receipt)).maybeSingle();if(error)throw error;return data?res({data}):res({error:'Kode tidak ditemukan'},404)}
 if(!['prepare','submit'].includes(act))return res({error:'Aksi tidak tersedia'},400);
 const token=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
 if(!token||token.length>5000)return res({error:'Verifikasi email terlebih dahulu'},401);
 const {data:{user},error:authError}=await sb.auth.getUser(token);
 if(authError||!user?.email||!user.email_confirmed_at)return res({error:'Sesi tidak valid atau email belum diverifikasi'},401);
 const {count,error:ce}=await sb.from('wk_intake_events').select('*',{count:'exact',head:true}).eq('ip_hash',ipHash).eq('action',act).gte('occurred_at',new Date(Date.now()-3600000).toISOString());if(ce)throw ce;
 if((count||0)>=(act==='prepare'?7:4))return res({error:'Terlalu banyak percobaan. Coba lagi nanti.'},429);
 const {error:ev}=await sb.from('wk_intake_events').insert({ip_hash:ipHash,action:act});if(ev)throw ev;
 if(act==='prepare'){
 const mime=text(b.mime,64),kind=text(b.kind,10),size=Number(b.size);
 const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/webm':'webm','video/quicktime':'mov'};
 const isImage=kind==='image'&&['image/jpeg','image/png','image/webp'].includes(mime),isVideo=kind==='video'&&['video/mp4','video/webm','video/quicktime'].includes(mime);
 if(!isImage&&!isVideo||!Number.isInteger(size)||size<1||size>(isImage?5242880:36700160)||key.length<28)return res({error:'Jenis/ukuran file tidak valid'},400);
 const path='verified/'+crypto.randomUUID()+'.'+ext[mime],signed=await sb.storage.from('wk-public-intake').createSignedUploadUrl(path,{upsert:false});if(signed.error)throw signed.error;
 const saved=await sb.from('wk_intake_tickets').insert({request_key_hash:await sha(key+':'+user.id),ip_hash:ipHash,path,file_kind:kind,file_size:size,mime}).select('id').single();if(saved.error)throw saved.error;
 return res({ticketId:saved.data.id,path,token:signed.data.token});
 }
 const kind=text(b.kind,12),band=text(b.band_name,80),title=text(b.title,100);
 if(!['band','release','video'].includes(kind)||band.length<2||key.length<28||kind!=='band'&&title.length<2||kind==='video'&&!b.video_ticket_id)return res({error:'Data pengajuan belum lengkap'},400);
 const requestHash=await sha(key+':'+user.id),receiptHash=await sha(key),ids=[b.photo_ticket_id,b.video_ticket_id].filter(Boolean),media={};
 for(const id of ids){
 if(!/^[a-f0-9-]{36}$/i.test(String(id)))return res({error:'Bukti file tidak sah'},400);
 const q=await sb.from('wk_intake_tickets').select('*').eq('id',id).eq('request_key_hash',requestHash).eq('ip_hash',ipHash).is('used_at',null).gt('expires_at',new Date().toISOString()).maybeSingle();
 if(q.error||!q.data)return res({error:'Bukti file kadaluarsa'},400);
 const label=id===b.video_ticket_id?'video':'image';if(q.data.file_kind!==label)return res({error:'Jenis file tidak sesuai'},400);
 const parts=q.data.path.split('/'),listed=await sb.storage.from('wk-public-intake').list(parts.slice(0,-1).join('/'),{search:parts.at(-1),limit:2});
 if(listed.error||!listed.data?.some(x=>x.name===parts.at(-1)))return res({error:'File belum berhasil diunggah'},400);
 media[label]=sb.storage.from('wk-public-intake').getPublicUrl(q.data.path).data.publicUrl;
 }
 const instagram=url(b.instagram_url),music=url(b.music_url);if(b.instagram_url&&!instagram||b.music_url&&!music)return res({error:'Tautan wajib HTTPS'},400);
 const result=await sb.from('wk_public_submissions').insert({receipt_hash:receiptHash,kind,band_name:band,title,genre:text(b.genre,60),city:text(b.city,70),description:text(b.description,1200),instagram_url:instagram,music_url:music,price_text:text(b.price_text,600),photo_url:media.image||'',video_url:media.video||'',review_status:'pending',is_published:false}).select('id').single();
 if(result.error)return res({error:result.error.code==='23505'?'Kode pengajuan sudah terpakai':'Pengajuan gagal disimpan'},409);
 for(const id of ids)await sb.from('wk_intake_tickets').update({used_at:new Date().toISOString()}).eq('id',id);
 return res({id:result.data.id,status:'pending',receipt:key});
}catch(e){console.error('intake',e);return res({error:'Sistem upload sedang bermasalah. Coba ulang.'},500)}
});