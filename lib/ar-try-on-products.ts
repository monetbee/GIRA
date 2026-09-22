import type { ShopifyProduct } from "@/lib/shopify";

export type ArTryOnCalibration = {
  asset: string;
  scale: number;
  offsetX: number;
  offsetY: number;
  rotationOffset: number;
};

// Add only purpose-built transparent PNG assets. Never use the regular PDP
// image as an AR overlay because its crop and background are not calibrated.
export const arTryOnProducts: Record<string, ArTryOnCalibration> = {
  siren: {
    asset: "/virtual-tryon/products/siren.png",
    scale: 1.08,
    offsetX: 0,
    offsetY: 4,
    rotationOffset: 0,
  },
};

export function getArTryOnProduct(product: Pick<ShopifyProduct, "handle">) {
  return arTryOnProducts[product.handle.toLowerCase()] ?? null;
}
