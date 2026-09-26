"use client";
import { useTranslations } from "@/components/providers/locale-provider";

import { useMemo, useState } from "react";
import { Check, Info, Sparkles, Truck, X } from "lucide-react";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductGallery } from "@/components/product/product-gallery";
import { VirtualTryOnModal } from "@/components/product/virtual-try-on";
import { formatPrice } from "@/lib/format";
import type { ShopifyProduct, ShopifyVariant } from "@/lib/shopify";

function colorLabel(variant: ShopifyVariant) {
  return variant.selectedOptions.find((option) => option.name.toLowerCase() === "color")?.value ?? variant.title;
}

export function ProductDetailExperience({ product }: { product: ShopifyProduct }) {
  const t = useTranslations();
  const initialVariant = product.variants.find((variant) => variant.availableForSale) ?? product.variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariant?.id ?? "");
  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId) ?? initialVariant;
  const tags = product.tags.filter((tag) => tag.trim());
  const productText = `${product.description} ${product.descriptionHtml ?? ""} ${product.tags.join(" ")}`;
  const hasUvClaim = /uv\s*400|紫外線|uv protection/i.test(productText);
  const material = useMemo(() => {
    const match = productText.match(/(?:material|素材)\s*[:：]?\s*([^<\n。]{2,80})/i);
    return match?.[1]?.trim() ?? null;
  }, [productText]);

  return <>
    <ProductGallery key={selectedVariant?.image?.url ?? "default"} product={product} initialImageUrl={selectedVariant?.image?.url} />
    <div className="gira-product-detail-panel">
      <p className="gira-product-detail-brand">{product.vendor || "GIRA"}</p>
      <h1>{product.title}</h1>
      <div className="gira-product-detail-price-row">
        <p>{formatPrice(selectedVariant?.price ?? product.priceRange.minVariantPrice)}</p>
        {selectedVariant?.compareAtPrice ? <span>{formatPrice(selectedVariant.compareAtPrice)}</span> : null}
      </div>
      {tags.length > 0 ? <section className="gira-product-detail-tags" aria-label={t("TAGS")}>
        <p>TAGS</p>
        <div className="gira-product-tags">
          {tags.map((tag) => <span key={tag}>#{tag}</span>)}
        </div>
      </section> : null}
      <div className="gira-product-detail-meta">
        {product.variants.length > 1 ? <fieldset className="gira-product-color-selector">
          <legend>{t("COLOR")}</legend>
          <div>{product.variants.map((variant) => <button key={variant.id} type="button" className={variant.id === selectedVariant?.id ? "is-selected" : ""} aria-pressed={variant.id === selectedVariant?.id} onClick={() => setSelectedVariantId(variant.id)}>{colorLabel(variant)}</button>)}</div>
        </fieldset> : null}
        <div className={`gira-product-stock-row ${selectedVariant?.availableForSale ? "" : "is-sold-out"}`}>
          {selectedVariant?.availableForSale ? <Check className="h-4 w-4 text-[#1ea86a]" /> : <X className="h-4 w-4" />}
          <span>{selectedVariant?.availableForSale ? t("In stock — available to purchase") : t("Currently sold out")}</span>
        </div>
      </div>
      <div className="gira-product-detail-actions">
        {selectedVariant ? <AddToCartButton variantId={selectedVariant.id} disabled={!selectedVariant.availableForSale} className="gira-product-cart-button" /> : null}
        <VirtualTryOnModal product={product} />
      </div>
      <div className="gira-product-detail-features">
        {hasUvClaim ? <div className="gira-product-feature-item"><Sparkles className="h-4 w-4" /><div><p>{t("UV protection")}</p><span>{t("Please refer to the UV protection specifications in the product information.")}</span></div></div> : null}
        {material ? <div className="gira-product-feature-item"><Info className="h-4 w-4" /><div><p>{t("Materials / specifications")}</p><span>{material}</span></div></div> : null}
        <div className="gira-product-feature-item"><Truck className="h-4 w-4" /><div><p>{t("SHIPPING")}</p><span>{t("Your order will be prepared and inspected before shipping. Some products may take up to two weeks to arrive.")}</span></div></div>
        <div className="gira-product-feature-item"><Info className="h-4 w-4" /><div><p>{t("Before you buy")}</p><span>{t("We aim to show products accurately, but colors and textures may appear different depending on lighting and your device. Details and finishes may also vary slightly between production batches.")}</span></div></div>
      </div>
    </div>
  </>;
}
