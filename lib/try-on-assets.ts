import type { ShopifyProduct } from "@/lib/shopify";

// Expected transparent frame PNGs per product key (handle/title/tag match).
// Files must live under public/images/try-on/.
const expectedTryOnAssets = {
  toxic: "/images/try-on/toxic.png",
  fever: "/images/try-on/fever.png",
  rush: "/images/try-on/rush.png",
  vex: "/images/try-on/vex.png",
  void: "/images/try-on/void.png",
} as const;

export type TryOnAssetKey = keyof typeof expectedTryOnAssets;

// Manifest of frame assets that actually exist in public/images/try-on/.
// Only paths listed here are offered to the Virtual Mirror. When you add a
// transparent PNG to public/images/try-on/, add its public path here too.
const availableTryOnAssetPaths = new Set<string>([
  // e.g. "/images/try-on/toxic.png",
]);

function isAssetAvailable(path: string): boolean {
  return availableTryOnAssetPaths.has(path);
}

export const tryOnAssets: Partial<Record<TryOnAssetKey, string>> = Object.fromEntries(
  (Object.entries(expectedTryOnAssets) as Array<[TryOnAssetKey, string]>).filter(([, path]) => isAssetAvailable(path)),
);

export const missingTryOnAssets: Array<{ key: TryOnAssetKey; expectedPath: string }> =
  (Object.entries(expectedTryOnAssets) as Array<[TryOnAssetKey, string]>)
    .filter(([, path]) => !isAssetAvailable(path))
    .map(([key, expectedPath]) => ({ key, expectedPath }));

export function getTryOnAssetForProduct(product?: Pick<ShopifyProduct, "handle" | "title" | "tags"> | null): string | null {
  const handleKey = product?.handle?.toLowerCase() as TryOnAssetKey | undefined;
  if (handleKey && tryOnAssets[handleKey]) {
    return tryOnAssets[handleKey] ?? null;
  }

  const titleText = product?.title?.toLowerCase() ?? "";
  const matchedKey = (Object.keys(tryOnAssets) as TryOnAssetKey[]).find(
    (key) => titleText.includes(key) || product?.tags?.some((tag) => tag.toLowerCase().includes(key)),
  );
  if (matchedKey) {
    return tryOnAssets[matchedKey] ?? null;
  }

  // Default to the first available frame instead of a hardcoded missing one.
  return tryOnAssetOrder[0] ?? null;
}

export const tryOnAssetOrder: string[] = Object.values(tryOnAssets).filter((path): path is string => Boolean(path));
