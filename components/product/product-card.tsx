import Image from "next/image";
import Link from "next/link";
import type { ShopifyProduct } from "@/lib/shopify";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const image = product.featuredImage || product.images[0];
  const price = product.variants[0]?.price ?? product.priceRange.minVariantPrice;

  return (
    <article className="group overflow-hidden rounded-[28px] border border-[#111111]/10 bg-white transition-transform duration-200 hover:-translate-y-1">
      <Link href={`/products/${product.handle}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f4f4f4]">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText || product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#f4f4f4] text-sm text-[#666666]">No image</div>
          )}
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#111111]">{product.title}</p>
            <span className="text-sm font-medium text-[#111111]">{formatPrice(price)}</span>
          </div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#666666]">{product.tags[0] || "New"}</p>
        </div>
      </Link>
    </article>
  );
}
