import { readFile } from "node:fs/promises";
import { getTranslations } from "@/lib/i18n/server";
import path from "node:path";
import { NextResponse } from "next/server";
import { virtualTryOnInstruction } from "@/lib/virtual-try-on-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FASHN_BASE_URL = "https://api.fashn.ai/v1";
const MAX_REQUEST_BYTES = 9 * 1024 * 1024;
const MAX_DATA_URI_BYTES = 7 * 1024 * 1024;
const POLL_INTERVAL_MS = 2_000;
const MAX_POLL_ATTEMPTS = 25;
const requestLog = new Map<string, number[]>();

type RequestBody = { personImage?: unknown; productImage?: unknown; productName?: unknown };
type FashnError = { name?: string; message?: string } | string | null;
type FashnStatus = { id?: string; status?: string; output?: string[]; error?: FashnError };

async function safeError(status: number, code: string) {
  const t = await getTranslations();
  return NextResponse.json({ error: code, message: t("We couldn't generate your try-on. Please try again.") }, { status });
}

function clientId(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(request: Request) {
  const key = clientId(request);
  const now = Date.now();
  const recent = (requestLog.get(key) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 3) return true;
  recent.push(now);
  requestLog.set(key, recent);
  return false;
}

function isAllowedDataUri(value: string) {
  if (!/^data:image\/(jpeg|png|webp);base64,/i.test(value)) return false;
  const payload = value.slice(value.indexOf(",") + 1);
  return Math.ceil(payload.length * 0.75) <= MAX_DATA_URI_BYTES;
}

async function resolvePersonImage(value: string) {
  if (isAllowedDataUri(value)) return value;
  const match = value.match(/^\/virtual-tryon\/models\/model(1[01]|[1-9])\.png$/);
  if (!match) throw new Error("INVALID_PERSON_IMAGE");
  const file = await readFile(path.join(process.cwd(), "public", "virtual-tryon", "models", `model${match[1]}.png`));
  if (file.byteLength > MAX_DATA_URI_BYTES) throw new Error("PERSON_IMAGE_TOO_LARGE");
  return `data:image/png;base64,${file.toString("base64")}`;
}

function validateProductImage(value: string) {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("INVALID_PRODUCT_IMAGE"); }
  const host = url.hostname.toLowerCase();
  const configuredStore = (process.env.SHOPIFY_STORE_DOMAIN ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "")
    .replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase();
  const allowed = url.protocol === "https:" && (host === "cdn.shopify.com" || host === configuredStore);
  if (!allowed) throw new Error("INVALID_PRODUCT_IMAGE");
  return url.toString();
}

async function fashnFetch(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try { return await fetch(url, { ...init, signal: controller.signal, cache: "no-store" }); }
  finally { clearTimeout(timer); }
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (!contentType.toLowerCase().startsWith("application/json")) return safeError(415, "UNSUPPORTED_CONTENT_TYPE");
  if (contentLength > MAX_REQUEST_BYTES) return safeError(413, "REQUEST_TOO_LARGE");
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).origin !== new URL(request.url).origin) return safeError(403, "INVALID_ORIGIN");
  if (isRateLimited(request)) return safeError(429, "RATE_LIMITED");

  const apiKey = process.env.FASHN_API_KEY;
  if (!apiKey) return safeError(503, "PROVIDER_NOT_CONFIGURED");

  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_REQUEST_BYTES) return safeError(413, "REQUEST_TOO_LARGE");
    const body = JSON.parse(rawBody) as RequestBody;
    if (typeof body.personImage !== "string" || typeof body.productImage !== "string" || typeof body.productName !== "string") return safeError(400, "INVALID_INPUT");
    if (body.productName.length < 1 || body.productName.length > 160) return safeError(400, "INVALID_INPUT");

    const [modelImage, productImage] = await Promise.all([
      resolvePersonImage(body.personImage),
      Promise.resolve(validateProductImage(body.productImage)),
    ]);
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
    const submit = await fashnFetch(`${FASHN_BASE_URL}/run`, {
      method: "POST", headers,
      body: JSON.stringify({
        model_name: "tryon-max",
        inputs: { model_image: modelImage, product_image: productImage, prompt: virtualTryOnInstruction, return_base64: true },
      }),
    });
    if (!submit.ok) {
      console.error("FASHN_SUBMIT_FAILED", { status: submit.status });
      return safeError(submit.status === 429 ? 429 : 502, "PROVIDER_SUBMIT_FAILED");
    }
    const submitted = await submit.json() as FashnStatus;
    if (!submitted.id) return safeError(502, "MALFORMED_PROVIDER_RESPONSE");

    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
      if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      const statusResponse = await fashnFetch(`${FASHN_BASE_URL}/status/${encodeURIComponent(submitted.id)}`, { headers });
      if (!statusResponse.ok) {
        console.error("FASHN_STATUS_FAILED", { status: statusResponse.status, predictionId: submitted.id });
        return safeError(statusResponse.status === 429 ? 429 : 502, "PROVIDER_STATUS_FAILED");
      }
      const prediction = await statusResponse.json() as FashnStatus;
      if (prediction.status === "completed") {
        const imageUrl = prediction.output?.[0];
        if (!imageUrl || (!imageUrl.startsWith("data:image/") && !/^https:\/\/(cdn|media)\.fashn\.ai\//.test(imageUrl))) return safeError(502, "MALFORMED_PROVIDER_RESPONSE");
        return NextResponse.json({ imageUrl });
      }
      if (prediction.status === "failed" || prediction.status === "canceled" || prediction.status === "time_out") {
        console.error("FASHN_GENERATION_FAILED", { predictionId: submitted.id, providerError: prediction.error });
        return safeError(422, "GENERATION_FAILED");
      }
    }
    console.error("FASHN_GENERATION_TIMEOUT", { predictionId: submitted.id });
    return safeError(504, "PROVIDER_TIMEOUT");
  } catch (error) {
    const name = error instanceof Error ? error.message : "UNKNOWN";
    console.error("VIRTUAL_TRY_ON_REQUEST_FAILED", { code: name });
    if (name.startsWith("INVALID_") || name.endsWith("_TOO_LARGE")) return safeError(400, name);
    return safeError(500, "INTERNAL_ERROR");
  }
}
