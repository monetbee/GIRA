import { virtualTryOnInstruction } from "@/lib/virtual-try-on-config";

export type GenerateVirtualTryOnInput = { personImage: string; productImage: string; productName: string; instruction?: string };
export type GenerateVirtualTryOnResult = { imageUrl: string };
export interface VirtualTryOnProvider { generate(input: GenerateVirtualTryOnInput): Promise<GenerateVirtualTryOnResult> }

// Deliberate mock. Replace only this provider after an AI service is selected.
// Production calls belong behind a server endpoint so secrets never reach JS.
const mockProvider: VirtualTryOnProvider = {
  async generate(input) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return { imageUrl: input.personImage };
  },
};

export function generateVirtualTryOn(input: GenerateVirtualTryOnInput) {
  return mockProvider.generate({ ...input, instruction: input.instruction ?? virtualTryOnInstruction });
}

export interface VirtualTryOnCache {
  get(key: string): Promise<GenerateVirtualTryOnResult | null>;
  set(key: string, value: GenerateVirtualTryOnResult): Promise<void>;
}

export function createModelTryOnCacheKey(productHandle: string, modelId: string) {
  return `${productHandle}:${modelId}`;
}
