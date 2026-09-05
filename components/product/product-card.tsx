import Image from "next/image";
import Link from "next/link";
import type { ShopifyProduct } from "@/lib/shopify";
import { formatPrice } from "@/lib/format";

function isProductLikeImage(url: string) {
  return /\.(png|webp|svg)(?:\?.*)?$/i.test(url);
}

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const image = product.featuredImage || product.images[0];
  const price = product.variants.find((variant) => variant.availableForSale)?.price ?? product.variants[0]?.price ?? product.priceRange.minVariantPrice;
  const isAvailable = product.availableForSale || product.variants.some((variant) => variant.availableForSale);
  const useContainFit = image ? isProductLikeImage(image.url) : false;

  return (
    <article className="gira-shop-product-card group">
      <Link href={`/products/${product.handle}`} className="gira-shop-product-link" aria-label={`View ${product.title}`}>
        <div className="gira-shop-product-media">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText || product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="gira-shop-product-image"
              style={{ objectFit: useContainFit ? "contain" : "cover" }}
            />
          ) : (
            <div className="gira-shop-product-fallback">No image</div>
          )}

          {!isAvailable && (
            <span className="gira-shop-product-status">Sold out</span>
          )}

          <span className="gira-shop-product-view">VIEW PRODUCT <span aria-hidden="true">→</span></span>
        </div>

        <div className="gira-shop-product-meta">
          <div className="gira-shop-product-text">
            <p className="gira-shop-product-title">{product.title}</p>
            <span className="gira-shop-product-price">{formatPrice(price)}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
