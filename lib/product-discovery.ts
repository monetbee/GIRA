import type { ShopifyProduct } from "./shopify";

export const SIGNAL_TAGS = ["Y2K", "BOLD", "MINIMAL", "RETRO", "FUTURE", "ESSENTIAL"] as const;
export type SignalTag = (typeof SIGNAL_TAGS)[number];
export const SORT_OPTIONS = [
  { value: "featured", label: "FEATURED" },
  { value: "newest", label: "NEWEST" },
  { value: "price-asc", label: "PRICE: LOW TO HIGH" },
  { value: "price-desc", label: "PRICE: HIGH TO LOW" },
  { value: "name-asc", label: "NAME: A TO Z" },
] as const;
export type ProductSort = (typeof SORT_OPTIONS)[number]["value"];
export type DiscoveryContext = { from: "shop" | "signal"; tag?: SignalTag; sort?: ProductSort; page?: number };
export const PRODUCTS_PER_PAGE = 12;

export function normalizePage(value: string | null | undefined, totalPages = Number.MAX_SAFE_INTEGER) {
  const parsed = value && /^\d+$/.test(value) ? Number(value) : 1;
  return Math.max(1, Math.min(parsed, Math.max(1, totalPages)));
}

export function paginateProducts(products: ShopifyProduct[], page: string | null) {
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const currentPage = normalizePage(page, totalPages);
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  return { totalPages, currentPage, products: products.slice(start, start + PRODUCTS_PER_PAGE) };
}

export function paginationItems(currentPage: number, totalPages: number): Array<number | string> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const pages = new Set([1, totalPages]);
  const start = Math.max(2, Math.min(currentPage - 1, totalPages - 3));
  for (let page = start; page <= Math.min(totalPages - 1, start + 2); page++) pages.add(page);
  const result: Array<number | string> = [];
  let previous = 0;
  for (const page of [...pages].sort((a, b) => a - b)) {
    if (previous && page - previous > 1) result.push(`gap-${previous}`);
    result.push(page);
    previous = page;
  }
  return result;
}

export function updateDiscoveryParams(params: URLSearchParams, key: string, value?: string) {
  const next = new URLSearchParams(params);
  if (value) next.set(key, value);
  else next.delete(key);
  if (key === "tag" || key === "sort") next.delete("page");
  return next;
}

export function parseSignal(value: string | null | undefined): SignalTag | undefined {
  return SIGNAL_TAGS.find((tag) => tag === value?.trim().toUpperCase());
}

export function parseSort(value: string | null | undefined): ProductSort {
  return SORT_OPTIONS.find((option) => option.value === value)?.value ?? "featured";
}

// Sorting uses exactly the representative price displayed by ProductCard.
export function getProductPrice(product: ShopifyProduct) {
  return product.variants.find((variant) => variant.availableForSale)?.price
    ?? product.variants[0]?.price ?? product.priceRange.minVariantPrice;
}

export function discoverProducts(products: ShopifyProduct[], tag?: SignalTag, sort: ProductSort = "featured") {
  const result = products.filter((product) => !tag || product.tags.some((value) => parseSignal(value) === tag));
  switch (sort) {
    case "newest": return result.sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
    case "price-asc": return result.sort((a, b) => Number(getProductPrice(a).amount) - Number(getProductPrice(b).amount));
    case "price-desc": return result.sort((a, b) => Number(getProductPrice(b).amount) - Number(getProductPrice(a).amount));
    case "name-asc": return result.sort((a, b) => a.title.localeCompare(b.title));
    default: return result;
  }
}

export function productDiscoveryHref(handle: string, context?: DiscoveryContext) {
  const path = `/products/${encodeURIComponent(handle)}`;
  if (!context) return path;
  const params = new URLSearchParams({ from: context.from });
  if (context.tag) params.set("tag", context.tag);
  if (context.sort && context.sort !== "featured") params.set("sort", context.sort);
  if (context.from === "shop" && context.page && context.page > 1) params.set("page", String(context.page));
  return `${path}?${params}`;
}

export function discoveryReturnLink(params: { get(name: string): string | null }) {
  const tag = parseSignal(params.get("tag"));
  if (params.get("from") === "signal" && tag) {
    return { href: `/?signal=${tag}#choose-the-signal`, label: `BACK TO ${tag} SIGNAL` };
  }
  const query = new URLSearchParams();
  if (params.get("from") === "shop") {
    if (tag) query.set("tag", tag);
    const sort = parseSort(params.get("sort"));
    if (sort !== "featured") query.set("sort", sort);
    const page = normalizePage(params.get("page"));
    if (page > 1) query.set("page", String(page));
  }
  return { href: `/shop${query.size ? `?${query}` : ""}`, label: "BACK TO SHOP" };
}
