import { NextRequest, NextResponse } from "next/server";
import { customerAccountOrigin, exchangeAuthorizationCode } from "@/lib/customer-account";
import { CUSTOMER_AUTH_COOKIE, CUSTOMER_SESSION_COOKIE, customerCookieOptions, getAuthTransaction, sealCustomerSession, valuesMatch } from "@/lib/customer-session";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/account", request.url));
  response.cookies.delete(CUSTOMER_AUTH_COOKIE);
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const transaction = getAuthTransaction(request.cookies.get(CUSTOMER_AUTH_COOKIE)?.value);
  if (!code || !state || !transaction || !valuesMatch(state, transaction.state)) {
    const invalid = new NextResponse("Invalid or expired sign-in request.", { status: 400 });
    invalid.cookies.delete(CUSTOMER_AUTH_COOKIE);
    return invalid;
  }
  try {
    const session = await exchangeAuthorizationCode({ origin: customerAccountOrigin(request.nextUrl.origin), code, codeVerifier: transaction.codeVerifier, nonce: transaction.nonce });
    response.headers.set("Location", new URL(transaction.returnTo, request.url).toString());
    response.cookies.set(CUSTOMER_SESSION_COOKIE, sealCustomerSession(session), {
      ...customerCookieOptions,
      maxAge: Math.max(1, Math.floor((session.expiresAt - Date.now()) / 1000)),
    });
    return response;
  } catch {
    const failed = new NextResponse("Customer sign-in could not be completed. Please try again.", { status: 401 });
    failed.cookies.delete(CUSTOMER_AUTH_COOKIE);
    return failed;
  }
}
