import {redirect} from "next/navigation";import {isAdmin,authVersion} from "@/lib/admin-auth";import "../dashboard.css";
export const dynamic="force-dynamic";
const issues:Record<string,string>={invalid:"Data password tidak valid.",weak:"Password baru minimal 14 karakter, harus berisi huruf dan angka.",mismatch:"Konfirmasi password baru tidak cocok.",same:"Password baru tidak boleh sama dengan yang lama.",current:"Password lama salah.",rate:"Terlalu banyak percobaan. Coba lagi nanti.",server:"Server tidak berhasil menyimpan perubahan. Password lama masih berlaku."};
export default async function SecurityPage({searchParams}:{searchParams:Promise<{error?:string;updated?:string}>}){
 if(!await isAdmin())redirect("/admin/access");
 const p=await searchParams;let version=0;try{version=(await authVersion()).version}catch{}
 const field={display:"grid",gap:10,color:"#d4ccc5",fontSize:13} as const,input={padding:15,background:"#0f0f12",border:"1px solid #6b5a51",color:"#fff",borderRadius:3,width:"100%",fontSize:16} as const;
 return <main style={{minHeight:"100vh",background:"#111114",color:"#f4f0ec",padding:"clamp(24px,5vw,72px)",fontFamily:"system-ui,sans-serif"}}>
 <div style={{maxWidth:800,margin:"0 auto"}}>
 <a href="/admin" style={{display:"inline-block",marginBottom:32,color:"#ffb86d",textDecoration:"none"}}>← Kembali ke dashboard</a>
 <p style={{color:"#f8b36b",fontSize:11,letterSpacing:2,marginBottom:14}}>WINGKING STUDIO / SETTINGS / SECURITY</p>
 <h1 style={{fontSize:"clamp(38px,7vw,64px)",fontWeight:700,letterSpacing:"-0.05em",marginBottom:14}}>Keamanan <em style={{color:"#ffb86d",fontWeight:400}}>akun.</em></h1>
 <p style={{color:"#b4a9a1",lineHeight:1.8,marginBottom:32}}>Ganti password admin sendiri tanpa perlu developer. Password baru tersimpan di database Supabase, tetap berlaku setelah website di-deploy ulang.</p>
 {p.updated==="1"&&<p role="status" style={{padding:20,background:"#142f20",color:"#b9f3cb",border:"1px solid #48775e",marginBottom:20}}>Password berhasil diganti. Sesi perangkat lain otomatis keluar.</p>}
 {p.error&&<p role="alert" style={{padding:20,background:"#361c20",color:"#ffcdcd",border:"1px solid #ac5b64",marginBottom:20}}>{issues[p.error]||issues.invalid}</p>}
 <section style={{background:"#1d1c20",border:"1px solid #483b33",padding:"clamp(20px,4vw,42px)"}}>
 <p style={{color:"#ffb86d",fontSize:11,letterSpacing:2,marginBottom:10}}>01 / PASSWORD CONTROL</p><h2 style={{fontSize:26,marginBottom:24}}>Ganti password admin</h2>
 <form method="POST" action="/admin/change-password" style={{display:"grid",gap:23,maxWidth:530}}>
 <label style={field}>Password saat ini<input style={input} name="currentPassword" type="password" autoComplete="current-password" maxLength={256} required placeholder="Password lama"/></label>
 <label style={field}>Password baru<input style={input} name="newPassword" type="password" autoComplete="new-password" minLength={14} maxLength={128} required placeholder="Minimal 14 karakter"/></label>
 <label style={field}>Ulangi password baru<input style={input} name="confirmPassword" type="password" autoComplete="new-password" minLength={14} maxLength={128} required placeholder="Konfirmasi password baru"/></label>
 <p style={{fontSize:12,color:"#aa9e95",lineHeight:1.7}}>Password baru minimal 14 karakter, kombinasi huruf dan angka. Setelah perubahan semua perangkat lain harus login ulang.</p>
 <button type="submit" style={{background:"#ffb86d",padding:"16px",color:"#22160b",fontWeight:800,border:"none",borderRadius:3,cursor:"pointer"}}>SIMPAN PASSWORD BARU</button>
 </form></section><p style={{color:"#998e88",fontSize:12,marginTop:23}}>SECURITY REVISION {version} · PRIVATE STORAGE · SESSION PROTECTED</p>
 </div></main>;
}
