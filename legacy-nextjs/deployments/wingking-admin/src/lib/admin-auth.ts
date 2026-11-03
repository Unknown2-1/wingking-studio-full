import { createHmac,randomBytes,scryptSync,timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { edgeFetch } from "@/lib/edge-api";
const COOKIE="wingking_admin";
const EXPIRES=8*60*60;
function getSecret(){const v=process.env.ADMIN_SESSION_SECRET;return v&&v.length>=32?v:null}
export function adminReady(){return Boolean(getSecret()&&process.env.ADMIN_PASSWORD_SCRYPT)}
export type SecurityVersion={initialized:boolean;version:number};
export async function authVersion():Promise<SecurityVersion>{
 const r=await edgeFetch("/admin/auth/state");
 if(!r.ok)throw Error("Security service unavailable");
 const d=await r.json();
 if(typeof d.initialized!=="boolean"||!Number.isSafeInteger(d.version)||d.version<0)throw Error("Invalid security state");
 return d;
}
export function checkAdminPassword(p:string){
 const encoded=process.env.ADMIN_PASSWORD_SCRYPT;
 if(!encoded||p.length<1||p.length>256)return false;
 const [saltHex,hashHex]=encoded.split(":");
 if(!/^[a-f0-9]{48}$/i.test(saltHex||"")||!/^[a-f0-9]{128}$/i.test(hashHex||""))return false;
 const actual=scryptSync(p,Buffer.from(saltHex,"hex"),64);
 return timingSafeEqual(actual,Buffer.from(hashHex,"hex"));
}
export async function verifyAdminPassword(p:string){
 if(typeof p!=="string"||!p.length||p.length>256)return false;
 try{
  const v=await authVersion();
  if(!v.initialized)return checkAdminPassword(p);
  const r=await edgeFetch("/admin/auth/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:p})});
  const d=await r.json();
  return r.ok&&d.initialized===true&&d.valid===true;
 }catch{return false}
}
function signature(payload:string,version:number,secret:string){
 return createHmac("sha256",secret).update(payload+"."+version).digest("hex");
}
export async function openAdminSession(){
 const secret=getSecret();if(!secret)throw Error("No session secret");
 const rev=await authVersion(),expires=Date.now()+EXPIRES*1000;
 const payload=expires+"."+randomBytes(16).toString("hex");
 (await cookies()).set(COOKIE,payload+"."+signature(payload,rev.version,secret),{
  httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/admin",maxAge:EXPIRES
 });
}
export async function isAdmin(){
 const secret=getSecret();if(!secret)return false;
 const raw=(await cookies()).get(COOKIE)?.value;if(!raw)return false;
 const parts=raw.split(".");
 if(parts.length!==3||!/^\d{13}$/.test(parts[0])||!/^[a-f0-9]{32}$/i.test(parts[1])||!/^[a-f0-9]{64}$/i.test(parts[2]))return false;
 const expiration=+parts[0];
 if(expiration<=Date.now()||expiration>Date.now()+EXPIRES*1000)return false;
 try{
  const rev=await authVersion();
  return timingSafeEqual(Buffer.from(signature(parts[0]+"."+parts[1],rev.version,secret),"hex"),Buffer.from(parts[2],"hex"));
 }catch{return false}
}
export async function closeAdminSession(){
 (await cookies()).set(COOKIE,"",{path:"/admin",maxAge:0,httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict"});
}
