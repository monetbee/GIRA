import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/product/product-card";
import { ShopAllLink } from "@/components/product/shop-all-link";
import type { ProductReviewSummary } from "@/components/product/product-rating";
import type { ShopifyProduct } from "@/lib/shopify";
import { getTranslations } from "@/lib/i18n/server";

export async function BestSellers({ products, reviewsByProductId = {} }: {
  products: ShopifyProduct[];
  reviewsByProductId?: Record<string, ProductReviewSummary | null>;
}) {
  const t = await getTranslations();
  return (
    <div className="gira-best-sellers">
      <Container>
        <div className="gira-storefront-brand">
          <h1 className="gira-brand-wordmark">GIRA</h1>
          <p>Go Insane. Reject Average.</p>
        </div>
        <h2 id="best-sellers-heading">BEST SELLERS</h2>
        {products.length > 0 ? (
          <ul className="gira-best-sellers-track" aria-labelledby="best-sellers-heading" tabIndex={0}>
            {products.map((product, index) => (
              <li key={product.id}>
                <ProductCard product={product} reviewSummary={reviewsByProductId[product.id] ?? null} normalizeImage
                  imageSizes="(max-width: 767px) 78vw, (max-width: 1280px) 23vw, 292px" eager={index === 0} />
              </li>
            ))}
          </ul>
        ) : <p className="gira-best-sellers-empty">{t("Products are currently unavailable. Please check back soon.")}</p>}
        <div className="gira-best-sellers-action">
          <ShopAllLink />
        </div>
      </Container>
    </div>
  );
}
