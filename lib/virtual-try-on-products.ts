import type { ShopifyProduct } from "@/lib/shopify";

export type VirtualTryOnProductConfig = { productImageIndex?: number; productImage?: string };

// Optional product overrides. Unlisted products use their featured image, then
// the first gallery image; no bespoke mask, PNG, model shoot, or CSS is needed.
export const virtualTryOnProducts: Record<string, VirtualTryOnProductConfig> = {
  void: { productImageIndex: 0 },
  toxic: { productImageIndex: 0 },
  fever: { productImageIndex: 0 },
  rush: { productImageIndex: 0 },
  vex: { productImageIndex: 0 },
};

function getConfig(product: Pick<ShopifyProduct, "handle" | "title" | "tags">) {
  const handle = product.handle.toLowerCase();
  if (virtualTryOnProducts[handle]) return virtualTryOnProducts[handle];
  const searchable = `${product.title} ${product.tags.join(" ")}`.toLowerCase();
  const key = Object.keys(virtualTryOnProducts).find((candidate) => searchable.includes(candidate));
  return key ? virtualTryOnProducts[key] : undefined;
}

export function getVirtualTryOnProductImage(product: ShopifyProduct): string | null {
  const config = getConfig(product);
  return config?.productImage
    ?? (config?.productImageIndex !== undefined ? product.images[config.productImageIndex]?.url : undefined)
    ?? product.featuredImage?.url
    ?? product.images[0]?.url
    ?? null;
}
