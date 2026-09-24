import { getTranslations } from "@/lib/i18n/server";
import { Suspense } from "react";
import { ProductDiscovery } from "@/components/product/product-discovery";
import { Container } from "@/components/ui/container";
import { getFeaturedProducts, getProducts } from "@/lib/shopify";

import { BestSellers } from "@/components/product/best-sellers";

const marqueeItems = ["GIRA", "GO INSANE.", "REJECT AVERAGE.", "Sunglasses as objects"];

export default async function HomePage() {
  const t = await getTranslations();
  const [featuredProducts, products] = await Promise.all([getFeaturedProducts(4), getProducts()]);

  return (
    <>
      <BestSellers products={featuredProducts} />

      <div className="gira-marquee" aria-label={t("GIRA updates")}>
        <div className="gira-marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <section className="gira-editorial-shell">
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

        <Container className="gira-hero-grid">
          <div className="gira-hero-copy">
            <h2 className="gira-display" aria-label={t("GIRA phrase")}>
              <span>GIRA</span>
              <span className="gira-display-subtle">GO</span>
              <span className="gira-display-subtle">INSANE.</span>
              <span className="gira-display-subtle">REJECT</span>
              <span className="gira-display-subtle">AVERAGE.</span>
            </h2>
          </div>

          <div className="gira-hero-visual" aria-label={t("GIRA brand wordmark")}>
            <div className="gira-hero-wordmark" data-text="GIRA" aria-label="GIRA">
              GIRA
            </div>
          </div>
        </Container>
      </section>

      <Suspense fallback={<p>{t("Loading signals...")}</p>}><ProductDiscovery products={products} mode="signal" /></Suspense>
    </>
  );
}
