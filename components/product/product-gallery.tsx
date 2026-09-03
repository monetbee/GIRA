import Image from "next/image";
import type { ShopifyProduct } from "@/lib/shopify";

export function ProductGallery({ product }: { product: ShopifyProduct }) {
  const images = product.images.length > 0 ? product.images : [{ url: "", altText: product.title }];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {images.map((image, index) => (
        <div key={`${image.url}-${index}`} className={`relative overflow-hidden rounded-[32px] bg-[#f3f3f3] ${index === 0 ? "sm:col-span-2" : ""}`}>
          {image.url ? (
            <div className={`relative ${index === 0 ? "aspect-[4/5]" : "aspect-[3/4]"}`}>
              <Image
                src={image.url}
                alt={image.altText || product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
