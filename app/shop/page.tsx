import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { getProducts } from "@/lib/shopify";

export default async function ShopPage() {
  const products = await getProducts(12);

  return (
    <main className="py-12 md:py-16">
      <Container>
        <SectionHeading
          eyebrow="Shop all"
          title="Wear the statement."
          description="Discover elevated lenses, bold silhouettes, and everyday frames built for motion."
        />
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
      </Container>
    </main>
  );
}
