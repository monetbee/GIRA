import { NextRequest, NextResponse } from "next/server";
import { customerAccountOrigin } from "@/lib/customer-account";
import { CUSTOMER_SESSION_COOKIE } from "@/lib/customer-session";

export async function GET(request: NextRequest) {
  const siteOrigin = customerAccountOrigin(request.nextUrl.origin);
  const referer = request.headers.get("referer");
  try {
    if (!referer || new URL(referer).origin !== siteOrigin) return new NextResponse("Invalid reauthentication request.", { status: 403 });
  } catch {
    return new NextResponse("Invalid reauthentication request.", { status: 403 });
  }
  const response = NextResponse.redirect(new URL("/account?reauth=1", request.url));
  response.cookies.delete(CUSTOMER_SESSION_COOKIE);
  return response;
}
