import { getTranslations } from "@/lib/i18n/server";
import { Container } from "@/components/ui/container";
import { Suspense } from "react";
import { ProductDiscovery } from "@/components/product/product-discovery";
import { getProducts } from "@/lib/shopify";

export default async function ShopPage() {
  const t = await getTranslations();
  const products = await getProducts();

  return (
    <main className="gira-shop-page">
      <section className="gira-shop-hero">
        <Container className="gira-shop-header">
          <div className="gira-shop-heading">
            <p className="gira-kicker">ALL SHADES</p>
            <h1>{t("Shop the collection.")}</h1>
          </div>
          <p className="gira-shop-intro">{t("Explore the full GIRA collection.")}</p>
        </Container>
      </section>

      <Container className="gira-shop-products-wrap">
        <Suspense fallback={<p>{t("Loading collection...")}</p>}><ProductDiscovery products={products} mode="shop" /></Suspense>
      </Container>
    </main>
  );
}
