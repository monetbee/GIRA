import { Container } from "@/components/ui/container";
import { ProductGrid } from "@/components/product/product-grid";
import { getProducts } from "@/lib/shopify";

export default async function ShopPage() {
  const products = await getProducts(12);

  return (
    <main className="gira-shop-page">
      <section className="gira-shop-hero">
        <Container className="gira-shop-header">
          <div className="gira-shop-heading">
            <p className="gira-kicker">ALL SHADES</p>
            <h1>Shop the collection.</h1>
          </div>
          <p className="gira-shop-intro">Explore the full GIRA collection.</p>
        </Container>
      </section>

      <Container className="gira-shop-products-wrap">
        <ProductGrid products={products} />
      </Container>
    </main>
  );
}
