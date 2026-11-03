import {createHmac,randomBytes} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {adminReady,verifyAdminPassword} from "@/lib/admin-auth";
import {edgeFetch} from "@/lib/edge-api";
import {loginLimit} from "@/lib/login-limiter";
export const dynamic="force-dynamic";const maxAge=8*60*60;
function back(req:NextRequest,reason="login"){const u=new URL("/admin/access",req.url);u.searchParams.set("error",reason);return NextResponse.redirect(u,{status:303})}
export async function GET(req:NextRequest){return NextResponse.redirect(new URL("/admin/access",req.url),303)}
export async function POST(req:NextRequest){
 const origin=req.headers.get("origin");if(origin&&origin!==new URL(req.url).origin)return NextResponse.json({error:"Forbidden"},{status:403});
 const site=req.headers.get("sec-fetch-site");if(site&&!["same-origin","none"].includes(site))return NextResponse.json({error:"Forbidden"},{status:403});
 const ct=req.headers.get("content-type")||"";
 if(!ct.startsWith("application/x-www-form-urlencoded")&&!ct.startsWith("multipart/form-data"))return NextResponse.json({error:"Unsupported media type"},{status:415});
 if(Number(req.headers.get("content-length")||"0")>2048)return NextResponse.json({error:"Request too large"},{status:413});
 if(!adminReady())return back(req,"server");
 let password:FormDataEntryValue|null;try{password=(await req.formData()).get("password")}catch{return back(req)}
 if(typeof password!=="string"||password.length<1||password.length>256)return back(req);
 const ip=req.headers.get("x-real-ip")||req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown",key="admin-login:"+ip;
 if(loginLimit(key))return back(req,"rate");
 if(!await verifyAdminPassword(password))return back(req);
 loginLimit(key,true);
 const secret=process.env.ADMIN_SESSION_SECRET;if(!secret||secret.length<32)return back(req,"server");
 let version=-1;try{const r=await edgeFetch("/admin/auth/state");if(!r.ok)throw Error("Unavailable");const d=await r.json();if(!Number.isSafeInteger(d.version)||d.version<0)throw Error("Bad version");version=d.version}catch{console.error("Admin session version unavailable");return back(req,"server")}
 const payload=String(Date.now()+maxAge*1000)+"."+randomBytes(16).toString("hex");
 const signature=createHmac("sha256",secret).update(payload+"."+version).digest("hex");
 const response=NextResponse.redirect(new URL("/admin",req.url),{status:303});
 response.cookies.set("wingking_admin",payload+"."+signature,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/admin",maxAge});
 response.headers.set("Cache-Control","no-store");
 return response;
}
