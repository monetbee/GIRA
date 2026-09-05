import { notFound } from "next/navigation";
import { Check, Shield, Sparkles, Truck } from "lucide-react";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ProductGallery } from "@/components/product/product-gallery";
import { formatPrice } from "@/lib/format";
import { getProductByHandle } from "@/lib/shopify";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: product.title,
    description: product.description || "Shop GIRA sunglasses.",
  };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const firstVariant = product.variants[0];
  const price = firstVariant?.price ?? product.priceRange.minVariantPrice;

  return (
    <main className="gira-product-detail-page">
      <Container className="gira-product-detail-container">
        <div className="gira-product-detail-shell">
          <ProductGallery product={product} />

          <div className="gira-product-detail-panel">
            <p className="gira-product-detail-brand">{product.vendor || "GIRA"}</p>
            <h1>{product.title}</h1>
            <div className="gira-product-detail-price-row">
              <p>{formatPrice(price)}</p>
              {firstVariant?.compareAtPrice ? (
                <span>{formatPrice(firstVariant.compareAtPrice)}</span>
              ) : null}
            </div>

            <div className="gira-product-detail-meta">
              {firstVariant ? (
                <div className="gira-product-variant-box">
                  <p>Variant</p>
                  <strong>{firstVariant.title}</strong>
                </div>
              ) : null}
              <div className="gira-product-stock-row">
                <Check className="h-4 w-4 text-[#1ea86a]" />
                <span>{product.availableForSale ? "In stock and ready to ship" : "Currently sold out"}</span>
              </div>
            </div>

            <div className="gira-product-detail-actions">
              {firstVariant ? <AddToCartButton variantId={firstVariant.id} className="gira-product-cart-button" /> : null}
              <Button type="button" variant="secondary" className="gira-product-secondary-button">Try on virtually</Button>
            </div>

            <div className="gira-product-detail-features">
              <div className="gira-product-feature-item">
                <Shield className="h-4 w-4" />
                <div>
                  <p>UV protection</p>
                  <span>100% UV400 lens protection with glare reduction.</span>
                </div>
              </div>
              <div className="gira-product-feature-item">
                <Sparkles className="h-4 w-4" />
                <div>
                  <p>Materials</p>
                  <span>Premium acetate frame with precision-engineered hinges.</span>
                </div>
              </div>
              <div className="gira-product-feature-item">
                <Truck className="h-4 w-4" />
                <div>
                  <p>Shipping</p>
                  <span>Free shipping on orders over $80 • 2-4 day delivery.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="gira-product-detail-copy-grid">
          <div>
            <p className="gira-product-detail-section-label">Description</p>
            <div className="gira-product-detail-copy" dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }} />
          </div>
          <div>
            <p className="gira-product-detail-section-label">Fit & care</p>
            <ul className="gira-product-detail-list">
              <li>Designed for everyday wear and elevated, street-level confidence.</li>
              <li>Lightweight construction with a polished silhouette and all-day comfort.</li>
              <li>Lens care: rinse gently with lukewarm water and dry with a microfiber cloth.</li>
            </ul>
          </div>
        </div>
      </Container>
    </main>
  );
}
