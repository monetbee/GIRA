import { NextRequest, NextResponse } from "next/server";
import { createAuthorizationUrl, customerAccountOrigin } from "@/lib/customer-account";
import { CUSTOMER_AUTH_COOKIE, createCodeChallenge, customerCookieOptions, randomUrlSafeValue, sealAuthTransaction } from "@/lib/customer-session";

function returnPath(value: string | null) {
  if (!value || value.length > 1024 || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/account";
  try {
    const siteOrigin = customerAccountOrigin("https://invalid.example");
    const destination = new URL(value, siteOrigin);
    return destination.origin === siteOrigin ? `${destination.pathname}${destination.search}${destination.hash}` : "/account";
  } catch {
    return "/account";
  }
}

export async function GET(request: NextRequest) {
  try {
    const codeVerifier = randomUrlSafeValue();
    const state = randomUrlSafeValue();
    const nonce = randomUrlSafeValue();
    const authorizationUrl = await createAuthorizationUrl({ origin: customerAccountOrigin(request.nextUrl.origin), state, nonce, codeChallenge: createCodeChallenge(codeVerifier) });
    const response = NextResponse.redirect(authorizationUrl);
    response.cookies.set(CUSTOMER_AUTH_COOKIE, sealAuthTransaction({ codeVerifier, state, nonce, returnTo: returnPath(request.nextUrl.searchParams.get("returnTo")), expiresAt: Date.now() + 10 * 60 * 1000 }), {
      ...customerCookieOptions,
      maxAge: 10 * 60,
    });
    return response;
  } catch {
    return new NextResponse("Customer sign-in is unavailable. Please try again later.", { status: 503 });
  }
}
