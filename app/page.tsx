import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { formatPrice } from "@/lib/format";
import { getFeaturedProducts, type ShopifyProduct } from "@/lib/shopify";

function getProductImage(product: ShopifyProduct) {
  return product.featuredImage || product.images[0];
}
const marqueeItems = ["GIRA", "GO INSANE.", "REJECT AVERAGE.", "Sunglasses as objects"];

function ShopifyLiveProductsSection({ products }: { products: ShopifyProduct[] }) {
  return (
    <section className="gira-live-shopify">
      <Container>
        <div className="gira-section-head">
          <p className="gira-kicker">New Drop</p>
          <h2>JUST DROPPED.</h2>
        </div>

        <div className="gira-live-grid" aria-label="Featured product collection">
          {products.map((product) => {
            const image = getProductImage(product);
            const price = product.variants[0]?.price ?? product.priceRange.minVariantPrice;

            return (
              <Link key={product.id} href={`/products/${product.handle}`} className="gira-live-card">
                {image ? (
                  <div className="gira-live-image">
                    <Image
                      src={image.url}
                      alt={image.altText || product.title}
                      fill
                      sizes="(max-width: 768px) 78vw, 22vw"
                      className="gira-live-product-image"
                    />
                  </div>
                ) : null}

                <div className="gira-live-meta">
                  <p>{product.title}</p>
                  <span>{formatPrice(price)}</span>
                  <strong>VIEW PRODUCT <span aria-hidden="true">→</span></strong>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(4);

  return (
    <>
      <div className="gira-marquee" aria-label="GIRA updates">
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
            <h1 className="gira-display" aria-label="GIRA phrase">
              <span>GIRA</span>
              <span className="gira-display-subtle">GO</span>
              <span className="gira-display-subtle">INSANE.</span>
              <span className="gira-display-subtle">REJECT</span>
              <span className="gira-display-subtle">AVERAGE.</span>
            </h1>
          </div>

          <div className="gira-hero-visual" aria-label="GIRA brand wordmark">
            <div className="gira-hero-wordmark" data-text="GIRA" aria-label="GIRA">
              GIRA
            </div>
          </div>
        </Container>
      </section>

      <ShopifyLiveProductsSection products={featuredProducts} />

      <section className="gira-minimal-shop">
        <Container className="gira-minimal-shop-grid">
          <div className="gira-shop-copy">
            <p className="gira-kicker">Shop</p>
            <h2>Choose the signal.</h2>
          </div>

          <div className="gira-shop-links">
            <Link href="/shop">All shades</Link>
            <Link href="/shop">New drop</Link>
            <Link href="/shop">Story</Link>
          </div>
        </Container>
      </section>
    </>
  );
}
