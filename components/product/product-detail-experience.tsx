"use client";

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
  const initialVariant = product.variants.find((variant) => variant.availableForSale) ?? product.variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariant?.id ?? "");
  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId) ?? initialVariant;
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
      <div className="gira-product-detail-meta">
        {product.variants.length > 1 ? <fieldset className="gira-product-color-selector">
          <legend>COLOR</legend>
          <div>{product.variants.map((variant) => <button key={variant.id} type="button" className={variant.id === selectedVariant?.id ? "is-selected" : ""} aria-pressed={variant.id === selectedVariant?.id} onClick={() => setSelectedVariantId(variant.id)}>{colorLabel(variant)}</button>)}</div>
        </fieldset> : null}
        <div className={`gira-product-stock-row ${selectedVariant?.availableForSale ? "" : "is-sold-out"}`}>
          {selectedVariant?.availableForSale ? <Check className="h-4 w-4 text-[#1ea86a]" /> : <X className="h-4 w-4" />}
          <span>{selectedVariant?.availableForSale ? "在庫あり・購入可能" : "現在売り切れです"}</span>
        </div>
      </div>
      <div className="gira-product-detail-actions">
        {selectedVariant ? <AddToCartButton variantId={selectedVariant.id} disabled={!selectedVariant.availableForSale} className="gira-product-cart-button" /> : null}
        <VirtualTryOnModal product={product} />
      </div>
      <div className="gira-product-detail-features">
        {hasUvClaim ? <div className="gira-product-feature-item"><Sparkles className="h-4 w-4" /><div><p>紫外線対策</p><span>商品情報に記載された紫外線対策仕様をご確認いただけます。</span></div></div> : null}
        {material ? <div className="gira-product-feature-item"><Info className="h-4 w-4" /><div><p>素材・仕様</p><span>{material}</span></div></div> : null}
        <div className="gira-product-feature-item"><Truck className="h-4 w-4" /><div><p>配送について</p><span>ご注文後、商品の準備・検品を行ったうえで発送いたします。商品によってはお届けまで最長2週間程度いただく場合があります。</span></div></div>
        <div className="gira-product-feature-item"><Info className="h-4 w-4" /><div><p>ご購入前にご確認ください</p><span>掲載画像はできる限り実物に近い状態で掲載していますが、撮影環境やお使いの端末により、実際の商品と色味・質感が異なって見える場合があります。また、生産時期により細部の仕様や仕上がりに若干の個体差が生じる場合があります。</span></div></div>
      </div>
    </div>
  </>;
}
