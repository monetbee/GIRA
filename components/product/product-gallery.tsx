"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ShopifyProduct } from "@/lib/shopify";

function isProductLikeImage(url: string) {
  return /\.(png|webp|svg)(?:\?.*)?$/i.test(url);
}

export function ProductGallery({ product }: { product: ShopifyProduct }) {
  const images = product.images.length > 0 ? product.images : [{ url: "", altText: product.title }];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex((current) => {
      if (images.length === 0) return 0;
      if (current >= images.length) return images.length - 1;
      return current;
    });
  }, [images.length]);

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
      aria-label={`${product.title} image gallery`}
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
          <div className="gira-product-detail-gallery-nav" aria-label="Image navigation">
            <button type="button" onClick={goToPrevious} aria-label="Previous image" className="gira-product-detail-nav-button">
              ←
            </button>
            <button type="button" onClick={goToNext} aria-label="Next image" className="gira-product-detail-nav-button">
              →
            </button>
          </div>
        ) : null}
      </div>

      {images.length > 0 ? (
        <div className="gira-product-detail-gallery-thumbs" aria-label="Product thumbnail gallery">
          {images.map((image, index) => {
            const thumbFitMode = image.url ? (isProductLikeImage(image.url) ? "contain" : "cover") : "cover";
            const isActive = index === activeIndex;

            return (
              <button
                key={`${image.url}-${index}`}
                type="button"
                aria-label={`View image ${index + 1}`}
                aria-pressed={isActive}
                className={`gira-product-detail-thumb ${isActive ? "is-active" : ""}`}
                onClick={() => setActiveIndex(index)}
              >
                <span className="gira-product-detail-thumb-inner">
                  <Image
                    src={image.url}
                    alt={image.altText || `${product.title} detail ${index + 1}`}
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
