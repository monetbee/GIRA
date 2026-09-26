import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const CUSTOMER_SESSION_COOKIE = "gira_customer_session";
export const CUSTOMER_AUTH_COOKIE = "gira_customer_auth";

export type CustomerAuthTransaction = {
  codeVerifier: string;
  state: string;
  nonce: string;
  returnTo: string;
  expiresAt: number;
};

export type CustomerSession = {
  accessToken: string;
  idToken: string;
  expiresAt: number;
};

function secretKey() {
  const secret = process.env.CUSTOMER_SESSION_SECRET;
  if (!secret || !/^[a-f0-9]{64}$/i.test(secret)) {
    throw new Error("CUSTOMER_SESSION_SECRET must be a 256-bit random value generated with: openssl rand -hex 32");
  }
  return Buffer.from(secret, "hex");
}

function seal(value: unknown) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", secretKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return `v1.${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${ciphertext.toString("base64url")}`;
}

function unseal<T>(value: string | undefined): T | null {
  if (!value) return null;
  try {
    const [version, iv, tag, ciphertext] = value.split(".");
    if (version !== "v1" || !iv || !tag || !ciphertext) return null;
    const decipher = createDecipheriv("aes-256-gcm", secretKey(), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return JSON.parse(Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function randomUrlSafeValue() {
  return randomBytes(32).toString("base64url");
}

export function createCodeChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function valuesMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function sealAuthTransaction(transaction: CustomerAuthTransaction) {
  return seal(transaction);
}

export function getAuthTransaction(value: string | undefined) {
  const transaction = unseal<CustomerAuthTransaction>(value);
  return transaction && transaction.expiresAt > Date.now() ? transaction : null;
}

export function sealCustomerSession(session: CustomerSession) {
  const value = seal([session.accessToken, session.idToken, session.expiresAt]);
  // Keep enough headroom for the cookie name and attributes under browser limits.
  if (Buffer.byteLength(value, "utf8") > 3500) throw new Error("Customer session exceeds the cookie size limit");
  return value;
}

export function getCustomerSession(value: string | undefined) {
  const session = unseal<unknown>(value);
  if (!Array.isArray(session) || session.length !== 3) return null;
  const [accessToken, idToken, expiresAt] = session;
  if (typeof accessToken !== "string" || typeof idToken !== "string" || typeof expiresAt !== "number") return null;
  return expiresAt > Date.now() ? { accessToken, idToken, expiresAt } : null;
}

const isProduction = process.env.NODE_ENV === "production";

export const customerCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
  priority: "high" as const,
};
