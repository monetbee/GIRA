import { virtualTryOnInstruction } from "@/lib/virtual-try-on-config";

export type GenerateVirtualTryOnInput = { personImage: string; productImage: string; productName: string; instruction?: string; signal?: AbortSignal };
export type GenerateVirtualTryOnResult = { imageUrl: string };
export interface VirtualTryOnProvider { generate(input: GenerateVirtualTryOnInput): Promise<GenerateVirtualTryOnResult> }

const fashnProvider: VirtualTryOnProvider = {
  async generate(input) {
    const response = await fetch("/api/virtual-try-on", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personImage: input.personImage, productImage: input.productImage, productName: input.productName }),
      signal: input.signal,
    });
    const payload = await response.json() as { imageUrl?: string; message?: string };
    if (!response.ok || !payload.imageUrl) throw new Error(payload.message || "VIRTUAL_TRY_ON_FAILED");
    return { imageUrl: payload.imageUrl };
  },
};

export function generateVirtualTryOn(input: GenerateVirtualTryOnInput) {
  return fashnProvider.generate({ ...input, instruction: input.instruction ?? virtualTryOnInstruction });
}

export interface VirtualTryOnCache {
  get(key: string): Promise<GenerateVirtualTryOnResult | null>;
  set(key: string, value: GenerateVirtualTryOnResult): Promise<void>;
}

export function createModelTryOnCacheKey(productHandle: string, modelId: string) {
  return `${productHandle}:${modelId}:tryon-max-v1`;
}
