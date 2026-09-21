import Image from "next/image";
import Link from "next/link";
import type { ShopifyProduct } from "@/lib/shopify";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const image = product.featuredImage || product.images[0];
  const price = product.variants.find((variant) => variant.availableForSale)?.price ?? product.variants[0]?.price ?? product.priceRange.minVariantPrice;
  const isAvailable = product.availableForSale || product.variants.some((variant) => variant.availableForSale);

  return (
    <article className="gira-shop-product-card group">
      <Link href={`/products/${product.handle}`} className="gira-shop-product-link" aria-label={`View ${product.title}`}>
        <div className="gira-shop-product-media">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText || product.title}
              fill
              sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1439px) 25vw, (max-width: 1799px) 20vw, 16vw"
              className="gira-shop-product-image"
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
