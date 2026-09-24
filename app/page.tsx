import { getTranslations } from "@/lib/i18n/server";
import { Suspense } from "react";
import { ProductDiscovery } from "@/components/product/product-discovery";
import { getProducts } from "@/lib/shopify";

import { BestSellers } from "@/components/product/best-sellers";

const marqueeItems = ["GIRA", "GO INSANE.", "REJECT AVERAGE.", "Sunglasses as objects"];

export default async function HomePage() {
  const t = await getTranslations();
  const products = await getProducts();
  // Keep selection separate from fetching so curated products can replace this later.
  const bestSellers = products.slice(0, 4);

  return (
    <>
      <div className="gira-marquee" aria-label={t("GIRA updates")}>
        <div className="gira-marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <section className="gira-editorial-shell" aria-label={t("GIRA brand wordmark")}>
        <video
          className="gira-hero-video"
          src="/videos/video23.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="gira-hero-overlay" aria-hidden="true" />

        <BestSellers products={bestSellers} />
      </section>

      <Suspense fallback={<p>{t("Loading signals...")}</p>}><ProductDiscovery products={products} mode="signal" /></Suspense>
    </>
  );
}
