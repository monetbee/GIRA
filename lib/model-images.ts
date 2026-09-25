import type { ShopifyProduct } from "@/lib/shopify";

// Model-worn photo shown as the Virtual Mirror's initial preview, per product.
// Keyed by product handle (falls back to title/tag match). Files must live
// under public/images/model/. Add a path here once the asset exists.
const expectedModelImages = {
  toxic: "/images/model/toxic.jpg",
  fever: "/images/model/fever.jpg",
  rush: "/images/model/rush.jpg",
  vex: "/images/model/vex.jpg",
  void: "/images/model/void.jpg",
} as const;

export type ModelImageKey = keyof typeof expectedModelImages;

// Manifest of model images that actually exist in public/images/model/.
// Only paths listed here are used; everything else falls back to the
// upload screen. Add the public path here once you drop the file in.
const availableModelImagePaths = new Set<string>([
  // e.g. "/images/model/void.jpg",
]);

function isAssetAvailable(path: string): boolean {
  return availableModelImagePaths.has(path);
}

const modelImages: Partial<Record<ModelImageKey, string>> = Object.fromEntries(
  (Object.entries(expectedModelImages) as Array<[ModelImageKey, string]>).filter(([, path]) => isAssetAvailable(path)),
);

export function getModelImageForProduct(product?: Pick<ShopifyProduct, "handle" | "title" | "tags"> | null): string | null {
  const handleKey = product?.handle?.toLowerCase() as ModelImageKey | undefined;
  if (handleKey && modelImages[handleKey]) {
    return modelImages[handleKey] ?? null;
  }

  const titleText = product?.title?.toLowerCase() ?? "";
  const matchedKey = (Object.keys(modelImages) as ModelImageKey[]).find(
    (key) => titleText.includes(key) || product?.tags?.some((tag) => tag.toLowerCase().includes(key)),
  );
  if (matchedKey) {
    return modelImages[matchedKey] ?? null;
  }

  return null;
}
