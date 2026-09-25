"use client";

import { useState } from "react";
import Image from "next/image";
import type { ShopifyImage } from "@/lib/shopify";
import { productImageBounds, productImageFrame } from "@/lib/product-image-framing";

export function FramedProductImage({ image, title, sizes, eager }: {
  image: ShopifyImage; title: string; sizes?: string; eager: boolean;
}) {
  const [framing, setFraming] = useState<{ src: string; style: ReturnType<typeof productImageFrame> } | null>(null);
  function measure(element: HTMLImageElement) {
    if (!element.naturalWidth || !element.naturalHeight) return;
    const ratio = Math.min(1, 320 / Math.max(element.naturalWidth, element.naturalHeight));
    const width = Math.max(1, Math.round(element.naturalWidth * ratio));
    const height = Math.max(1, Math.round(element.naturalHeight * ratio));
    let bounds = { x: 0, y: 0, width, height };
    try {
      // Next's optimized image is same-origin. If pixel access is unavailable,
      // preserve the entire image rather than guessing a product-specific zoom.
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (context) {
        context.drawImage(element, 0, 0, width, height);
        bounds = productImageBounds(context.getImageData(0, 0, width, height).data, width, height);
      }
    } catch { /* Safe full-image fallback, including cross-origin images. */ }
    setFraming({ src: image.url, style: productImageFrame(bounds, width, height) });
  }
  return <div className="gira-product-image-frame" style={framing?.src === image.url ? framing.style : undefined}>
    <Image src={image.url} alt={image.altText || title} fill sizes={sizes}
      loading={eager ? "eager" : "lazy"} className="gira-shop-product-image"
      onLoad={(event) => measure(event.currentTarget)} />
  </div>;
}
