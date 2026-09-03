import { ProductCard } from "@/components/product/product-card";
import type { ShopifyProduct } from "@/lib/shopify";

export function ProductGrid({ products }: { products: ShopifyProduct[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
