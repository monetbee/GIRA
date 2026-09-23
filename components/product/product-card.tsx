"use client";
import { useTranslations } from "@/components/providers/locale-provider";
import Image from "next/image";
import Link from "next/link";
import type { ShopifyProduct } from "@/lib/shopify";
import { formatPrice } from "@/lib/format";

import { getProductPrice, productDiscoveryHref, type DiscoveryContext } from "@/lib/product-discovery";

export function ProductCard({ product, context }: { product: ShopifyProduct; context?: DiscoveryContext }) {
  const t = useTranslations();
  const image = product.featuredImage || product.images[0];
  const price = getProductPrice(product);
  const isAvailable = product.availableForSale || product.variants.some((variant) => variant.availableForSale);

  return (
    <article className="gira-shop-product-card group">
      <Link href={productDiscoveryHref(product.handle, context)} prefetch={context ? false : undefined} className="gira-shop-product-link" aria-label={t("View {title}", { title: product.title })}>
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
            <div className="gira-shop-product-fallback">{t("No image")}</div>
          )}

          {!isAvailable && (
            <span className="gira-shop-product-status">{t("Sold out")}</span>
          )}

          <span className="gira-shop-product-view">{t("VIEW PRODUCT")} <span aria-hidden="true">→</span></span>
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
