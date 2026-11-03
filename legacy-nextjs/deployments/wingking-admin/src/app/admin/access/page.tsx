import {redirect} from "next/navigation";
import {adminReady,isAdmin} from "@/lib/admin-auth";
import "../dashboard.css";
export const dynamic="force-dynamic";
const ICON=({name}:{name:"arrow"|"lock"})=><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{name==="arrow"?<path d="M4 12h15m-6-6 6 6-6 6"/>:<><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>}</svg>;
export default async function AdminAccess({searchParams}:{searchParams:Promise<{error?:string}>}){
 if(await isAdmin())redirect("/admin");
 const p=await searchParams;
 return <main className="wkadmin-login">
 <div className="wkadmin-login-art"><span className="wkadmin-kicker">WINGKING / BACK OFFICE</span><div className="wkadmin-record" aria-hidden="true"/><h1>THE OTHER<br/><em>SIDE OF</em><br/>THE MIX.</h1><p>Ruang kendali operasional studio, dari satu sesi sampai seluruh jadwal.</p></div>
 <div className="wkadmin-login-pane"><a className="wkadmin-return" href="/">Kembali ke website <ICON name="arrow"/></a>
 <div className="wkadmin-login-card"><span className="wkadmin-kicker">SECURE ACCESS / 001</span><div className="wkadmin-login-icon"><ICON name="lock"/></div><h2>Masuk ke Studio.</h2><p>Kelola reservasi dan harga layanan melalui dashboard privat.</p>
 {!adminReady()&&<p role="alert" className="wkadmin-alert">Akun admin sedang tidak tersedia. Hubungi pengelola.</p>}
 {p.error&&<p role="alert" className="wkadmin-alert">{p.error==="server"?"Server belum dapat memproses login. Coba lagi sebentar.":p.error==="rate"?"Terlalu banyak percobaan login. Coba lagi nanti.":"Password tidak sesuai. Periksa kembali dan coba lagi."}</p>}
 <form method="POST" action="/admin/session" className="wkadmin-login-form"><label htmlFor="adminPassword">PASSWORD ADMIN</label><input id="adminPassword" name="password" type="password" autoComplete="current-password" minLength={1} maxLength={256} required placeholder="Masukkan kata sandi"/><button type="submit" disabled={!adminReady()}>MASUK DASHBOARD <ICON name="arrow"/></button></form>
 <small>SECURE SESSION · HTTP-ONLY COOKIE · WIB</small></div></div></main>;
}
