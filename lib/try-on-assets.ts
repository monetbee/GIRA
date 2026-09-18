import type { ShopifyProduct } from "@/lib/shopify";

export const tryOnAssets = {
  toxic: "/images/try-on/toxic.png",
  fever: "/images/try-on/fever.png",
  rush: "/images/try-on/rush.png",
  vex: "/images/try-on/vex.png",
  void: "/images/try-on/void.png",
} as const;

export function getTryOnAssetForProduct(product?: Pick<ShopifyProduct, "handle" | "title" | "tags"> | null): string {
  const handleKey = product?.handle?.toLowerCase();
  if (handleKey && handleKey in tryOnAssets) {
    return tryOnAssets[handleKey as keyof typeof tryOnAssets];
  }

  const titleText = product?.title?.toLowerCase() ?? "";
  const matchedKey = Object.keys(tryOnAssets).find((key) => titleText.includes(key) || product?.tags?.some((tag) => tag.toLowerCase().includes(key)));
  if (matchedKey) {
    return tryOnAssets[matchedKey as keyof typeof tryOnAssets];
  }

  return tryOnAssets.toxic;
}

export const tryOnAssetOrder = Object.values(tryOnAssets);
