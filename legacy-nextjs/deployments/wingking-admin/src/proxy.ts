import { NextRequest, NextResponse } from "next/server";
export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === "/admin") {
    const cookie = req.cookies.get("wingking_admin")?.value || "";
    if (!/^\d{13}\.[a-f0-9]{32}\.[a-f0-9]{64}$/i.test(cookie)) {
      const url = req.nextUrl.clone(); url.pathname="/admin/access";url.searchParams.delete("saved");
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}
export const config={matcher:["/admin"]};
