import "server-only";

import { createPublicKey, verify } from "node:crypto";
import { valuesMatch } from "@/lib/customer-session";

type OpenIdConfiguration = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint: string;
  jwks_uri: string;
  issuer: string;
};

type CustomerAccountConfiguration = { graphql_api: string };

export type CustomerProfile = { firstName?: string | null; lastName?: string | null; email?: string | null };
export class CustomerAuthenticationError extends Error {}

type JwtHeader = { alg?: string; kid?: string };
type JwtPayload = { iss?: string; aud?: string | string[]; azp?: string; exp?: number; nonce?: string };
type JsonWebKey = { kty?: string; kid?: string; use?: string; alg?: string; [key: string]: unknown };

function getConfig() {
  const storeDomain = (process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "")
    .replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID || "";
  if (!storeDomain || !clientId) throw new Error("Customer Account API is not configured");
  return { storeDomain, clientId };
}

function assertHttpsUrl(value: string, name: string) {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error(`Invalid ${name}`);
  return url;
}

async function discover() {
  const { storeDomain } = getConfig();
  const baseUrl = `https://${storeDomain}`;
  const [openIdResponse, accountResponse] = await Promise.all([
    fetch(`${baseUrl}/.well-known/openid-configuration`, { cache: "no-store" }),
    fetch(`${baseUrl}/.well-known/customer-account-api`, { cache: "no-store" }),
  ]);
  if (!openIdResponse.ok || !accountResponse.ok) throw new Error("Customer Account API discovery failed");
  const openId = await openIdResponse.json() as OpenIdConfiguration;
  const account = await accountResponse.json() as CustomerAccountConfiguration;
  return {
    authorizationEndpoint: assertHttpsUrl(openId.authorization_endpoint, "authorization endpoint"),
    tokenEndpoint: assertHttpsUrl(openId.token_endpoint, "token endpoint"),
    logoutEndpoint: assertHttpsUrl(openId.end_session_endpoint, "logout endpoint"),
    jwksUri: assertHttpsUrl(openId.jwks_uri, "JWKS URI"),
    issuer: openId.issuer,
    graphqlEndpoint: assertHttpsUrl(account.graphql_api, "GraphQL endpoint"),
  };
}

export function callbackUrl(origin: string) {
  return new URL("/account/callback", origin).toString();
}

export function customerAccountOrigin(requestOrigin: string) {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  return configuredOrigin ? new URL(configuredOrigin).origin : requestOrigin;
}

export async function createAuthorizationUrl(input: { origin: string; state: string; nonce: string; codeChallenge: string }) {
  const { clientId } = getConfig();
  const { authorizationEndpoint } = await discover();
  authorizationEndpoint.search = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: callbackUrl(input.origin),
    scope: "openid email customer-account-api:full",
    state: input.state,
    nonce: input.nonce,
    code_challenge: input.codeChallenge,
    code_challenge_method: "S256",
  }).toString();
  return authorizationEndpoint;
}

export async function exchangeAuthorizationCode(input: { origin: string; code: string; codeVerifier: string; nonce: string }) {
  const { clientId } = getConfig();
  const { tokenEndpoint, issuer, jwksUri } = await discover();
  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      code: input.code,
      redirect_uri: callbackUrl(input.origin),
      code_verifier: input.codeVerifier,
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Customer sign-in could not be completed");
  const token = await response.json() as { access_token?: string; id_token?: string; expires_in?: number };
  if (!token.access_token || !token.id_token || !token.expires_in) throw new Error("Customer token response was incomplete");
  await verifyIdToken(token.id_token, { issuer, jwksUri, audience: clientId, nonce: input.nonce });
  return { accessToken: token.access_token, idToken: token.id_token, expiresAt: Date.now() + Math.max(1, token.expires_in - 60) * 1000 };
}

