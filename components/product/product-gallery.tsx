"use client";
import { useTranslations } from "@/components/providers/locale-provider";

import Image from "next/image";
import { useState } from "react";
import type { ShopifyProduct } from "@/lib/shopify";

function isProductLikeImage(url: string) {
  return /\.(png|webp|svg)(?:\?.*)?$/i.test(url);
}

export function ProductGallery({ product, initialImageUrl }: { product: ShopifyProduct; initialImageUrl?: string }) {
  const t = useTranslations();
  const productImages = product.images.length > 0 ? product.images : [{ url: "", altText: product.title }];
  const variantImage = product.variants.find((variant) => variant.image?.url === initialImageUrl)?.image;
  const images = variantImage && !productImages.some((image) => image.url === variantImage.url)
    ? [variantImage, ...productImages]
    : productImages;
  const initialIndex = initialImageUrl ? images.findIndex((image) => image.url === initialImageUrl) : -1;
  const [activeIndex, setActiveIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  const goToPrevious = () => {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const goToNext = () => {
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPrevious();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNext();
    }
  };

  const activeImage = images[activeIndex] ?? images[0];
  const mainFitMode = activeImage?.url ? (isProductLikeImage(activeImage.url) ? "contain" : "cover") : "cover";

  return (
    <div
      className="gira-product-detail-gallery"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={t("{title} image gallery", { title: product.title })}
    >
      <div className="gira-product-detail-gallery-main">
        {activeImage?.url ? (
          <Image
            src={activeImage.url}
            alt={activeImage.altText || product.title}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="gira-product-detail-image"
            style={{ objectFit: mainFitMode }}
            priority
          />
        ) : null}

        {images.length > 1 ? (
          <div className="gira-product-detail-gallery-nav" aria-label={t("Image navigation")}>
            <button type="button" onClick={goToPrevious} aria-label={t("Previous image")} className="gira-product-detail-nav-button">
              ←
            </button>
            <button type="button" onClick={goToNext} aria-label={t("Next image")} className="gira-product-detail-nav-button">
              →
            </button>
          </div>
        ) : null}
      </div>

      {images.length > 0 ? (
        <div className="gira-product-detail-gallery-thumbs" aria-label={t("Product thumbnail gallery")}>
          {images.map((image, index) => {
            const thumbFitMode = image.url ? (isProductLikeImage(image.url) ? "contain" : "cover") : "cover";
            const isActive = index === activeIndex;

            return (
              <button
                key={`${image.url}-${index}`}
                type="button"
                aria-label={t("View image {number}", { number: index + 1 })}
                aria-pressed={isActive}
                className={`gira-product-detail-thumb ${isActive ? "is-active" : ""}`}
                onClick={() => setActiveIndex(index)}
              >
                <span className="gira-product-detail-thumb-inner">
                  <Image
                    src={image.url}
                    alt={image.altText || t("{title} detail {number}", { title: product.title, number: index + 1 })}
                    fill
                    sizes="(max-width: 768px) 24vw, 9vw"
                    className="gira-product-detail-thumb-image"
                    style={{ objectFit: thumbFitMode }}
                  />
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
