import { NextRequest, NextResponse } from "next/server";
import { createLogoutUrl, customerAccountOrigin } from "@/lib/customer-account";
import { CUSTOMER_SESSION_COOKIE, getCustomerSession } from "@/lib/customer-session";

export async function POST(request: NextRequest) {
  const siteOrigin = customerAccountOrigin(request.nextUrl.origin);
  if (request.headers.get("origin") !== siteOrigin) return new NextResponse("Invalid logout request.", { status: 403 });
  const session = getCustomerSession(request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
  const fallback = new URL("/", request.url);
  const response = NextResponse.redirect(fallback, 303);
  response.cookies.delete(CUSTOMER_SESSION_COOKIE);
  if (!session) return response;
  try {
    const logoutResponse = NextResponse.redirect(await createLogoutUrl(session.idToken, siteOrigin), 303);
    logoutResponse.cookies.delete(CUSTOMER_SESSION_COOKIE);
    return logoutResponse;
  } catch {
    return response;
  }
}
