import {isAdmin} from "@/lib/admin-auth";
import Script from "next/script";

export default async function AdminLayout({children}:{children:React.ReactNode}){
 const authed=await isAdmin();
 return <>{children}
 <Script src="/admin-password-visibility.js" strategy="afterInteractive" />
 {authed&&<a href="/admin/security" aria-label="Pengaturan akun, ganti password admin" style={{
  position:"fixed",zIndex:150,right:20,bottom:20,padding:"15px 19px",background:"#f4b777",color:"#24150a",borderRadius:7,
  boxShadow:"0 10px 32px rgba(0,0,0,.6)",display:"flex",alignItems:"center",gap:9,fontWeight:800,fontSize:13,textDecoration:"none"
 }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
 <rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>Pengaturan akun</a>}</>;
}
