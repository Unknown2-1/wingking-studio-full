import {cookies} from "next/headers";
export const EDGE_URL="https://kiuhzrowbypovoydymam.supabase.co/functions/v1/wingking-core";
export function edgeFetch(path:string, options:RequestInit={}) {
 if(!path.startsWith("/"))throw new Error("Invalid Edge API path");
 return fetch(EDGE_URL+path,{...options,cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12000),headers:{Accept:"application/json",...(options.headers||{})}});
}
export async function edgeAdminFetch(path:string, options:RequestInit={}) {
 const value=(await cookies()).get("wingking_admin")?.value;
 if(!value)throw new Error("Admin session required");
 return edgeFetch("/admin"+path,{...options,headers:{...(options.headers||{}),"X-Wingking-Cookie":"wingking_admin="+value}});
}
