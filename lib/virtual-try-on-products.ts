import type { ShopifyProduct } from "@/lib/shopify";

export type VirtualTryOnProductConfig = {
  modelImage?: string;
  modelImageIndex?: number;
  glassesAsset?: string;
  glassesImageIndex?: number;
};

// Single source of truth for Virtual Mirror assets. Prefer local files under
// /public/images/virtual-mirror; gallery indexes are a useful Shopify fallback.
export const virtualTryOnProducts: Record<string, VirtualTryOnProductConfig> = {
  void: { modelImageIndex: 1, glassesImageIndex: 0 },
  toxic: { modelImageIndex: 1, glassesImageIndex: 0 },
  fever: { modelImageIndex: 1, glassesImageIndex: 0 },
  rush: { modelImageIndex: 1, glassesImageIndex: 0 },
  vex: { modelImageIndex: 1, glassesImageIndex: 0 },
};

function getConfig(product: Pick<ShopifyProduct, "handle" | "title" | "tags">) {
  const handle = product.handle.toLowerCase();
  if (virtualTryOnProducts[handle]) return virtualTryOnProducts[handle];

  const searchable = `${product.title} ${product.tags.join(" ")}`.toLowerCase();
  const key = Object.keys(virtualTryOnProducts).find((candidate) => searchable.includes(candidate));
  return key ? virtualTryOnProducts[key] : undefined;
}

function galleryImage(product: ShopifyProduct, index?: number) {
  return index === undefined ? null : product.images[index]?.url ?? null;
}

export function getVirtualTryOnAssets(product: ShopifyProduct) {
  const config = getConfig(product);
  return {
    modelImage: config?.modelImage ?? galleryImage(product, config?.modelImageIndex),
    glassesAsset: config?.glassesAsset ?? galleryImage(product, config?.glassesImageIndex),
  };
}
