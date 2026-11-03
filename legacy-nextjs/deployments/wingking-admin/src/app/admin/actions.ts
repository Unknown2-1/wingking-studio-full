"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminReady, verifyAdminPassword, closeAdminSession, isAdmin, openAdminSession } from "@/lib/admin-auth";
import { loginLimit } from "@/lib/login-limiter";
import { edgeAdminFetch } from "@/lib/edge-api";
export async function loginAdmin(formData:FormData){
 const h=await headers();const ip=h.get("x-real-ip")||h.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";const key="login:"+ip;
 const p=formData.get("password");
 if(!adminReady()||loginLimit(key)||typeof p!=="string"||!await verifyAdminPassword(p))redirect("/admin?error=login");
 loginLimit(key,true);await openAdminSession();redirect("/admin");
}
export async function logoutAdmin(){await closeAdminSession();redirect("/admin")}
export async function setBookingStatus(formData:FormData){
 if(!await isAdmin())redirect("/admin?error=login");
 const bookingId=formData.get("bookingId"),status=formData.get("status");
 if(typeof bookingId!=="string"||!/^[a-z0-9]{10,40}$/i.test(bookingId)||!["PENDING","CONFIRMED","CANCELLED"].includes(String(status)))redirect("/admin?error=update");
 let saved=false;try{const r=await edgeAdminFetch("/status",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookingId,status})});const d=await r.json();saved=r.ok&&d.success===true}catch{console.error("Admin booking update failed")}
 if(!saved)redirect("/admin?error=update");revalidatePath("/admin");redirect("/admin?saved=booking");
}
export async function updateServicePrice(formData:FormData){
 if(!await isAdmin())redirect("/admin?error=login");
 const serviceId=formData.get("serviceId"),price=Number(formData.get("price"));
 if(typeof serviceId!=="string"||!/^[a-z0-9]{10,40}$/i.test(serviceId)||!Number.isInteger(price)||price<1000||price>10000000)redirect("/admin?error=update");
 let saved=false;try{const r=await edgeAdminFetch("/price",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({serviceId,price})});const d=await r.json();saved=r.ok&&d.success===true}catch{console.error("Admin pricing update failed")}
 if(!saved)redirect("/admin?error=update");revalidatePath("/");revalidatePath("/admin");redirect("/admin?saved=pricing#pricing");
}
