import {createHmac,randomBytes,scryptSync} from "node:crypto";import {NextRequest,NextResponse} from "next/server";import {authVersion,isAdmin,verifyAdminPassword} from "@/lib/admin-auth";import {edgeAdminFetch} from "@/lib/edge-api";import {loginLimit} from "@/lib/login-limiter";export const dynamic="force-dynamic";const maxAge=8*60*60;
function back(req:NextRequest,reason="server"){const u=new URL("/admin/security",req.url);u.searchParams.set("error",reason);return NextResponse.redirect(u,{status:303})}
export async function GET(req:NextRequest){return NextResponse.redirect(new URL("/admin/security",req.url),{status:303})}
export async function POST(req:NextRequest){
 const origin=req.headers.get("origin");if(origin&&origin!==new URL(req.url).origin)return NextResponse.json({error:"Forbidden"},{status:403});
 const site=req.headers.get("sec-fetch-site");if(site&&!["same-origin","none"].includes(site))return NextResponse.json({error:"Forbidden"},{status:403});
 if(!await isAdmin())return NextResponse.redirect(new URL("/admin/access",req.url),{status:303});
 const ct=req.headers.get("content-type")||"";if(!ct.startsWith("application/x-www-form-urlencoded")&&!ct.startsWith("multipart/form-data"))return NextResponse.json({error:"Unsupported media type"},{status:415});
 if(Number(req.headers.get("content-length")||"0")>8192)return NextResponse.json({error:"Request too large"},{status:413});
 let old:FormDataEntryValue|null,next:FormDataEntryValue|null,confirmation:FormDataEntryValue|null;
 try{const f=await req.formData();old=f.get("currentPassword");next=f.get("newPassword");confirmation=f.get("confirmPassword")}catch{return back(req,"invalid")}
 if(typeof old!=="string"||typeof next!=="string"||typeof confirmation!=="string")return back(req,"invalid");
 if(next.length<14||next.length>128||!/[a-z]/i.test(next)||!/\d/.test(next))return back(req,"weak");
 if(next!==confirmation)return back(req,"mismatch");if(next===old)return back(req,"same");
 const ip=req.headers.get("x-real-ip")||req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown",key="admin-change:"+ip;
 if(loginLimit(key))return back(req,"rate");
 if(!await verifyAdminPassword(old))return back(req,"current");
 loginLimit(key,true);
 let version=-1;try{const state=await authVersion(),salt=randomBytes(24),hash=salt.toString("hex")+":"+scryptSync(next,salt,64).toString("hex");
 const r=await edgeAdminFetch("/auth/change",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({passwordHash:hash,expectedVersion:state.version})});
 const d=await r.json();if(!r.ok||d.success!==true||!Number.isInteger(d.version))return back(req);version=d.version;
 }catch{console.error("Password update unavailable");return back(req)}
 const secret=process.env.ADMIN_SESSION_SECRET;if(!secret||secret.length<32||version<0)return back(req);
 const payload=String(Date.now()+maxAge*1000)+"."+randomBytes(16).toString("hex"),signature=createHmac("sha256",secret).update(payload+"."+version).digest("hex");
 const u=new URL("/admin/security",req.url);u.searchParams.set("updated","1");
 const res=NextResponse.redirect(u,{status:303});
 res.cookies.set("wingking_admin",payload+"."+signature,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/admin",maxAge});
 res.headers.set("Cache-Control","no-store");return res;
}