export async function getCustomerProfile(accessToken: string): Promise<CustomerProfile> {
  const { graphqlEndpoint } = await discover();
  const response = await fetch(graphqlEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: accessToken },
    body: JSON.stringify({ query: "query CustomerProfile { customer { firstName lastName emailAddress { emailAddress } } }" }),
    cache: "no-store",
  });
  if (response.status === 401 || response.status === 403) throw new CustomerAuthenticationError("Customer access token is not accepted");
  if (!response.ok) throw new Error("Customer profile request failed");
  const payload = await response.json() as { data?: { customer?: { firstName?: string | null; lastName?: string | null; emailAddress?: { emailAddress?: string | null } } }; errors?: Array<{ message: string; extensions?: { code?: string } }> };
  if (payload.errors?.some((error) => ["UNAUTHENTICATED", "UNAUTHORIZED", "FORBIDDEN", "ACCESS_DENIED"].includes(error.extensions?.code ?? ""))) throw new CustomerAuthenticationError("Customer access token is not accepted");
  if (payload.errors?.length || !payload.data?.customer) throw new Error("Customer profile is unavailable");
  const customer = payload.data.customer;
  return { firstName: customer.firstName, lastName: customer.lastName, email: customer.emailAddress?.emailAddress };
}

export async function createLogoutUrl(idToken: string, postLogoutRedirectUri: string) {
  const { logoutEndpoint } = await discover();
  logoutEndpoint.searchParams.set("id_token_hint", idToken);
  logoutEndpoint.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);
  return logoutEndpoint;
}

async function verifyIdToken(token: string, input: { issuer: string; jwksUri: URL; audience: string; nonce: string }) {
  const [encodedHeader, encodedPayload, encodedSignature, ...extra] = token.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature || extra.length) throw new Error("Invalid ID token");
  let header: JwtHeader;
  let payload: JwtPayload;
  try {
    header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8")) as JwtHeader;
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as JwtPayload;
  } catch {
    throw new Error("Invalid ID token");
  }
  if (!header.kid || !header.alg || !["RS256", "RS384", "RS512", "ES256", "ES384", "ES512"].includes(header.alg)) throw new Error("Unsupported ID token algorithm");
  const jwksResponse = await fetch(input.jwksUri, { cache: "no-store" });
  if (!jwksResponse.ok) throw new Error("Customer Account JWKS request failed");
  const jwks = await jwksResponse.json() as { keys?: JsonWebKey[] };
  const key = jwks.keys?.find((candidate) => candidate.kid === header.kid && (!candidate.use || candidate.use === "sig") && (!candidate.alg || candidate.alg === header.alg));
  if (!key) throw new Error("ID token signing key was not found");
  const isRsa = header.alg.startsWith("RS");
  const isEc = header.alg.startsWith("ES");
  if ((isRsa && key.kty !== "RSA") || (isEc && key.kty !== "EC")) throw new Error("ID token key type is invalid");
  const hash = header.alg.endsWith("256") ? "sha256" : header.alg.endsWith("384") ? "sha384" : "sha512";
  const signed = Buffer.from(`${encodedHeader}.${encodedPayload}`);
  const signature = Buffer.from(encodedSignature, "base64url");
  const publicKey = createPublicKey({ key, format: "jwk" });
  const signatureIsValid = isEc
    ? verify(hash, signed, { key: publicKey, dsaEncoding: "ieee-p1363" }, signature)
    : verify(`RSA-SHA${header.alg.slice(-3)}`, signed, publicKey, signature);
  if (!signatureIsValid) throw new Error("ID token signature is invalid");
  const audienceMatches = typeof payload.aud === "string" ? payload.aud === input.audience : Array.isArray(payload.aud) && payload.aud.includes(input.audience);
  const authorizedPartyMatches = !Array.isArray(payload.aud) || payload.aud.length === 1 || payload.azp === input.audience;
  if (payload.iss !== input.issuer || !audienceMatches || !authorizedPartyMatches || typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000) || typeof payload.nonce !== "string" || !valuesMatch(payload.nonce, input.nonce)) {
    throw new Error("ID token claims are invalid");
  }
}
